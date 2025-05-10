import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the member to be approved
    const member = await prisma.weddingMember.findUnique({
      where: { id: params.id },
      include: { wedding: true },
    });

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Check if the current user is an admin of the wedding
    const currentUserMember = await prisma.weddingMember.findFirst({
      where: {
        weddingId: member.weddingId,
        userId: session.user.id,
        role: "ADMIN",
      },
    });

    if (!currentUserMember) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the member's status to APPROVED
    await prisma.weddingMember.update({
      where: { id: params.id },
      data: { status: "APPROVED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MEMBER_APPROVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 