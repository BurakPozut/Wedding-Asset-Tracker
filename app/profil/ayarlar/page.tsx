"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

type WeddingMember = {
  id: string;
  role: 'ADMIN' | 'VIEWER';
  user: {
    name: string;
    email: string;
  };
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [members, setMembers] = useState<WeddingMember[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Fetch current wedding date and members
    const fetchWeddingData = async () => {
      try {
        const response = await fetch("/api/weddings");
        if (response.ok) {
          const data = await response.json();
          if (data?.date) {
            setWeddingDate(new Date(data.date).toISOString().split('T')[0]);
          }
          if (data?.members) {
            setMembers(data.members);
            // Check if current user is admin
            const currentUserMember = data.members.find((m: WeddingMember) => m.user.email === session?.user?.email);
            setIsAdmin(currentUserMember?.role === 'ADMIN');
          }
        }
      } catch (error) {
        console.error("Error fetching wedding data:", error);
      }
    };

    if (session) {
      fetchWeddingData();
    }
  }, [session]);

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

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Bu üyeyi düğünden çıkarmak istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/weddings/members/${memberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMembers(members.filter(m => m.id !== memberId));
        setMessage({ text: "Üye başarıyla çıkarıldı.", type: "success" });
      } else {
        setMessage({ text: "Üye çıkarılırken bir hata oluştu.", type: "error" });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      setMessage({ text: "Bir hata oluştu. Lütfen tekrar deneyin.", type: "error" });
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
      
      <div className="bg-white shadow rounded-lg mb-8">
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

      {/* Wedding Members Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Düğün Üyeleri</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">İsim</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">E-posta</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rol</th>
                  {isAdmin && (
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {member.user?.name || 'İsimsiz Kullanıcı'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {member.user?.email || 'E-posta yok'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {member.role === 'ADMIN' ? 'Yönetici' : 'Görüntüleyici'}
                    </td>
                    {isAdmin && member.role === 'VIEWER' && (
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Çıkar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 