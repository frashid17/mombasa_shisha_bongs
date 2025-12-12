# Fix Twilio WhatsApp Error 63055

## The Problem

**Error 63055**: "Only marketing messages supported on MM Lite API"

This happens when you try to send transactional messages (order confirmations, payment receipts) using Twilio's MM Lite API, which only supports marketing messages.

## ✅ Solution

We've updated the code to use **Twilio WhatsApp Cloud API** instead, which supports transactional messages.

### What Changed

- ✅ Now using Cloud API endpoint (`Messages.json`) - supports all message types
- ✅ Removed any MM Lite specific parameters
- ✅ Using simple `Body` parameter for messages

## 🔧 Configuration Check

Make sure your `.env.local` has the correct format:

```env
# For Sandbox (Testing)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# For Production (After approval)
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890  # Your approved WhatsApp Business number
```

**Important**: 
- Must start with `whatsapp:`
- For sandbox, use `whatsapp:+14155238886`
- Don't use MM Lite endpoints or ContentSid

## 🧪 Testing

1. **Restart your server**:
   ```bash
   npm run dev
   ```

2. **Make sure sandbox is joined**:
   - Send `join <code>` from recipient WhatsApp to `+1 415 523 8886`
   - Get code from: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

3. **Test order creation**:
   - Create a test order
   - Check WhatsApp messages

## 📱 Message Types Supported

Now you can send:
- ✅ **Transactional messages** (order confirmations, payment receipts)
- ✅ **Utility messages** (shipping updates, delivery notifications)
- ✅ **Authentication messages** (OTPs, verification codes)

## 🆘 Still Getting Error?

1. **Check your Twilio Console**:
   - Go to: https://console.twilio.com
   - Check if you're using the right WhatsApp number
   - Make sure it's not an MM Lite number

2. **Verify sandbox setup**:
   - Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   - Make sure you see the sandbox number
   - Copy it exactly: `whatsapp:+14155238886`

3. **Check recipient joined sandbox**:
   - Recipient must send `join <code>` to `+1 415 523 8886`
   - Wait a few minutes after joining

## 🚀 For Production

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

**The code is now fixed!** Restart your server and try again. The error should be resolved. ✅

