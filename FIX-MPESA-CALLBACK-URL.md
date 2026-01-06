# Fix M-Pesa Callback URL Error

## The Problem
You're getting: "Mpesa configuration is incomplete. Please check your environment variables."

This is because `MPESA_CALLBACK_URL` is commented out or missing in your `.env.local` file.

## Solution

### For Local Development (Using ngrok):

1. **Install ngrok** (if not already installed):
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from: https://ngrok.com/download
   ```

2. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** from ngrok (e.g., `https://abc123.ngrok.io`)

5. **Update your `.env.local` file:**
   ```env
   MPESA_CONSUMER_KEY=9DY8aKGLgIKFuf6cNrldJg70G1pPlomUSyCuc2Ck1aAXAkVe
   MPESA_CONSUMER_SECRET=KdGhYSoiOXU6Nt6fK0yeTuNyt8PtpJHJzyWZDfTLFQgAGlgyVDRGyGwE5v6vGJXg
   MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
   MPESA_SHORTCODE=174379
   MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
   MPESA_ENVIRONMENT=sandbox
   ```

   **Important:** Replace `https://abc123.ngrok.io` with your actual ngrok URL!

6. **Restart your Next.js server** after updating `.env.local`

### For Production:

```env
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

## Required Environment Variables Checklist

Make sure ALL of these are set (not commented out) in `.env.local`:

- ✅ `MPESA_CONSUMER_KEY` - Your consumer key
- ✅ `MPESA_CONSUMER_SECRET` - Your consumer secret  
- ✅ `MPESA_PASSKEY` - The sandbox passkey
- ✅ `MPESA_SHORTCODE` - `174379` for sandbox
- ✅ `MPESA_CALLBACK_URL` - **This is the one that's missing!**
- ✅ `MPESA_ENVIRONMENT` - `sandbox` for testing

## Quick Fix

Uncomment the `MPESA_CALLBACK_URL` line in your `.env.local` and set it to your ngrok URL:

```env
# Change this:
# MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback

# To this (with your actual ngrok URL):
MPESA_CALLBACK_URL=https://your-actual-ngrok-url.ngrok.io/api/mpesa/callback
```

## After Fixing

1. Make sure ngrok is running (`ngrok http 3000`)
2. Update `.env.local` with the ngrok URL
3. Restart your Next.js server
4. Try the payment again

The callback URL must be:
- ✅ Publicly accessible (not localhost)
- ✅ Using HTTPS (required by M-Pesa)
- ✅ Pointing to `/api/mpesa/callback` endpoint

