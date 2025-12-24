import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react'
import StructuredData from '@/components/seo/StructuredData'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

interface Article {
  slug: string
  title: string
  image: string
  date: string
  readTime: string
  content: string[]
}

const articles: Record<string, Article> = {
  'top-shisha-products-2024': {
    slug: 'top-shisha-products-2024',
    title: 'Top 5 Best Shisha Products in 2025',
    image: '/uploads/tips/top-shisha-products-2024.jpg',
    date: 'December 20, 2025',
    readTime: '5 min read',
    content: [
      'As we navigate through 2025, the shisha market continues to evolve with innovative products that enhance your smoking experience. Whether you\'re a seasoned enthusiast or new to the world of shisha, finding the right products can make all the difference.',
      'In this comprehensive guide, we\'ve curated the top 5 shisha products that stand out for their quality, performance, and value. Our selection is based on customer reviews, expert testing, and market trends.',
      'From premium hookah pipes to the finest shisha tobacco flavors, each product on our list has been carefully evaluated to ensure it meets the highest standards. We consider factors such as build quality, ease of use, flavor delivery, and overall smoking experience.',
      'Stay tuned as we dive deep into each product, exploring their unique features, pros and cons, and what makes them the best choices for 2025. Whether you\'re looking to upgrade your current setup or start your shisha journey, this guide will help you make informed decisions.',
      'Remember, the best shisha experience comes from combining quality products with proper technique and maintenance. We\'ll also share tips on how to get the most out of each product.',
    ],
  },
  'choose-right-vape-kit': {
    slug: 'choose-right-vape-kit',
    title: 'How to Choose the Right Vape Kit',
    image: '/uploads/tips/choose-right-vape-kit.jpg',
    date: 'December 20, 2025',
    readTime: '7 min read',
    content: [
      'Choosing the right vape kit can be overwhelming, especially with the vast array of options available in today\'s market. Whether you\'re transitioning from traditional smoking or looking to upgrade your current setup, understanding what to look for is crucial.',
      'The perfect vape kit for you depends on several factors: your experience level, preferred vaping style, budget, and lifestyle needs. Beginners might prefer simple, all-in-one devices, while experienced vapers may seek customizable options with advanced features.',
      'Key considerations include battery life, tank capacity, coil compatibility, and ease of use. We\'ll break down each of these factors to help you make an informed decision that matches your vaping goals.',
      'In this guide, we\'ll explore different types of vape kits, from pod systems to box mods, and help you understand which features matter most for your specific needs. We\'ll also discuss maintenance requirements and how to extend the life of your device.',
      'Safety is paramount when it comes to vaping. We\'ll cover important safety tips, proper battery handling, and how to recognize quality products that meet industry standards.',
      'By the end of this article, you\'ll have a clear understanding of what to look for in a vape kit and be equipped to make a choice that enhances your vaping experience while fitting your lifestyle and budget.',
    ],
  },
  'shisha-maintenance-guide': {
    slug: 'shisha-maintenance-guide',
    title: 'Complete Guide to Shisha Maintenance',
    image: '/uploads/tips/shisha-maintenance-guide.jpg',
    date: 'December 20, 2025',
    readTime: '8 min read',
    content: [
      'Proper maintenance is the key to ensuring your shisha delivers the best possible experience every time you use it. A well-maintained hookah not only performs better but also lasts longer and provides cleaner, more flavorful smoke.',
      'Regular cleaning and care can prevent common issues like clogged hoses, stale flavors, and reduced smoke quality. In this comprehensive guide, we\'ll walk you through all aspects of shisha maintenance, from daily cleaning routines to deep cleaning procedures.',
      'We\'ll cover essential maintenance tasks including cleaning the base, stem, and hose, replacing components when necessary, and storing your shisha properly. Each step is crucial for maintaining optimal performance and hygiene.',
      'Understanding the anatomy of your shisha will help you maintain it more effectively. We\'ll explain each component\'s role and how to care for it properly. From the bowl to the base, every part requires specific attention.',
      'We\'ll also discuss troubleshooting common problems like weak smoke, harsh flavors, and leaks. Most issues can be resolved with proper maintenance techniques that we\'ll detail in this guide.',
      'Additionally, we\'ll provide tips on extending the life of your shisha accessories, when to replace parts, and how to store your equipment to prevent damage and maintain quality.',
      'By following this maintenance guide, you\'ll not only improve your smoking sessions but also protect your investment. A well-cared-for shisha can provide years of enjoyable use.',
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = articles[slug]

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  const articleUrl = `${siteUrl}/tips/${slug}`
  const articleImage = article.image && article.image !== '/uploads/tips/' ? article.image : '/logo.png'

  return {
    title: `${article.title} - Expert Tips | Mombasa Shisha Bongs`,
    description: article.content[0] || `${article.title} - Expert guide from Mombasa Shisha Bongs`,
    openGraph: {
      title: article.title,
      description: article.content[0] || article.title,
      url: articleUrl,
      images: [articleImage.startsWith('http') ? articleImage : `${siteUrl}${articleImage}`],
      type: 'article',
      publishedTime: '2025-12-20T00:00:00Z',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.content[0] || article.title,
      images: [articleImage.startsWith('http') ? articleImage : `${siteUrl}${articleImage}`],
    },
    alternates: {
      canonical: articleUrl,
    },
  }
}

export default async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles[slug]

  if (!article) {
    notFound()
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Expert Tips', url: '/#expert-tips' },
    { name: article.title, url: `/tips/${slug}` },
  ]

  return (
    <>
      <StructuredData
        type="Article"
        data={{
          title: article.title,
          description: article.content[0] || article.title,
          image: article.image && article.image !== '/uploads/tips/' ? article.image : '/logo.png',
          date: '2025-12-20',
          datePublished: '2025-12-20T00:00:00Z',
          dateModified: '2025-12-20T00:00:00Z',
        }}
      />
      <StructuredData type="BreadcrumbList" data={breadcrumbs} />
      <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-green-600" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              {article.title}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Image */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden mb-8 bg-gray-100">
          {article.image && article.image !== '/uploads/tips/' ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <BookOpen className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 md:p-8 lg:p-12 border border-gray-200">
            {article.content.map((paragraph, index) => (
              <p
                key={index}
                className="text-gray-700 leading-relaxed mb-6 text-base md:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Related Articles */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.values(articles)
                .filter((a) => a.slug !== slug)
                .map((relatedArticle) => (
                  <Link
                    key={relatedArticle.slug}
                    href={`/tips/${relatedArticle.slug}`}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-red-500 transition-all hover:shadow-lg"
                  >
                    <div className="relative h-40 overflow-hidden">
                      {relatedArticle.image && relatedArticle.image !== '/uploads/tips/' ? (
                        <Image
                          src={relatedArticle.image}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-sm text-gray-600">{relatedArticle.readTime}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </article>
      </div>
    </div>
    </>
  )
}

