import { AssetType } from "@/types";

// Map AssetType to Turkish display name
export const ASSET_TYPE_NAMES: Record<AssetType, string> = {
  [AssetType.CEYREK_ALTIN]: "Çeyrek Altın",
  [AssetType.YARIM_ALTIN]: "Yarım Altın",
  [AssetType.TAM_ALTIN]: "Tam Altın",
  [AssetType.RESAT_ALTIN]: "Reşat Altın",
  [AssetType.CUMHURIYET_ALTIN]: "Cumhuriyet Altını",
  [AssetType.GRAM_ALTIN_22K]: "22 Ayar Gram Altın",
  [AssetType.BESI_BIR_YERDE]: "Beşi Bir Yerde",
  [AssetType.BILEZIK]: "Bilezik",
  [AssetType.GRAM_GOLD]: "Gram Altın",
  [AssetType.TURKISH_LIRA]: "Türk Lirası",
  [AssetType.DOLLAR]: "Dolar",
  [AssetType.EURO]: "Euro",
};

// Asset types that require gram input
export const GRAM_REQUIRED_ASSETS = [
  AssetType.BILEZIK,
  AssetType.GRAM_GOLD,
  AssetType.GRAM_ALTIN_22K,
];

// Asset types that are currencies
export const CURRENCY_ASSETS = [
  AssetType.TURKISH_LIRA,
  AssetType.DOLLAR,
  AssetType.EURO,
];

// Asset types that are gold coins (require quantity)
export const GOLD_COIN_ASSETS = [
  AssetType.CEYREK_ALTIN,
  AssetType.YARIM_ALTIN,
  AssetType.TAM_ALTIN,
  AssetType.RESAT_ALTIN,
  AssetType.CUMHURIYET_ALTIN,
  AssetType.BESI_BIR_YERDE,
]; 