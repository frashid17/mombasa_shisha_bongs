'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Phone } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'

// Add all brand icons to library
library.add(fab)

// Access icons via byPrefixAndName pattern
const byPrefixAndName = {
  fab: {
    'whatsapp': faWhatsapp,
  },
}

export default function FloatingContactButtons() {
  const pathname = usePathname()
  const [isAdminRoute, setIsAdminRoute] = useState(false)

  useEffect(() => {
    setIsAdminRoute(pathname.startsWith('/admin'))
  }, [pathname])

  // Don't render on admin routes
  if (isAdminRoute) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/254117037140"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
        aria-label="Contact us on WhatsApp"
      >
        <FontAwesomeIcon icon={byPrefixAndName.fab['whatsapp']} className="w-5 h-5" />
      </a>

      {/* Phone Button */}
      <a
        href="tel://+254117037140"
        className="bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
        aria-label="Call us"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  )
}

