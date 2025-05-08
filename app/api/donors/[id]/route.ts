import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: {
    id: string;
  };
};

// GET /api/donors/[id] - Get a specific donor and their assets
export async function GET(
  request: NextRequest,
  routeParams: RouteParams
) {
  try {
    const params = await routeParams.params;
    const id = params.id;
    
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
    
    const donor = await prisma.donor.findFirst({
      where: { 
        id,
        weddingId: weddingId
      },
      include: { 
        assets: {
          include: {
            assetType: true,
            donor: true
          }
        } 
      },
    });
    
    if (!donor) {
      return NextResponse.json(
        { error: "Bağışçı bulunamadı." },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ...donor,
      isAdmin: userWedding.role === "ADMIN"
    });
  } catch (error) {
    console.error("Donor fetch error:", error);
    return NextResponse.json(
      { error: "Bağışçı getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 