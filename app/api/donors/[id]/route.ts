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
  _request: NextRequest,
  routeParams: RouteParams
) {
  try {
    // Await/unwrap params before using
    const params = await routeParams.params;
    const id = params.id;
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }
    
    const donor = await prisma.donor.findUnique({
      where: { id },
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
    
    // Check if the donor belongs to the user
    if (donor.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu bağışçıya erişim izniniz yok." },
        { status: 403 }
      );
    }
    
    return NextResponse.json(donor);
  } catch (error) {
    console.error("Donor fetch error:", error);
    return NextResponse.json(
      { error: "Bağışçı getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 