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
import PageLoader from "@/components/PageLoader";

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

// Mark layout as dynamic since it uses headers()
export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let pathname = ''
  let isAdminRoute = false
  
  try {
    const headersList = await headers()
    pathname = headersList.get('x-pathname') || ''
    isAdminRoute = pathname.startsWith('/admin')
  } catch (error) {
    // Fallback if headers() fails - assume not admin route
    console.error('Error reading headers:', error)
    isAdminRoute = false
  }

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
          <PageLoader />
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
