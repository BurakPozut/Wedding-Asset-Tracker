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

// Mock price data - would be fetched from external API in production
const assetPrices = {
  CEYREK_ALTIN: 7500,    // Value in TRY per unit
  TAM_ALTIN: 15000,      // Value in TRY per unit
  RESAT: 19000,          // Value in TRY per unit
  BESI_BIR_YERDE: 35000, // Value in TRY per unit
  BILEZIK: 6500,         // Value in TRY per gram for 24K
  GRAM_GOLD: 2200,       // Value in TRY per gram for 24K
  TURKISH_LIRA: 1,       // TRY to TRY exchange rate (1:1)
  DOLLAR: 33,            // USD to TRY exchange rate
  EURO: 36,              // EUR to TRY exchange rate
};

// Calculate gold value based on karat
const getGoldValueByKarat = (caratValue: number, baseValue: number): number => {
  switch (caratValue) {
    case 24: return baseValue;       // 24K = 100% of value
    case 22: return baseValue * 0.92; // 22K = 92% of value
    case 18: return baseValue * 0.75; // 18K = 75% of value
    case 14: return baseValue * 0.58; // 14K = 58% of value
    default: return baseValue * 0.75; // Default to 18K if unknown
  }
};

// Calculate asset value based on type and properties
const calculateAssetValue = async (
  type: AssetType, 
  quantity: number = 1,
  amount?: number, 
  grams?: number, 
  carat?: number,
  dateReceived?: Date
): Promise<number> => {
  let unitValue = 0;
  
  switch (type) {
    case AssetType.CEYREK_ALTIN:
      if (dateReceived) {
        // Format date to match the format in the DB (YYYY-MM-DD)
        const formattedDate = dateReceived.toISOString().split('T')[0];
        
        // Try to find a price from the cey_gold_prices table for the exact date
        let goldPrice = await prisma.cey_gold_prices.findFirst({
          where: { price_date: new Date(formattedDate) },
          select: { bid_price: true }
        });
        
        // If no price found for exact date, get the closest previous price
        if (!goldPrice) {
          goldPrice = await prisma.cey_gold_prices.findFirst({
            where: { price_date: { lte: new Date(formattedDate) } },
            orderBy: { price_date: 'desc' },
            select: { bid_price: true }
          });
        }
        
        // If still no price found, use fallback mock price
        unitValue = goldPrice ? parseFloat(goldPrice.bid_price.toString()) : assetPrices.CEYREK_ALTIN;
      } else {
        unitValue = assetPrices.CEYREK_ALTIN;
      }
      break;
    
    case AssetType.TAM_ALTIN:
      unitValue = assetPrices.TAM_ALTIN;
      break;
    
    case AssetType.RESAT:
      unitValue = assetPrices.RESAT;
      break;
    
    case AssetType.BESI_BIR_YERDE:
      unitValue = assetPrices.BESI_BIR_YERDE;
      break;
    
    case AssetType.BILEZIK:
      if (!grams || !carat) return 0;
      unitValue = grams * getGoldValueByKarat(carat, assetPrices.BILEZIK);
      break;
    
    case AssetType.GRAM_GOLD:
      if (!grams || !carat) return 0;
      unitValue = grams * getGoldValueByKarat(carat, assetPrices.GRAM_GOLD);
      break;
    
    case AssetType.TURKISH_LIRA:
      unitValue = amount ? amount * assetPrices.TURKISH_LIRA : 0;
      break;
    
    case AssetType.DOLLAR:
      unitValue = amount ? amount * assetPrices.DOLLAR : 0;
      break;
    
    case AssetType.EURO:
      unitValue = amount ? amount * assetPrices.EURO : 0;
      break;
    
    default:
      unitValue = 0;
  }
  
  return unitValue * quantity;
};

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
    if (!data.type || !data.dateReceived || !data.donorId) {
      return NextResponse.json(
        { error: "Tür, tarih ve bağışçı alanları zorunludur." },
        { status: 400 }
      );
    }
    
    // Ensure quantity is at least 1
    const quantity = data.quantity && parseInt(data.quantity) > 0 ? parseInt(data.quantity) : 1;
    
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
    
    // Calculate asset value - now with date parameter
    const dateReceived = new Date(data.dateReceived);
    const calculatedValue = await calculateAssetValue(
      data.type,
      quantity,
      data.amount, 
      data.grams, 
      data.carat,
      dateReceived
    );
    
    // Create the asset
    const asset = await prisma.asset.create({
      data: {
        userId: session.user.id,
        type: data.type,
        quantity: quantity,
        amount: data.amount || null,
        grams: data.grams || null,
        carat: data.carat || null,
        initialValue: calculatedValue,
        currentValue: calculatedValue, // Initially set to calculated value
        dateReceived: dateReceived,
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