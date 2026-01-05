import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import { Suspense } from "react";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import AgeVerification from "@/components/AgeVerification";
import prisma from "@/lib/prisma";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import PageLoader from "@/components/PageLoader";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mombasa Shisha Bongs - Premium Shisha & Vapes in Mombasa, Kenya",
    template: "%s | Mombasa Shisha Bongs"
  },
  description: "Premium shisha, vapes, and smoking accessories in Mombasa, Kenya. Fast delivery, authentic products, secure payment with Mpesa and Paystack. Shop the best shisha flavors, hookahs, disposable vapes, and e-liquids.",
  keywords: [
    "shisha",
    "hookah",
    "vape",
    "tobacco",
    "mombasa",
    "kenya",
    "shisha flavors",
    "disposable vapes",
    "e-liquids",
    "hookah accessories",
    "shisha coals",
    "vape kits",
    "mombasa shisha shop",
    "online shisha store kenya"
  ],
  authors: [{ name: "Mombasa Shisha Bongs" }],
  creator: "Mombasa Shisha Bongs",
  publisher: "Mombasa Shisha Bongs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
      { url: '/logo.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo.png', type: 'image/png', sizes: '32x32' },
      { url: '/uploads/hookah.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
      { url: '/uploads/hookah.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: siteUrl,
    siteName: 'Mombasa Shisha Bongs',
    title: "Mombasa Shisha Bongs - Premium Shisha & Vapes in Mombasa",
    description: "Premium shisha, vapes, and smoking accessories in Mombasa, Kenya. Fast delivery, authentic products, secure payment.",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Mombasa Shisha Bongs Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mombasa Shisha Bongs - Premium Shisha & Vapes",
    description: "Premium shisha, vapes, and smoking accessories in Mombasa, Kenya.",
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
};

// Mark layout as dynamic since it uses headers()
export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isAdminRoute = false
  
  try {
    const headersList = await headers()
    // Get pathname from middleware header
    const pathname = headersList.get('x-pathname') || ''
    
    // Check if it's an admin route
    isAdminRoute = pathname.startsWith('/admin')
  } catch (error) {
    // Fallback if headers() fails - assume not admin route
    isAdminRoute = false
  }

  // Fetch categories for footer (only if not admin route)
  const categories = !isAdminRoute ? await prisma.category.findMany({
    take: 6,
    orderBy: { name: 'asc' },
  }) : []

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
          {/* Favicon for Google Search */}
          <link rel="icon" href="/logo.png" type="image/png" sizes="512x512" />
          <link rel="icon" href="/logo.png" type="image/png" sizes="192x192" />
          <link rel="icon" href="/logo.png" type="image/png" sizes="32x32" />
          <link rel="icon" href="/uploads/hookah.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/logo.png" sizes="180x180" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ffffff" />
          {/* Additional meta tags for Google Search */}
          <meta name="application-name" content="Mombasa Shisha Bongs" />
          <meta name="msapplication-TileImage" content="/logo.png" />
          <meta name="msapplication-TileColor" content="#ffffff" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
          style={{ backgroundColor: 'white' }}
        >
          <CurrencyProvider>
            <ServiceWorkerRegistration />
            <PageLoader />
            <AgeVerification />
            {!isAdminRoute && <ConditionalNavbar />}
            {children}
            {!isAdminRoute && (
              <Suspense fallback={<div className="h-64 bg-gray-900" />}>
                <ConditionalFooter categories={categories} />
              </Suspense>
            )}
            {!isAdminRoute && <FloatingContactButtons />}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f3f4f6',
                  border: '1px solid #374151',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f3f4f6',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f3f4f6',
                  },
                },
              }}
            />
            <Analytics />
          </CurrencyProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
