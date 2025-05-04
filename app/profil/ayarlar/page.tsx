"use client";

import { useState, useEffect } from "react";
import { useWeddingDate } from "@/context/wedding-date-context";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { weddingDate, setWeddingDate, isLoading } = useWeddingDate();
  const [updatedDate, setUpdatedDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (weddingDate) {
      setUpdatedDate(weddingDate);
    }
  }, [weddingDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updatedDate) {
      setMessage({ text: "Lütfen düğün tarihinizi giriniz.", type: "error" });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      setWeddingDate(updatedDate);
      setMessage({ text: "Düğün tarihi başarıyla güncellendi.", type: "success" });
    } catch {
      setMessage({ text: "Düğün tarihi güncellenirken bir hata oluştu.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Profil Ayarları</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Profil Ayarları</h1>
      
      {message && (
        <div className={`mb-6 rounded-md p-4 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Düğün Bilgileri</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700 mb-1">
                Düğün Tarihi
              </label>
              <input
                type="date"
                id="weddingDate"
                value={updatedDate}
                onChange={(e) => setUpdatedDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Bu tarih, yeni hediye eklerken varsayılan alınma tarihi olarak kullanılacaktır.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 