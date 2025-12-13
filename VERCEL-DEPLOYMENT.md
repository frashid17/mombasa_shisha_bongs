# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com (free tier available)
2. **GitHub Repository**: Your code should be pushed to GitHub (already done ✅)
3. **Database**: You'll need a Neon PostgreSQL database (free tier available at https://neon.tech)

## Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

## Step 3: Deploy to Vercel

### Option A: Deploy via CLI (Recommended for first time)

```bash
# From your project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No (first time)
# - Project name? mombasa-shisha-bongs (or your choice)
# - Directory? ./
# - Override settings? No
```

### Option B: Deploy via Vercel Dashboard (Easier)

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `frashid17/mombasa_shisha_bongs`
4. Vercel will auto-detect Next.js settings
5. **Don't deploy yet** - we need to set environment variables first!

## Step 4: Set Environment Variables

### Option A: Import via Vercel CLI (Easiest)

If you have a `.env.local` file locally:

```bash
# 1. Login and link project
vercel login
vercel link

# 2. Pull existing vars (creates .env.local if needed)
vercel env pull .env.local

# 3. Add missing variables one by one
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
# ... etc (it will prompt for values)
```

### Option B: Import via Vercel Dashboard (Recommended)

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **"Add"** for each variable
4. Or use the **"Import"** button if available (some plans)

### Option C: Manual Entry (Most Secure)

Go to your project settings in Vercel Dashboard → **Settings** → **Environment Variables**

Add these variables one by one:

### Required Environment Variables

```env
# Database (Neon PostgreSQL - use pooled connection for production)
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Gmail SMTP (for email notifications)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=whsec_...

# App URL (will be your Vercel URL initially)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Node Environment
NODE_ENV=production
```

### Important Notes:

1. **DATABASE_URL**: Use your Neon PostgreSQL connection string
   - Get it from: https://console.neon.tech
   - **For production**: Use pooled connection (`?pgbouncer=true`)
   - **For migrations**: Use direct connection (no `pgbouncer`)
   - Format: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`

2. **NEXT_PUBLIC_APP_URL**: 
   - Initially: `https://your-app.vercel.app`
   - After custom domain: `https://yourdomain.com`

3. **Paystack Webhook URL**:
   - Set in Paystack Dashboard: `https://your-app.vercel.app/api/paystack/webhook`

## Step 5: Configure Build Settings

Vercel should auto-detect Next.js, but verify in **Settings** → **General**:

- **Framework Preset**: Next.js
- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Step 6: Run Database Migrations

After first deployment, you need to run migrations:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Option 2: Via your local machine (with production DATABASE_URL)
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

## Step 7: Deploy!

### Via Dashboard:
Click **"Deploy"** button

### Via CLI:
```bash
vercel --prod
```

## Step 8: Post-Deployment Checklist

- [ ] Verify site is accessible
- [ ] Test authentication (sign in/sign up)
- [ ] Test product browsing
- [ ] Test checkout process
- [ ] Test admin dashboard access
- [ ] Verify email notifications work
- [ ] Test Paystack payments
- [ ] Update Paystack webhook URL to production URL

## Step 9: Custom Domain (Later)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Update Paystack webhook URL

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure all environment variables are set
- Verify `prisma generate` runs in build command

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Ensure database is accessible (not localhost)

### Environment Variables Not Working
- Make sure variables are set for **Production** environment
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

## Quick Deploy Command

```bash
# One-time setup
vercel login
vercel

# Production deploy
vercel --prod
```

---

**Need Help?** Check Vercel docs: https://vercel.com/docs

