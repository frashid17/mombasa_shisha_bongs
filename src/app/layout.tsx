import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AgeVerification from "@/components/AgeVerification";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mombasa Shisha Bongs - Premium Shisha & Vapes",
  description: "Premium shisha, vapes, and smoking accessories in Mombasa. Fast delivery, authentic products, secure payment with Mpesa.",
  keywords: ["shisha", "hookah", "vape", "tobacco", "mombasa", "kenya"],
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: '/logo.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "Mombasa Shisha Bongs - Premium Shisha & Vapes",
    description: "Premium shisha, vapes, and smoking accessories in Mombasa.",
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" type="image/x-icon" />
          <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
          <link rel="apple-touch-icon" href="/logo.png" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
        >
          <AgeVerification />
          <Navbar />
          {children}
          <Footer />
          <FloatingContactButtons />
        </body>
      </html>
    </ClerkProvider>
  );
}
