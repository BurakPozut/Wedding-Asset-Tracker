"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Asset, Donor } from "@/types";
import { AssetTable } from "@/components/asset/asset-table";
import Link from "next/link";

export default function DonorDetailPage() {
  // Use the useParams hook to get route parameters
  const params = useParams<{ id: string }>();
  const id = params.id;
  
  const router = useRouter();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchDonorDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const selectedWeddingId = localStorage.getItem("selectedWeddingId");
        
        if (!selectedWeddingId) {
          router.push("/dugun-secimi");
          return;
        }
        
        const response = await fetch(`/api/donors/${id}?weddingId=${selectedWeddingId}`);
        
        if (!response.ok) {
          if (response.status === 403) {
            localStorage.removeItem("selectedWeddingId");
            router.push("/dugun-secimi");
            return;
          }
          throw new Error("Bağışçı bilgileri getirilemedi.");
        }
        
        const data = await response.json();
        setDonor(data);
        setAssets(data.assets || []);
        setIsAdmin(data.isAdmin || false);
      } catch (err) {
        console.error("Bağışçı detayı getirme hatası:", err);
        setError("Bağışçı bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchDonorDetails();
    }
  }, [id, router]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };
  
  // Calculate total value
  const totalValue = assets.reduce((sum, asset) => sum + asset.initialValue, 0);
  
  const handleDeleteAsset = async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Varlık silinemedi.");
      }
      
      // Remove the deleted asset from the list
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetId));
      
      // If no assets remain, go back to the donors list
      if (assets.length <= 1) {
        router.push("/bagiscilar");
      }
    } catch (err) {
      console.error("Varlık silme hatası:", err);
      alert("Varlık silinirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };
  
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Link 
            href="/bagiscilar" 
            className="text-indigo-600 hover:text-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bağışçı Detayları</h1>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" role="status">
            <span className="sr-only">Yükleniyor...</span>
          </div>
          <p className="mt-2 text-gray-700">Bağışçı bilgileri yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      ) : !donor ? (
        <div className="text-center py-8 bg-white shadow rounded-lg">
          <p className="text-gray-700">Bağışçı bulunamadı.</p>
          <p className="mt-4">
            <Link href="/bagiscilar" className="text-indigo-600 hover:text-indigo-500">
              Bağışçılar listesine dön
            </Link>
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{donor.name}</h2>
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
              <div className="mt-4 sm:mt-0">
                <p className="text-sm font-medium text-gray-500">Varlık Sayısı</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{assets.length}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-sm font-medium text-gray-500">Toplam Değer</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Bağışçının Varlıkları</h3>
                <Link href={`/varliklar/yeni-kayit?donorId=${donor.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Varlık Ekle
                </Link>
              </div>
              
              {assets.length > 0 ? (
                <AssetTable assets={assets} onDelete={handleDeleteAsset} isAdmin={isAdmin} />
              ) : (
                <p className="text-sm text-gray-500">Bu bağışçıya ait varlık bulunmamaktadır.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 