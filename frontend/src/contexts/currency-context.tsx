"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { formatCurrency as fmt, type CurrencyCode, VALID_CURRENCIES } from "@/lib/currency";

const STORAGE_KEY = "debtwise_currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("IDR");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (stored && VALID_CURRENCIES.includes(stored)) {
      setCurrencyState(stored);
    }
    setMounted(true);
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, c);
    }
  }, []);

  const formatCurrency = useCallback(
    (amount: number) => fmt(amount, currency),
    [currency]
  );

  if (!mounted) {
    return (
      <CurrencyContext.Provider
        value={{
          currency: "IDR",
          setCurrency,
          formatCurrency: (n) => fmt(n, "IDR"),
        }}
      >
        {children}
      </CurrencyContext.Provider>
    );
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
