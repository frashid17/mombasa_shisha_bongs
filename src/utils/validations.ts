import { z } from 'zod'

// ============================================
// PRODUCT VALIDATIONS
// ============================================

export const createProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255),
  slug: z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().max(500).optional(),
  sku: z.string().max(100).optional(),
  price: z.number().positive('Price must be positive').min(0.01),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  categoryId: z.string().cuid('Invalid category ID'),
  brand: z.string().max(100).optional(),
  tags: z.string().max(1000).optional(),
  weight: z.number().positive().optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
})

export const updateProductSchema = createProductSchema.partial()

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  categoryId: z.string().cuid().optional(),
  search: z.string().max(255).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['price', 'name', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isFeatured: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
})

// ============================================
// CATEGORY VALIDATIONS
// ============================================

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  image: z.string().url('Invalid image URL').optional(),
  parentId: z.string().cuid().optional(),
  isActive: z.boolean().default(true),
})

export const updateCategorySchema = createCategorySchema.partial()

// ============================================
// ORDER VALIDATIONS
// ============================================

export const orderItemSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be positive')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Maximum quantity is 100'),
})

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Maximum 50 items per order'),
  deliveryAddress: z
    .string()
    .min(10, 'Delivery address must be at least 10 characters')
    .max(500),
  deliveryCity: z.string().min(2).max(100),
  deliveryNotes: z.string().max(1000).optional(),
  userPhone: z
    .string()
    .regex(/^\+254[17]\d{8}$/, 'Invalid Kenyan phone number. Format: +254712345678'),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().max(100).optional(),
  estimatedDelivery: z.coerce.date().optional(),
  adminNotes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z
    .enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .optional(),
})

// ============================================
// PAYMENT VALIDATIONS (MPESA)
// ============================================

export const initiateMpesaSchema = z.object({
  orderId: z.string().cuid('Invalid order ID'),
  phoneNumber: z
    .string()
    .regex(/^\+254[17]\d{8}$/, 'Invalid Kenyan phone number. Format: +254712345678'),
})

// ============================================
// REVIEW VALIDATIONS
// ============================================

export const createReviewSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(255).optional(),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(5000, 'Comment cannot exceed 5000 characters'),
})

export const updateReviewSchema = z.object({
  isApproved: z.boolean(),
  adminNotes: z.string().max(500).optional(),
})

// ============================================
// SEARCH VALIDATIONS
// ============================================

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(255),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  categoryId: z.string().cuid().optional(),
})

// ============================================
// SETTINGS VALIDATIONS
// ============================================

export const createSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  description: z.string().max(500).optional(),
  category: z.string().max(50).default('general'),
  isPublic: z.boolean().default(false),
})

export const updateSettingSchema = createSettingSchema.partial()

// ============================================
// ADMIN LOG VALIDATIONS
// ============================================

export const createAdminLogSchema = z.object({
  action: z.string().max(100),
  entity: z.string().max(50),
  entityId: z.string().cuid().optional(),
  description: z.string(),
  metadata: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderQueryInput = z.infer<typeof orderQuerySchema>

export type InitiateMpesaInput = z.infer<typeof initiateMpesaSchema>

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>

export type SearchQueryInput = z.infer<typeof searchQuerySchema>

export type CreateSettingInput = z.infer<typeof createSettingSchema>
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>

export type CreateAdminLogInput = z.infer<typeof createAdminLogSchema>

