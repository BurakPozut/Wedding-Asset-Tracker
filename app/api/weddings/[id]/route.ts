import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const wedding = await prisma.wedding.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!wedding) {
      return new NextResponse("Wedding not found", { status: 404 });
    }

    return NextResponse.json(wedding);
  } catch (error) {
    console.error("[WEDDING_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 