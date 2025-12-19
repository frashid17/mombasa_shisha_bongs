# 🔧 Clerk Custom Domain Setup - mombasashishabongs.com

## Issue
Sign-in page is stuck/not working on live domain `mombasashishabongs.com` even though DNS is configured and Clerk is set to live mode.

## ✅ Solution Steps

### Step 1: Configure Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Settings** → **Domains**
4. Add your custom domain:
   - **Domain**: `mombasashishabongs.com`
   - **Frontend API**: Leave default or set to `clerk.mombasashishabongs.com` (if using subdomain)
5. Save the domain

### Step 2: Update Allowed Origins in Clerk

1. In Clerk Dashboard, go to **Settings** → **Paths**
2. Under **Allowed Origins**, add:
   - `https://mombasashishabongs.com`
   - `https://www.mombasashishabongs.com` (if using www)
3. Save changes

### Step 3: Update Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

**Update these variables:**

1. **NEXT_PUBLIC_APP_URL**
   ```
   Value: https://mombasashishabongs.com
   ```
   Make sure this is set for **Production** environment

2. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
   ```
   Value: pk_live_... (your LIVE key, not test key)
   ```
   Make sure you're using **LIVE** keys, not test keys

3. **CLERK_SECRET_KEY**
   ```
   Value: sk_live_... (your LIVE secret, not test secret)
   ```
   Make sure you're using **LIVE** keys, not test keys

4. **NEXT_PUBLIC_CLERK_SIGN_IN_URL**
   ```
   Value: /sign-in
   ```

5. **NEXT_PUBLIC_CLERK_SIGN_UP_URL**
   ```
   Value: /sign-up
   ```

6. **NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL**
   ```
   Value: /
   ```

7. **NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL**
   ```
   Value: /
   ```

### Step 4: Verify Clerk Keys are LIVE

⚠️ **CRITICAL**: Make sure you're using **LIVE** keys, not test keys!

1. Go to Clerk Dashboard → **API Keys**
2. Make sure you're viewing **Production** keys (not Development)
3. Copy the **Publishable Key** (starts with `pk_live_`)
4. Copy the **Secret Key** (starts with `sk_live_`)
5. Update in Vercel environment variables

### Step 5: Redeploy on Vercel

After updating environment variables:

1. Go to Vercel Dashboard → **Deployments**
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

### Step 6: Test

1. Visit `https://mombasashishabongs.com/sign-in`
2. The Clerk sign-in form should appear
3. Try signing in with a test account

## 🔍 Troubleshooting

### If sign-in still doesn't work:

1. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for Clerk-related errors
   - Common errors:
     - "Clerk: Invalid publishable key" → Keys not set correctly
     - "Clerk: Origin not allowed" → Domain not added to Clerk allowed origins
     - CORS errors → Domain not configured in Clerk

2. **Verify Environment Variables**:
   - Go to Vercel → Settings → Environment Variables
   - Make sure all Clerk variables are set for **Production**
   - Make sure `NEXT_PUBLIC_APP_URL` is `https://mombasashishabongs.com`

3. **Check Clerk Dashboard**:
   - Verify domain is added in Settings → Domains
   - Verify allowed origins include `https://mombasashishabongs.com`
   - Verify you're using LIVE keys (not test keys)

4. **Clear Browser Cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

## 📝 Quick Checklist

- [ ] Domain added in Clerk Dashboard → Settings → Domains
- [ ] Allowed origins include `https://mombasashishabongs.com` in Clerk
- [ ] Using LIVE Clerk keys (pk_live_ and sk_live_)
- [ ] NEXT_PUBLIC_APP_URL set to `https://mombasashishabongs.com` in Vercel
- [ ] All Clerk environment variables set in Vercel for Production
- [ ] Vercel deployment redeployed after environment variable changes
- [ ] Browser cache cleared

## 🚨 Common Mistakes

1. **Using Test Keys in Production**: Make sure you're using `pk_live_` and `sk_live_`, not `pk_test_` and `sk_test_`
2. **Wrong Domain Format**: Use `https://mombasashishabongs.com` (with https, no trailing slash)
3. **Environment Variables Not Set for Production**: Make sure variables are set for Production environment in Vercel
4. **Not Redeploying**: After changing environment variables, you must redeploy

