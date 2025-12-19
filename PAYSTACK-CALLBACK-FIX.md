# Fix Paystack Callback URL Issue

## Problem
Paystack is redirecting to an old ngrok URL instead of your production domain.

## Solution

### Option 1: Remove Callback URL from Paystack Dashboard (Recommended)

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Find the **Callback URL** field
4. **Clear/Delete** the callback URL field (leave it empty)
5. Save changes

This allows the callback URL sent in each API request to be used instead of a hardcoded dashboard setting.

### Option 2: Update Callback URL in Paystack Dashboard

If you prefer to set a default callback URL:

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Set **Callback URL** to: `https://mombasashishabongs.com/api/paystack/callback`
   - Or use your Vercel domain: `https://mombasa-shisha-bongs.vercel.app/api/paystack/callback`
4. Save changes

### Verify Environment Variable

Make sure `NEXT_PUBLIC_APP_URL` is set in Vercel:

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://mombasashishabongs.com` (or your production domain)
   - **Environment:** Production, Preview, Development
4. Redeploy after adding the variable

## How It Works

The code now:
1. First checks `NEXT_PUBLIC_APP_URL` environment variable
2. Falls back to request headers (Vercel provides these automatically)
3. Uses the determined origin to build the callback URL: `${origin}/api/paystack/callback`

The callback URL is logged in the console for debugging.

