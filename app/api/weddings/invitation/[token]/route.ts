import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
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

    return NextResponse.json({
      weddingName: invitationToken.wedding.name,
      weddingId: invitationToken.wedding.id,
    });
  } catch (error) {
    console.error("[INVITATION_VALIDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 