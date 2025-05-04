import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WeddingDateProvider } from "@/context/wedding-date-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Düğün Hediye Takibi",
  description: "Düğünde alınan altın ve para hediyeleri takip etmek için uygulama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="light">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <AuthProvider>
          <WeddingDateProvider>
            <div className="flex min-h-screen flex-col bg-gray-50">
              <Header />
              <main className="flex-grow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
          </WeddingDateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
