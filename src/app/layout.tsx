import type { Metadata } from "next";
import { Bricolage_Grotesque, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart-context";
import "./globals.css";

const sans = Bricolage_Grotesque({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "ADONISMOB15TH — Modern Clothing, Made Deliberate",
    template: "%s — ADONISMOB15TH",
  },
  description:
    "ADONISMOB15TH is a modern clothing brand rooted in African identity — original designs, custom pieces, and an exclusive collection for verified members.",
  openGraph: {
    title: "ADONISMOB15TH",
    description:
      "Modern clothing rooted in African identity. Original designs, custom pieces, and an exclusive members collection.",
    siteName: "ADONISMOB15TH",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bone text-ink">
        <CartProvider>
          {children}
          <Toaster position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
