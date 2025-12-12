# Twilio WhatsApp Cloud API Setup Guide

## 🎯 Complete Step-by-Step Setup

This guide will help you set up Twilio WhatsApp Cloud API for sending transactional messages (order confirmations, payment receipts, etc.).

---

## Step 1: Get Your Twilio WhatsApp Sandbox Number

### 1.1 Login to Twilio Console

1. Go to: **https://console.twilio.com**
2. Log in with your Twilio account
3. Make sure you're in the correct account (the one with your Account SID)

### 1.2 Navigate to WhatsApp Sandbox

1. In the left sidebar, click **Messaging** → **Try it out** → **Send a WhatsApp message**
   - OR go directly to: **https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn**

2. You'll see a page with:
   - **Sandbox number**: Something like `+1 415 523 8886`
   - **Join code**: A code like `join xyz-abc`

3. **Copy the sandbox number** - it will look like: `whatsapp:+14155238886`

---

## Step 2: Join the Sandbox

### 2.1 Join from Your Admin WhatsApp

1. Open WhatsApp on your phone (the one you'll use as admin)
2. Send a message to: **+1 415 523 8886**
3. Send the join code: `join xyz-abc` (use the code from Twilio console)
4. You'll receive a confirmation message

### 2.2 Join from Delivery Person WhatsApp

1. Open WhatsApp on the delivery person's phone
2. Send a message to: **+1 415 523 8886**
3. Send the same join code: `join xyz-abc`
4. Wait for confirmation

### 2.3 Buyers Will Auto-Join

- When a buyer receives their first WhatsApp message, they'll be prompted to join
- OR you can pre-join them by having them send `join <code>` to `+1 415 523 8886`

---

## Step 3: Update Your .env.local File

Open your `.env.local` file and add/update these lines:

```env
# ============================================
# WHATSAPP CONFIGURATION (Twilio Cloud API)
# ============================================

# Twilio Credentials (get these from Twilio Console)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here

# WhatsApp Sandbox Number (from Step 1.2)
# Format: whatsapp:+14155238886
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Recipients (format: whatsapp:+254712345678)
# Replace with your actual WhatsApp numbers
ADMIN_WHATSAPP_PHONE=whatsapp:+254712345678
DELIVERY_WHATSAPP_PHONE=whatsapp:+254712345678
```

### Important Notes:

1. **TWILIO_WHATSAPP_NUMBER**: 
   - Must start with `whatsapp:`
   - Use the exact number from Twilio console
   - Example: `whatsapp:+14155238886`

2. **ADMIN_WHATSAPP_PHONE**:
   - Your WhatsApp number (the one you joined sandbox with)
   - Format: `whatsapp:+254712345678` (replace with your actual number)
   - Must include country code (+254 for Kenya)

3. **DELIVERY_WHATSAPP_PHONE**:
   - Delivery person's WhatsApp number
   - Format: `whatsapp:+254712345678` (replace with actual number)
   - Must have joined sandbox

---

## Step 4: Verify Your Setup

### 4.1 Check Your .env.local Format

Make sure your numbers look like this:
```env
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_PHONE=whatsapp:+254712345678
DELIVERY_WHATSAPP_PHONE=whatsapp:+254712345678
```

**Common Mistakes:**
- ❌ `+254712345678` (missing `whatsapp:` prefix)
- ❌ `whatsapp:254712345678` (missing `+` before country code)
- ❌ `whatsapp:+254 712 345 678` (spaces not allowed)
- ✅ `whatsapp:+254712345678` (correct format)

### 4.2 Restart Your Server

After updating `.env.local`:

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 5: Test the Setup

### 5.1 Create a Test Order

1. Go to your website: `http://localhost:3000`
2. Add items to cart
3. Go to checkout
4. Fill in the form
5. Place order

### 5.2 Check WhatsApp Messages

You should receive WhatsApp messages on:
- **Admin phone**: Order notification
- **Delivery phone**: Order details for delivery
- **Buyer phone**: Order confirmation (after they join sandbox)

### 5.3 Check Console Logs

In your terminal, you should see:
- ✅ `WhatsApp sent successfully` (or similar)
- ❌ If errors, check the error message

---

## Step 6: Troubleshooting

### Error: "Cannot send to unverified number"

**Solution**: Recipient must join sandbox first
1. Have them send `join <code>` to `+1 415 523 8886`
2. Wait for confirmation
3. Try again

### Error: "Invalid phone number format"

**Solution**: Check your `.env.local` format
- Must be: `whatsapp:+254712345678`
- No spaces, must include `+` and country code

### Error: 63055 "MM Lite API"

**Solution**: Already fixed! The code now uses Cloud API. Just make sure:
- `TWILIO_WHATSAPP_NUMBER` is correct
- Using sandbox number: `whatsapp:+14155238886`

### Messages Not Sending

1. **Check Twilio Console**:
   - Go to: https://console.twilio.com/monitor/logs/errors
   - Look for recent errors

2. **Verify Credentials**:
   - Double-check Account SID and Auth Token
   - Make sure they're correct in `.env.local`

3. **Check Sandbox Status**:
   - Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   - Make sure sandbox is active

---

## Step 7: Complete .env.local Example

Here's a complete example with all WhatsApp settings:

```env
# Database
DATABASE_URL="mysql://root@localhost:3306/mombasa_shisha_bongs"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d29ya2FibGUtbXV0dC00My5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_xGShHZ3hcXsw7yWmHXZF9SPUbdX2rHGtMeTvYszWYv

# Mpesa
MPESA_CONSUMER_KEY=rLzMJTQmdZ9sMHAQl0RdiDKdgprdyKNMYcS1ZInmyoxNBPHQ
MPESA_CONSUMER_SECRET=7g1eLaIOebWYe5MrVoGN5612Pfqh4VVyF4m8dLQJ7COVFwysS4DMNz6cnwjlScVq
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox

# Email (Resend)
EMAIL_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@mombasashishabongs.com

# WhatsApp (Twilio Cloud API)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_PHONE=whatsapp:+254712345678
DELIVERY_WHATSAPP_PHONE=whatsapp:+254712345678

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
ADMIN_EMAIL=admin@mombasashishabongs.com
```

---

## 🎉 You're Done!

After completing these steps:

1. ✅ Sandbox is set up
2. ✅ All recipients joined sandbox
3. ✅ `.env.local` is configured
4. ✅ Server is restarted
5. ✅ Ready to test!

---

## 📱 What Happens Now?

### When Order is Placed:
- 📱 **Delivery Person** gets WhatsApp with order details
- 📱 **Admin** gets WhatsApp notification
- 📧 **Buyer** gets email (optional)

### When Payment is Received:
- 📱 **Buyer** gets WhatsApp payment confirmation
- 📱 **Admin** gets WhatsApp payment notification

### When Order is Shipped:
- 📱 **Buyer** gets WhatsApp shipping notification

---

## 🚀 Next Steps (Optional - For Production)

When ready for production:

1. **Apply for WhatsApp Business API**:
   - Go to: https://www.twilio.com/whatsapp
   - Submit business verification
   - Get approved WhatsApp Business number

2. **Update .env.local**:
   ```env
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890  # Your approved number
   ```

3. **No sandbox join needed** - Can send to any number!

---

## 🆘 Need Help?

If you're stuck:

1. Check Twilio Console for errors
2. Verify all numbers are in correct format
3. Make sure sandbox is joined
4. Check terminal logs for detailed error messages

**The code is already configured correctly - just need to set up the credentials!** ✅

