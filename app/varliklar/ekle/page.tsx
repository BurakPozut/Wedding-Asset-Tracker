"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AssetForm } from "@/components/asset/asset-form";
import { AssetFormData, Donor } from "@/types";
import Link from "next/link";

export default function AddAssetPage() {
  const router = useRouter();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/donors");
        
        if (!response.ok) {
          throw new Error("Bağışçılar getirilemedi.");
        }
        
        const data = await response.json();
        setDonors(data);
      } catch (err) {
        console.error("Bağışçıları getirme hatası:", err);
        setError("Bağışçılar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDonors();
  }, []);
  
  const handleSubmit = async (data: AssetFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Varlık oluşturulamadı.");
      }
      
      // Redirect to the assets list page after successful creation
      router.push("/varliklar");
      router.refresh();
    } catch (err: unknown) {
      console.error("Varlık oluşturma hatası:", err);
      setError(err instanceof Error ? err.message : "Varlık oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Yeni Varlık Ekle</h1>
          <p className="mt-2 text-lg text-gray-700">
            Düğününüzde aldığınız hediye bilgilerini girin
          </p>
        </div>
        <div>
          <Link
            href="/varliklar"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Varlıklara Dön
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
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
      )}
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" role="status">
            <span className="sr-only">Yükleniyor...</span>
          </div>
          <p className="mt-2 text-gray-700">Bağışçılar yükleniyor...</p>
        </div>
      ) : donors.length === 0 && !error ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-700">Henüz hiç bağışçı eklenmemiş.</p>
          <p className="mt-2">
            <Link href="/bagiscilar/ekle" className="text-indigo-600 hover:text-indigo-500">
              Önce bir bağışçı ekleyin
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <AssetForm
              donors={donors}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
} 