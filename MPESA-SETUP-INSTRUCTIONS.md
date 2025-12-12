# Mpesa API Setup Instructions

## 🚀 Quick Start

### Step 1: Get Your Mpesa Credentials

1. **Visit Mpesa Developer Portal:**
   - Go to: https://developer.safaricom.co.ke/
   - Sign up or log in

2. **Create a Sandbox App:**
   - Navigate to "My Apps"
   - Click "Create App"
   - Choose "Sandbox" environment
   - Fill in app details

3. **Copy Your Credentials:**
   After creating the app, you'll see:
   - **Consumer Key** (long string)
   - **Consumer Secret** (long string)
   - **Passkey** (long string)
   - **Shortcode** (usually `174379` for sandbox)

### Step 2: Update Your `.env.local` File

Open `.env.local` and replace the placeholder values:

```env
# Mpesa Daraja API Configuration
MPESA_CONSUMER_KEY=paste_your_consumer_key_here
MPESA_CONSUMER_SECRET=paste_your_consumer_secret_here
MPESA_PASSKEY=paste_your_passkey_here
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=http://localhost:3000/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

**Important:** Replace `paste_your_consumer_key_here` etc. with your actual credentials!

### Step 3: Expose Localhost for Callbacks

Mpesa needs to send callbacks to your server. For local development:

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from: https://ngrok.com/download
   ```

2. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

3. **In a new terminal, expose port 3000:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Update `.env.local`:**
   ```env
   MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
   ```

6. **Restart your Next.js server** to load the new environment variable

### Step 4: Test the Connection

Run the test script to verify your setup:

```bash
npx tsx scripts/test-mpesa-connection.ts
```

You should see:
```
✅ Success! Access token generated
```

### Step 5: Test Payment Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Create a test order:**
   - Go to http://localhost:3000
   - Add products to cart
   - Proceed to checkout
   - Fill in delivery information
   - Use test phone: `254708374149`

3. **Initiate payment:**
   - Click "Pay with Mpesa"
   - Enter phone number: `254708374149`
   - Click "Pay"

4. **Check results:**
   - Check terminal for API responses
   - Check database for payment record
   - Verify order status updated

---

## 📋 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MPESA_CONSUMER_KEY` | Your app's consumer key | `abc123...` |
| `MPESA_CONSUMER_SECRET` | Your app's consumer secret | `xyz789...` |
| `MPESA_PASSKEY` | Your app's passkey | `bfb279f9...` |
| `MPESA_SHORTCODE` | Business shortcode | `174379` (sandbox) |
| `MPESA_CALLBACK_URL` | URL for payment callbacks | `https://your-url.com/api/mpesa/callback` |
| `MPESA_ENVIRONMENT` | Environment type | `sandbox` or `production` |

---

## 🔧 Troubleshooting

### "Failed to get access token"
- ✅ Check your consumer key and secret are correct
- ✅ Verify no extra spaces in `.env.local`
- ✅ Restart your server after updating `.env.local`

### "STK Push failed"
- ✅ Verify shortcode matches your app
- ✅ Check passkey is correct
- ✅ Ensure phone number is in format: `254XXXXXXXXX`

### "Callback not received"
- ✅ Make sure ngrok is running
- ✅ Update `MPESA_CALLBACK_URL` with ngrok URL
- ✅ Restart Next.js server after updating URL

### "Payment status stuck on PROCESSING"
- ✅ Check callback endpoint is accessible
- ✅ Verify database connection
- ✅ Check server logs for errors

---

## 📚 Additional Resources

- **Detailed Guide:** See `MPESA-SETUP-GUIDE.md` for comprehensive instructions
- **Quick Checklist:** See `QUICK-MPESA-SETUP.md` for a step-by-step checklist
- **Mpesa Documentation:** https://developer.safaricom.co.ke/docs
- **Sandbox Testing:** https://developer.safaricom.co.ke/docs#sandbox

---

## 🎯 Next Steps After Setup

1. ✅ Test with sandbox credentials
2. ✅ Verify payment flow works end-to-end
3. ✅ Test callback handling
4. ⏭️ Complete production onboarding (when ready)
5. ⏭️ Get production credentials
6. ⏭️ Deploy to production

---

**Need Help?** Check the troubleshooting section or refer to the detailed guides.

