import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { AssetType } from "@/types";

/**
 * Assets API Route
 * 
 * This API handles creating and retrieving assets.
 * It uses historical exchange rates from the database for:
 * - CEYREK_ALTIN (from cey_gold_prices table)
 * - GRAM_GOLD (from gram_gold_prices table)
 * - DOLLAR (from usd_exchange_rates table)
 * - EURO (from eur_exchange_rates table)
 * 
 * For other asset types (TAM_ALTIN, RESAT, etc.), it uses fixed values
 * since we don't have historical data for these types yet.
 */

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
      include: { 
        donor: true,
        assetType: true 
      },
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
  TAM_ALTIN: 15000,      // Value in TRY per unit
  RESAT: 19000,          // Value in TRY per unit
  BESI_BIR_YERDE: 35000, // Value in TRY per unit
  BILEZIK: 6500,         // Value in TRY per gram for 24K
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
  grams?: number, 
  carat?: number,
  dateReceived?: Date
): Promise<number> => {
  let unitValue = 0;
  
  // Helper function to get gold price from cey_gold_prices for a given date
  const getCeyrekAltinPrice = async (date: Date): Promise<number> => {
    // Format date to match the format in the DB (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    
    // Try to find a price for the exact date
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
    
    // If still no price found, throw an error
    if (!goldPrice) {
      throw new Error("No gold price found for the given date or any previous date");
    }
    
    return parseFloat(goldPrice.bid_price.toString());
  };
  
  // Helper function to get the exchange rate from database for a given date
  const getExchangeRate = async (tableName: 'usd_exchange_rates' | 'eur_exchange_rates', date: Date): Promise<number> => {
    // Format date to match the format in the DB (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    
    // Select the correct Prisma model based on tableName
    let rateRecord;
    if (tableName === 'usd_exchange_rates') {
      // Try to find a price for the exact date
      rateRecord = await prisma.usd_exchange_rates.findFirst({
        where: { price_date: new Date(formattedDate) },
        select: { bid_price: true }
      });
      
      // If no price found for exact date, get the closest previous price
      if (!rateRecord) {
        rateRecord = await prisma.usd_exchange_rates.findFirst({
          where: { price_date: { lte: new Date(formattedDate) } },
          orderBy: { price_date: 'desc' },
          select: { bid_price: true }
        });
      }
    } else if (tableName === 'eur_exchange_rates') {
      // Try to find a price for the exact date
      rateRecord = await prisma.eur_exchange_rates.findFirst({
        where: { price_date: new Date(formattedDate) },
        select: { bid_price: true }
      });
      
      // If no price found for exact date, get the closest previous price
      if (!rateRecord) {
        rateRecord = await prisma.eur_exchange_rates.findFirst({
          where: { price_date: { lte: new Date(formattedDate) } },
          orderBy: { price_date: 'desc' },
          select: { bid_price: true }
        });
      }
    }
    
    // If still no price found, throw an error
    if (!rateRecord) {
      throw new Error(`No exchange rate found for the given date (${formattedDate}) or any previous date`);
    }
    
    return parseFloat(rateRecord.bid_price.toString());
  };
  
  switch (type) {
    case AssetType.CEYREK_ALTIN:
      if (dateReceived) {
        // Get the price directly using the helper function
        unitValue = await getCeyrekAltinPrice(dateReceived);
      } 
      break;
    
    case AssetType.TAM_ALTIN:
      if (dateReceived) {
        // TAM_ALTIN is 4x the price of CEYREK_ALTIN
        const ceyrekPrice = await getCeyrekAltinPrice(dateReceived);
        unitValue = ceyrekPrice * 4;
      } else {
        unitValue = assetPrices.TAM_ALTIN;
      }
      break;
      
    case AssetType.YARIM_ALTIN:
      if (dateReceived) {
        // YARIM_ALTIN is 2x the price of CEYREK_ALTIN
        const ceyrekPrice = await getCeyrekAltinPrice(dateReceived);
        unitValue = ceyrekPrice * 2;
      }
      break;
    
    case AssetType.BESI_BIR_YERDE:
      unitValue = assetPrices.BESI_BIR_YERDE;
      break;
    
    case AssetType.BILEZIK:
    case AssetType.GRAM_GOLD:
      if (!grams || !carat) return 0;
      if (dateReceived) {
        // Format date to match the format in the DB (YYYY-MM-DD)
        const formattedDate = dateReceived.toISOString().split('T')[0];
        
        // Try to find a price from the gram_gold_prices table for the exact date
        let goldPrice = await prisma.gram_gold_prices.findFirst({
          where: { price_date: new Date(formattedDate) },
          select: { bid_price: true }
        });
        
        // If no price found for exact date, get the closest previous price
        if (!goldPrice) {
          goldPrice = await prisma.gram_gold_prices.findFirst({
            where: { price_date: { lte: new Date(formattedDate) } },
            orderBy: { price_date: 'desc' },
            select: { bid_price: true }
          });
        }
        
        // If still no price found, use fallback mock price
        if (!goldPrice) {
          throw new Error("No gram gold price found for the given date or any previous date");
        }
        const baseValue = parseFloat(goldPrice.bid_price.toString());
        unitValue = grams * getGoldValueByKarat(carat, baseValue);
      } 
      break;
    
    case AssetType.TURKISH_LIRA:
      unitValue = quantity * assetPrices.TURKISH_LIRA;
      break;
    
    case AssetType.DOLLAR:
      if (!quantity || !dateReceived) return 0;
      try {
        // Get USD exchange rate from database
        const exchangeRate = await getExchangeRate('usd_exchange_rates', dateReceived);
        unitValue = quantity * exchangeRate;
      } catch (error) {
        console.error('Error getting USD exchange rate:', error);
        // Fallback to mock price if database lookup fails
        unitValue = quantity * assetPrices.DOLLAR;
      }
      break;
    
    case AssetType.EURO:
      if (!quantity || !dateReceived) return 0;
      try {
        // Get EUR exchange rate from database
        const exchangeRate = await getExchangeRate('eur_exchange_rates', dateReceived);
        unitValue = quantity * exchangeRate;
      } catch (error) {
        console.error('Error getting EUR exchange rate:', error);
        // Fallback to mock price if database lookup fails
        unitValue = quantity * assetPrices.EURO;
      }
      break;
    
    case AssetType.RESAT_ALTIN:
      if (!dateReceived) return 0;
      try {
        // Get gram gold price from database
        const formattedDate = dateReceived.toISOString().split('T')[0];
        const goldPrice = await prisma.gram_gold_prices.findFirst({
          where: { price_date: { lte: new Date(formattedDate) } },
          orderBy: { price_date: 'desc' },
          select: { bid_price: true }
        });
        
        if (!goldPrice) {
          throw new Error("No gram gold price found for the given date or any previous date");
        }
        
        const gramPrice = parseFloat(goldPrice.bid_price.toString());
        // Resat Altin calculation: Gram Altin Fiyatı * 6,60 * 1,025
        unitValue = gramPrice * 6.60 * 1.025;
      } catch (error) {
        console.error('Error calculating Resat Altin value:', error);
        unitValue = 0;
      }
      break;

    case AssetType.CUMHURIYET_ALTIN:
      if (!dateReceived) return 0;
      try {
        // Get gram gold price from database
        const formattedDate = dateReceived.toISOString().split('T')[0];
        const goldPrice = await prisma.gram_gold_prices.findFirst({
          where: { price_date: { lte: new Date(formattedDate) } },
          orderBy: { price_date: 'desc' },
          select: { bid_price: true }
        });
        
        if (!goldPrice) {
          throw new Error("No gram gold price found for the given date or any previous date");
        }
        
        const gramPrice = parseFloat(goldPrice.bid_price.toString());
        // Cumhuriyet Altin calculation: Gram Altin Fiyatı * 6,614 * 1,045
        unitValue = gramPrice * 6.614 * 1.045;
      } catch (error) {
        console.error('Error calculating Cumhuriyet Altin value:', error);
        unitValue = 0;
      }
      break;
    
    default:
      unitValue = 0;
  }
  
  return unitValue;
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
    const quantity = data.quantity && parseFloat(data.quantity) > 0 ? parseFloat(data.quantity) : 1;
    
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
      !data.quantity
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

    // Get assetTypeInfo record by type enum value
    const assetTypeInfo = await prisma.assetTypeInfo.findUnique({
      where: { type: data.type },
    });

    if (!assetTypeInfo) {
      return NextResponse.json(
        { error: "Geçersiz varlık türü." },
        { status: 400 }
      );
    }
    
    // Calculate asset value - now with date parameter
    const dateReceived = new Date(data.dateReceived);
    const calculatedValue = await calculateAssetValue(
      data.type,
      quantity,
      data.grams, 
      data.carat,
      dateReceived
    );
    
    // Create the asset
    const asset = await prisma.asset.create({
      data: {
        userId: session.user.id,
        assetTypeId: assetTypeInfo.id, // Use the ID from assetTypeInfo
        quantity: quantity,
        grams: data.grams || null,
        carat: data.carat || null,
        initialValue: calculatedValue,
        dateReceived: dateReceived,
        donorId: data.donorId,
      },
      include: { 
        donor: true, 
        assetType: true 
      },
    });
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Asset creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Varlık değeri hesaplanamadı.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
} 