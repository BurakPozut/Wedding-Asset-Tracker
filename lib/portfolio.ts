// Define a type that matches the asset structure from Prisma
interface PrismaAsset {
  initialValue: number;
  quantity?: number;
  grams?: number | null;
  assetType: {
    type: string;
    currentValue: number;
  };
}

/**
 * Calculate the total current value of the user's assets based on current prices
 * @param assets User's asset array with both initialValue and current price info
 * @returns Total current value in Turkish Lira
 */
export function calculateCurrentPortfolioValue(assets: PrismaAsset[]): number {
  return assets.reduce((total, asset) => {
    // For each asset, multiply quantity by current value from assetType
    const currentValuePerUnit = asset.assetType.currentValue || 0;
    
    // For gold assets with grams property, calculate based on grams
    if (asset.grams && (asset.assetType.type === 'BILEZIK' || asset.assetType.type === 'GRAM_GOLD')) {
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