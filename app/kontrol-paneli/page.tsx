"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculatePortfolioChange, formatCurrency, formatPercentage } from "@/lib/portfolio";
import { ASSET_TYPE_NAMES } from "@/lib/constants";
import { AssetType } from "@/types";
import { Button } from "@/components/ui/button";
import Loading from "./loading";

type Wedding = {
  id: string;
  name: string;
  date: string | null;
};

type Asset = {
  id: string;
  type: AssetType;
  initialValue: number;
  donorName: string;
  date: string;
  donorId: string;
  assetType: {
    type: AssetType;
    currentValue: number;
  };
  dateReceived: Date;
  donor: {
    name: string;
  };
};

type Donor = {
  id: string;
  name: string;
  isGroomSide: boolean;
  isBrideSide: boolean;
};

function DashboardContent() {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const selectedWeddingId = localStorage.getItem("selectedWeddingId");
        
        if (!selectedWeddingId) {
          router.push("/dugun-secimi");
          return;
        }

        // Fetch wedding data
        const weddingResponse = await fetch(`/api/weddings/${selectedWeddingId}`);
        if (!weddingResponse.ok) {
          localStorage.removeItem("selectedWeddingId");
          router.push("/dugun-secimi");
          return;
        }
        const weddingData = await weddingResponse.json();
        setWedding(weddingData);

        // Fetch assets and donors
        const [assetsResponse, donorsResponse] = await Promise.all([
          fetch(`/api/assets?weddingId=${selectedWeddingId}`),
          fetch(`/api/donors?weddingId=${selectedWeddingId}`)
        ]);

        if (assetsResponse.ok) {
          const assetsData = await assetsResponse.json();
          setAssets(assetsData.assets);
        }

        if (donorsResponse.ok) {
          const donorsData = await donorsResponse.json();
          setDonors(donorsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [router]);

  const handleWeddingChange = () => {
    router.push("/dugun-secimi");
  };


  if (!wedding) {
    return null;
  }

  // Calculate total value
  const totalValue = assets.reduce((sum, asset) => sum + asset.initialValue, 0);
  
  // Calculate portfolio change
  const portfolioChange = calculatePortfolioChange(assets);
  
  // Calculate side distribution
  const sideDistribution = {
    groom: 0,
    bride: 0,
    both: 0,
  };
  
  for (const asset of assets) {
    const donor = donors.find(d => d.id === asset.donorId);
    if (donor) {
      if (donor.isGroomSide && donor.isBrideSide) {
        sideDistribution.both += asset.initialValue;
      } else if (donor.isGroomSide) {
        sideDistribution.groom += asset.initialValue;
      } else if (donor.isBrideSide) {
        sideDistribution.bride += asset.initialValue;
      }
    }
  }
  
  // Add half of "both" to each side for display
  const displayGroomValue = sideDistribution.groom + (sideDistribution.both / 2);
  const displayBrideValue = sideDistribution.bride + (sideDistribution.both / 2);
  
  // Calculate asset types summary
  const assetTypeMap = new Map();
  
  for (const asset of assets) {
    const type = asset.assetType.type;
    if (!assetTypeMap.has(type)) {
      assetTypeMap.set(type, { type, count: 0, totalValue: 0 });
    }
    
    const typeData = assetTypeMap.get(type);
    typeData.count += 1;
    typeData.totalValue += asset.initialValue;
  }
  
  const assetTypes = Array.from(assetTypeMap.values())
    .sort((a, b) => b.totalValue - a.totalValue);
  
  // Get recent assets
  const recentAssets = assets.slice(0, 3).map(asset => ({
    id: asset.id,
    type: asset.assetType.type,
    initialValue: asset.initialValue,
    donorName: asset.donor.name,
    date: new Date(asset.dateReceived).toISOString().split('T')[0],
  }));

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{wedding.name}</h1>
          <p className="mt-2 text-lg text-gray-700">
            {wedding.date ? new Date(wedding.date).toLocaleDateString('tr-TR') : 'Tarih belirlenmemiş'}
          </p>
        </div>
        <Button
          onClick={handleWeddingChange}
          variant="outline"
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 21h5v-5"/>
          </svg>
          Düğün Değiştir
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Toplam Varlık</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{assets.length}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Toplam Değer</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(totalValue)}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Toplam Bağışçı</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{donors.length}</dd>
          </div>
        </div>
        
        <div className={`bg-white overflow-hidden shadow rounded-lg ${
          portfolioChange.isProfit ? 'border-green-200' : 'border-red-200'
        } border-2`}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Portföy Değişimi</dt>
            <dd className={`mt-1 text-3xl font-semibold ${
              portfolioChange.isProfit ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(portfolioChange.changeAmount)}
            </dd>
            <p className={`text-sm ${
              portfolioChange.isProfit ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(portfolioChange.changePercentage)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Side Distribution */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Gelin/Damat Tarafı Dağılımı</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-indigo-600">Damat Tarafı</p>
              <p className="mt-2 text-xl font-semibold text-indigo-900">{formatCurrency(displayGroomValue)}</p>
              <p className="mt-1 text-sm text-indigo-700">
                {totalValue > 0 ? Math.round((displayGroomValue / totalValue) * 100) : 0}%
              </p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-pink-600">Gelin Tarafı</p>
              <p className="mt-2 text-xl font-semibold text-pink-900">{formatCurrency(displayBrideValue)}</p>
              <p className="mt-1 text-sm text-pink-700">
                {totalValue > 0 ? Math.round((displayBrideValue / totalValue) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assets */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Son Eklenen Varlıklar</h3>
              <Link href="/varliklar" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Tümünü Görüntüle
              </Link>
            </div>
            {recentAssets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Tür</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Değer</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bağışçı</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {ASSET_TYPE_NAMES[asset.type as AssetType]}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(asset.initialValue)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{asset.donorName}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(asset.date).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Henüz varlık eklenmemiş</p>
            )}
          </div>
        </div>
        
        {/* Asset Types */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Varlık Türleri</h3>
            {assetTypes.length > 0 ? (
              <div className="space-y-4">
                {assetTypes.map((item) => (
                  <div key={item.type} className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{ASSET_TYPE_NAMES[item.type as AssetType]}</p>
                      <p className="text-sm text-gray-500">{item.count} adet</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(item.totalValue)}</p>
                      <p className="text-sm text-gray-500">
                        {totalValue > 0 ? Math.round((item.totalValue / totalValue) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Henüz varlık eklenmemiş</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex space-x-4">
        <Link 
          href="/varliklar/yeni-kayit"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Yeni Kayıt Ekle
        </Link>
        
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
} 