import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
              <p>
                Delivery fees are calculated based on your location and will be displayed at checkout. 
                Free delivery may be available for orders above a certain amount within Mombasa.
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
                <li>For cash on delivery, please have exact change ready</li>
                <li>We are not responsible for delays caused by incorrect address information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
              <p>
                For questions about shipping, please contact us at{' '}
                <a href="tel://+254719541660" className="text-blue-400 hover:text-blue-300">
                  +254 719 541 660
                </a>{' '}
                or via{' '}
                <a
                  href="https://wa.me/254719541660"
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

