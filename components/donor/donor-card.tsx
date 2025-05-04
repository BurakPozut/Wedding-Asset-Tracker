"use client";

import { Donor } from "@/types";
import Link from "next/link";

type DonorCardProps = {
  donor: Donor;
  assetCount?: number;
  totalValue?: number;
};

export function DonorCard({ donor, assetCount, totalValue }: DonorCardProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{donor.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              {donor.isGroomSide && (
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                  Damat Tarafı
                </span>
              )}
              {donor.isBrideSide && (
                <span className="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700">
                  Gelin Tarafı
                </span>
              )}
              {!donor.isGroomSide && !donor.isBrideSide && (
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
                  Belirsiz
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/bagiscilar/${donor.id}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Detayları Görüntüle
          </Link>
        </div>
        
        {assetCount !== undefined && totalValue !== undefined && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Varlık Sayısı</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{assetCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Değer</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 