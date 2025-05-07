// Define a type that matches the asset structure from Prisma
interface PrismaAsset {
  initialValue: number;
  quantity?: number;
  grams?: number | null;
  carat?: number | null;
  assetType: {
    type: string;
    currentValue: number;
  };
}

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

/**
 * Calculate the total current value of the user's assets based on current prices
 * @param assets User's asset array with both initialValue and current price info
 * @returns Total current value in Turkish Lira
 */
export function calculateCurrentPortfolioValue(assets: PrismaAsset[]): number {
  return assets.reduce((total, asset) => {
    // For each asset, multiply quantity by current value from assetType
    const currentValuePerUnit = asset.assetType.currentValue || 0;
    
    // For gold assets with grams property, calculate based on grams and carat
    if (asset.grams && (asset.assetType.type === 'BILEZIK' || asset.assetType.type === 'GRAM_GOLD')) {
      // If we have a carat value, adjust the current value based on carat
      if (asset.carat) {
        const adjustedValue = getGoldValueByKarat(asset.carat, currentValuePerUnit);
        return total + (adjustedValue * (asset.grams || 0));
      }
      // If no carat value, use the base value (assumes 24K)
      return total + (currentValuePerUnit * (asset.grams || 0));
    }
    
    // For money types (TURKISH_LIRA, DOLLAR, EURO), use the exchange rate
    if (['TURKISH_LIRA', 'DOLLAR', 'EURO'].includes(asset.assetType.type)) {
      return total + (currentValuePerUnit * (asset.quantity || 1));
    }
    
    // For all other types, use the quantity
    return total + (currentValuePerUnit * (asset.quantity || 1));
  }, 0);
}

/**
 * Calculate portfolio change in value and percentage
 * @param assets User's asset array with both initialValue and current price info
 * @returns Object containing change amount and percentage
 */
export function calculatePortfolioChange(assets: PrismaAsset[]): { 
  changeAmount: number;
  changePercentage: number;
  isProfit: boolean;
} {
  const initialValue = assets.reduce((total, asset) => total + asset.initialValue, 0);
  const currentValue = calculateCurrentPortfolioValue(assets);
  
  const changeAmount = currentValue - initialValue;
  const changePercentage = initialValue > 0 
    ? (changeAmount / initialValue) * 100 
    : 0;
  
  return {
    changeAmount,
    changePercentage,
    isProfit: changeAmount >= 0
  };
}

/**
 * Format currency value as Turkish Lira
 * @param value Amount to format
 * @returns Formatted string with currency symbol
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY' 
  }).format(value);
}

/**
 * Format percentage with + or - sign
 * @param value Percentage value
 * @returns Formatted string with sign and percentage symbol
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
} 