"use client";

import { Asset, AssetType } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { ASSET_TYPE_NAMES } from "@/lib/constants";

type AssetTableProps = {
  assets: Asset[];
  onDelete?: (assetId: string) => void;
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

// Calculate current value based on asset type and properties
const calculateCurrentValue = (asset: Asset): number => {
  if (!asset.assetType?.currentValue) return 0;
  
  const baseValue = asset.assetType.currentValue;
  
  if (asset.assetType.type === AssetType.BILEZIK || asset.assetType.type === AssetType.GRAM_GOLD) {
    if (asset.carat) {
      const adjustedValue = getGoldValueByKarat(asset.carat, baseValue);
      return adjustedValue * (asset.grams || 0);
    }
    return baseValue * (asset.grams || 0);
  }
  
  if (asset.assetType.type === AssetType.TURKISH_LIRA || 
      asset.assetType.type === AssetType.DOLLAR || 
      asset.assetType.type === AssetType.EURO) {
    return baseValue * (asset.quantity || 1);
  }
  
  return baseValue * (asset.quantity || 1);
};

export function AssetTable({ assets, onDelete }: AssetTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };
  
  // Handle delete click
  const handleDeleteClick = async (assetId: string) => {
    if (onDelete) {
      setDeletingId(assetId);
      await onDelete(assetId);
      setDeletingId(null);
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Varlık Türü</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Detaylar</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Başlangıç Değeri</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Güncel Değer</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bağışçı</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Alınma Tarihi</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4">
              <span className="sr-only">İşlemler</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {assets.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-4 text-sm text-gray-500 text-center">
                Henüz varlık eklenmemiş
              </td>
            </tr>
          ) : (
            assets.map((asset) => (
              <tr key={asset.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                  {asset.assetType?.type ? ASSET_TYPE_NAMES[asset.assetType.type] : "Bilinmeyen Tür"}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {asset.assetType?.type === AssetType.BILEZIK || asset.assetType?.type === AssetType.GRAM_GOLD ? (
                    <>
                      {asset.grams} gram / {asset.carat} ayar
                    </>
                  ) : (asset.assetType?.type === AssetType.TURKISH_LIRA || 
                         asset.assetType?.type === AssetType.DOLLAR || 
                         asset.assetType?.type === AssetType.EURO) ? (
                    <>{asset.quantity} {
                      asset.assetType?.type === AssetType.TURKISH_LIRA ? "TL" :
                      asset.assetType?.type === AssetType.DOLLAR ? "USD" : "EUR"
                    }</>
                  ) : (
                    "1 adet"
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatCurrency(asset.initialValue)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatCurrency(calculateCurrentValue(asset))}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {asset.donor?.name || "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(asset.dateReceived)}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/varliklar/${asset.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Detay
                    </Link>
                    <Link
                      href={`/varliklar/${asset.id}/duzenle`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Düzenle
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => handleDeleteClick(asset.id)}
                        disabled={deletingId === asset.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deletingId === asset.id ? "Siliniyor..." : "Sil"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 