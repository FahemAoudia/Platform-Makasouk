"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="makasouk-theme"
      disableTransitionOnChange={false}
    >
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
