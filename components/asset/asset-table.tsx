"use client";

import { Asset, AssetType } from "@/types";
import { ASSET_TYPE_NAMES } from "@/lib/constants";

interface AssetTableProps {
  assets: Asset[];
  onDelete: (assetId: string) => void;
  isAdmin: boolean;
}

export function AssetTable({ assets, onDelete, isAdmin }: AssetTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("tr-TR");
  };

  const getAssetTypeName = (type: AssetType) => {
    return ASSET_TYPE_NAMES[type] || "Bilinmeyen Tür";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Tür</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Miktar</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Gram</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ayar</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Değer</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bağışçı</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarih</th>
            {isAdmin && (
              <th scope="col" className="relative py-3.5 pl-3 pr-4">
                <span className="sr-only">İşlemler</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {asset.assetType?.type ? getAssetTypeName(asset.assetType.type) : "Bilinmeyen Tür"}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{asset.quantity}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{asset.grams || "-"}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{asset.carat || "-"}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(asset.initialValue)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{asset.donor?.name || "-"}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(asset.dateReceived)}</td>
              {isAdmin && (
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(asset.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Sil
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 