"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Wedding = {
  id: string;
  name: string;
  date: Date | null;
  createdAt: Date;
  updatedAt: Date;
  member: {
    status: 'PENDING' | 'APPROVED';
  };
};

export default function WeddingSelection() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWeddings = async () => {
      try {
        const response = await fetch("/api/weddings");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const weddingsArray = Array.isArray(data) ? data : [];
        const validWeddings = weddingsArray.filter((wedding): wedding is Wedding => 
          wedding && 
          typeof wedding === 'object' && 
          'id' in wedding && 
          'name' in wedding &&
          'member' in wedding
        );
        setWeddings(validWeddings);
      } catch (error) {
        console.error("Error fetching weddings:", error);
        setWeddings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeddings();
  }, []);

  const handleWeddingSelect = (weddingId: string) => {
    localStorage.setItem("selectedWeddingId", weddingId);
    router.push("/kontrol-paneli");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (weddings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Düğün Bulunamadı
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Henüz bir düğün oluşturulmamış veya davet edilmediniz
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Düğün Seçimi
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Lütfen yönetmek istediğiniz düğünü seçin
          </p>
        </div>

        <div className="space-y-4">
          {weddings.map((wedding) => (
            <button
              key={wedding.id}
              onClick={() => handleWeddingSelect(wedding.id)}
              className={`w-full flex items-center justify-between p-6 rounded-xl border ${
                wedding.member.status === 'APPROVED' 
                  ? 'border-gray-200 hover:border-indigo-500' 
                  : 'border-yellow-200 bg-yellow-50'
              } shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{wedding.name}</h3>
                  {wedding.member.status === 'PENDING' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Onay Bekliyor
                    </span>
                  )}
                </div>
                {wedding.date && (
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(wedding.date).toLocaleDateString("tr-TR", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${wedding.member.status === 'APPROVED' ? 'text-indigo-500' : 'text-yellow-500'}`}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 