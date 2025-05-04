import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { AssetType } from "@/types";

type RouteParams = {
  params: {
    id: string;
  };
};

// GET /api/assets/[id] - Get a specific asset
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }
    
    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: { donor: true },
    });
    
    if (!asset) {
      return NextResponse.json(
        { error: "Varlık bulunamadı." },
        { status: 404 }
      );
    }
    
    // Check if the asset belongs to the user
    if (asset.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu varlığa erişim izniniz yok." },
        { status: 403 }
      );
    }
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Asset fetch error:", error);
    return NextResponse.json(
      { error: "Varlık getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PUT /api/assets/[id] - Update an asset
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }
    
    // Check if the asset exists and belongs to the user
    const existingAsset = await prisma.asset.findUnique({
      where: { id: params.id },
    });
    
    if (!existingAsset) {
      return NextResponse.json(
        { error: "Varlık bulunamadı." },
        { status: 404 }
      );
    }
    
    if (existingAsset.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu varlığı düzenleme izniniz yok." },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Validate donor if it's being updated
    if (data.donorId) {
      const donor = await prisma.donor.findFirst({
        where: { id: data.donorId, userId: session.user.id },
      });
      
      if (!donor) {
        return NextResponse.json(
          { error: "Geçersiz bağışçı." },
          { status: 400 }
        );
      }
    }
    
    // Validate type-specific fields
    if (data.type) {
      if (
        (data.type === AssetType.BILEZIK || data.type === AssetType.GRAM_GOLD) &&
        (data.grams === undefined || data.carat === undefined)
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
        data.amount === undefined
      ) {
        return NextResponse.json(
          { error: "Para birimleri için miktar alanı zorunludur." },
          { status: 400 }
        );
      }
    }
    
    // Update the asset
    const asset = await prisma.asset.update({
      where: { id: params.id },
      data: {
        type: data.type !== undefined ? data.type : undefined,
        amount: data.amount !== undefined ? data.amount : undefined,
        grams: data.grams !== undefined ? data.grams : undefined,
        carat: data.carat !== undefined ? data.carat : undefined,
        initialValue: data.initialValue !== undefined ? data.initialValue : undefined,
        currentValue: data.currentValue !== undefined ? data.currentValue : undefined,
        dateReceived: data.dateReceived ? new Date(data.dateReceived) : undefined,
        donorId: data.donorId !== undefined ? data.donorId : undefined,
      },
      include: { donor: true },
    });
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Asset update error:", error);
    return NextResponse.json(
      { error: "Varlık güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/assets/[id] - Delete an asset
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası. Lütfen giriş yapın." },
        { status: 401 }
      );
    }
    
    // Check if the asset exists and belongs to the user
    const existingAsset = await prisma.asset.findUnique({
      where: { id: params.id },
    });
    
    if (!existingAsset) {
      return NextResponse.json(
        { error: "Varlık bulunamadı." },
        { status: 404 }
      );
    }
    
    if (existingAsset.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu varlığı silme izniniz yok." },
        { status: 403 }
      );
    }
    
    // Delete the asset
    await prisma.asset.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Asset deletion error:", error);
    return NextResponse.json(
      { error: "Varlık silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 