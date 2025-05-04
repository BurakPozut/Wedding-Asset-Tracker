import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { AssetType } from "@/types";

// GET /api/assets - Get all assets for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }
    
    const assets = await prisma.asset.findMany({
      where: { userId: session.user.id },
      include: { donor: true },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Assets fetch error:", error);
    return NextResponse.json(
      { error: "Varlıklar getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/assets - Create a new asset
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
    
    // Validate asset data
    if (!data.type || !data.initialValue || !data.dateReceived || !data.donorId) {
      return NextResponse.json(
        { error: "Tür, başlangıç değeri, tarih ve bağışçı alanları zorunludur." },
        { status: 400 }
      );
    }
    
    // Validate asset type-specific fields
    if (
      (data.type === AssetType.BILEZIK || data.type === AssetType.GRAM_GOLD) &&
      (!data.grams || !data.carat)
    ) {
      return NextResponse.json(
        { error: "Bilezik ve Gram Altın için gram ve karat alanları zorunludur." },
        { status: 400 }
      );
    }
    
    if (
      (data.type === AssetType.TURKISH_LIRA || 
       data.type === AssetType.DOLLAR || 
       data.type === AssetType.EURO) &&
      !data.amount
    ) {
      return NextResponse.json(
        { error: "Para birimleri için miktar alanı zorunludur." },
        { status: 400 }
      );
    }
    
    // Validate donor exists and belongs to user
    const donor = await prisma.donor.findFirst({
      where: { id: data.donorId, userId: session.user.id },
    });
    
    if (!donor) {
      return NextResponse.json(
        { error: "Geçersiz bağışçı." },
        { status: 400 }
      );
    }
    
    // Create the asset
    const asset = await prisma.asset.create({
      data: {
        userId: session.user.id,
        type: data.type,
        amount: data.amount || null,
        grams: data.grams || null,
        carat: data.carat || null,
        initialValue: data.initialValue,
        currentValue: data.initialValue, // Initially set to initial value
        dateReceived: new Date(data.dateReceived),
        donorId: data.donorId,
      },
      include: { donor: true },
    });
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Asset creation error:", error);
    return NextResponse.json(
      { error: "Varlık oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
} 