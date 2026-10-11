import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fashion Store — Trend-led fashion for women & men in Singapore",
    template: "%s | Fashion Store",
  },
  description:
    "Shop the latest dresses, denim, hoodies and jackets for women and men. Free islandwide delivery over S$80 and Cash on Delivery across Singapore.",
  openGraph: {
    type: "website",
    siteName: "Fashion Store",
    locale: "en_SG",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-SG" className={`${inter.variable} ${archivoBlack.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
