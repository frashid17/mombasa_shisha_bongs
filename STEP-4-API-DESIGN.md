# 🛣️ STEP 4 — API DESIGN

## 📋 Table of Contents
1. [API Overview](#api-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Schemas](#requestresponse-schemas)
5. [Validation Rules](#validation-rules)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## 🌐 API Overview

### Base URL
```
Development: http://localhost:3000/api
Production:  https://mombasashishabongs.com/api
```

### API Version
```
Version: 1.0
All endpoints: /api/*
```

### Response Format
All responses follow this structure:

```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}

// Paginated Response
{
  success: true,
  data: any[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

---

## 🔐 Authentication & Authorization

### Authentication Methods

**1. Clerk Authentication**
- All authenticated endpoints require Clerk session token
- Token passed in `Authorization` header: `Bearer <token>`
- User info extracted from Clerk session

**2. Admin Authorization**
- Admin routes require `publicMetadata.role === 'admin'`
- Checked via Clerk middleware

### Protected Routes

```typescript
// Public Routes (No Auth)
GET  /api/products
GET  /api/products/[id]
GET  /api/products/search
GET  /api/categories
GET  /api/categories/[id]

// Authenticated Routes (User)
GET  /api/orders (own orders)
GET  /api/orders/[id] (own order)
POST /api/orders
GET  /api/reviews (own reviews)
POST /api/reviews

// Admin Routes (Admin Role)
GET    /api/admin/orders (all orders)
PUT    /api/admin/orders/[id]
GET    /api/admin/products (all with filters)
POST   /api/admin/products
PUT    /api/admin/products/[id]
DELETE /api/admin/products/[id]
POST   /api/admin/categories
PUT    /api/admin/categories/[id]
DELETE /api/admin/categories/[id]
GET    /api/admin/stats
```

---

## 📡 API Endpoints

### 1. Products Endpoints

#### **GET /api/products**
Get all active products with filtering and pagination

**Query Parameters:**
```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 12, Max: 50
  categoryId?: string;    // Filter by category
  search?: string;        // Search in name and description
  minPrice?: number;      // Minimum price filter
  maxPrice?: number;      // Maximum price filter
  sortBy?: 'price' | 'name' | 'createdAt'; // Default: 'createdAt'
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
  isFeatured?: boolean;   // Filter featured products
  isNewArrival?: boolean; // Filter new arrivals
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123",
      "name": "Premium Glass Hookah",
      "slug": "premium-glass-hookah",
      "description": "High-quality glass hookah...",
      "shortDescription": "Premium quality glass...",
      "price": 8900,
      "compareAtPrice": 10500,
      "stock": 45,
      "isActive": true,
      "isFeatured": true,
      "isNewArrival": false,
      "featuredImage": "https://...",
      "category": {
        "id": "cat123",
        "name": "Shisha Hookahs",
        "slug": "shisha-hookahs"
      },
      "images": [
        {
          "id": "img123",
          "url": "https://...",
          "altText": "Front view",
          "isPrimary": true
        }
      ],
      "averageRating": 4.8,
      "reviewCount": 127
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 166,
    "totalPages": 14
  }
}
```

---

#### **GET /api/products/[id]**
Get single product by ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx123",
    "name": "Premium Glass Hookah",
    "slug": "premium-glass-hookah",
    "description": "High-quality borosilicate glass...",
    "shortDescription": "Premium quality glass...",
    "sku": "HOOK-001",
    "price": 8900,
    "compareAtPrice": 10500,
    "stock": 45,
    "lowStockThreshold": 10,
    "trackInventory": true,
    "allowBackorder": false,
    "brand": "Premium Collection",
    "tags": "glass,hookah,premium,modern",
    "weight": 2.5,
    "length": 65,
    "width": 20,
    "height": 30,
    "metaTitle": "Premium Glass Hookah...",
    "metaDescription": "Buy premium quality...",
    "isActive": true,
    "isFeatured": true,
    "isNewArrival": false,
    "featuredImage": "https://...",
    "category": {
      "id": "cat123",
      "name": "Shisha Hookahs",
      "slug": "shisha-hookahs",
      "description": "Traditional and modern..."
    },
    "images": [
      {
        "id": "img123",
        "url": "https://...",
        "altText": "Front view",
        "position": 0,
        "isPrimary": true
      }
    ],
    "reviews": [
      {
        "id": "rev123",
        "rating": 5,
        "title": "Excellent product!",
        "comment": "Very satisfied...",
        "userName": "John K.",
        "createdAt": "2024-12-10T10:30:00Z",
        "isVerified": true
      }
    ],
    "averageRating": 4.8,
    "reviewCount": 127,
    "createdAt": "2024-11-01T00:00:00Z",
    "updatedAt": "2024-12-01T00:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

---

#### **GET /api/products/search**
Search products by query

**Query Parameters:**
```typescript
{
  q: string;              // Search query (required)
  page?: number;          // Default: 1
  limit?: number;         // Default: 12
  categoryId?: string;    // Filter by category
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123",
      "name": "Premium Glass Hookah",
      "slug": "premium-glass-hookah",
      "shortDescription": "Premium quality...",
      "price": 8900,
      "featuredImage": "https://...",
      "averageRating": 4.8,
      "reviewCount": 127
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 2. Categories Endpoints

#### **GET /api/categories**
Get all active categories

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat123",
      "name": "Shisha Hookahs",
      "slug": "shisha-hookahs",
      "description": "Traditional and modern hookahs...",
      "image": "https://...",
      "productCount": 45,
      "children": [
        {
          "id": "cat456",
          "name": "Glass Hookahs",
          "slug": "glass-hookahs",
          "productCount": 20
        }
      ]
    }
  ]
}
```

---

#### **GET /api/categories/[slug]**
Get category by slug with products

**Query Parameters:**
```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 12
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cat123",
      "name": "Shisha Hookahs",
      "slug": "shisha-hookahs",
      "description": "Traditional and modern...",
      "image": "https://..."
    },
    "products": [
      {
        "id": "clx123",
        "name": "Premium Glass Hookah",
        "price": 8900,
        "featuredImage": "https://..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "totalPages": 4
    }
  }
}
```

---

### 3. Orders Endpoints

#### **POST /api/orders**
Create a new order

**Authentication:** Required (User)

**Request Body:**
```json
{
  "items": [
    {
      "productId": "clx123",
      "quantity": 1
    },
    {
      "productId": "clx456",
      "quantity": 2
    }
  ],
  "deliveryAddress": "Nyali, Mombasa",
  "deliveryCity": "Mombasa",
  "deliveryNotes": "Please call before delivery",
  "userPhone": "+254712345678"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "ord123",
    "orderNumber": "MSB-2024-000001",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "items": [
      {
        "id": "item123",
        "productName": "Premium Glass Hookah",
        "productImage": "https://...",
        "price": 8900,
        "quantity": 1,
        "subtotal": 8900
      }
    ],
    "subtotal": 12100,
    "deliveryFee": 0,
    "tax": 0,
    "discount": 0,
    "total": 12100,
    "deliveryAddress": "Nyali, Mombasa",
    "deliveryCity": "Mombasa",
    "createdAt": "2024-12-11T10:30:00Z"
  },
  "message": "Order created successfully. Proceed to payment."
}
```

**Validation Errors (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "items": "At least one item is required",
      "deliveryAddress": "Delivery address is required"
    }
  }
}
```

