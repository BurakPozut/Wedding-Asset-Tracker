"use client";

import { useState, useEffect } from "react";
import { Asset, AssetFormData, AssetType, Donor } from "@/types";
import { Button } from "@/components/ui/button";

type AssetFormProps = {
  initialData?: Partial<Asset>;
  donors: Donor[];
  onSubmit: (data: AssetFormData) => Promise<void>;
  isSubmitting?: boolean;
};

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

export function AssetForm({ initialData, donors, onSubmit, isSubmitting = false }: AssetFormProps) {
  const [type, setType] = useState<AssetType>(initialData?.type || AssetType.CEYREK_ALTIN);
  const [amount, setAmount] = useState<number | undefined>(initialData?.amount || undefined);
  const [grams, setGrams] = useState<number | undefined>(initialData?.grams || undefined);
  const [carat, setCarat] = useState<number | undefined>(initialData?.carat || undefined);
  const [initialValue, setInitialValue] = useState<number>(initialData?.initialValue || 0);
  const [currentValue, setCurrentValue] = useState<number | undefined>(initialData?.currentValue || undefined);
  const [dateReceived, setDateReceived] = useState<string>(
    initialData?.dateReceived 
      ? new Date(initialData.dateReceived).toISOString().split("T")[0] 
      : new Date().toISOString().split("T")[0]
  );
  const [donorId, setDonorId] = useState<string>(initialData?.donorId || "");

  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Reset fields based on asset type
  useEffect(() => {
    if (type === AssetType.BILEZIK || type === AssetType.GRAM_GOLD) {
      setAmount(undefined);
    } else if (type === AssetType.TURKISH_LIRA || type === AssetType.DOLLAR || type === AssetType.EURO) {
      setGrams(undefined);
      setCarat(undefined);
    } else {
      setAmount(undefined);
      setGrams(undefined);
      setCarat(undefined);
    }
  }, [type]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // Validate required fields based on asset type
    if (!donorId) {
      setValidationError("Lütfen bir bağışçı seçin.");
      return;
    }
    
    if (type === AssetType.BILEZIK || type === AssetType.GRAM_GOLD) {
      if (!grams || !carat) {
        setValidationError("Bilezik ve Gram Altın için gram ve karat alanları zorunludur.");
        return;
      }
    }
    
    if (type === AssetType.TURKISH_LIRA || type === AssetType.DOLLAR || type === AssetType.EURO) {
      if (!amount) {
        setValidationError("Para birimleri için miktar alanı zorunludur.");
        return;
      }
    }
    
    if (!initialValue || initialValue <= 0) {
      setValidationError("Lütfen geçerli bir başlangıç değeri girin.");
      return;
    }
    
    const formData: AssetFormData = {
      type,
      amount,
      grams,
      carat,
      initialValue,
      currentValue,
      dateReceived,
      donorId,
    };
    
    await onSubmit(formData);
  };
  
  // Determine if fields should be shown based on asset type
  const showMoneyFields = type === AssetType.TURKISH_LIRA || type === AssetType.DOLLAR || type === AssetType.EURO;
  const showGoldFields = type === AssetType.BILEZIK || type === AssetType.GRAM_GOLD;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{validationError}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900">
          Varlık Türü
        </label>
        <div className="mt-2">
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as AssetType)}
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
      
      {showMoneyFields && (
        <div>
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
          <div>
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
          
          <div>
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
      
      <div>
        <label htmlFor="initialValue" className="block text-sm font-medium leading-6 text-gray-900">
          Başlangıç Değeri (TL)
        </label>
        <div className="mt-2">
          <input
            id="initialValue"
            name="initialValue"
            type="number"
            step="0.01"
            min="0"
            required
            value={initialValue || ""}
            onChange={(e) => setInitialValue(parseFloat(e.target.value) || 0)}
            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="currentValue" className="block text-sm font-medium leading-6 text-gray-900">
          Güncel Değer (TL) <span className="text-gray-500 text-xs">(Opsiyonel)</span>
        </label>
        <div className="mt-2">
          <input
            id="currentValue"
            name="currentValue"
            type="number"
            step="0.01"
            min="0"
            value={currentValue || ""}
            onChange={(e) => setCurrentValue(parseFloat(e.target.value) || undefined)}
            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      
      <div>
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
        </div>
      </div>
      
      <div>
        <label htmlFor="donorId" className="block text-sm font-medium leading-6 text-gray-900">
          Bağışçı
        </label>
        <div className="mt-2">
          <select
            id="donorId"
            name="donorId"
            required
            value={donorId}
            onChange={(e) => setDonorId(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="">Bağışçı Seçin</option>
            {donors.map((donor) => (
              <option key={donor.id} value={donor.id}>
                {donor.name} {donor.isGroomSide && "(Damat Tarafı)"} {donor.isBrideSide && "(Gelin Tarafı)"}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Kaydediliyor..." : initialData?.id ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
} 