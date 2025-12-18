# 🚀 Production Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Database Migration
**CRITICAL**: Run database migration before deploying:

```bash
npx prisma db push
npx prisma generate
```

This will create all the new tables for:
- Stock notifications
- Recently viewed products
- Saved searches
- Delivery addresses
- Saved cart items
- Abandoned carts
- Flash sales
- Wishlist shares

### 2. Environment Variables

Make sure all these are set in your Vercel project:

#### Required Variables:
```
# Database
DATABASE_URL=postgresql://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Email (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Paystack
PAYSTACK_SECRET_KEY=sk_...
PAYSTACK_PUBLIC_KEY=pk_...
PAYSTACK_WEBHOOK_SECRET=whsec_...

# Admin (set in Clerk publicMetadata)
# Make sure your admin user has: { "role": "admin" }
```

### 3. Build Verification
✅ Build completed successfully - All TypeScript errors fixed

## 📦 Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next` (default)
4. Add all environment variables
5. Deploy!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## 🔧 Post-Deployment Steps

### 1. Database Migration on Production
After deployment, run migrations on production database:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migration
npx prisma db push
npx prisma generate
```

Or use Vercel's environment variables and run via Vercel CLI:
```bash
vercel env pull .env.production
npx prisma db push
```

### 2. Verify Environment Variables
Check that all environment variables are set in Vercel:
- Go to Project Settings → Environment Variables
- Verify all required variables are present

### 3. Test Critical Features
- [ ] User authentication (sign in/up)
- [ ] Product browsing
- [ ] Add to cart
- [ ] Checkout process
- [ ] Payment processing (Paystack)
- [ ] Admin dashboard access
- [ ] Email notifications

### 4. Set Up Webhooks

#### Paystack Webhook:
1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/paystack/webhook`
3. Copy the webhook secret and add to `PAYSTACK_WEBHOOK_SECRET`

### 5. Configure Domain (if you have one)
1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## 🎯 New Features in Production

### ✅ Fully Working:
1. **Frequently Bought Together** - Shows on product pages
2. **Stock Notifications** - "Notify Me" button on out-of-stock products
3. **Recently Viewed** - "Continue Browsing" section on homepage
4. **Social Sharing** - Share buttons on product pages

### ⚠️ Requires Database Migration:
All other features need the database migration to work:
- Saved searches
- Multiple delivery addresses
- Flash sales
- Abandoned cart recovery
- etc.

## 🔍 Monitoring & Debugging

### Check Build Logs:
- Vercel Dashboard → Deployments → Click on deployment → View Build Logs

### Check Runtime Logs:
- Vercel Dashboard → Deployments → Functions → View Logs

### Database Connection:
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection status
- Test queries in Prisma Studio: `npx prisma studio`

## 🚨 Common Issues

### Issue: Build fails with Prisma errors
**Solution**: Make sure `DATABASE_URL` is set in Vercel environment variables

### Issue: Database connection errors
**Solution**: 
- Check Neon database is running
- Verify connection string format
- Check IP whitelist in Neon (if enabled)

### Issue: Environment variables not working
**Solution**:
- Restart deployment after adding variables
- Check variable names match exactly
- Verify no typos in values

### Issue: Admin access not working
**Solution**:
- Set `role: "admin"` in Clerk publicMetadata for your user
- Go to Clerk Dashboard → Users → Your User → Metadata → Public

## 📊 Performance Tips

1. **Enable Vercel Analytics** (optional):
   - Project Settings → Analytics
   - Enable Web Analytics

2. **Image Optimization**:
   - Already configured with Next.js Image component
   - External images use `unoptimized` prop

3. **Database Indexing**:
   - Already configured in Prisma schema
   - Monitor slow queries in Neon dashboard

## 🎉 Success!

Once deployed, your site will be live at:
- Production: `https://your-project.vercel.app`
- Custom domain: `https://your-domain.com` (if configured)

## 📝 Next Steps After Deployment

1. Test all features thoroughly
2. Monitor error logs for first 24 hours
3. Set up monitoring/alerts (optional)
4. Configure backup strategy for database
5. Set up staging environment (optional)

---

**Need Help?**
- Check Vercel documentation: https://vercel.com/docs
- Check Prisma documentation: https://www.prisma.io/docs
- Check Next.js documentation: https://nextjs.org/docs

