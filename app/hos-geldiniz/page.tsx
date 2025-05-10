"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Welcome() {
  const { status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const handleInvitationToken = async () => {
      const invitationToken = localStorage.getItem("invitationToken");
      if (invitationToken) {
        try {
          const response = await fetch(`/api/weddings/invitation/${invitationToken}/accept`, {
            method: "POST",
          });

          if (response.ok) {
            // Clear the token from localStorage
            localStorage.removeItem("invitationToken");
            // Show success message
            setMessage({
              text: "Katılım isteğiniz düğün sahibine iletilmiştir. Onaylandıktan sonra düğün detaylarına erişebileceksiniz.",
              type: "success"
            });
          } else {
            // If there's an error, show error message
            setMessage({
              text: "Katılım isteği gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
              type: "error"
            });
            localStorage.removeItem("invitationToken");
          }
        } catch (error) {
          console.error("Error accepting invitation:", error);
          setMessage({
            text: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            type: "error"
          });
          localStorage.removeItem("invitationToken");
        }
      }
    };

    if (status === "authenticated") {
      handleInvitationToken();
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Yükleniyor...
          </h2>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/giris");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Hoş Geldiniz!
        </h2>
        {message && (
          <div className={`mt-4 rounded-md p-4 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {message.text}
          </div>
        )}
        <p className="mt-2 text-center text-sm text-gray-600">
          Düğün hediyelerinizi takip etmeye başlamak için bir seçim yapın
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="mt-8 space-y-4">
              <Link
                href="/dugunler/yeni"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Yeni Düğün Oluştur
              </Link>
              <Link
                href="/dugunler/ara"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Mevcut Düğüne Katıl
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 