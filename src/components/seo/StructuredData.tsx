interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'BreadcrumbList' | 'Article'
  data?: any
}

interface ProductData {
  id: string
  name: string
  description?: string | null
  sku?: string | null
  price: number | string
  stock: number
  images?: { url: string }[]
  category?: { name: string } | null
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Mombasa Shisha Bongs',
          url: siteUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/logo.png`,
            width: 512,
            height: 512,
          },
          image: `${siteUrl}/logo.png`,
          description: 'Premium shisha, vapes, and smoking accessories in Mombasa, Kenya',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Mombasa',
            addressCountry: 'KE',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            areaServed: 'KE',
            availableLanguage: 'English',
          },
          sameAs: [
            // Add social media links when available
            // 'https://www.facebook.com/mombasashishabongs',
            // 'https://www.instagram.com/mombasashishabongs',
          ],
        }

      case 'Product':
        if (!data) return null
        const product = data as ProductData
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description || `${product.name} - Premium quality product from Mombasa Shisha Bongs`,
          image: product.images?.[0]?.url ? `${siteUrl}${product.images[0].url}` : `${siteUrl}/logo.png`,
          sku: product.sku,
          brand: {
            '@type': 'Brand',
            name: 'Mombasa Shisha Bongs',
          },
          category: product.category?.name || 'Shisha & Vapes',
          offers: {
            '@type': 'Offer',
            url: `${siteUrl}/products/${product.id}`,
            priceCurrency: 'KES',
            price: Number(product.price),
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: 'Mombasa Shisha Bongs',
            },
          },
        }

      case 'BreadcrumbList':
        if (!data || !Array.isArray(data)) return null
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.map((item: { name: string; url: string }, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${siteUrl}${item.url}`,
          })),
        }

      case 'Article':
        if (!data) return null
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          description: data.description || data.title,
          image: data.image ? `${siteUrl}${data.image}` : `${siteUrl}/logo.png`,
          datePublished: data.datePublished || data.date,
          dateModified: data.dateModified || data.date,
          author: {
            '@type': 'Organization',
            name: 'Mombasa Shisha Bongs',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Mombasa Shisha Bongs',
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/logo.png`,
            },
          },
        }

      default:
        return null
    }
  }

  const structuredData = getStructuredData()

  if (!structuredData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

