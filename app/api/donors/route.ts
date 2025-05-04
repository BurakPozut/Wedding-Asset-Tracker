import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/donors - Get all donors for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }
    
    const donors = await prisma.donor.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
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
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Validate donor data
    if (!data.name) {
      return NextResponse.json(
        { error: "İsim alanı zorunludur." },
        { status: 400 }
      );
    }
    
    // Create the donor
    const donor = await prisma.donor.create({
      data: {
        userId: session.user.id,
        name: data.name,
        isGroomSide: data.isGroomSide || false,
        isBrideSide: data.isBrideSide || false,
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