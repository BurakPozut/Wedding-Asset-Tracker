"use client";

import { Asset, AssetType } from "@/types";
import Link from "next/link";
import { useState } from "react";

type AssetTableProps = {
  assets: Asset[];
  onDelete?: (assetId: string) => void;
};

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
                  {assetTypeNames[asset.assetType.type]}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {asset.assetType.type === AssetType.BILEZIK || asset.assetType.type === AssetType.GRAM_GOLD ? (
                    <>
                      {asset.grams} gram / {asset.carat} ayar
                    </>
                  ) : (asset.assetType.type === AssetType.TURKISH_LIRA || 
                         asset.assetType.type === AssetType.DOLLAR || 
                         asset.assetType.type === AssetType.EURO) ? (
                    <>{asset.amount} {
                      asset.assetType.type === AssetType.TURKISH_LIRA ? "TL" :
                      asset.assetType.type === AssetType.DOLLAR ? "USD" : "EUR"
                    }</>
                  ) : (
                    "1 adet"
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatCurrency(asset.initialValue)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {asset.currentValue ? formatCurrency(asset.currentValue) : "-"}
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