import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

export const metadata: Metadata = {
  title: 'About Us - Mombasa Shisha Bongs',
  description: 'Learn about Mombasa Shisha Bongs - Mombasa\'s premier destination for premium shisha, vapes, and smoking accessories. 100% authentic products, fast delivery, excellent customer service.',
  openGraph: {
    title: 'About Us - Mombasa Shisha Bongs',
    description: 'Mombasa\'s premier destination for premium shisha, vapes, and smoking accessories.',
    url: `${siteUrl}/about`,
    images: ['/logo.png'],
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-white mb-8">About Us</h1>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to Mombasa Shisha Bongs</h2>
              <p>
                We are Mombasa's premier destination for premium shisha, vapes, and smoking accessories. 
                With a commitment to quality and authenticity, we provide our customers with the finest 
                products from trusted suppliers worldwide.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p>
                Our mission is to provide our customers with authentic, high-quality shisha products 
                and accessories while ensuring excellent customer service and fast, reliable delivery. 
                We believe in building lasting relationships with our customers through trust and 
                transparency.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Why Choose Us?</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>100% authentic products guaranteed</li>
                <li>Fast same-day delivery in Mombasa</li>
                <li>Competitive pricing with regular discounts</li>
                <li>Secure payment options (Paystack, Mpesa, Cash on Delivery)</li>
                <li>Excellent customer support</li>
                <li>Wide selection of premium products</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <p className="mb-2">
                  <strong className="text-white">Phone:</strong>{' '}
                  <a href="tel://+254117037140" className="text-blue-400 hover:text-blue-300">
                    +254 7117037140
                  </a>
                </p>
                <p className="mb-2">
                  <strong className="text-white">WhatsApp:</strong>{' '}
                  <a
                    href="https://wa.me/254117037140"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300"
                  >
                    Chat with us
                  </a>
                </p>
                <p>
                  <strong className="text-white">Location:</strong> Mombasa, Kenya
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

