# 🔧 Fix: Paystack Callback URL Redirecting to Localhost

## ❌ Problem

After payment to Paystack, users were being redirected to `localhost:3000/api/paystack/callback` instead of the production URL.

## 🔍 Root Cause

The callback URL was hardcoded to use `NEXT_PUBLIC_APP_URL` environment variable, which:
- Wasn't set in Vercel environment variables
- Defaulted to `http://localhost:3000` when not set
- Didn't dynamically use the actual request origin

## ✅ Solution

Updated the code to:
1. **Dynamically detect the request origin** from the API route
2. **Use the origin** to build the callback URL automatically
3. **Fallback gracefully** to `NEXT_PUBLIC_APP_URL` or localhost (dev only)

### Changes Made

#### 1. Updated `src/lib/paystack.ts`

- Added optional `callbackUrl` parameter to `initializePaystackPayment()`
- Improved callback URL resolution logic
- Removes trailing slashes to prevent double slashes

#### 2. Updated `src/app/api/paystack/initiate/route.ts`

- Extracts origin from request headers (`origin` or `host` + `x-forwarded-proto`)
- Passes origin to `initializePaystackPayment()` as callback URL
- Logs the callback URL being used for debugging

## 📋 How It Works Now

### Priority Order for Callback URL:

1. **Request Origin** (from API route headers) - ✅ **Used in production**
2. **NEXT_PUBLIC_APP_URL** (environment variable) - Fallback
3. **localhost:3000** - Development fallback only

### Example:

```typescript
// Production (Vercel)
Request origin: https://your-app.vercel.app
Callback URL: https://your-app.vercel.app/api/paystack/callback ✅

// Development
Request origin: http://localhost:3000
Callback URL: http://localhost:3000/api/paystack/callback ✅
```

## 🚀 Deployment

1. **Commit changes:**
   ```bash
   git add src/lib/paystack.ts src/app/api/paystack/initiate/route.ts
   git commit -m "Fix: Use dynamic callback URL for Paystack payments"
   git push
   ```

2. **Vercel will auto-deploy** - the callback URL will now work correctly!

## ✅ Optional: Set NEXT_PUBLIC_APP_URL in Vercel

While the fix works without it, you can still set `NEXT_PUBLIC_APP_URL` in Vercel as a fallback:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://your-app.vercel.app` (or your custom domain)
   - **Environment**: Production, Preview, Development
3. **Redeploy** (or wait for auto-deploy)

## 🧪 Testing

After deployment:

1. **Create a test order**
2. **Initiate Paystack payment**
3. **Complete payment on Paystack**
4. **Verify redirect** - should go to:
   - ✅ `https://your-app.vercel.app/api/paystack/callback?reference=...`
   - ❌ NOT `localhost:3000/api/paystack/callback`

## 📝 Notes

- **Dynamic detection** works automatically - no configuration needed
- **Works with custom domains** - automatically uses the correct domain
- **Works in development** - still uses localhost correctly
- **Backward compatible** - still respects `NEXT_PUBLIC_APP_URL` if set

---

**Status**: ✅ Fixed - Ready to deploy!

