import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

export const metadata: Metadata = {
  title: 'Shipping Policy - Delivery Information | Mombasa Shisha Bongs',
  description: 'Learn about our shipping and delivery policy. Same-day delivery in Mombasa, nationwide shipping across Kenya. Delivery fees, timeframes, and tracking information.',
  openGraph: {
    title: 'Shipping Policy - Mombasa Shisha Bongs',
    description: 'Same-day delivery in Mombasa, nationwide shipping across Kenya. Fast and reliable delivery service.',
    url: `${siteUrl}/shipping-policy`,
    images: ['/logo.png'],
  },
  alternates: {
    canonical: `${siteUrl}/shipping-policy`,
  },
}

export default function ShippingPolicyPage() {
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

          <h1 className="text-4xl font-bold text-white mb-8">Shipping Policy</h1>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Delivery Areas</h2>
              <p>
                We currently offer delivery services within Mombasa and nationwide shipping across Kenya. 
                Delivery times and fees may vary based on your location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Delivery Timeframes</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Mombasa:</strong> Same-day delivery (orders placed before 2 PM)</li>
                <li><strong className="text-white">Other Cities:</strong> 2-5 business days</li>
                <li><strong className="text-white">Remote Areas:</strong> 5-7 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Delivery Fees</h2>
              <p className="mb-3">
                Delivery fees are <strong className="text-white">not included</strong> in the checkout total. 
                The delivery person will collect the delivery fee separately in cash when your order is delivered.
              </p>
              <p className="mb-3">
                Delivery fees vary based on your area within Mombasa:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">CBD/Town areas:</strong> Delivery fees may vary</li>
                <li><strong className="text-white">Other Mombasa areas:</strong> Delivery fees may vary</li>
                <li>The delivery person will inform you of the exact fee upon delivery</li>
              </ul>
              <p className="mt-3 text-yellow-300">
                <strong>Note:</strong> Please have cash ready for both the order payment (if paying on delivery) and the delivery fee.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Order Tracking</h2>
              <p>
                Once your order is shipped, you will receive a tracking number via email or SMS. 
                You can use this number to track your order's progress.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Delivery Requirements</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Someone must be available to receive the order at the delivery address</li>
                <li>Valid ID may be required for age verification</li>
                <li>For cash on delivery, please have exact change ready for both the order total and delivery fee</li>
                <li>We are not responsible for delays caused by incorrect address information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
              <p>
                For questions about shipping, please contact us at{' '}
                <a href="tel://+254117037140" className="text-blue-400 hover:text-blue-300">
                  +254 719 541 660
                </a>{' '}
                or via{' '}
                <a
                  href="https://wa.me/254117037140"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  WhatsApp
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

