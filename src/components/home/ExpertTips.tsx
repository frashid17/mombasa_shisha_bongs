import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, ArrowRight } from 'lucide-react'

interface Tip {
  id: string
  title: string
  image: string
  slug: string
}

const expertTips: Tip[] = [
  {
    id: '1',
    title: 'Top 5 Best Shisha Products in 2024',
    image: '/uploads/tips/top-shisha-products-2024.jpg',
    slug: 'top-shisha-products-2024',
  },
  {
    id: '2',
    title: 'How to Choose the Right Vape Kit',
    image: '/uploads/tips/choose-right-vape-kit.jpg',
    slug: 'choose-right-vape-kit',
  },
  {
    id: '3',
    title: 'Complete Guide to Shisha Maintenance',
    image: '/uploads/tips/shisha-maintenance-guide.jpg',
    slug: 'shisha-maintenance-guide',
  },
]

export default function ExpertTips() {
  return (
    <section className="py-16 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Latest Expert Tips & Advice
              </h2>
              <p className="text-gray-400">Learn from our experts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expertTips.map((tip) => (
            <Link
              key={tip.id}
              href={`/tips/${tip.slug}`}
              className="group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all hover:shadow-lg"
            >
              <div className="relative h-48 overflow-hidden bg-gray-800">
                {tip.image && tip.image !== '/uploads/tips/' ? (
                  <Image
                    src={tip.image}
                    alt={tip.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Hide image on error, show placeholder
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : null}
                {(!tip.image || tip.image === '/uploads/tips/') && (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <BookOpen className="w-12 h-12 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {tip.title}
                </h3>
                <div className="inline-flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-3 transition-all">
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

