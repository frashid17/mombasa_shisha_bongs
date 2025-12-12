// ============================================
// API CONFIGURATION
// ============================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
} as const

// ============================================
// PAGINATION DEFAULTS
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
  ADMIN_DEFAULT_LIMIT: 20,
} as const

// ============================================
// RATE LIMITING
// ============================================

export const RATE_LIMITS = {
  // Public endpoints (per minute)
  PUBLIC_PRODUCTS: 100,
  PUBLIC_CATEGORIES: 100,
  
  // Authenticated endpoints (per minute)
  CREATE_ORDER: 10,
  CREATE_REVIEW: 5,
  
  // Payment endpoints (per minute)
  MPESA_INITIATE: 3,
  
  // Admin endpoints (per minute)
  ADMIN_WRITE: 50,
  ADMIN_DELETE: 20,
} as const

// ============================================
// ORDER CONSTANTS
// ============================================

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export const PAYMENT_METHOD = {
  MPESA: 'MPESA',
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
} as const

// ============================================
// NOTIFICATION CONSTANTS
// ============================================

export const NOTIFICATION_TYPE = {
  ORDER_CONFIRMATION: 'ORDER_CONFIRMATION',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  LOW_STOCK_ALERT: 'LOW_STOCK_ALERT',
  ADMIN_ALERT: 'ADMIN_ALERT',
} as const

export const NOTIFICATION_CHANNEL = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  WHATSAPP: 'WHATSAPP',
  PUSH: 'PUSH',
} as const

export const NOTIFICATION_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  DELIVERED: 'DELIVERED',
} as const

// ============================================
// PRODUCT CONSTANTS
// ============================================

export const PRODUCT_SORT_OPTIONS = {
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  NEWEST: 'newest',
  OLDEST: 'oldest',
} as const

export const STOCK_STATUS = {
  IN_STOCK: 'IN_STOCK',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
} as const

// ============================================
// REVIEW CONSTANTS
// ============================================

export const REVIEW_RATING = {
  MIN: 1,
  MAX: 5,
} as const

// ============================================
// DELIVERY CONFIGURATION
// ============================================

export const DELIVERY_CONFIG = {
  FREE_DELIVERY_CITIES: ['Mombasa'],
  STANDARD_FEE: 500, // KES
  FREE_THRESHOLD: 0, // Free for orders above this amount
  ESTIMATED_DAYS: {
    MOMBASA: 1,
    OTHER: 3,
  },
} as const

// ============================================
// MPESA CONFIGURATION
// ============================================

export const MPESA_CONFIG = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
  PASSKEY: process.env.MPESA_PASSKEY || '',
  SHORTCODE: process.env.MPESA_SHORTCODE || '',
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL || '',
  ENVIRONMENT: (process.env.MPESA_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  
  // API URLs
  SANDBOX_URL: 'https://sandbox.safaricom.co.ke',
  PRODUCTION_URL: 'https://api.safaricom.co.ke',
  
  // Endpoints
  AUTH_URL: '/oauth/v1/generate?grant_type=client_credentials',
  STK_PUSH_URL: '/mpesa/stkpush/v1/processrequest',
  QUERY_URL: '/mpesa/stkpushquery/v1/query',
} as const

// ============================================
// EMAIL CONFIGURATION
// ============================================

export const EMAIL_CONFIG = {
  FROM_ADDRESS: process.env.EMAIL_FROM || 'noreply@mombasashishabongs.com',
  FROM_NAME: 'Mombasa Shisha Bongs',
  API_KEY: process.env.EMAIL_API_KEY || '',
} as const

// ============================================
// SMS CONFIGURATION (Twilio)
// ============================================

export const SMS_CONFIG = {
  // Twilio credentials
  ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  FROM_NUMBER: process.env.TWILIO_PHONE_NUMBER || '', // Format: +1234567890
} as const

// ============================================
// WHATSAPP CONFIGURATION (360dialog)
// ============================================
// NOTE: WhatsApp notifications are currently disabled
// This configuration is kept for future implementation

export const WHATSAPP_CONFIG = {
  // 360dialog WhatsApp Business API credentials
  API_KEY: process.env.WHATSAPP_API_KEY || '',
  INSTANCE_ID: process.env.WHATSAPP_INSTANCE_ID || '', // Optional, if provided by 360dialog
  API_URL: process.env.WHATSAPP_API_URL || 'https://waba.360dialog.io/v1',
  // Recipients (format: 254712345678 - no + or whatsapp: prefix)
  ADMIN_PHONE: process.env.ADMIN_WHATSAPP_PHONE || '', // Admin WhatsApp number (format: 254712345678)
  DELIVERY_PHONE: process.env.DELIVERY_WHATSAPP_PHONE || '', // Delivery person WhatsApp number (format: 254712345678)
} as const

// ============================================
// ADMIN CONFIGURATION
// ============================================

export const ADMIN_CONFIG = {
  ROLE: 'admin',
  EMAIL: process.env.ADMIN_EMAIL || 'mombasashishabongs@gmail.com',
} as const

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_IMAGES_PER_PRODUCT: 5,
} as const

// ============================================
// VALIDATION REGEX
// ============================================

export const REGEX = {
  KENYAN_PHONE: /^\+254[17]\d{8}$/,
  SLUG: /^[a-z0-9-]+$/,
  SKU: /^[A-Z0-9-]+$/,
} as const

// ============================================
// CURRENCY
// ============================================

export const CURRENCY = {
  CODE: 'KES',
  SYMBOL: 'KSH',
  LOCALE: 'en-KE',
} as const

// ============================================
// DATE FORMATS
// ============================================

export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy',
  SHORT: 'MMM dd, yyyy',
  TIME: 'hh:mm a',
  FULL_WITH_TIME: 'MMMM dd, yyyy hh:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",
} as const

// ============================================
// CACHE CONFIGURATION
// ============================================

export const CACHE_CONFIG = {
  PRODUCTS_TTL: 300, // 5 minutes
  CATEGORIES_TTL: 3600, // 1 hour
  SETTINGS_TTL: 3600, // 1 hour
  REVALIDATE_PRODUCTS: 60, // ISR revalidation
  REVALIDATE_CATEGORIES: 300, // ISR revalidation
} as const

// ============================================
// SEO CONFIGURATION
// ============================================

export const SEO_CONFIG = {
  SITE_NAME: 'Mombasa Shisha Bongs',
  SITE_DESCRIPTION: 'Premium shisha, vapes, and smoking accessories in Mombasa',
  SITE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  OG_IMAGE: '/images/og-image.jpg',
  TWITTER_HANDLE: '@MombasaShisha',
} as const

// ============================================
// ERROR MESSAGES (USER-FRIENDLY)
// ============================================

export const USER_MESSAGES = {
  SUCCESS: {
    ORDER_CREATED: 'Order placed successfully!',
    PAYMENT_INITIATED: 'Payment request sent to your phone. Please enter your MPESA PIN.',
    PAYMENT_COMPLETED: 'Payment received! Your order is being processed.',
    REVIEW_SUBMITTED: 'Thank you for your review! It will be visible after approval.',
    PRODUCT_ADDED: 'Product added to cart',
  },
  ERROR: {
    OUT_OF_STOCK: 'Sorry, this product is currently out of stock.',
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    INVALID_PHONE: 'Please enter a valid Kenyan phone number (e.g., +254712345678)',
    ORDER_NOT_FOUND: 'Order not found or you do not have permission to view it.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  },
} as const

