import { NextResponse } from 'next/server'

// ============================================
// ERROR CODES
// ============================================

export enum ErrorCode {
  // General Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',

  // Product Errors
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_OUT_OF_STOCK = 'PRODUCT_OUT_OF_STOCK',
  PRODUCT_HAS_ORDERS = 'PRODUCT_HAS_ORDERS',
  PRODUCT_SLUG_EXISTS = 'PRODUCT_SLUG_EXISTS',
  PRODUCT_SKU_EXISTS = 'PRODUCT_SKU_EXISTS',

  // Order Errors
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_ALREADY_PAID = 'ORDER_ALREADY_PAID',
  ORDER_CANNOT_BE_CANCELLED = 'ORDER_CANNOT_BE_CANCELLED',
  INVALID_ORDER_STATUS = 'INVALID_ORDER_STATUS',
  ORDER_ITEMS_REQUIRED = 'ORDER_ITEMS_REQUIRED',

  // Payment Errors
  PAYMENT_INITIATION_FAILED = 'PAYMENT_INITIATION_FAILED',
  PAYMENT_VERIFICATION_FAILED = 'PAYMENT_VERIFICATION_FAILED',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',

  // Category Errors
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CATEGORY_HAS_PRODUCTS = 'CATEGORY_HAS_PRODUCTS',
  CATEGORY_SLUG_EXISTS = 'CATEGORY_SLUG_EXISTS',

  // Review Errors
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  ALREADY_REVIEWED = 'ALREADY_REVIEWED',
  CANNOT_REVIEW_OWN_PRODUCT = 'CANNOT_REVIEW_OWN_PRODUCT',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: any
  }
}

export interface ApiPaginatedResponse<T = any> {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Success response helper
 */
export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

/**
 * Error response helper
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number = 400,
  details?: any
) {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  )
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status: number = 200
) {
  return NextResponse.json<ApiPaginatedResponse<T>>(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status }
  )
}

/**
 * Validation error response
 */
export function validationError(details: any) {
  return errorResponse(ErrorCode.VALIDATION_ERROR, 'Invalid request data', 400, details)
}

/**
 * Unauthorized error response
 */
export function unauthorizedError(message: string = 'Authentication required') {
  return errorResponse(ErrorCode.UNAUTHORIZED, message, 401)
}

/**
 * Forbidden error response
 */
export function forbiddenError(message: string = 'You do not have permission to perform this action') {
  return errorResponse(ErrorCode.FORBIDDEN, message, 403)
}

/**
 * Not found error response
 */
export function notFoundError(resource: string = 'Resource') {
  return errorResponse(ErrorCode.NOT_FOUND, `${resource} not found`, 404)
}

/**
 * Internal server error response
 */
export function internalError(message: string = 'An unexpected error occurred') {
  return errorResponse(ErrorCode.INTERNAL_ERROR, message, 500)
}

/**
 * Rate limit error response
 */
export function rateLimitError(retryAfter: number = 60) {
  return errorResponse(
    ErrorCode.RATE_LIMIT_EXCEEDED,
    'Too many requests. Please try again later.',
    429,
    { retryAfter }
  )
}

// ============================================
// STATUS CODE CONSTANTS
// ============================================

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ============================================
// ERROR MESSAGE HELPERS
// ============================================

export const ErrorMessages = {
  // General
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'An unexpected error occurred',

  // Products
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_OUT_OF_STOCK: 'Product is out of stock',
  PRODUCT_HAS_ORDERS: 'Cannot delete product with existing orders',
  PRODUCT_SLUG_EXISTS: 'A product with this slug already exists',
  PRODUCT_SKU_EXISTS: 'A product with this SKU already exists',

  // Orders
  ORDER_NOT_FOUND: 'Order not found',
  ORDER_ALREADY_PAID: 'Order has already been paid',
  ORDER_CANNOT_BE_CANCELLED: 'Order cannot be cancelled at this stage',
  INVALID_ORDER_STATUS: 'Invalid order status',
  ORDER_ITEMS_REQUIRED: 'At least one item is required',

  // Payments
  PAYMENT_INITIATION_FAILED: 'Failed to initiate payment',
  PAYMENT_VERIFICATION_FAILED: 'Failed to verify payment',
  PAYMENT_ALREADY_PROCESSED: 'Payment has already been processed',
  PAYMENT_NOT_FOUND: 'Payment record not found',
  INVALID_PHONE_NUMBER: 'Invalid phone number format',

  // Categories
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_HAS_PRODUCTS: 'Cannot delete category with products',
  CATEGORY_SLUG_EXISTS: 'A category with this slug already exists',

  // Reviews
  REVIEW_NOT_FOUND: 'Review not found',
  ALREADY_REVIEWED: 'You have already reviewed this product',
  CANNOT_REVIEW_OWN_PRODUCT: 'You cannot review your own product',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
} as const

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format Zod validation errors
 */
export function formatZodErrors(errors: any) {
  const formatted: Record<string, string> = {}
  
  errors.forEach((error: any) => {
    const path = error.path.join('.')
    formatted[path] = error.message
  })
  
  return formatted
}

/**
 * Catch async errors and return error response
 */
export async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<T | ReturnType<typeof internalError>> {
  try {
    return await fn()
  } catch (error) {
    console.error('API Error:', error)
    return internalError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    )
  }
}

/**
 * Check if response is an error
 */
export function isErrorResponse(response: any): response is ApiErrorResponse {
  return response && response.success === false
}

