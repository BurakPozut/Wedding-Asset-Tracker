import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { token } = await params;

    // Find the invitation token
    const invitationToken = await prisma.invitationToken.findUnique({
      where: { token },
      include: {
        wedding: true,
      },
    });

    if (!invitationToken) {
      return new NextResponse("Invalid invitation token", { status: 404 });
    }

    // Check if token is expired
    if (invitationToken.expiresAt < new Date()) {
      return new NextResponse("Invitation token has expired", { status: 410 });
    }

    // Check if user is already a member
    const existingMember = await prisma.weddingMember.findFirst({
      where: {
        weddingId: invitationToken.weddingId,
        userId: session.user.id,
      },
    });

    if (existingMember) {
      return new NextResponse("Already a member of this wedding", { status: 400 });
    }

    // Create new wedding member
    await prisma.weddingMember.create({
      data: {
        weddingId: invitationToken.weddingId,
        userId: session.user.id,
        role: "VIEWER",
        status: "PENDING",
      },
    });

    // Delete the used invitation token
    await prisma.invitationToken.delete({
      where: { token },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INVITATION_ACCEPT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 