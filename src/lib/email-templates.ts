/**
 * Email templates for bulk marketing emails
 */

export type EmailTopic = 'NEW_ITEMS' | 'DISCOUNTS' | 'TRENDING' | 'OFFERS'

export interface ProductData {
  id: string
  name: string
  price: number
  compareAtPrice?: number | null
  image?: string
  images?: Array<{ url: string }>
  slug?: string
  discountPercent?: number // For discount topic
}

export interface EmailTemplateData {
  subject: string
  getHtmlBody: (products: ProductData[], discountInfo?: string) => string
  getTextBody: (products: ProductData[], discountInfo?: string) => string
}

export const EMAIL_TEMPLATES: Record<EmailTopic, EmailTemplateData> = {
  NEW_ITEMS: {
    subject: '🆕 New Products Just Arrived!',
    getHtmlBody: (products) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Mombasa Shisha Bongs</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">🆕 Exciting New Products Just Arrived!</h2>
            <p style="color: #4b5563; font-size: 16px;">
              We're thrilled to announce our latest collection of premium shisha products! Check out these amazing new arrivals:
            </p>
            
            <div style="margin: 30px 0;">
              ${products.map((product) => `
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
                  ${product.image ? `
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 15px;">
                  ` : ''}
                  <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">${product.name}</h3>
                  <p style="color: #667eea; font-size: 24px; font-weight: bold; margin: 10px 0;">
                    KES ${product.price.toLocaleString()}
                    ${product.compareAtPrice && product.compareAtPrice > product.price ? `
                      <span style="color: #9ca3af; font-size: 18px; text-decoration: line-through; margin-left: 10px;">
                        KES ${Number(product.compareAtPrice).toLocaleString()}
                      </span>
                    ` : ''}
                  </p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${product.id}" 
                     style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                    View Product →
                  </a>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" 
                 style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">
                Shop All New Products
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              You are receiving this email because you are a valued customer of Mombasa Shisha Bongs.<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #667eea;">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `,
    getTextBody: (products) => {
      const productList = products.map((p) => `- ${p.name}: KES ${p.price.toLocaleString()}`).join('\n')
      return `Exciting New Products Just Arrived!\n\nWe're thrilled to announce our latest collection:\n\n${productList}\n\nShop now: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products`
    },
  },

  DISCOUNTS: {
    subject: '🎉 Special Discounts - Limited Time Only!',
    getHtmlBody: (products, discountInfo) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Mombasa Shisha Bongs</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 24px; font-weight: bold;">🎉 SPECIAL DISCOUNTS</p>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Limited Time Discounts!</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Don't miss out on these amazing deals! Special discounts on selected products for a limited time only.
            </p>
            ${discountInfo ? `<p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; color: #92400e; font-weight: bold;">${discountInfo}</p>` : ''}
            
            <div style="margin: 30px 0;">
              ${products.map((product) => {
                const originalPrice = product.compareAtPrice || product.price
                const discountedPrice = product.price
                const discount = product.discountPercent || Math.round(((Number(originalPrice) - discountedPrice) / Number(originalPrice)) * 100)
                return `
                  <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 2px solid #f59e0b;">
                    ${product.image ? `
                      <img src="${product.image}" alt="${product.name}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 15px;">
                    ` : ''}
                    <div style="background: #fef3c7; color: #92400e; padding: 5px 10px; border-radius: 4px; display: inline-block; font-weight: bold; margin-bottom: 10px;">
                      ${discount}% OFF
                    </div>
                    <h3 style="color: #1f2937; margin: 10px 0; font-size: 20px;">${product.name}</h3>
                    <div style="margin: 10px 0;">
                      <span style="color: #ef4444; font-size: 28px; font-weight: bold;">
                        KES ${discountedPrice.toLocaleString()}
                      </span>
                      <span style="color: #9ca3af; font-size: 18px; text-decoration: line-through; margin-left: 10px;">
                        KES ${Number(originalPrice).toLocaleString()}
                      </span>
                    </div>
                    <p style="color: #059669; font-weight: bold; margin: 5px 0;">
                      You save KES ${(Number(originalPrice) - discountedPrice).toLocaleString()}!
                    </p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${product.id}" 
                       style="display: inline-block; background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                      Shop Now →
                    </a>
                  </div>
                `
              }).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" 
                 style="display: inline-block; background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">
                View All Discounted Products
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              You are receiving this email because you are a valued customer of Mombasa Shisha Bongs.<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #667eea;">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `,
    getTextBody: (products, discountInfo) => {
      const productList = products.map((p) => {
        const originalPrice = p.compareAtPrice || p.price
        const discount = p.discountPercent || Math.round(((Number(originalPrice) - p.price) / Number(originalPrice)) * 100)
        return `- ${p.name}: ${discount}% OFF - Now KES ${p.price.toLocaleString()} (Was KES ${Number(originalPrice).toLocaleString()})`
      }).join('\n')
      return `Special Discounts - Limited Time Only!\n\n${discountInfo || ''}\n\n${productList}\n\nShop now: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products`
    },
  },

  TRENDING: {
    subject: '🔥 Trending Now - Most Popular Products!',
    getHtmlBody: (products) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Mombasa Shisha Bongs</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 24px; font-weight: bold;">🔥 TRENDING NOW</p>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">🔥 What's Trending Right Now</h2>
            <p style="color: #4b5563; font-size: 16px;">
              These are the products everyone is talking about! Join thousands of satisfied customers who love these trending items.
            </p>
            
            <div style="margin: 30px 0;">
              ${products.map((product) => `
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb; position: relative;">
                  <div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                    🔥 TRENDING
                  </div>
                  ${product.image ? `
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 15px;">
                  ` : ''}
                  <h3 style="color: #1f2937; margin: 10px 0; font-size: 20px;">${product.name}</h3>
                  <p style="color: #667eea; font-size: 24px; font-weight: bold; margin: 10px 0;">
                    KES ${product.price.toLocaleString()}
                    ${product.compareAtPrice && product.compareAtPrice > product.price ? `
                      <span style="color: #9ca3af; font-size: 18px; text-decoration: line-through; margin-left: 10px;">
                        KES ${Number(product.compareAtPrice).toLocaleString()}
                      </span>
                    ` : ''}
                  </p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${product.id}" 
                     style="display: inline-block; background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                    View Product →
                  </a>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" 
                 style="display: inline-block; background: #ef4444; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">
                Shop Trending Products
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              You are receiving this email because you are a valued customer of Mombasa Shisha Bongs.<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #667eea;">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `,
    getTextBody: (products) => {
      const productList = products.map((p) => `- ${p.name}: KES ${p.price.toLocaleString()}`).join('\n')
      return `Trending Now - Most Popular Products!\n\nThese are the products everyone is talking about:\n\n${productList}\n\nShop now: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products`
    },
  },

  OFFERS: {
    subject: '🎁 Special Offers - Don\'t Miss Out!',
    getHtmlBody: (products, offerInfo) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Mombasa Shisha Bongs</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 24px; font-weight: bold;">🎁 SPECIAL OFFERS</p>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">🎁 Exclusive Offers Just For You!</h2>
            <p style="color: #4b5563; font-size: 16px;">
              We have some amazing special offers that you won't want to miss! Limited time only.
            </p>
            ${offerInfo ? `<div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; color: #065f46; margin: 20px 0;"><strong>Special Offer:</strong> ${offerInfo}</div>` : ''}
            
            <div style="margin: 30px 0;">
              ${products.map((product) => `
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 2px solid #10b981;">
                  ${product.image ? `
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-bottom: 15px;">
                  ` : ''}
                  <div style="background: #d1fae5; color: #065f46; padding: 5px 10px; border-radius: 4px; display: inline-block; font-weight: bold; margin-bottom: 10px;">
                    🎁 SPECIAL OFFER
                  </div>
                  <h3 style="color: #1f2937; margin: 10px 0; font-size: 20px;">${product.name}</h3>
                  <p style="color: #10b981; font-size: 24px; font-weight: bold; margin: 10px 0;">
                    KES ${product.price.toLocaleString()}
                    ${product.compareAtPrice && product.compareAtPrice > product.price ? `
                      <span style="color: #9ca3af; font-size: 18px; text-decoration: line-through; margin-left: 10px;">
                        KES ${Number(product.compareAtPrice).toLocaleString()}
                      </span>
                    ` : ''}
                  </p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${product.id}" 
                     style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                    Claim Offer →
                  </a>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" 
                 style="display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">
                View All Offers
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              You are receiving this email because you are a valued customer of Mombasa Shisha Bongs.<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #667eea;">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `,
    getTextBody: (products, offerInfo) => {
      const productList = products.map((p) => `- ${p.name}: KES ${p.price.toLocaleString()}`).join('\n')
      return `Special Offers - Don't Miss Out!\n\n${offerInfo ? `Special Offer: ${offerInfo}\n\n` : ''}${productList}\n\nShop now: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products`
    },
  },
}

