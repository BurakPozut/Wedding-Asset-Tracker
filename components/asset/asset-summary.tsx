"use client";

import { Asset, AssetType } from "@/types";
import { useMemo } from "react";

type AssetSummaryProps = {
  assets: Asset[];
};

// Extended Asset type with quantity
type ExtendedAsset = Asset & {
  quantity?: number;
};

// Map AssetType to Turkish display name
const assetTypeNames: Record<string, string> = {
  CEYREK_ALTIN: "Çeyrek Altın",
  TAM_ALTIN: "Tam Altın",
  RESAT: "Reşat",
  BESI_BIR_YERDE: "Beşi Bir Yerde",
  BILEZIK: "Bilezik",
  GRAM_GOLD: "Gram Altın",
  TURKISH_LIRA: "Türk Lirası",
  DOLLAR: "Dolar",
  EURO: "Euro",
};

type AssetTypeStats = {
  type: string;
  displayName: string;
  count: number;
  initialValue: number;
  currentValue: number;
  changeAmount: number;
  changePercentage: number;
  isProfit: boolean;
};

export function AssetSummary({ assets }: AssetSummaryProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };
  
  // Format percentage with + or - sign
  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };
  
  // Calculate asset statistics by type
  const assetStats = useMemo(() => {
    const statsByType = new Map<string, AssetTypeStats>();
    
    // Group assets by type
    for (const asset of assets as ExtendedAsset[]) {
      if (!asset.assetType?.type) continue;
      
      const type = asset.assetType.type;
      const displayName = assetTypeNames[type] || type;
      const currentUnitValue = asset.assetType.currentValue || 0;
      
      if (!statsByType.has(type)) {
        statsByType.set(type, {
          type,
          displayName,
          count: 0,
          initialValue: 0,
          currentValue: 0,
          changeAmount: 0,
          changePercentage: 0,
          isProfit: false
        });
      }
      
      const stats = statsByType.get(type)!;
      stats.count += asset.quantity || 1;
      stats.initialValue += asset.initialValue;
      
      // Calculate current value based on the asset type
      let currentAssetValue = 0;
      
      if (type === AssetType.BILEZIK || type === AssetType.GRAM_GOLD) {
        // For gold by weight, calculate based on grams
        currentAssetValue = currentUnitValue * (asset.grams || 0);
      } else if (
        type === AssetType.TURKISH_LIRA || 
        type === AssetType.DOLLAR || 
        type === AssetType.EURO
      ) {
        // For money types, use the quantity
        currentAssetValue = currentUnitValue * (asset.quantity || 1);
      } else {
        // For other types, use the quantity
        currentAssetValue = currentUnitValue * (asset.quantity || 1);
      }
      
      stats.currentValue += currentAssetValue;
    }
    
    // Calculate change metrics
    for (const stats of statsByType.values()) {
      stats.changeAmount = stats.currentValue - stats.initialValue;
      stats.changePercentage = stats.initialValue > 0 
        ? (stats.changeAmount / stats.initialValue) * 100 
        : 0;
      stats.isProfit = stats.changeAmount >= 0;
    }
    
    // Convert to array and sort by current value
    return Array.from(statsByType.values())
      .sort((a, b) => b.currentValue - a.currentValue);
  }, [assets]);
  
  // Calculate total values
  const totalStats = useMemo(() => {
    const initialValue = assetStats.reduce((sum, stat) => sum + stat.initialValue, 0);
    const currentValue = assetStats.reduce((sum, stat) => sum + stat.currentValue, 0);
    const changeAmount = currentValue - initialValue;
    const changePercentage = initialValue > 0 
      ? (changeAmount / initialValue) * 100 
      : 0;
    
    return {
      initialValue,
      currentValue,
      changeAmount,
      changePercentage,
      isProfit: changeAmount >= 0
    };
  }, [assetStats]);
  
  if (assets.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8 bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Varlık Türleri Özeti
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Varlıklarınızın tür bazında dağılımı ve toplam değerleri
        </p>
      </div>
      
      <div className="border-b border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Toplam Başlangıç Değeri</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(totalStats.initialValue)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Toplam Güncel Değer</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(totalStats.currentValue)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Toplam Değişim</dt>
              <dd className={`mt-1 text-lg font-semibold ${totalStats.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalStats.changeAmount)} ({formatPercentage(totalStats.changePercentage)})
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">Tür Bazında Dağılım</h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Varlık Türü</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Adet</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Başlangıç Değeri</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Güncel Değer</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Değişim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assetStats.map((stat) => (
                <tr key={stat.type}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                    {stat.displayName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stat.count}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatCurrency(stat.initialValue)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatCurrency(stat.currentValue)}
                  </td>
                  <td className={`whitespace-nowrap px-3 py-4 text-sm ${stat.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stat.changeAmount)} ({formatPercentage(stat.changePercentage)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 