---

#### **GET /api/orders**
Get user's orders

**Authentication:** Required (User)

**Query Parameters:**
```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 10
  status?: OrderStatus;   // Filter by status
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ord123",
      "orderNumber": "MSB-2024-000001",
      "status": "PROCESSING",
      "paymentStatus": "PAID",
      "total": 12100,
      "itemCount": 3,
      "createdAt": "2024-12-11T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

#### **GET /api/orders/[id]**
Get order details

**Authentication:** Required (User - own orders only)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ord123",
    "orderNumber": "MSB-2024-000001",
    "status": "PROCESSING",
    "paymentStatus": "PAID",
    "items": [
      {
        "id": "item123",
        "productId": "clx123",
        "productName": "Premium Glass Hookah",
        "productSku": "HOOK-001",
        "productImage": "https://...",
        "price": 8900,
        "quantity": 1,
        "subtotal": 8900
      }
    ],
    "subtotal": 12100,
    "deliveryFee": 0,
    "tax": 0,
    "discount": 0,
    "total": 12100,
    "deliveryAddress": "Nyali, Mombasa",
    "deliveryCity": "Mombasa",
    "deliveryNotes": "Please call before delivery",
    "trackingNumber": null,
    "estimatedDelivery": "2024-12-13T00:00:00Z",
    "payment": {
      "method": "MPESA",
      "status": "PAID",
      "amount": 12100,
      "paidAt": "2024-12-11T10:31:00Z"
    },
    "createdAt": "2024-12-11T10:30:00Z",
    "updatedAt": "2024-12-11T10:31:00Z"
  }
}
```

