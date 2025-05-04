"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DonorForm } from "@/components/donor/donor-form";
import { DonorFormData } from "@/types";
import Link from "next/link";

export default function AddDonorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (data: DonorFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch("/api/donors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Bağışçı oluşturulamadı.");
      }
      
      // Redirect to the donors list page after successful creation
      router.push("/bagiscilar");
      router.refresh();
    } catch (err: unknown) {
      console.error("Bağışçı oluşturma hatası:", err);
      setError(err instanceof Error ? err.message : "Bağışçı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Yeni Bağışçı Ekle</h1>
          <p className="mt-2 text-lg text-gray-700">
            Hediye veren kişi bilgilerini girin
          </p>
        </div>
        <div>
          <Link
            href="/bagiscilar"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Bağışçılara Dön
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
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <DonorForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
} 