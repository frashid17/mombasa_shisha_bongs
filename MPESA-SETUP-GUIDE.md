# Mpesa Daraja API Setup Guide

This guide will help you set up Mpesa Daraja API credentials for both sandbox (testing) and production environments.

---

## Step 1: Create Mpesa Daraja Account

### For Sandbox (Testing):

1. **Visit Mpesa Developer Portal:**
   - Go to: https://developer.safaricom.co.ke/
   - Click "Get Started" or "Sign Up"

2. **Create Account:**
   - Fill in your details
   - Verify your email
   - Complete the registration

3. **Create an App:**
   - Log in to the developer portal
   - Navigate to "My Apps"
   - Click "Create App"
   - Fill in app details:
     - **App Name:** Mombasa Shisha Bongs (or your preferred name)
     - **Short Description:** E-commerce payment integration
     - **Environment:** Sandbox (for testing)

4. **Get Your Credentials:**
   After creating the app, you'll receive:
   - **Consumer Key** (e.g., `abc123...`)
   - **Consumer Secret** (e.g., `xyz789...`)
   - **Passkey** (e.g., `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`)
   - **Shortcode** (e.g., `174379` for sandbox)

---

## Step 2: Configure Environment Variables

### Update `.env.local`:

Open your `.env.local` file and add/update the Mpesa configuration:

```env
# Mpesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_PASSKEY=your_passkey_here
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=http://localhost:3000/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

**Important Notes:**
- Replace `your_consumer_key_here`, `your_consumer_secret_here`, and `your_passkey_here` with your actual credentials
- For sandbox, the shortcode is usually `174379`
- For local testing, you'll need to expose your localhost (see Step 3)

---

## Step 3: Expose Localhost for Callback (Sandbox Testing)

Mpesa needs to send callbacks to your server. For local development, you need to expose your localhost.

### Option A: Using ngrok (Recommended)

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

3. **In a new terminal, expose port 3000:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL:**
   - You'll see something like: `https://abc123.ngrok.io`
   - Copy this URL

5. **Update `.env.local`:**
   ```env
   MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
   ```

6. **Restart your Next.js server** to load the new environment variable

### Option B: Using Cloudflare Tunnel

```bash
# Install cloudflared
brew install cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:3000
```

### Option C: Using localtunnel

```bash
# Install
npm install -g localtunnel

# Expose port
lt --port 3000
```

---

## Step 4: Test Sandbox Integration

### 1. Test Phone Numbers

Mpesa provides test phone numbers for sandbox testing. Common test numbers:
- `254708374149` (Test number 1)
- `254712345678` (Test number 2)

**Note:** These are virtual numbers. You won't receive actual STK Push notifications, but you can simulate the flow.

### 2. Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Create a test order:**
   - Go to your website
   - Add products to cart
   - Proceed to checkout
   - Fill in delivery information
   - Use a test phone number (e.g., `254708374149`)

3. **Initiate Payment:**
   - Click "Pay with Mpesa"
   - Enter the test phone number
   - Click "Pay"

4. **Check Logs:**
   - Check your terminal for API responses
   - Check browser console for errors
   - Verify the payment record in database

### 3. Simulate Callback (For Testing)

Since sandbox doesn't send real callbacks, you can manually test the callback endpoint:

```bash
curl -X POST http://localhost:3000/api/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "29115-34620561-1",
        "CheckoutRequestID": "ws_CO_191220231020440123",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            {
              "Name": "Amount",
              "Value": 5000
            },
            {
              "Name": "MpesaReceiptNumber",
              "Value": "QGH12345"
            },
            {
              "Name": "TransactionDate",
              "Value": "20231219102044"
            },
            {
              "Name": "PhoneNumber",
              "Value": "254708374149"
            }
          ]
        }
      }
    }
  }'
```

Replace `CheckoutRequestID` with the actual ID from your payment initiation.

---

## Step 5: Production Setup

### 1. Complete Mpesa Onboarding

For production, you need to:

1. **Complete Business Registration:**
   - Register your business with Safaricom
   - Provide business documents
   - Get approved for Mpesa Daraja

