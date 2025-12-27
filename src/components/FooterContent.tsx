import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram } from 'lucide-react'

interface FooterContentProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    image: string | null
    description: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    parentId: string | null
  }>
}

export function FooterContent({ categories }: FooterContentProps) {
  return (
    <footer className="bg-white border-t-2 border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Us */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="tel://+254117037140"
                className="flex items-center gap-3 text-gray-700 hover:text-red-600 transition-colors font-medium"
              >
                <Phone className="w-5 h-5" />
                <span>+2547117037140</span>
              </a>
              <a
                href="https://wa.me/254117037140"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                <Mail className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin className="w-5 h-5 mt-1" />
                <span>Mombasa, Kenya</span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.instagram.com/mombasa_shisha_bongs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-pink-600 transition-colors flex items-center gap-2 font-medium"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
                <span className="text-sm">@mombasa_shisha_bongs</span>
              </a>
            </div>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">About Us</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.id}`}
                    className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/categories"
                  className="text-red-600 hover:text-red-700 transition-all font-bold"
                >
                  View All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 text-white px-3 py-2 rounded-lg font-semibold text-sm shadow-lg">
                  Cash
                </div>
                <span className="text-gray-700 text-sm font-medium">Pay on Delivery</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-10 bg-white border border-gray-200 rounded flex items-center justify-center shadow-md">
                  <span className="text-green-600 dark:text-green-400 font-bold text-xs">
                    M-PESA
                  </span>
                </div>
                <span className="text-gray-700 dark:text-gray-400 text-sm font-medium">Mobile Money</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-red-600 text-white px-3 py-2 rounded-md font-semibold text-sm">
                  Paystack
                </div>
                <span className="text-gray-700 dark:text-gray-400 text-sm font-medium">Cards & Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-gray-200 dark:border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              © {new Date().getFullYear()} Mombasa Shisha Bongs. All rights reserved.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              You must be 21+ to purchase. Age verification required.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

