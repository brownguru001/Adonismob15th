import type { Metadata } from "next";
import { Libre_Franklin, Cinzel } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart-context";
import { RoseBackdrop } from "@/components/rose-backdrop";
import "./globals.css";

const sans = Libre_Franklin({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
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
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-bone">
        <RoseBackdrop />
        <CartProvider>
          {children}
          <Toaster position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
