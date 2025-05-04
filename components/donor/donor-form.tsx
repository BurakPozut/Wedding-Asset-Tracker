"use client";

import { DonorFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type DonorFormProps = {
  initialData?: DonorFormData;
  onSubmit: (data: DonorFormData) => Promise<void>;
  isSubmitting?: boolean;
};

export function DonorForm({ initialData, onSubmit, isSubmitting = false }: DonorFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [isGroomSide, setIsGroomSide] = useState(initialData?.isGroomSide || false);
  const [isBrideSide, setIsBrideSide] = useState(initialData?.isBrideSide || false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: DonorFormData = {
      name,
      isGroomSide,
      isBrideSide,
    };
    
    await onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
          İsim Soyisim
        </label>
        <div className="mt-2">
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      
      <div>
        <fieldset>
          <legend className="text-sm font-medium leading-6 text-gray-900">Taraf</legend>
          <div className="mt-2 space-y-2">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="isGroomSide"
                  name="isGroomSide"
                  type="checkbox"
                  checked={isGroomSide}
                  onChange={(e) => setIsGroomSide(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="isGroomSide" className="font-medium text-gray-900">
                  Damat Tarafı
                </label>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="isBrideSide"
                  name="isBrideSide"
                  type="checkbox"
                  checked={isBrideSide}
                  onChange={(e) => setIsBrideSide(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="isBrideSide" className="font-medium text-gray-900">
                  Gelin Tarafı
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Kaydediliyor..." : initialData ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
} 