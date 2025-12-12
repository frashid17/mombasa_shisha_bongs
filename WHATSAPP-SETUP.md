# WhatsApp Notifications Setup Guide

## ✅ Complete WhatsApp Notification System

Your system now sends WhatsApp messages to:
1. **Delivery Person** - When order is placed (with order details)
2. **Buyer** - When payment is received (payment confirmation)
3. **Admin** - When order is placed AND when payment is received

---

## 🚀 Quick Setup (Twilio WhatsApp Sandbox - FREE!)

### Step 1: Get Twilio WhatsApp Sandbox Number

1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. You'll see a sandbox number like: `whatsapp:+14155238886`
3. Join the sandbox by sending a WhatsApp message:
   - Send: `join <your-code>` to `+1 415 523 8886`
   - Example: `join xyz-abc` (use the code shown in Twilio console)

### Step 2: Add to .env.local

```env
# WhatsApp Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Your Twilio WhatsApp sandbox number

# Recipients (format: whatsapp:+254712345678)
ADMIN_WHATSAPP_PHONE=whatsapp:+254712345678  # Your admin WhatsApp number
DELIVERY_WHATSAPP_PHONE=whatsapp:+254712345678  # Delivery person WhatsApp number
```

### Step 3: Join Sandbox for Each Number

**Important**: Each WhatsApp number that will RECEIVE messages must join the sandbox first!

1. **Admin**: Send `join <code>` from your admin WhatsApp to `+1 415 523 8886`
2. **Delivery Person**: Send `join <code>` from delivery person's WhatsApp to `+1 415 523 8886`
3. **Buyers**: They'll automatically join when they receive first message (or you can pre-join them)

---

## 📱 How It Works

### When Order is Placed:
- ✅ **Delivery Person** gets WhatsApp with order details
- ✅ **Admin** gets WhatsApp notification
- ✅ **Buyer** gets email (optional)

### When Payment is Received:
- ✅ **Buyer** gets WhatsApp payment confirmation
- ✅ **Admin** gets WhatsApp payment notification

### When Order is Shipped:
- ✅ **Buyer** gets WhatsApp shipping notification

---

## 🧪 Testing

1. **Add credentials to .env.local** (see above)
2. **Join sandbox** for all recipient numbers
3. **Restart dev server**: `npm run dev`
4. **Create a test order**
5. **Check WhatsApp** - You should receive messages!

---

## 💰 Pricing

### Twilio WhatsApp Sandbox (Free)
- ✅ **FREE** for testing
- ✅ Send to any number that joins sandbox
- ✅ Perfect for development

### Twilio WhatsApp Production
- Requires WhatsApp Business API approval
- ~$0.005 per message (very affordable!)
- Can send to any WhatsApp number
- Better delivery rates

---

## 🔧 Production Setup (Optional)

When ready for production:

1. **Apply for WhatsApp Business API**:
   - Go to: https://www.twilio.com/whatsapp
   - Submit business verification
   - Get approved WhatsApp Business number

2. **Update .env.local**:
   ```env
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890  # Your approved WhatsApp Business number
   ```

3. **No sandbox join required** - Can send to any number!

---

## 📝 Complete .env.local Example

```env
# Database
DATABASE_URL="mysql://root@localhost:3306/mombasa_shisha_bongs"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Mpesa
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox

# Email (Resend)
EMAIL_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@mombasashishabongs.com

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Sandbox number
ADMIN_WHATSAPP_PHONE=whatsapp:+254712345678  # Your admin WhatsApp
DELIVERY_WHATSAPP_PHONE=whatsapp:+254712345678  # Delivery person WhatsApp

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🎉 You're All Set!

1. ✅ Add WhatsApp credentials to `.env.local`
2. ✅ Join Twilio sandbox from all recipient numbers
3. ✅ Restart server
4. ✅ Test by creating an order!

**WhatsApp notifications will now work automatically!** 🚀

---

## 🆘 Troubleshooting

### "Cannot send to unverified number"
- **Solution**: Recipient must join sandbox first
- Send `join <code>` to `+1 415 523 8886` from that number

### "Invalid phone number format"
- **Solution**: Use format `whatsapp:+254712345678`
- Must include `whatsapp:` prefix and country code

### Messages not sending
- Check Twilio Console for error logs
- Verify all credentials are correct
- Make sure sandbox is joined

---

**Ready to go!** Add the credentials and join the sandbox, then test it out! 🎊