---

### 4. Payment Endpoints (Mpesa)

#### **POST /api/mpesa/initiate**
Initiate Mpesa STK Push

**Authentication:** Required (User)

**Request Body:**
```json
{
  "orderId": "ord123",
  "phoneNumber": "+254712345678"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "checkoutRequestId": "ws_CO_123456789",
    "merchantRequestId": "12345-67890-1",
    "responseCode": "0",
    "responseDescription": "Success. Request accepted for processing",
    "customerMessage": "Enter your MPESA PIN to complete payment"
  },
  "message": "Payment request sent to your phone. Please enter your MPESA PIN."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_INITIATION_FAILED",
    "message": "Failed to initiate payment",
    "details": "Invalid phone number format"
  }
}
```

---

#### **POST /api/mpesa/callback**
Mpesa payment callback (webhook)

**Authentication:** None (Safaricom webhook)

**Request Body (from Safaricom):**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "12345-67890-1",
      "CheckoutRequestID": "ws_CO_123456789",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 12100 },
          { "Name": "MpesaReceiptNumber", "Value": "QGH12345XYZ" },
          { "Name": "TransactionDate", "Value": 20241211103100 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

**Success Response (200):**
```json
{
  "ResultCode": 0,
  "ResultDesc": "Accepted"
}
```

---

### 5. Reviews Endpoints

#### **POST /api/reviews**
Create a product review

**Authentication:** Required (User)

**Request Body:**
```json
{
  "productId": "clx123",
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Very satisfied with the quality. Fast delivery too!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "rev123",
    "productId": "clx123",
    "rating": 5,
    "title": "Excellent product!",
    "comment": "Very satisfied...",
    "isVerified": false,
    "isApproved": false,
    "createdAt": "2024-12-11T10:30:00Z"
  },
  "message": "Review submitted successfully. It will be visible after approval."
}
```

---

### 6. Admin Endpoints

#### **GET /api/admin/stats**
Get dashboard statistics

**Authentication:** Required (Admin)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 847000,
      "thisMonth": 123000,
      "lastMonth": 98000,
      "percentageChange": 25.5
    },
    "orders": {
      "total": 234,
      "thisMonth": 45,
      "pending": 5,
      "processing": 12,
      "shipped": 8,
      "delivered": 20
    },
    "customers": {
      "total": 1432,
      "new": 89
    },
    "products": {
      "total": 166,
      "active": 158,
      "lowStock": 12,
      "outOfStock": 3
    },
    "topProducts": [
      {
        "id": "clx123",
        "name": "Premium Glass Hookah",
        "sales": 89,
        "revenue": 792100
      }
    ],
    "recentOrders": [
      {
        "id": "ord123",
        "orderNumber": "MSB-2024-000001",
        "customerName": "John Kamau",
        "total": 12100,
        "status": "PROCESSING",
        "createdAt": "2024-12-11T10:30:00Z"
      }
    ]
  }
}
```

---

#### **POST /api/admin/products**
Create a new product

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Premium Glass Hookah",
  "slug": "premium-glass-hookah",
  "description": "High-quality borosilicate glass...",
  "shortDescription": "Premium quality glass...",
  "sku": "HOOK-001",
  "price": 8900,
  "compareAtPrice": 10500,
  "costPrice": 6000,
  "stock": 45,
  "lowStockThreshold": 10,
  "categoryId": "cat123",
  "brand": "Premium Collection",
  "tags": "glass,hookah,premium,modern",
  "weight": 2.5,
  "length": 65,
  "width": 20,
  "height": 30,
  "metaTitle": "Premium Glass Hookah...",
  "metaDescription": "Buy premium quality...",
  "isActive": true,
  "isFeatured": true,
  "isNewArrival": false
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clx123",
    "name": "Premium Glass Hookah",
    "slug": "premium-glass-hookah",
    "price": 8900,
    "stock": 45,
    "isActive": true,
    "createdAt": "2024-12-11T10:30:00Z"
  },
  "message": "Product created successfully"
}
```

