"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Wedding = {
  id: string;
  name: string;
  date: string | null;
};

export default function SearchWeddingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Wedding[]>([]);
  
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/weddings/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: searchName,
          date: searchDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Arama sırasında bir hata oluştu.");
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setError(error instanceof Error ? error.message : "Arama sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWedding = async (weddingId: string) => {
    try {
      const response = await fetch("/api/weddings/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weddingId }),
      });

      if (!response.ok) {
        throw new Error("Düğüne katılırken bir hata oluştu.");
      }

      // Redirect to dashboard after successful join
      router.push("/kontrol-paneli");
      router.refresh();
    } catch (error) {
      console.error("Join error:", error);
      setError(error instanceof Error ? error.message : "Düğüne katılırken bir hata oluştu.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Düğün Ara</h1>
      
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
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="searchName" className="block text-sm font-medium text-gray-700">
                  Düğün Adı
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="searchName"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
                    placeholder="Düğün adını girin"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="searchDate" className="block text-sm font-medium text-gray-700">
                  Düğün Tarihi
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="searchDate"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Aranıyor..." : "Ara"}
              </Button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Arama Sonuçları</h2>
              <div className="space-y-4">
                {searchResults.map((wedding) => (
                  <div key={wedding.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{wedding.name}</h3>
                      {wedding.date && (
                        <p className="text-sm text-gray-500">
                          {new Date(wedding.date).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleJoinWedding(wedding.id)}
                      variant="outline"
                    >
                      Katıl
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && !isLoading && searchName && (
            <div className="mt-8 text-center text-gray-500">
              Sonuç bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 