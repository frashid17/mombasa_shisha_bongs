# Quick Mpesa Setup Checklist

Follow these steps to quickly set up Mpesa integration:

## ✅ Step-by-Step Checklist

### 1. Get Mpesa Credentials
- [ ] Go to https://developer.safaricom.co.ke/
- [ ] Sign up / Log in
- [ ] Create a new app (Sandbox)
- [ ] Copy your credentials:
  - [ ] Consumer Key
  - [ ] Consumer Secret
  - [ ] Passkey
  - [ ] Shortcode (usually `174379` for sandbox)

### 2. Update Environment Variables
- [ ] Open `.env.local` file
- [ ] Add/update these lines:
  ```env
  MPESA_CONSUMER_KEY=your_consumer_key_here
  MPESA_CONSUMER_SECRET=your_consumer_secret_here
  MPESA_PASSKEY=your_passkey_here
  MPESA_SHORTCODE=174379
  MPESA_CALLBACK_URL=http://localhost:3000/api/mpesa/callback
  MPESA_ENVIRONMENT=sandbox
  ```

### 3. Expose Localhost (For Callbacks)
- [ ] Install ngrok: `brew install ngrok` (or download from ngrok.com)
- [ ] Start your Next.js server: `npm run dev`
- [ ] In a new terminal, run: `ngrok http 3000`
- [ ] Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
- [ ] Update `.env.local`:
  ```env
  MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
  ```
- [ ] Restart your Next.js server

### 4. Test the Integration
- [ ] Create a test order on your website
- [ ] Use test phone number: `254708374149`
- [ ] Click "Pay with Mpesa"
- [ ] Check terminal logs for API responses
- [ ] Verify payment record in database

### 5. Verify Everything Works
- [ ] Access token generation works
- [ ] STK Push initiation works
- [ ] Callback endpoint is accessible
- [ ] Payment status updates correctly

## 🚨 Common Issues

**"Failed to get access token"**
→ Check your consumer key and secret

**"STK Push failed"**
→ Verify shortcode and passkey

**"Callback not received"**
→ Make sure ngrok URL is updated in `.env.local`

## 📝 Next Steps

Once sandbox is working:
1. Test with real transactions
2. Complete production onboarding
3. Get production credentials
4. Update environment variables for production
5. Deploy to production

For detailed instructions, see `MPESA-SETUP-GUIDE.md`

