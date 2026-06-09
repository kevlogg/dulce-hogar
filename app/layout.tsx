import type { Metadata } from "next";
import { DM_Sans, Libre_Baskerville } from "next/font/google";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-config";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const libreBaskerville = Libre_Baskerville({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: { locale: "es_AR" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${libreBaskerville.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
