import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

export const metadata: Metadata = {
  title: 'Terms & Conditions - Mombasa Shisha Bongs',
  description: 'Read our terms and conditions for using Mombasa Shisha Bongs website and services. Age requirements, payment terms, returns policy, and more.',
  openGraph: {
    title: 'Terms & Conditions - Mombasa Shisha Bongs',
    description: 'Terms and conditions for using our website and services.',
    url: `${siteUrl}/terms`,
    images: ['/logo.png'],
  },
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
}

export default function TermsPage() {
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

          <h1 className="text-4xl font-bold text-white mb-8">Terms & Conditions</h1>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Age Requirement</h2>
              <p>
                You must be 18 years or older to purchase products from this website. By placing an order, 
                you confirm that you are of legal age to purchase tobacco and smoking-related products in 
                your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Product Information</h2>
              <p>
                We strive to provide accurate product descriptions and images. However, we do not warrant 
                that product descriptions or other content on this site is accurate, complete, reliable, 
                current, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Pricing</h2>
              <p>
                All prices are in Kenyan Shillings (KES) and are subject to change without notice. 
                We reserve the right to modify prices at any time, but price changes will not affect 
                orders that have already been confirmed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Payment</h2>
              <p>
                We accept payment via Paystack (cards and bank transfer), Mpesa, and Cash on Delivery. 
                Payment must be received before or upon delivery. We reserve the right to refuse or cancel 
                any order at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Returns & Refunds</h2>
              <p>
                Due to the nature of our products, we do not accept returns or offer refunds unless the 
                product is defective or damaged upon delivery. Please inspect your order upon receipt and 
                contact us immediately if there are any issues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Mombasa Shisha Bongs shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages resulting from your use 
                of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Contact</h2>
              <p>
                For questions about these terms, please contact us at{' '}
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

