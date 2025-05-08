"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [weddingDate, setWeddingDate] = useState<string>("");

  useEffect(() => {
    // Fetch current wedding date
    const fetchWeddingDate = async () => {
      try {
        const response = await fetch("/api/weddings");
        if (response.ok) {
          const data = await response.json();
          if (data?.date) {
            setWeddingDate(new Date(data.date).toISOString().split('T')[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching wedding date:", error);
      }
    };

    fetchWeddingDate();
  }, []);

  const handleSaveWeddingDate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/weddings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: weddingDate }),
      });

      if (response.ok) {
        setMessage({ text: "Düğün tarihi başarıyla kaydedildi.", type: "success" });
      } else {
        setMessage({ text: "Düğün tarihi kaydedilirken bir hata oluştu.", type: "error" });
      }
    } catch (error) {
      console.error("Error saving wedding date:", error);
      setMessage({ text: "Bir hata oluştu. Lütfen tekrar deneyin.", type: "error" });
    } finally {
      setIsLoading(false);
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
          <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Düğün Ayarları</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700">
                Düğün Tarihi
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="weddingDate"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Düğün tarihini belirleyin. Bu tarih, varlık kayıtlarında referans olarak kullanılacaktır.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveWeddingDate}
                disabled={isLoading}
              >
                {isLoading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 