---

#### **PUT /api/admin/products/[id]**
Update a product

**Authentication:** Required (Admin)

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Product Name",
  "price": 9500,
  "stock": 50,
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx123",
    "name": "Updated Product Name",
    "price": 9500,
    "stock": 50,
    "updatedAt": "2024-12-11T10:30:00Z"
  },
  "message": "Product updated successfully"
}
```

---

#### **DELETE /api/admin/products/[id]**
Delete a product

**Authentication:** Required (Admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_HAS_ORDERS",
    "message": "Cannot delete product with existing orders"
  }
}
```

---

#### **PUT /api/admin/orders/[id]**
Update order status

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123456",
  "adminNotes": "Shipped via DHL"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ord123",
    "orderNumber": "MSB-2024-000001",
    "status": "SHIPPED",
    "trackingNumber": "TRACK123456",
    "updatedAt": "2024-12-11T10:30:00Z"
  },
  "message": "Order updated successfully"
}
```

---

## ✅ Validation Rules (Zod Schemas)

### Product Validation

```typescript
import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  shortDescription: z.string().max(500).optional(),
  sku: z.string().max(100).optional(),
  price: z.number().positive().min(0.01),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  categoryId: z.string().cuid(),
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
```

---

### Order Validation

```typescript
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive().min(1).max(100),
  })).min(1, "At least one item is required"),
  deliveryAddress: z.string().min(10).max(500),
  deliveryCity: z.string().min(2).max(100),
  deliveryNotes: z.string().max(1000).optional(),
  userPhone: z.string().regex(/^\+254[17]\d{8}$/, "Invalid Kenyan phone number"),
})
```

---

### Review Validation

```typescript
export const createReviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  comment: z.string().min(10).max(5000),
})
```

---

### Mpesa Validation

```typescript
export const initiateMpesaSchema = z.object({
  orderId: z.string().cuid(),
  phoneNumber: z.string().regex(/^\+254[17]\d{8}$/, "Invalid Kenyan phone number"),
})
```

---

## ⚠️ Error Handling

### Error Codes

```typescript
export enum ErrorCode {
  // General Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  
  // Product Errors
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_OUT_OF_STOCK = 'PRODUCT_OUT_OF_STOCK',
  PRODUCT_HAS_ORDERS = 'PRODUCT_HAS_ORDERS',
  
  // Order Errors
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_ALREADY_PAID = 'ORDER_ALREADY_PAID',
  ORDER_CANNOT_BE_CANCELLED = 'ORDER_CANNOT_BE_CANCELLED',
  INVALID_ORDER_STATUS = 'INVALID_ORDER_STATUS',
  
  // Payment Errors
  PAYMENT_INITIATION_FAILED = 'PAYMENT_INITIATION_FAILED',
  PAYMENT_VERIFICATION_FAILED = 'PAYMENT_VERIFICATION_FAILED',
  PAYMENT_ALREADY_PROCESSED = 'PAYMENT_ALREADY_PROCESSED',
  
  // Category Errors
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CATEGORY_HAS_PRODUCTS = 'CATEGORY_HAS_PRODUCTS',
  
  // Review Errors
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  ALREADY_REVIEWED = 'ALREADY_REVIEWED',
}
```

---

### Error Response Helper

```typescript
// src/utils/api-response.ts

