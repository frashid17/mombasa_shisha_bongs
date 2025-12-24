import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

export const metadata: Metadata = {
  title: 'Privacy Policy - Mombasa Shisha Bongs',
  description: 'Read our privacy policy to understand how Mombasa Shisha Bongs collects, uses, and protects your personal information when you use our website and services.',
  openGraph: {
    title: 'Privacy Policy - Mombasa Shisha Bongs',
    description: 'Learn how we protect your privacy and handle your personal information.',
    url: `${siteUrl}/privacy`,
    images: ['/logo.png'],
  },
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
}

export default function PrivacyPage() {
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

          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including name, email address, 
                phone number, shipping address, and payment information when you place an order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To process and fulfill your orders</li>
                <li>To communicate with you about your orders</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To improve our services and website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. However, 
                no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
              <p>
                For questions about this privacy policy, please contact us at{' '}
                <a href="tel://+254117037140" className="text-blue-400 hover:text-blue-300">
                  +254 7117037140
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

