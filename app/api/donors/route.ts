import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/donors - Get all donors for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    // Get the selected wedding ID from the request
    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get("weddingId");

    if (!weddingId) {
      return NextResponse.json(
        { error: "Wedding ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this wedding
    const userWedding = await prisma.weddingMember.findFirst({
      where: {
        userId: session.user.id,
        weddingId: weddingId,
      },
    });

    if (!userWedding) {
      return NextResponse.json(
        { error: "You don't have access to this wedding" },
        { status: 403 }
      );
    }

    // Get donors for the wedding
    const donors = await prisma.donor.findMany({
      where: { 
        weddingId: weddingId
      },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json(donors);
  } catch (error) {
    console.error("Donors fetch error:", error);
    return NextResponse.json(
      { error: "Bağışçılar getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/donors - Create a new donor
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // Get the user's wedding
    const userWedding = await prisma.wedding.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!userWedding) {
      return NextResponse.json(
        { error: "Henüz bir düğüne ait değilsiniz." },
        { status: 404 }
      );
    }
    
    // Create the donor
    const donor = await prisma.donor.create({
      data: {
        name: data.name,
        isGroomSide: data.isGroomSide,
        isBrideSide: data.isBrideSide,
        weddingId: userWedding.id,
      },
    });
    
    return NextResponse.json(donor);
  } catch (error) {
    console.error("Donor creation error:", error);
    return NextResponse.json(
      { error: "Bağışçı oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
} 