import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface CategoryPromoCardProps {
  title: string
  description: string
  products: string
  priceRange: string
  image: string
  href: string
  gradient?: string
}

export default function CategoryPromoCard({
  title,
  description,
  products,
  priceRange,
  image,
  href,
  gradient = 'from-purple-600 to-purple-800',
}: CategoryPromoCardProps) {
  return (
    <Link
      href={href}
      className="group relative bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900 rounded-xl overflow-hidden border border-purple-700 hover:border-purple-500 transition-all hover:shadow-xl hover:shadow-purple-500/20"
    >
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
      </div>
      <div className="p-6 relative z-10">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-3 text-sm md:text-base">{description}</p>
        <p className="text-purple-300 font-semibold mb-2 text-sm md:text-base">{products}</p>
        <p className="text-white font-bold mb-4">From {priceRange}</p>
        <div className="inline-flex items-center gap-2 text-purple-300 group-hover:text-purple-200 font-semibold transition-colors">
          <span>Shop Now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

