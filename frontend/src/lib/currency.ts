/** Southeast Asian and common currencies */
export type CurrencyCode = "IDR" | "MYR" | "THB" | "SGD" | "PHP" | "VND" | "USD";

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "IDR", label: "Rupiah (Indonesia)", symbol: "Rp" },
  { code: "MYR", label: "Ringgit (Malaysia)", symbol: "RM" },
  { code: "THB", label: "Baht (Thailand)", symbol: "฿" },
  { code: "SGD", label: "Dollar (Singapore)", symbol: "S$" },
  { code: "PHP", label: "Peso (Philippines)", symbol: "₱" },
  { code: "VND", label: "Dong (Vietnam)", symbol: "₫" },
  { code: "USD", label: "US Dollar", symbol: "$" },
];

/** Currencies with no decimal subunits - round to whole numbers */
const NO_DECIMAL_CURRENCIES: CurrencyCode[] = ["IDR", "VND"];

/**
 * Format amount for display. SEA currencies use proper thousands separators.
 * IDR/VND: Rp 5.000.000 (no decimals, dot separator)
 * USD/SGD/MYR/THB/PHP: 2 decimals where applicable
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return "0";

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);
  }
  if (currency === "IDR" || currency === "VND") {
    const rounded = Math.round(n);
    const formatted = rounded.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return currency === "IDR" ? `Rp ${formatted}` : `₫${formatted}`;
  }
  if (currency === "MYR" || currency === "SGD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);
  }
  if (currency === "THB") {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  }
  if (currency === "PHP") {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);
  }
  // Fallback for IDR
  const rounded = Math.round(n);
  const formatted = rounded.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return `Rp ${formatted}`;
}

const STORAGE_KEY = "debtwise_currency";
export const VALID_CURRENCIES: CurrencyCode[] = ["IDR", "MYR", "THB", "SGD", "PHP", "VND", "USD"];

/** Get currency from localStorage (for non-React code like PDF export) */
export function getStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "IDR";
  const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
  return VALID_CURRENCIES.includes(stored as CurrencyCode) ? (stored as CurrencyCode) : "IDR";
}

/** Whether currency uses whole numbers only (no decimals) */
export function isNoDecimalCurrency(currency: CurrencyCode): boolean {
  return NO_DECIMAL_CURRENCIES.includes(currency);
}

/** Default slider max and step for extra payment by currency */
export function getExtraPaymentRange(currency: CurrencyCode): { max: number; step: number } {
  if (currency === "IDR" || currency === "VND") {
    return { max: 10_000_000, step: 50_000 };
  }
  if (currency === "PHP") {
    return { max: 50_000, step: 500 };
  }
  return { max: 5_000, step: 25 };
}
