import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram } from 'lucide-react'
import prisma from '@/lib/prisma'

async function getCategories() {
  return prisma.category.findMany({
    take: 6,
    orderBy: { name: 'asc' },
  })
}

export default async function Footer() {
  const categories = await getCategories()

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Us */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="tel://+254719541660"
                className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>+254 719 541 660</span>
              </a>
              <a
                href="https://wa.me/254719541660"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-1" />
                <span>Mombasa, Kenya</span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.instagram.com/mombasa_shisha_bongs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors flex items-center gap-2"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
                <span className="text-sm">@mombasa_shisha_bongs</span>
              </a>
            </div>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">About Us</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.id}`}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/categories"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                >
                  View All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                  Cash
                </div>
                <span className="text-gray-400 text-sm">Pay on Delivery</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-10 bg-white rounded flex items-center justify-center">
                  {/* Mpesa Logo - You can add mpesa-logo.png to /public folder */}
                  <span className="text-green-600 font-bold text-xs">
                    M-PESA
                  </span>
                </div>
                <span className="text-gray-400 text-sm">Mobile Money</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold text-sm">
                  Paystack
                </div>
                <span className="text-gray-400 text-sm">Cards & Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Mombasa Shisha Bongs. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs">
              You must be 18+ to purchase. Please drink responsibly.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

