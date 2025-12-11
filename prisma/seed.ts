import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Create Categories
  const shishaCategory = await prisma.category.create({
    data: {
      name: 'Shisha Hookahs',
      slug: 'shisha-hookahs',
      description: 'Traditional and modern hookahs for the perfect smoking experience',
      image: 'https://images.unsplash.com/photo-1621264448270-9ef00e88a935',
      isActive: true,
    },
  })

  const vapesCategory = await prisma.category.create({
    data: {
      name: 'Vapes',
      slug: 'vapes',
      description: 'Electronic vaping devices and accessories',
      image: 'https://images.unsplash.com/photo-1555697863-80a30c6e4bc1',
      isActive: true,
    },
  })

  const tobaccoCategory = await prisma.category.create({
    data: {
      name: 'Tobacco',
      slug: 'tobacco',
      description: 'Premium flavored tobacco for hookahs',
      image: 'https://images.unsplash.com/photo-1548595165-c96277dfa6d3',
      isActive: true,
    },
  })

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Essential hookah and vape accessories',
      image: 'https://images.unsplash.com/photo-1591522810163-d1e3cbf1c888',
      isActive: true,
    },
  })

  console.log('✅ Categories created')

  // 2. Create Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Premium Glass Hookah',
      slug: 'premium-glass-hookah',
      description: 'High-quality borosilicate glass hookah with modern design. Features smooth smoking experience and easy maintenance.',
      shortDescription: 'Premium quality glass hookah with modern design',
      sku: 'HOOK-001',
      price: 8900,
      compareAtPrice: 10500,
      costPrice: 6000,
      stock: 45,
      lowStockThreshold: 10,
      categoryId: shishaCategory.id,
      brand: 'Premium Collection',
      tags: 'glass,hookah,premium,modern',
      featuredImage: 'https://images.unsplash.com/photo-1621264448270-9ef00e88a935',
      weight: 2.5,
      length: 65,
      width: 20,
      height: 30,
      metaTitle: 'Premium Glass Hookah - Modern Design',
      metaDescription: 'Buy premium quality glass hookah with modern design. Fast delivery in Mombasa.',
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      publishedAt: new Date(),
    },
  })

  const product2 = await prisma.product.create({
    data: {
      name: 'Electronic Vape Pen',
      slug: 'electronic-vape-pen',
      description: 'Rechargeable electronic vape pen with long battery life and adjustable settings.',
      shortDescription: 'Rechargeable vape pen with long battery',
      sku: 'VAPE-001',
      price: 2300,
      stock: 120,
      categoryId: vapesCategory.id,
      brand: 'VapeTech',
      tags: 'vape,electronic,rechargeable',
      featuredImage: 'https://images.unsplash.com/photo-1555697863-80a30c6e4bc1',
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      publishedAt: new Date(),
    },
  })

  const product3 = await prisma.product.create({
    data: {
      name: 'Flavored Tobacco Pack - Apple Mint',
      slug: 'flavored-tobacco-apple-mint',
      description: 'Premium flavored tobacco with refreshing apple mint flavor. 50g pack.',
      shortDescription: 'Apple mint flavored tobacco - 50g',
      sku: 'TOB-001',
      price: 1200,
      stock: 200,
      categoryId: tobaccoCategory.id,
      brand: 'FlavorMaster',
      tags: 'tobacco,flavored,apple,mint',
      featuredImage: 'https://images.unsplash.com/photo-1548595165-c96277dfa6d3',
      weight: 0.05,
      isActive: true,
      isFeatured: false,
      publishedAt: new Date(),
    },
  })

  const product4 = await prisma.product.create({
    data: {
      name: 'Charcoal Pack (50 pieces)',
      slug: 'charcoal-pack-50',
      description: 'Natural coconut charcoal cubes, quick-lighting and long-lasting. 50 pieces per pack.',
      shortDescription: 'Natural coconut charcoal - 50 pcs',
      sku: 'ACC-001',
      price: 800,
      compareAtPrice: 1000,
      stock: 300,
      categoryId: accessoriesCategory.id,
      brand: 'CocoFire',
      tags: 'charcoal,coconut,natural',
      featuredImage: 'https://images.unsplash.com/photo-1591522810163-d1e3cbf1c888',
      weight: 0.5,
      isActive: true,
      isFeatured: false,
      publishedAt: new Date(),
    },
  })

  console.log('✅ Products created')

  // 3. Create Product Images
  await prisma.productImage.createMany({
    data: [
      {
        productId: product1.id,
        url: 'https://images.unsplash.com/photo-1621264448270-9ef00e88a935',
        altText: 'Premium Glass Hookah - Front View',
        position: 0,
        isPrimary: true,
      },
      {
        productId: product1.id,
        url: 'https://images.unsplash.com/photo-1621264448271-9ef00e88a936',
        altText: 'Premium Glass Hookah - Side View',
        position: 1,
        isPrimary: false,
      },
    ],
  })

  console.log('✅ Product images created')

  // 4. Create Sample Order
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'MSB-2024-000001',
      userId: 'user_sample123',
      userEmail: 'john@example.com',
      userName: 'John Kamau',
      userPhone: '+254712345678',
      deliveryAddress: 'Nyali, Mombasa',
      deliveryCity: 'Mombasa',
      deliveryNotes: 'Please call before delivery',
      subtotal: 12100,
      deliveryFee: 0,
      tax: 0,
      discount: 0,
      total: 12100,
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    },
  })

  // 5. Create Order Items
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: sampleOrder.id,
        productId: product1.id,
        productName: 'Premium Glass Hookah',
        productSku: 'HOOK-001',
        productImage: 'https://images.unsplash.com/photo-1621264448270-9ef00e88a935',
        price: 8900,
        quantity: 1,
        subtotal: 8900,
      },
      {
        orderId: sampleOrder.id,
        productId: product3.id,
        productName: 'Flavored Tobacco Pack - Apple Mint',
        productSku: 'TOB-001',
        productImage: 'https://images.unsplash.com/photo-1548595165-c96277dfa6d3',
        price: 1200,
        quantity: 2,
        subtotal: 2400,
      },
      {
        orderId: sampleOrder.id,
        productId: product4.id,
        productName: 'Charcoal Pack (50 pieces)',
        productSku: 'ACC-001',
        productImage: 'https://images.unsplash.com/photo-1591522810163-d1e3cbf1c888',
        price: 800,
        quantity: 1,
        subtotal: 800,
      },
    ],
  })

  console.log('✅ Order and order items created')

  // 6. Create Payment Record
  await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      method: 'MPESA',
      mpesaPhone: '+254712345678',
      mpesaReceiptNumber: 'QGH12345XYZ',
      mpesaTransactionId: 'MPESA123456789',
      amount: 12100,
      currency: 'KES',
      status: 'PAID',
      paidAt: new Date(),
    },
  })

  console.log('✅ Payment record created')

  // 7. Create Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: product1.id,
        userId: 'user_sample123',
        userName: 'John Kamau',
        userEmail: 'john@example.com',
        rating: 5,
        title: 'Excellent product!',
        comment: 'Very satisfied with the quality. Fast delivery too!',
        isVerified: true,
        isApproved: true,
        helpfulCount: 12,
      },
      {
        productId: product1.id,
        userId: 'user_sample456',
        userName: 'Sarah Mwangi',
        userEmail: 'sarah@example.com',
        rating: 4,
        title: 'Good value for money',
        comment: 'Nice design, works well. Only issue is the hose is a bit short.',
        isVerified: true,
        isApproved: true,
        helpfulCount: 8,
      },
    ],
  })

  console.log('✅ Reviews created')

  // 8. Create Settings
  await prisma.settings.createMany({
    data: [
      {
        key: 'site_name',
        value: 'Mombasa Shisha Bongs',
        description: 'Website name',
        category: 'general',
        isPublic: true,
      },
      {
        key: 'delivery_fee_mombasa',
        value: '0',
        description: 'Free delivery in Mombasa',
        category: 'shipping',
        isPublic: true,
      },
      {
        key: 'delivery_fee_other',
        value: '500',
        description: 'Delivery fee outside Mombasa',
        category: 'shipping',
        isPublic: true,
      },
      {
        key: 'low_stock_alert_threshold',
        value: '10',
        description: 'Alert when stock falls below this number',
        category: 'inventory',
        isPublic: false,
      },
    ],
  })

  console.log('✅ Settings created')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

