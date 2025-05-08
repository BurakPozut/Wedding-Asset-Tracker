"use client";

import { useEffect, useState } from "react";
import { Asset } from "@/types";
import { AssetTable } from "@/components/asset/asset-table";
import { AssetSummary } from "@/components/asset/asset-summary";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("/api/assets");
        
        if (!response.ok) {
          throw new Error("Varlıklar getirilemedi.");
        }
        
        const data = await response.json();
        setAssets(data.assets);
        setIsAdmin(data.isAdmin);
      } catch (err) {
        console.error("Varlıkları getirme hatası:", err);
        setError("Varlıklar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssets();
  }, []);
  
  const handleDeleteAsset = async (assetId: string) => {
    if (!isAdmin) {
      alert("Bu işlem için yetkiniz bulunmamaktadır.");
      return;
    }

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Varlık silinemedi.");
      }
      
      // Remove the deleted asset from the list
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetId));
    } catch (err) {
      console.error("Varlık silme hatası:", err);
      alert("Varlık silinirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };
  
  return (
    <div>
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Varlıklar</h1>
          <p className="mt-2 text-lg text-gray-700">
            Düğününüzde aldığınız tüm hediyeleriniz
          </p>
        </div>
        {isAdmin && (
          <div className="mt-4 sm:mt-0">
            <Link href="/varliklar/yeni-kayit">
              <Button>
                <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Yeni Varlık Ekle
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" role="status">
            <span className="sr-only">Yükleniyor...</span>
          </div>
          <p className="mt-2 text-gray-700">Varlıklar yükleniyor...</p>
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
      ) : (
        <>
          {/* Asset Summary */}
          {assets.length > 0 && <AssetSummary assets={assets} />}
          
          {/* Asset Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <AssetTable assets={assets} onDelete={handleDeleteAsset} isAdmin={isAdmin} />
            </div>
          </div>
        </>
      )}
    </div>
  );
} 