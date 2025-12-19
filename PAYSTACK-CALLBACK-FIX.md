# Fix Paystack Callback URL Issue

## Problem
Paystack is redirecting to an old ngrok URL instead of your production domain. This prevents payment status from updating to PAID.

## ⚠️ CRITICAL: Remove Callback URL from Paystack Dashboard

**This is the most important step!** Paystack dashboard settings override the callback URL sent in API requests.

### Step 1: Clear Callback URL in Paystack Dashboard

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Find the **Callback URL** field
4. **DELETE/CLEAR** the callback URL field completely (leave it empty)
5. **Save changes**
6. **Wait 1-2 minutes** for changes to propagate

**Why this is important:** If there's a callback URL in the dashboard, Paystack will ALWAYS use that instead of the one sent in the API request.

### Step 2: Verify Environment Variable

Make sure `NEXT_PUBLIC_APP_URL` is set in Vercel:

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://mombasashishabongs.com` (your production domain)
   - **Environment:** Production, Preview, Development
4. **Redeploy** after adding/updating the variable

### Step 3: Test Payment Flow

1. Create a test order
2. Complete payment on Paystack
3. You should be redirected to: `https://mombasashishabongs.com/orders/[orderId]?payment=success`
4. Payment status should update to PAID
5. Cart should be cleared automatically

## How It Works

The code:
1. First checks `NEXT_PUBLIC_APP_URL` environment variable
2. Falls back to request headers (Vercel provides these automatically)
3. Uses the determined origin to build the callback URL: `${origin}/api/paystack/callback`
4. Logs the callback URL being used for debugging

## Troubleshooting

### Still redirecting to ngrok?

1. **Double-check Paystack dashboard** - The callback URL field must be completely empty
2. **Check Vercel logs** - Look for "Paystack Callback URL Configuration" log message
3. **Verify environment variable** - Make sure `NEXT_PUBLIC_APP_URL` is set correctly
4. **Clear browser cache** - Old redirects might be cached
5. **Wait a few minutes** - Paystack changes can take 1-2 minutes to propagate

### Payment stays as PROCESSING?

- The webhook should still update payment status to PAID
- Check Paystack webhook settings: `https://mombasashishabongs.com/api/paystack/webhook`
- Cart will be cleared when order is created (items are committed to order)

