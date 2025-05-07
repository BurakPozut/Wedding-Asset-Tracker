// Define AssetType enum to match Prisma schema
export enum AssetType {
  CEYREK_ALTIN = "CEYREK_ALTIN",
  YARIM_ALTIN = "YARIM_ALTIN",
  TAM_ALTIN = "TAM_ALTIN",
  RESAT_ALTIN = "RESAT_ALTIN",
  CUMHURIYET_ALTIN = "CUMHURIYET_ALTIN",
  GRAM_ALTIN_22K = "GRAM_ALTIN_22K",
  BESI_BIR_YERDE = "BESI_BIR_YERDE",
  BILEZIK = "BILEZIK",
  GRAM_GOLD = "GRAM_GOLD",
  TURKISH_LIRA = "TURKISH_LIRA",
  DOLLAR = "DOLLAR",
  EURO = "EURO"
}

export type AssetTypeInfo = {
  id: string;
  type: AssetType;
  currentValue: number;
  lastUpdated: Date;
};

export type Asset = {
  id: string;
  userId: string;
  assetTypeId: string;
  assetType: AssetTypeInfo;
  quantity: number;
  grams?: number | null;
  carat?: number | null;
  initialValue: number;
  dateReceived: Date;
  donorId: string;
  createdAt: Date;
  updatedAt: Date;
  donor?: Donor;
};

export type Donor = {
  id: string;
  userId: string;
  name: string;
  isGroomSide: boolean;
  isBrideSide: boolean;
  createdAt: Date;
  assets?: Asset[];
};

export type User = {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
};

// Type definitions for form validation
export type AssetFormData = {
  type: AssetType;
  quantity?: number;
  grams?: number;
  carat?: number;
  initialValue: number;
  currentValue?: number;
  dateReceived: Date | string;
  donorId: string;
};

export type DonorFormData = {
  name: string;
  isGroomSide: boolean;
  isBrideSide: boolean;
}; 