export function successResponse<T>(data: T, message?: string) {
  return Response.json({
    success: true,
    data,
    ...(message && { message }),
  })
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number = 400,
  details?: any
) {
  return Response.json(
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

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return Response.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
```

---

### HTTP Status Codes

```typescript
200 OK              - Successful GET, PUT requests
201 Created         - Successful POST request
204 No Content      - Successful DELETE request
400 Bad Request     - Validation errors
401 Unauthorized    - Missing or invalid authentication
403 Forbidden       - Insufficient permissions
404 Not Found       - Resource not found
409 Conflict        - Duplicate resource
429 Too Many Requests - Rate limit exceeded
500 Internal Error  - Server error
```

---

## 🚦 Rate Limiting

### Rate Limit Configuration

```typescript
// Public Endpoints
GET /api/products        - 100 requests per minute
GET /api/categories      - 100 requests per minute

// Authenticated Endpoints
POST /api/orders         - 10 requests per minute
POST /api/reviews        - 5 requests per minute

// Payment Endpoints
POST /api/mpesa/initiate - 3 requests per minute

// Admin Endpoints
POST /api/admin/products - 50 requests per minute
PUT /api/admin/products  - 50 requests per minute
DELETE /api/admin/*      - 20 requests per minute
```

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702291200
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## 📊 API Endpoint Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/products` | GET | Public | List products |
| `/api/products/[id]` | GET | Public | Get product |
| `/api/products/search` | GET | Public | Search products |
| `/api/categories` | GET | Public | List categories |
| `/api/categories/[slug]` | GET | Public | Get category |
| `/api/orders` | GET | User | User's orders |
| `/api/orders` | POST | User | Create order |
| `/api/orders/[id]` | GET | User | Get order |
| `/api/mpesa/initiate` | POST | User | Initiate payment |
| `/api/mpesa/callback` | POST | Webhook | Payment callback |
| `/api/reviews` | POST | User | Create review |
| `/api/admin/stats` | GET | Admin | Dashboard stats |
| `/api/admin/products` | GET | Admin | List all products |
| `/api/admin/products` | POST | Admin | Create product |
| `/api/admin/products/[id]` | PUT | Admin | Update product |
| `/api/admin/products/[id]` | DELETE | Admin | Delete product |
| `/api/admin/categories` | POST | Admin | Create category |
| `/api/admin/categories/[id]` | PUT | Admin | Update category |
| `/api/admin/categories/[id]` | DELETE | Admin | Delete category |
| `/api/admin/orders/[id]` | PUT | Admin | Update order |

**Total Endpoints: 20+**

---

## 🔒 Security Best Practices

1. **Input Validation**: All inputs validated with Zod
2. **SQL Injection**: Protected by Prisma ORM
3. **XSS Protection**: Output sanitization
4. **CSRF Protection**: SameSite cookies
5. **Rate Limiting**: Prevent abuse
6. **Authentication**: Clerk token verification
7. **Authorization**: Role-based access control
8. **HTTPS Only**: Enforce secure connections
9. **Audit Logging**: Log admin actions

---

## 📝 API Testing

### Using cURL

```bash
# Get products
curl http://localhost:3000/api/products

# Search products
curl "http://localhost:3000/api/products/search?q=hookah"

# Create order (with auth token)
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "clx123", "quantity": 1}],
    "deliveryAddress": "Nyali, Mombasa",
    "deliveryCity": "Mombasa",
    "userPhone": "+254712345678"
  }'
```

---

## 🎯 Next Steps

**Type "NEXT" to proceed to:**

**STEP 5 — AUTHENTICATION USING CLERK**

This will include:
- Clerk middleware setup
- ClerkProvider configuration
- Admin role implementation
- Protected route patterns
- User session management
- Sign-in/Sign-up pages

---

**API Design**: ✅ **COMPLETE**  
**Total Endpoints**: 20+  
**Validation Schemas**: ✅ Ready  
**Error Handling**: ✅ Defined  
**Rate Limiting**: ✅ Configured

