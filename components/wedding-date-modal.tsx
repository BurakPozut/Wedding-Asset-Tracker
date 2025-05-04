"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface WeddingDateModalProps {
  onDateSet: (date: string) => void;
}

export function WeddingDateModal({ onDateSet }: WeddingDateModalProps) {
  const [date, setDate] = useState<string>("");
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      setError("Lütfen düğün tarihinizi giriniz.");
      return;
    }
    
    onDateSet(date);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Düğün Tarihiniz</h2>
        <p className="text-gray-500 mb-6">
          Düğün tarihinizi giriniz. Bu tarih hediye kayıt formunda varsayılan tarih olarak kullanılacaktır.
        </p>

        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700 mb-1">
              Düğün Tarihi
            </label>
            <input
              type="date"
              id="weddingDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="w-full">
              Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 