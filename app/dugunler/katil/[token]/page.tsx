"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [weddingName, setWeddingName] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/weddings/invitation/${token}`);
        if (!response.ok) {
          throw new Error("Geçersiz veya süresi dolmuş davet linki.");
        }
        const data = await response.json();
        setWeddingName(data.weddingName);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleJoinRequest = async () => {
    if (status === "unauthenticated") {
      // Store the token in localStorage and redirect to login
      localStorage.setItem("invitationToken", token);
      router.push("/auth/giris");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/weddings/invitation/${token}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Katılım isteği gönderilirken bir hata oluştu.");
      }

      // Show success message and redirect to home
      setMessage({ text: "Katılım isteğiniz başarıyla gönderildi. Yönetici onayı bekleniyor.", type: "success" });
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Yükleniyor...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Hata</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Düğün Daveti</h2>
        {message && (
          <div className={`mb-4 rounded-md p-4 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {message.text}
          </div>
        )}
        <p className="text-gray-600 mb-6 text-center">
          {weddingName} düğününe katılmak için davet edildiniz.
        </p>
        <div className="space-y-4">
          {status === "unauthenticated" ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Katılım isteği göndermek için giriş yapmanız gerekiyor.
              </p>
              <Button onClick={handleJoinRequest} className="w-full">
                Katılmak İçin Giriş Yap
              </Button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4 text-center">
                Katılım isteğiniz yöneticiye iletilecek ve onaylandıktan sonra düğün detaylarına erişebileceksiniz.
              </p>
              <Button
                onClick={handleJoinRequest}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "İşleniyor..." : "Katılım İsteği Gönder"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 