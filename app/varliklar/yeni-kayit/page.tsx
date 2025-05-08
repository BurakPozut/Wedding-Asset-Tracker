"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AssetType } from "@/types";
import Link from "next/link";
import { ASSET_TYPE_NAMES, CURRENCY_ASSETS, GRAM_REQUIRED_ASSETS } from "@/lib/constants";
import dynamic from 'next/dynamic';
import type { SingleValue } from 'react-select';

const Select = dynamic(() => import('react-select'), {
  ssr: false
}) as typeof import('react-select').default;

type AssetTypeOption = {
  value: AssetType;
  label: string;
};

// Create sorted asset type options
const assetTypeOptions: AssetTypeOption[] = Object.entries(ASSET_TYPE_NAMES)
  .sort(([, a], [, b]) => a.localeCompare(b, 'tr'))
  .map(([value, label]) => ({
    value: value as AssetType,
    label
  }));

export default function IntegratedAddPage() {
  const router = useRouter();
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
  const [dateReceived, setDateReceived] = useState<string>("");

  useEffect(() => {
    // Fetch wedding date and set it as default
    const fetchWeddingDate = async () => {
      try {
        const response = await fetch("/api/weddings");
        if (response.ok) {
          const data = await response.json();
          if (data?.date) {
            setDateReceived(new Date(data.date).toISOString().split('T')[0]);
          } else {
            // If no wedding date is set, use current date
            setDateReceived(new Date().toISOString().split('T')[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching wedding date:", error);
        // If there's an error, use current date
        setDateReceived(new Date().toISOString().split('T')[0]);
      }
    };

    fetchWeddingDate();
  }, []);
  
  // Determine if fields should be shown based on asset type
  const showMoneyFields = CURRENCY_ASSETS.includes(assetType);
  const showGoldFields = GRAM_REQUIRED_ASSETS.includes(assetType);
  
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
    if (showMoneyFields) {
      // For money/currency fields
      if (!amount) {
        setError("Para birimleri için miktar alanı zorunludur.");
        return false;
      }
    } else if (showGoldFields) {
      // For gold fields that need grams
      if (!grams) {
        setError("Gram alanı zorunludur.");
        return false;
      }
      if (!carat) {
        setError("Karat (Ayar) alanı zorunludur.");
        return false;
      }
    } else {
      // Standard gold items like CEYREK_ALTIN that only need quantity
      if (quantity < 1) {
        setError("Adet en az 1 olmalıdır.");
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
      // For currency assets, we use the quantity directly
      const assetData = {
        type: assetType,
        quantity: showMoneyFields ? amount : quantity,
        grams,
        carat,
        dateReceived,
        donorId: donor.id,
      };
      
      const assetResponse = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assetData),
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
                    type="text"
                    id="donorName"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
                    placeholder="Bağışçının adını girin"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                  Taraf
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={isGroomSide}
                      onChange={(e) => setIsGroomSide(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Damat Tarafı</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={isBrideSide}
                      onChange={(e) => setIsBrideSide(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Gelin Tarafı</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Asset Section */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Hediye Bilgileri</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="assetType" className="block text-sm font-medium leading-6 text-gray-900">
                    Hediye Türü
                  </label>
                  <div className="mt-2">
                    <Select
                      id="assetType"
                      value={{ value: assetType, label: ASSET_TYPE_NAMES[assetType] }}
                      onChange={(option: SingleValue<AssetTypeOption>) => {
                        if (option) {
                          setAssetType(option.value);
                          // Reset fields when type changes
                          setAmount(undefined);
                          setGrams(undefined);
                          setCarat(undefined);
                          setQuantity(1);
                        }
                      }}
                      options={assetTypeOptions}
                      className="basic-single"
                      classNamePrefix="select"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dateReceived" className="block text-sm font-medium leading-6 text-gray-900">
                    Alınma Tarihi
                  </label>
                  <div className="mt-2">
                    <input
                      type="date"
                      id="dateReceived"
                      value={dateReceived}
                      onChange={(e) => setDateReceived(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
                    />
                  </div>
                </div>
              </div>
              
              {/* Dynamic fields based on asset type */}
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {showMoneyFields ? (
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">
                      Miktar
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="amount"
                        value={amount || ''}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
                        placeholder="Miktar girin"
                      />
                    </div>
                  </div>
                ) : showGoldFields ? (
                  <>
                    <div>
                      <label htmlFor="grams" className="block text-sm font-medium leading-6 text-gray-900">
                        Gram
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          id="grams"
                          value={grams || ''}
                          onChange={(e) => setGrams(parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
                          placeholder="Gram girin"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="carat" className="block text-sm font-medium leading-6 text-gray-900">
                        Karat (Ayar)
                      </label>
                      <div className="mt-2">
                        <input
                          type="number"
                          id="carat"
                          value={carat || ''}
                          onChange={(e) => setCarat(parseInt(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
                          placeholder="Karat girin"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium leading-6 text-gray-900">
                      Adet
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        min="1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
                      />
                    </div>
                  </div>
                )}
              </div>
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