import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import { Suspense } from "react";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import Footer from "@/components/Footer";
import AgeVerification from "@/components/AgeVerification";
import FloatingContactButtons from "@/components/FloatingContactButtons";

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
      { url: '/uploads/hookah.svg', type: 'image/svg+xml' },
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: '/uploads/hookah.svg',
    shortcut: '/uploads/hookah.svg',
  },
  openGraph: {
    title: "Mombasa Shisha Bongs - Premium Shisha & Vapes",
    description: "Premium shisha, vapes, and smoking accessories in Mombasa.",
    images: ['/logo.png'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/uploads/hookah.svg" type="image/svg+xml" />
          <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
          <link rel="apple-touch-icon" href="/uploads/hookah.svg" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
        >
          <AgeVerification />
          {!isAdminRoute && <ConditionalNavbar />}
          {children}
          {!isAdminRoute && (
            <Suspense fallback={<div className="h-64 bg-gray-900" />}>
              <Footer />
            </Suspense>
          )}
          <FloatingContactButtons />
        </body>
      </html>
    </ClerkProvider>
  );
}
