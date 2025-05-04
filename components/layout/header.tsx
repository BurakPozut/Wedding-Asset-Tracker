"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState } from "react";

const navigation = [
  { name: "Anasayfa", href: "/" },
  { name: "Kontrol Paneli", href: "/kontrol-paneli" },
  { name: "Varlıklar", href: "/varliklar" },
  { name: "Bağışçılar", href: "/bagiscilar" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 text-xl font-bold text-indigo-600">
            Düğün Hediye Takibi
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={toggleMenu}
          >
            <span className="sr-only">Ana menüyü aç</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden lg:flex lg:gap-x-6">
          {status === "authenticated" && 
            navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold ${
                  pathname === item.href ? "text-indigo-600" : "text-gray-900 hover:text-indigo-600"
                }`}
              >
                {item.name}
              </Link>
            ))
          }
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {status === "loading" ? (
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
          ) : status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Merhaba, {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn("google", { callbackUrl: "/kontrol-paneli" })}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Google ile Giriş Yap <span aria-hidden="true">&rarr;</span>
            </button>
          )}
        </div>
      </nav>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 py-2 border-t">
            {status === "authenticated" && 
              navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    pathname === item.href ? "text-indigo-600 bg-gray-50" : "text-gray-900 hover:bg-gray-50 hover:text-indigo-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))
            }
            
            {status === "authenticated" ? (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-indigo-600 hover:bg-gray-50 rounded-md"
              >
                Çıkış Yap
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  signIn("google", { callbackUrl: "/kontrol-paneli" });
                }}
                className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-gray-50 rounded-md"
              >
                Google ile Giriş Yap
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 