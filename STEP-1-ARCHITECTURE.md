# 🏗️ STEP 1 — SYSTEM PLANNING + ARCHITECTURE

## 📋 Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Technology Stack Justification](#technology-stack-justification)
3. [System Components](#system-components)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Folder Structure](#folder-structure)
6. [User Journeys](#user-journeys)
7. [Route Planning](#route-planning)

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js 16 App Router (React 19)            │  │
│  │                                                           │  │
│  │  ┌────────────────┐           ┌────────────────┐        │  │
│  │  │  Client Pages  │           │  Admin Pages   │        │  │
│  │  │  - Homepage    │           │  - Dashboard   │        │  │
│  │  │  - Products    │           │  - Products    │        │  │
│  │  │  - Categories  │           │  - Orders      │        │  │
│  │  │  - Cart        │           │  - Categories  │        │  │
│  │  │  - Checkout    │           │  - Settings    │        │  │
│  │  └────────────────┘           └────────────────┘        │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │         Shared Components & UI Library           │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ HTTP/HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Products   │  │    Orders    │  │    Mpesa     │         │
│  │   API        │  │    API       │  │    API       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Categories  │  │    Admin     │  │ Notifications│         │
│  │   API        │  │    API       │  │    API       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│   Clerk      │ │   Prisma    │ │  External    │
│   Auth       │ │   ORM       │ │  Services    │
│   Service    │ │             │ │              │
│              │ │      │      │ │  - Mpesa     │
│  - Users     │ │      ▼      │ │  - Email     │
│  - Roles     │ │  ┌────────┐ │ │  - SMS       │
│  - Sessions  │ │  │ MySQL  │ │ │  - WhatsApp  │
│              │ │  │   DB   │ │ │              │
└──────────────┘ │  └────────┘ │ └──────────────┘
                 └─────────────┘
```

---

## 🎯 Technology Stack Justification

### Frontend Framework: **Next.js 16 with App Router**
**Why?**
- ✅ **Server-Side Rendering (SSR)** - Better SEO for product pages
- ✅ **Static Site Generation (SSG)** - Fast page loads for product catalogs
- ✅ **API Routes** - Backend API in the same project
- ✅ **File-based Routing** - Intuitive route management
- ✅ **Image Optimization** - Automatic image optimization
- ✅ **Built-in TypeScript Support** - Type safety out of the box

### UI Framework: **React 19**
**Why?**
- ✅ **Component-Based Architecture** - Reusable UI components
- ✅ **Large Ecosystem** - Extensive library support
- ✅ **React Compiler** - Automatic performance optimization
- ✅ **Hooks** - Clean state management
- ✅ **Virtual DOM** - Efficient rendering

### Styling: **TailwindCSS 4**
**Why?**
- ✅ **Utility-First** - Rapid UI development
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Small Bundle Size** - Only used classes are included
- ✅ **Customizable** - Easy theme configuration
- ✅ **No CSS Conflicts** - Scoped utility classes

### Authentication: **Clerk**
**Why?**
- ✅ **Production-Ready** - Battle-tested authentication
- ✅ **Role-Based Access Control** - Easy admin management
- ✅ **Social Logins** - Google, Facebook, etc.
- ✅ **User Management** - Built-in user dashboard
- ✅ **Security** - MFA, session management, etc.
- ✅ **No Backend Code** - Handled by Clerk

### Database: **MySQL + Prisma ORM**
**Why MySQL?**
- ✅ **Relational Data** - Products, orders, users have relationships
- ✅ **ACID Compliance** - Transaction safety for payments
- ✅ **Mature & Stable** - Battle-tested for e-commerce
- ✅ **Wide Support** - Easy hosting options

**Why Prisma?**
- ✅ **Type Safety** - Auto-generated TypeScript types
- ✅ **Migrations** - Database version control
- ✅ **Intuitive API** - Easy to write queries
- ✅ **Prisma Studio** - Visual database browser
- ✅ **Performance** - Optimized queries

### Payments: **Mpesa Daraja API (STK Push)**
**Why?**
- ✅ **Local Payment Method** - Preferred in Kenya
- ✅ **Direct Integration** - No third-party fees
- ✅ **STK Push** - Seamless customer experience
- ✅ **Real-time Callbacks** - Instant payment confirmation
- ✅ **Secure** - Safaricom's secure infrastructure

### State Management: **Zustand**
**Why?**
- ✅ **Lightweight** - Small bundle size (~1KB)
- ✅ **Simple API** - Easy to learn and use
- ✅ **No Boilerplate** - Unlike Redux
- ✅ **TypeScript Support** - Full type safety
- ✅ **Persistent State** - Easy localStorage integration

### Data Fetching: **TanStack Query (React Query)**
**Why?**
- ✅ **Caching** - Automatic data caching
- ✅ **Background Refetching** - Keep data fresh
- ✅ **Loading States** - Built-in loading/error states
- ✅ **Optimistic Updates** - Better UX
- ✅ **DevTools** - Debugging made easy

### Validation: **Zod**
**Why?**
- ✅ **TypeScript-First** - Type inference
- ✅ **Runtime Validation** - Catch errors early
- ✅ **Schema Composition** - Reusable schemas
- ✅ **Error Messages** - User-friendly validation errors
- ✅ **Small Bundle** - Lightweight library

---

## 🧩 System Components

### 1. **Client-Side Components**
```
Client Application
├── Layout Components
│   ├── Header (Logo, Search, Cart Badge, Auth)
│   ├── Footer (Links, Contact, Social)
│   └── Sidebar (Mobile Navigation)
├── Product Components
│   ├── ProductCard (Image, Price, Add to Cart)
│   ├── ProductGrid (Product Listing)
│   ├── ProductDetails (Full Product View)
│   ├── ProductFilters (Category, Price, Brand)
│   └── ProductSearch (Search Bar)
├── Cart Components
│   ├── CartDrawer (Side Panel)
│   ├── CartItem (Product in Cart)
│   └── CartSummary (Total, Checkout Button)
├── Checkout Components
│   ├── CheckoutForm (Customer Details)
│   ├── PaymentMethods (Mpesa)
│   └── OrderSummary (Review Order)
└── User Components
    ├── UserProfile (Account Details)
    └── OrderHistory (Past Orders)
```

### 2. **Admin-Side Components**
```
Admin Dashboard
├── Dashboard Components
│   ├── StatsCard (Revenue, Orders, Products)
│   ├── RevenueChart (Sales Over Time)
│   ├── RecentOrders (Latest Orders Table)
│   └── LowStockAlert (Products Low on Stock)
├── Product Management
│   ├── ProductList (All Products Table)
│   ├── ProductForm (Add/Edit Product)
│   ├── ImageUploader (Product Images)
│   └── StockManager (Inventory Control)
├── Order Management
│   ├── OrderList (All Orders)
│   ├── OrderDetails (Full Order View)
│   └── OrderStatus (Update Status)
├── Category Management
│   ├── CategoryList (All Categories)
│   └── CategoryForm (Add/Edit Category)
└── Settings
    ├── SiteSettings (Site Name, Logo)
    └── NotificationSettings (Email, SMS)
```

### 3. **API Routes Structure**
```
/api/
├── products/
│   ├── route.ts              # GET all, POST create
│   ├── [id]/route.ts         # GET, PUT, DELETE specific
│   └── search/route.ts       # Product search
├── categories/
│   ├── route.ts              # GET all, POST create
│   └── [id]/route.ts         # GET, PUT, DELETE specific
├── orders/
│   ├── route.ts              # GET all, POST create
│   ├── [id]/route.ts         # GET, PUT specific
│   └── [id]/cancel/route.ts  # Cancel order
├── cart/
│   └── route.ts              # Cart operations
├── mpesa/
│   ├── initiate/route.ts     # Initiate STK Push
│   └── callback/route.ts     # Payment callback
├── admin/
│   ├── stats/route.ts        # Dashboard statistics
│   └── settings/route.ts     # Site settings
└── notifications/
    ├── email/route.ts        # Send email
    └── sms/route.ts          # Send SMS
```

---

## 🔄 Data Flow Diagrams

### 1. **User Authentication Flow**
```
┌──────────┐
│  User    │
│  Visits  │
│  Site    │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│  Next.js Page   │
│  Checks Auth    │
└────┬─────┬──────┘
     │     │
     │     └──────────────────┐
     │                        │
     ▼                        ▼
┌────────────┐         ┌─────────────┐
│ Logged In  │         │ Not Logged  │
│ Continue   │         │ Redirect to │
│ to Page    │         │ Sign In     │
└────────────┘         └──────┬──────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Clerk Auth   │
                       │ Modal        │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ User Signs   │
                       │ In/Up        │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │ Redirect to  │
                       │ Original Page│
                       └──────────────┘
```

### 2. **Product Browsing Flow**
```
┌──────────┐
│ Homepage │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│ Category/Search │
└────┬─────┬──────┘
     │     │
     ▼     ▼
┌──────────────┐  ┌──────────────┐
│ Product Grid │  │ API: Fetch   │
│ (Client)     │◄─┤ Products     │
└──────┬───────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│ User Clicks  │
│ Product Card │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Product      │
│ Details Page │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Add to Cart  │
│ Button       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Cart Updated │
│ (Zustand)    │
└──────────────┘
```

### 3. **Checkout & Payment Flow**
```
┌──────────────┐
│ User Clicks  │
│ Checkout     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Checkout Page    │
│ - Customer Info  │
│ - Phone Number   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Submit Order     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ POST /api/orders │
│ Create Order     │
│ (Status: Pending)│
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ POST /api/mpesa/     │
│      initiate        │
│ - Generate Token     │
│ - Send STK Push      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User's Phone Rings   │
│ Enter Mpesa PIN      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Mpesa Callback       │
│ POST /api/mpesa/     │
│      callback        │
└──────┬───────────────┘
       │
       ├──── Success ────┐
       │                 │
       ▼                 ▼
┌────────────┐    ┌──────────────┐
│ Update     │    │ Send Email   │
│ Order      │    │ & SMS        │
│ Status:    │    │ Notification │
│ Paid       │    └──────────────┘
└────────────┘
       │
       ▼
┌────────────┐
│ Show       │
│ Success    │
│ Page       │
└────────────┘
```

### 4. **Admin Product Management Flow**
```
┌────────────────┐
│ Admin Logs In  │
│ (Clerk + Role) │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Admin          │
│ Dashboard      │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Products Page  │
└───────┬────────┘
        │
        ├──── View All Products ────┐
        │                           │
        ▼                           ▼
┌─────────────┐            ┌──────────────┐
│ Click       │            │ GET /api/    │
│ Add Product │            │ products     │
└─────┬───────┘            └──────────────┘
      │
      ▼
┌─────────────────┐
│ Product Form    │
│ - Name          │
│ - Price         │
│ - Stock         │
│ - Category      │
│ - Images        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Submit Form     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ POST /api/      │
│ products        │
│ (Create Product)│
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Show Success    │
│ Redirect to List│
└─────────────────┘
```

---

## 📁 Detailed Folder Structure

```
mombasa-shisha-bongs/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── public/
│   ├── images/
│   │   ├── products/              # Product images
│   │   ├── categories/            # Category images
│   │   └── logo/                  # Site logo
│   └── icons/                     # Favicon, etc.
├── src/
│   ├── app/
│   │   ├── (auth)/                # Auth routes group
│   │   │   ├── sign-in/
│   │   │   │   └── [[...sign-in]]/page.tsx
│   │   │   └── sign-up/
│   │   │       └── [[...sign-up]]/page.tsx
│   │   ├── (client)/              # Client routes group
│   │   │   ├── layout.tsx         # Client layout
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # All products
│   │   │   │   └── [id]/page.tsx  # Product details
│   │   │   ├── categories/
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx       # Order history
│   │   │       └── [id]/page.tsx  # Order details
│   │   ├── (admin)/               # Admin routes group
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx     # Admin layout
│   │   │   │   ├── page.tsx       # Dashboard
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx   # Products list
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/edit/page.tsx
│   │   │   │   ├── categories/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/edit/page.tsx
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── search/route.ts
│   │   │   ├── categories/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── [id]/cancel/route.ts
│   │   │   ├── mpesa/
│   │   │   │   ├── initiate/route.ts
│   │   │   │   └── callback/route.ts
│   │   │   ├── admin/
│   │   │   │   ├── stats/route.ts
│   │   │   │   └── settings/route.ts
│   │   │   └── notifications/
│   │   │       ├── email/route.ts
│   │   │       └── sms/route.ts
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Root page (redirects)
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── OrderTable.tsx
│   │   │   ├── CategoryTable.tsx
│   │   │   └── CategoryForm.tsx
│   │   ├── client/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── Table.tsx
│   │   └── providers/
│   │       ├── ClerkProvider.tsx
│   │       └── QueryProvider.tsx
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client
│   │   ├── mpesa.ts               # Mpesa integration
│   │   ├── email.ts               # Email service
│   │   ├── sms.ts                 # SMS service
│   │   └── utils.ts               # Utility functions
│   ├── store/
│   │   ├── cartStore.ts           # Cart state
│   │   └── uiStore.ts             # UI state
│   ├── types/
│   │   ├── index.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── category.ts
│   │   └── mpesa.ts
│   └── utils/
│       ├── validators.ts          # Zod schemas
│       ├── formatters.ts          # Format functions
│       └── constants.ts           # App constants
├── .env.local                     # Environment variables
├── .gitignore
├── next.config.ts
├── package.json
├── prisma.config.ts
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

---

## 👥 User Journeys

### **Customer Journey**

```
1. DISCOVERY
   └─> Homepage
       ├─> Featured Products
       ├─> Category Tiles
       └─> Search Bar

2. BROWSE
   └─> Category Page / Search Results
       ├─> Filter by Price, Brand
       ├─> Sort by Price, Name
       └─> View Product Cards

3. PRODUCT DETAILS
   └─> Product Page
       ├─> Images Gallery
       ├─> Description
       ├─> Price & Stock
       └─> Add to Cart Button

4. CART
   └─> Cart Drawer/Page
       ├─> View Items
       ├─> Update Quantity
       ├─> Remove Items
       └─> Proceed to Checkout

5. CHECKOUT
   └─> Checkout Page
       ├─> Enter Name, Phone, Address
       ├─> Review Order
       └─> Select Mpesa Payment

6. PAYMENT
   └─> Mpesa STK Push
       ├─> Receive Prompt on Phone
       ├─> Enter PIN
       └─> Payment Confirmed

7. CONFIRMATION
   └─> Order Success Page
       ├─> Order Number
       ├─> Email & SMS Notification
       └─> View Order Button

8. ORDER TRACKING
   └─> My Orders Page
       ├─> View Order History
       ├─> Check Order Status
       └─> View Order Details
```

### **Admin Journey**

```
1. LOGIN
   └─> Admin Login (Clerk)
       ├─> Email/Password
       └─> Role Check (Admin)

2. DASHBOARD
   └─> Admin Dashboard
       ├─> View Stats (Revenue, Orders, Products)
       ├─> Revenue Chart
       ├─> Recent Orders
       └─> Low Stock Alerts

3. PRODUCT MANAGEMENT
   └─> Products Page
       ├─> View All Products
       ├─> Search Products
       ├─> Add New Product
       │   ├─> Fill Form
       │   ├─> Upload Images
       │   └─> Save Product
       ├─> Edit Product
       └─> Delete Product

4. CATEGORY MANAGEMENT
   └─> Categories Page
       ├─> View All Categories
       ├─> Add Category
       ├─> Edit Category
       └─> Delete Category

5. ORDER MANAGEMENT
   └─> Orders Page
       ├─> View All Orders
       ├─> Filter by Status
       ├─> View Order Details
       ├─> Update Order Status
       │   ├─> Processing
       │   ├─> Shipped
       │   ├─> Delivered
       │   └─> Cancelled
       └─> Print Invoice

6. SETTINGS
   └─> Settings Page
       ├─> Site Settings
       ├─> Notification Settings
       └─> Admin Management
```

---

## 🛣️ Route Planning

### **Client Routes (Public)**
| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Featured products, categories |
| `/products` | All Products | Product grid with filters |
| `/products/[id]` | Product Details | Single product view |
| `/categories/[slug]` | Category Products | Products by category |
| `/cart` | Shopping Cart | Cart items |
| `/checkout` | Checkout | Order form & payment |
| `/orders` | Order History | User's past orders (auth) |
| `/orders/[id]` | Order Details | Single order view (auth) |
| `/sign-in` | Sign In | Login page |
| `/sign-up` | Sign Up | Registration page |

### **Admin Routes (Protected)**
| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Dashboard | Stats & overview |
| `/admin/products` | Products List | All products table |
| `/admin/products/new` | Add Product | Product creation form |
| `/admin/products/[id]/edit` | Edit Product | Product edit form |
| `/admin/categories` | Categories List | All categories |
| `/admin/categories/new` | Add Category | Category form |
| `/admin/categories/[id]/edit` | Edit Category | Category edit form |
| `/admin/orders` | Orders List | All orders |
| `/admin/orders/[id]` | Order Details | Single order view |
| `/admin/settings` | Settings | Site configuration |

### **API Routes**
| Route | Method | Description |
|-------|--------|-------------|
| `/api/products` | GET | Get all products |
| `/api/products` | POST | Create product (admin) |
| `/api/products/[id]` | GET | Get product by ID |
| `/api/products/[id]` | PUT | Update product (admin) |
| `/api/products/[id]` | DELETE | Delete product (admin) |
| `/api/products/search` | GET | Search products |
| `/api/categories` | GET | Get all categories |
| `/api/categories` | POST | Create category (admin) |
| `/api/categories/[id]` | GET | Get category |
| `/api/categories/[id]` | PUT | Update category (admin) |
| `/api/categories/[id]` | DELETE | Delete category (admin) |
| `/api/orders` | GET | Get orders (user/admin) |
| `/api/orders` | POST | Create order |
| `/api/orders/[id]` | GET | Get order details |
| `/api/orders/[id]` | PUT | Update order (admin) |
| `/api/orders/[id]/cancel` | POST | Cancel order |
| `/api/mpesa/initiate` | POST | Initiate STK Push |
| `/api/mpesa/callback` | POST | Handle Mpesa callback |
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/notifications/email` | POST | Send email |
| `/api/notifications/sms` | POST | Send SMS |

---

## 🔐 Security Architecture

### **Authentication Layers**
```
1. Route Protection
   ├─> Clerk Middleware
   │   ├─> Check if logged in
   │   └─> Check user role
   │
   ├─> Public Routes: /, /products, /products/[id]
   ├─> Auth Routes: /orders, /checkout
   └─> Admin Routes: /admin/*

2. API Protection
   ├─> Check Clerk Session Token
   ├─> Validate User Role
   └─> Rate Limiting

3. Data Validation
   ├─> Zod Schemas
   ├─> Input Sanitization
   └─> SQL Injection Prevention (Prisma)
```

---

## 🎨 Component Hierarchy

```
App
├── ClerkProvider
│   ├── QueryClientProvider
│   │   ├── Toaster (react-hot-toast)
│   │   └── RootLayout
│   │       ├── ClientLayout
│   │       │   ├── Header
│   │       │   │   ├── Logo
│   │       │   │   ├── SearchBar
│   │       │   │   ├── CartBadge
│   │       │   │   └── UserButton (Clerk)
│   │       │   ├── Main Content
│   │       │   │   ├── HomePage
│   │       │   │   │   ├── Hero
│   │       │   │   │   ├── CategoryTiles
│   │       │   │   │   └── ProductGrid
│   │       │   │   ├── ProductPage
│   │       │   │   │   ├── ProductFilters
│   │       │   │   │   └── ProductGrid
│   │       │   │   │       └── ProductCard
│   │       │   │   ├── ProductDetailsPage
│   │       │   │   │   ├── ImageGallery
│   │       │   │   │   ├── ProductInfo
│   │       │   │   │   └── AddToCartButton
│   │       │   │   ├── CartPage
│   │       │   │   │   ├── CartItem
│   │       │   │   │   └── CartSummary
│   │       │   │   └── CheckoutPage
│   │       │   │       ├── CheckoutForm
│   │       │   │       └── OrderSummary
│   │       │   ├── CartDrawer
│   │       │   └── Footer
│   │       │
│   │       └── AdminLayout
│   │           ├── AdminSidebar
│   │           ├── AdminHeader
│   │           └── Main Content
│   │               ├── Dashboard
│   │               │   ├── StatsCard
│   │               │   ├── RevenueChart
│   │               │   └── RecentOrders
│   │               ├── ProductsPage
│   │               │   ├── ProductTable
│   │               │   └── ProductForm
│   │               ├── CategoriesPage
│   │               │   ├── CategoryTable
│   │               │   └── CategoryForm
│   │               └── OrdersPage
│   │                   └── OrderTable
```

---

## 📊 Database Entity Relationships (Preview)

```
┌─────────────┐         ┌──────────────┐
│   User      │         │   Category   │
│  (Clerk)    │         │              │
└──────┬──────┘         └──────┬───────┘
       │                       │
       │ 1:N                   │ 1:N
       │                       │
       ▼                       ▼
┌─────────────┐         ┌──────────────┐
│   Order     │    N:N  │   Product    │
│             │◄────────►│              │
└──────┬──────┘         └──────┬───────┘
       │                       │
       │ 1:N                   │ 1:N
       │                       │
       ▼                       ▼
┌─────────────┐         ┌──────────────┐
│ OrderItem   │         │ ProductImage │
│             │         │              │
└─────────────┘         └──────────────┘
       │
       │ 1:1
       ▼
┌─────────────┐
│  Payment    │
│  (Mpesa)    │
└─────────────┘
```

---

## 🚀 Performance Optimizations

1. **Static Site Generation (SSG)**
   - Product pages cached at build time
   - Category pages pre-rendered

2. **Incremental Static Regeneration (ISR)**
   - Update product pages every 60 seconds
   - Fresh data without full rebuild

3. **Image Optimization**
   - Next.js Image component
   - WebP format
   - Lazy loading

4. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based code splitting

5. **Caching Strategy**
   - React Query cache
   - Browser cache headers
   - CDN caching (Vercel Edge)

6. **Database Optimization**
   - Prisma query optimization
   - Indexes on frequently queried fields
   - Connection pooling

---

## 📱 Responsive Design Strategy

```
Mobile First Approach:
- Base styles for mobile (320px+)
- Tablet breakpoint (768px+)
- Desktop breakpoint (1024px+)
- Large desktop (1440px+)

Key Responsive Components:
├── Navigation (Hamburger on mobile)
├── Product Grid (1 col → 2 col → 3 col → 4 col)
├── Admin Tables (Horizontal scroll on mobile)
└── Forms (Stack on mobile, side-by-side on desktop)
```

---

## ✅ Architecture Summary

| Aspect | Decision | Justification |
|--------|----------|---------------|
| **Framework** | Next.js 16 | SSR, SSG, API routes, SEO |
| **UI** | React 19 | Component-based, large ecosystem |
| **Styling** | TailwindCSS 4 | Rapid development, small bundle |
| **Auth** | Clerk | Production-ready, RBAC |
| **Database** | MySQL + Prisma | Relational data, type-safe |
| **Payments** | Mpesa STK Push | Local payment method |
| **State** | Zustand | Lightweight, simple |
| **Data Fetching** | TanStack Query | Caching, loading states |
| **Validation** | Zod | Type-safe, runtime validation |

---

## 🎯 Next Steps

**Type "NEXT" to proceed to:**

**STEP 2 — UI/UX MOCKUPS**

This will include:
- Full UI wireframes (text-based)
- Client-side pages mockups
- Admin dashboard mockups
- Checkout flow wireframe
- Mobile responsive designs
- Color scheme and typography
- Component designs


