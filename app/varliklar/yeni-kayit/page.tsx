"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AssetType } from "@/types";
import Link from "next/link";
import { useWeddingDate } from "@/context/wedding-date-context";

// Map AssetType to Turkish display name
const assetTypeNames: Record<string, string> = {
  CEYREK_ALTIN: "Çeyrek Altın",
  TAM_ALTIN: "Tam Altın",
  RESAT: "Reşat",
  BESI_BIR_YERDE: "Beşi Bir Yerde",
  BILEZIK: "Bilezik",
  GRAM_GOLD: "Gram Altın",
  TURKISH_LIRA: "Türk Lirası",
  DOLLAR: "Dolar",
  EURO: "Euro",
};

export default function IntegratedAddPage() {
  const router = useRouter();
  const { weddingDate } = useWeddingDate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [donorName, setDonorName] = useState("");
  const [isGroomSide, setIsGroomSide] = useState(false);
  const [isBrideSide, setIsBrideSide] = useState(false);
  
  const [assetType, setAssetType] = useState<AssetType>(AssetType.CEYREK_ALTIN);
  const [quantity, setQuantity] = useState<number>(1);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [grams, setGrams] = useState<number | undefined>(undefined);
  const [carat, setCarat] = useState<number | undefined>(undefined);
  // Use wedding date as default if available, otherwise use current date
  const [dateReceived, setDateReceived] = useState<string>(
    weddingDate || new Date().toISOString().split("T")[0]
  );
  
  // Determine if fields should be shown based on asset type
  const showMoneyFields = assetType === AssetType.TURKISH_LIRA || assetType === AssetType.DOLLAR || assetType === AssetType.EURO;
  const showGoldFields = assetType === AssetType.BILEZIK || assetType === AssetType.GRAM_GOLD;
  
  const validateForm = (): boolean => {
    // Validate donor name
    if (!donorName.trim()) {
      setError("Bağışçı adı zorunludur.");
      return false;
    }
    
    // At least one side must be selected
    if (!isGroomSide && !isBrideSide) {
      setError("Gelin veya damat tarafı seçmelisiniz.");
      return false;
    }
    
    // Validate asset type-specific fields
    if (showMoneyFields && !amount) {
      setError("Para birimleri için miktar alanı zorunludur.");
      return false;
    }
    
    if (showGoldFields) {
      if (!grams) {
        setError("Gram alanı zorunludur.");
        return false;
      }
      
      if (!carat) {
        setError("Karat/Ayar seçmelisiniz.");
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 1. Create donor
      const donorResponse = await fetch("/api/donors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: donorName,
          isGroomSide,
          isBrideSide,
        }),
      });
      
      if (!donorResponse.ok) {
        const errorData = await donorResponse.json();
        throw new Error(errorData.error || "Bağışçı oluşturulamadı.");
      }
      
      const donor = await donorResponse.json();
      
      // 2. Create asset
      const assetResponse = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: assetType,
          quantity,
          amount,
          grams,
          carat,
          dateReceived,
          donorId: donor.id,
        }),
      });
      
      if (!assetResponse.ok) {
        const errorData = await assetResponse.json();
        throw new Error(errorData.error || "Varlık oluşturulamadı.");
      }
      
      // Redirect to the dashboard
      router.push("/kontrol-paneli");
      router.refresh();
    } catch (err: unknown) {
      console.error("Kayıt hatası:", err);
      setError(err instanceof Error ? err.message : "Kayıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Yeni Kayıt Ekle</h1>
          <p className="mt-2 text-lg text-gray-700">
            Bağışçı ve hediye bilgilerini tek adımda girin
          </p>
        </div>
        <div>
          <Link
            href="/kontrol-paneli"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Kontrol Paneline Dön
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor Section */}
            <div className="border-b border-gray-200 pb-5 mb-5">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Bağışçı Bilgileri</h3>
              
              <div>
                <label htmlFor="donorName" className="block text-sm font-medium leading-6 text-gray-900">
                  Bağışçı Adı
                </label>
                <div className="mt-2">
                  <input
                    id="donorName"
                    name="donorName"
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                  Taraf
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      id="isGroomSide"
                      name="isGroomSide"
                      type="checkbox"
                      checked={isGroomSide}
                      onChange={(e) => setIsGroomSide(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="isGroomSide" className="ml-2 block text-sm text-gray-900">
                      Damat Tarafı
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="isBrideSide"
                      name="isBrideSide"
                      type="checkbox"
                      checked={isBrideSide}
                      onChange={(e) => setIsBrideSide(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="isBrideSide" className="ml-2 block text-sm text-gray-900">
                      Gelin Tarafı
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Asset Section */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Hediye Bilgileri</h3>
              
              <div>
                <label htmlFor="assetType" className="block text-sm font-medium leading-6 text-gray-900">
                  Hediye Türü
                </label>
                <div className="mt-2">
                  <select
                    id="assetType"
                    name="assetType"
                    value={assetType}
                    onChange={(e) => {
                      setAssetType(e.target.value as AssetType);
                      // Reset fields when type changes
                      if (e.target.value === AssetType.BILEZIK || e.target.value === AssetType.GRAM_GOLD) {
                        setAmount(undefined);
                      } else if (
                        e.target.value === AssetType.TURKISH_LIRA || 
                        e.target.value === AssetType.DOLLAR || 
                        e.target.value === AssetType.EURO
                      ) {
                        setGrams(undefined);
                        setCarat(undefined);
                      } else {
                        setAmount(undefined);
                        setGrams(undefined);
                        setCarat(undefined);
                      }
                    }}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    {Object.entries(assetTypeNames).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="quantity" className="block text-sm font-medium leading-6 text-gray-900">
                  Adet
                </label>
                <div className="mt-2">
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              
              {showMoneyFields && (
                <div className="mt-4">
                  <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">
                    Miktar
                  </label>
                  <div className="mt-2">
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount || ""}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || undefined)}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              )}
              
              {showGoldFields && (
                <>
                  <div className="mt-4">
                    <label htmlFor="grams" className="block text-sm font-medium leading-6 text-gray-900">
                      Gram
                    </label>
                    <div className="mt-2">
                      <input
                        id="grams"
                        name="grams"
                        type="number"
                        step="0.01"
                        min="0"
                        value={grams || ""}
                        onChange={(e) => setGrams(parseFloat(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="carat" className="block text-sm font-medium leading-6 text-gray-900">
                      Karat (Ayar)
                    </label>
                    <div className="mt-2">
                      <select
                        id="carat"
                        name="carat"
                        value={carat || ""}
                        onChange={(e) => setCarat(parseInt(e.target.value) || undefined)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">Seçiniz</option>
                        <option value="14">14 Ayar</option>
                        <option value="18">18 Ayar</option>
                        <option value="22">22 Ayar</option>
                        <option value="24">24 Ayar</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <label htmlFor="dateReceived" className="block text-sm font-medium leading-6 text-gray-900">
                Alınma Tarihi
              </label>
              <div className="mt-2">
                <input
                  id="dateReceived"
                  name="dateReceived"
                  type="date"
                  required
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                {assetType === AssetType.CEYREK_ALTIN && (
                  <p className="mt-1 text-sm text-gray-500">
                    Çeyrek Altın değeri seçilen tarihe göre otomatik hesaplanacaktır.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-5">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 