import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: weddingId } = await params;

    // Check if user is admin of the wedding
    const weddingMember = await prisma.weddingMember.findFirst({
      where: {
        weddingId,
        userId: session.user.id,
        role: "ADMIN",
      },
    });

    if (!weddingMember) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create invitation token that expires in 24 hours
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.invitationToken.create({
      data: {
        weddingId,
        token,
        expiresAt,
      },
    });

    // Generate the invitation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invitationLink = `${baseUrl}/dugunler/katil/${token}`;

    return NextResponse.json({ invitationLink });
  } catch (error) {
    console.error("[INVITATION_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 