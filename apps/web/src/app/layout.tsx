import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Atelier — Couture sur-mesure",
  description:
    "Mode sur-mesure d’exception : mesures guidées et maîtres tailleurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${arabic.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Providers>
            <Nav />
            <main className="flex flex-1 flex-col pt-20 sm:pt-[5.25rem] md:pt-24">
              {children}
            </main>
            <Footer />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
