"use client";

import { useEffect, useState } from "react";
import { Donor } from "@/types";
import { DonorCard } from "@/components/donor/donor-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
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
  
  // Group donors by type
  const groomSideDonors = donors.filter(donor => donor.isGroomSide);
  const brideSideDonors = donors.filter(donor => donor.isBrideSide);
  const otherDonors = donors.filter(donor => !donor.isGroomSide && !donor.isBrideSide);
  
  return (
    <div>
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bağışçılar</h1>
          <p className="mt-2 text-lg text-gray-700">
            Düğününüzdeki hediye sahipleri
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/bagiscilar/ekle">
            <Button>
              <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Yeni Bağışçı Ekle
            </Button>
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" role="status">
            <span className="sr-only">Yükleniyor...</span>
          </div>
          <p className="mt-2 text-gray-700">Bağışçılar yükleniyor...</p>
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
      ) : donors.length === 0 ? (
        <div className="text-center py-8 bg-white shadow rounded-lg">
          <p className="text-gray-700">Henüz hiç bağışçı eklenmemiş.</p>
          <p className="mt-4">
            <Link href="/bagiscilar/ekle" className="text-indigo-600 hover:text-indigo-500">
              İlk bağışçınızı ekleyin
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groomSideDonors.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Damat Tarafı</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groomSideDonors.map((donor) => (
                  <DonorCard key={donor.id} donor={donor} />
                ))}
              </div>
            </div>
          )}
          
          {brideSideDonors.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gelin Tarafı</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brideSideDonors.map((donor) => (
                  <DonorCard key={donor.id} donor={donor} />
                ))}
              </div>
            </div>
          )}
          
          {otherDonors.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Diğer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherDonors.map((donor) => (
                  <DonorCard key={donor.id} donor={donor} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 