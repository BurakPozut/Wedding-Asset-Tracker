"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WeddingDateModal } from "@/components/wedding-date-modal";
import { useSession } from "next-auth/react";

interface WeddingDateContextType {
  weddingDate: string | null;
  setWeddingDate: (date: string) => void;
  isLoading: boolean;
}

const WeddingDateContext = createContext<WeddingDateContextType | undefined>(undefined);

export function useWeddingDate() {
  const context = useContext(WeddingDateContext);
  if (context === undefined) {
    throw new Error("useWeddingDate must be used within a WeddingDateProvider");
  }
  return context;
}

interface WeddingDateProviderProps {
  children: ReactNode;
}

export function WeddingDateProvider({ children }: WeddingDateProviderProps) {
  const { data: session, status } = useSession();
  const [weddingDate, setWeddingDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchWeddingDate() {
      try {
        // Only fetch wedding date if the user is authenticated
        if (status === "authenticated" && session) {
          const response = await fetch("/api/user/wedding-date");
          const data = await response.json();
          
          if (data.weddingDate) {
            // Format the date as YYYY-MM-DD
            const date = new Date(data.weddingDate);
            const formattedDate = date.toISOString().split("T")[0];
            setWeddingDate(formattedDate);
          } else {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error("Error fetching wedding date:", error);
      } finally {
        // Only set loading to false if authenticated or if authentication has been checked
        if (status !== "loading") {
          setIsLoading(false);
        }
      }
    }

    // Only fetch if the session status is not loading
    if (status !== "loading") {
      fetchWeddingDate();
    }
  }, [session, status]);

  const handleSetWeddingDate = async (date: string) => {
    try {
      const response = await fetch("/api/user/wedding-date", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weddingDate: date }),
      });

      if (response.ok) {
        setWeddingDate(date);
        setShowModal(false);
      } else {
        console.error("Failed to save wedding date");
      }
    } catch (error) {
      console.error("Error saving wedding date:", error);
    }
  };

  return (
    <WeddingDateContext.Provider value={{ weddingDate, setWeddingDate: handleSetWeddingDate, isLoading }}>
      {children}
      {showModal && status === "authenticated" && <WeddingDateModal onDateSet={handleSetWeddingDate} />}
    </WeddingDateContext.Provider>
  );
} 