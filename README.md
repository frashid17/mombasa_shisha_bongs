# 🌊 Mombasa Shisha Bongs - E-Commerce Platform

A full-stack TypeScript e-commerce system for selling shisha items, vapes, and accessories with integrated Mpesa payments.

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS 4
- **Authentication**: Clerk
- **Database**: Neon PostgreSQL + Prisma ORM
- **Payments**: Mpesa Daraja STK Push
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Notifications**: Email + SMS/WhatsApp
- **Deployment**: Vercel (Frontend) + Railway/Supabase (Database)

## 📋 Prerequisites

- Node.js v18.17 or higher
- Neon PostgreSQL account (free tier available)
- npm or yarn
- Git

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd mombasa-shisha-bongs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Mpesa if using mpesa daraja api
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox

# Email
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM=noreply@mombasashishabongs.com

# SMS/WhatsApp
SMS_API_KEY=your_sms_api_key
SMS_USERNAME=your_sms_username

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
ADMIN_EMAIL=admin@mombasashishabongs.com
```

### 4. Set up the database

1. **Create a Neon account**: https://neon.tech
2. **Create a new project** in Neon dashboard
3. **Copy the connection string** from Neon dashboard
4. **Add it to `.env.local`** as `DATABASE_URL`
5. **Run Prisma migrations**:
npx prisma migrate dev
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
mombasa-shisha-bongs/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                     # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (admin)/          # Admin dashboard routes
│   │   ├── (client)/         # Client-facing routes
│   │   ├── api/              # API routes
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/            # React components
│   │   ├── admin/            # Admin components
│   │   ├── client/           # Client components
│   │   └── ui/               # Shared UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Library configurations
│   ├── store/                # Zustand state management
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── .env.local                # Environment variables (not committed)
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔑 Features

### Client Side
- 🏠 Homepage with featured products
- 🔍 Product search and filtering
- 📦 Product categories (Shisha, Vapes, Accessories)
- 🛒 Shopping cart
- 💳 Mpesa STK Push checkout
- 📱 Responsive design
- 🔔 Order notifications

### Admin Side
- 🔐 Role-based authentication with Clerk
- 📊 Dashboard with analytics
- ➕ Product management (CRUD)
- 📂 Category management
- 📋 Order management
- 📦 Stock control
- ⚙️ Settings

## 🚀 Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

### Railway/Supabase (Database)
1. Create MySQL database
2. Copy connection string
3. Update DATABASE_URL in Vercel
4. Run migrations

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Contact

For questions or support, contact: admin@mombasashishabongs.com
