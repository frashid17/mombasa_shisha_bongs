import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mombasashishabongs.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/sign-in/',
          '/sign-up/',
          '/sign-out/',
          '/profile/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/wishlist/',
          '/debug-clerk/',
          '/test-clerk/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