2. **Get Production Credentials:**
   - Log in to Mpesa Developer Portal
   - Create a production app
   - Get production credentials:
     - Consumer Key
     - Consumer Secret
     - Passkey
     - Shortcode (your business shortcode)

3. **Configure Production Environment:**
   ```env
   MPESA_CONSUMER_KEY=your_production_consumer_key
   MPESA_CONSUMER_SECRET=your_production_consumer_secret
   MPESA_PASSKEY=your_production_passkey
   MPESA_SHORTCODE=your_business_shortcode
   MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
   MPESA_ENVIRONMENT=production
   ```

### 2. Production Checklist

- [ ] Domain has valid SSL certificate (HTTPS required)
- [ ] Callback URL is publicly accessible
- [ ] Server IP is whitelisted in Mpesa dashboard (if required)
- [ ] Production credentials are stored securely
- [ ] Error logging is configured
- [ ] Payment callbacks are being received
- [ ] Test transactions in production environment

---

## Step 6: Verify Setup

### Check Access Token Generation

Test if you can generate an access token:

```bash
# Create a test script: test-mpesa-token.js
```

Or use this curl command (replace with your credentials):

```bash
curl -X GET "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" \
  -H "Authorization: Basic $(echo -n 'YOUR_CONSUMER_KEY:YOUR_CONSUMER_SECRET' | base64)"
```

You should get a response like:
```json
{
  "access_token": "abc123...",
  "expires_in": "3599"
}
```

### Check Database

Verify that payments are being created:

```bash
# Using Prisma Studio
npm run db:studio

# Or query directly
# Check payments table for new records
```

---

## Troubleshooting

### Issue: "Failed to get Mpesa access token"

**Solutions:**
1. Verify consumer key and secret are correct
2. Check network connectivity
3. Ensure you're using the correct environment URL (sandbox vs production)
4. Check if credentials have expired (regenerate if needed)

### Issue: "STK Push failed"

**Solutions:**
1. Verify shortcode and passkey are correct
2. Check if account has sufficient balance (for test account)
3. Ensure phone number is in correct format (254XXXXXXXXX)
4. Verify callback URL is accessible

### Issue: "Callback not received"

**Solutions:**
1. Ensure callback URL is publicly accessible (use ngrok for local)
2. Check server logs for incoming requests
3. Verify callback URL format in environment variable
4. Test callback endpoint manually with curl

### Issue: "Payment status stuck on PROCESSING"

**Solutions:**
1. Manually query STK Push status using Mpesa API
2. Check callback logs
3. Verify database connection
4. Check for error messages in payment record

---

## Security Best Practices

1. **Never commit credentials to git:**
   - Keep `.env.local` in `.gitignore`
   - Use environment variables in production

2. **Use different credentials for sandbox and production:**
   - Never mix sandbox and production credentials

3. **Rotate credentials regularly:**
   - Change passwords periodically
   - Regenerate keys if compromised

4. **Monitor API usage:**
   - Set up alerts for unusual activity
   - Log all payment transactions

5. **Validate callbacks:**
   - Verify callback source (IP whitelist)
   - Validate callback structure
   - Log all callbacks for audit

---

## Additional Resources

- [Mpesa Daraja Documentation](https://developer.safaricom.co.ke/docs)
- [STK Push API Reference](https://developer.safaricom.co.ke/docs#stk-push)
- [Sandbox Testing Guide](https://developer.safaricom.co.ke/docs#sandbox)
- [ngrok Documentation](https://ngrok.com/docs)
- [Mpesa Support](https://developer.safaricom.co.ke/support)

---

## Quick Reference

### Sandbox Credentials (Example)
```env
MPESA_CONSUMER_KEY=your_sandbox_key
MPESA_CONSUMER_SECRET=your_sandbox_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

### Production Credentials (Example)
```env
MPESA_CONSUMER_KEY=your_production_key
MPESA_CONSUMER_SECRET=your_production_secret
MPESA_PASSKEY=your_production_passkey
MPESA_SHORTCODE=your_business_shortcode
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_ENVIRONMENT=production
```

---

**Need Help?** Check the troubleshooting section or refer to the Mpesa Daraja API documentation.

