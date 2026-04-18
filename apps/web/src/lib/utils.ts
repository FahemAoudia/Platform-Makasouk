import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Fixed locale so SSR and browser produce identical strings (avoids hydration mismatch). */
const APP_LOCALE = "fr-FR" as const;

export function formatMoneyAmount(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString(APP_LOCALE, { maximumFractionDigits: 0 });
}

/** Amount + currency symbol (DA / دج), no leading $ — pass symbol from i18n `currency.symbol`. */
export function formatPriceWithSymbol(
  value: number | string,
  symbol: string
): string {
  return `${formatMoneyAmount(value)} ${symbol}`;
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(APP_LOCALE, {
    dateStyle: "short",
    timeStyle: "short",
  });
}
