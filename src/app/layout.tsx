import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import SessionProvider from "@/components/session-provider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  // Fraunces has optical sizing — use a moderate weight range for headings.
  axes: ["SOFT", "WONK", "opsz"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "In Loving Memory of Princess Gloria Mala Galabe",
  description:
    "A memorial tribute to Princess Gloria Mala Galabe (22 Oct 1965 – 24 Jun 2026). Family, friends, and well-wishers may share tributes in her honour.",
  keywords: [
    "Princess Gloria Mala Galabe",
    "memorial",
    "tribute",
    "in loving memory",
    "Galabe",
  ],
  authors: [{ name: "The Galabe Family" }],
  openGraph: {
    title: "In Loving Memory of Princess Gloria Mala Galabe",
    description:
      "22 October 1965 – 24 June 2026. A life of love, faith, compassion, and selfless service.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${karla.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
        <SonnerToaster position="top-center" richColors={false} />
      </body>
    </html>
  );
}
