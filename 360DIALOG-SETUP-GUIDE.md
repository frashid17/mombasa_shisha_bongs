# 360dialog WhatsApp Setup Guide

## 🎯 What is 360dialog?

**360dialog** is a WhatsApp Business API provider that allows you to send WhatsApp messages programmatically. It's:
- ✅ Easy to set up (10-15 minutes)
- ✅ Reliable and fast
- ✅ Good pricing (pay-as-you-go)
- ✅ Supports Kenya
- ✅ No sandbox limitations (works with any WhatsApp number)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Sign Up for 360dialog

1. **Go to**: https://www.360dialog.com/
2. **Click**: "Get Started" or "Sign Up"
3. **Create account** (free tier available for testing)
4. **Verify your email**

### Step 2: Connect Your WhatsApp Number

1. **Login** to your 360dialog dashboard
2. **Go to**: "Channels" or "WhatsApp" section
3. **Click**: "Add Channel" or "Connect WhatsApp"
4. **Scan QR Code**:
   - Open WhatsApp on your phone
   - Go to **Settings** → **Linked Devices**
   - Click **"Link a Device"**
   - Scan the QR code shown in 360dialog dashboard
5. **Wait for connection** (usually instant)

### Step 3: Get Your API Key

1. **Go to**: "API" or "Settings" → "API" section
2. **Copy your API Key** (it looks like: `abc123def456...`)
3. **Copy Instance ID** (if shown - some accounts don't need this)

---

## 📝 Update .env.local

Add these to your `.env.local` file:

```env
# ============================================
# WHATSAPP CONFIGURATION (360dialog)
# ============================================
WHATSAPP_API_KEY=your_360dialog_api_key_here
WHATSAPP_INSTANCE_ID=your_instance_id  # Optional - only if provided by 360dialog
WHATSAPP_API_URL=https://waba.360dialog.io/v1

# WhatsApp Recipients (format: 254712345678 - no + or whatsapp: prefix)
ADMIN_WHATSAPP_PHONE=254712345678  # Your admin WhatsApp number
DELIVERY_WHATSAPP_PHONE=254712345678  # Delivery person WhatsApp number
```

**Important Phone Number Format:**
- ✅ **Correct**: `254712345678` (country code + number, no +, no whatsapp:)
- ❌ **Wrong**: `+254712345678` (no + sign)
- ❌ **Wrong**: `whatsapp:+254712345678` (no whatsapp: prefix)
- ❌ **Wrong**: `0712345678` (must include country code 254)

---

## 🧪 Test It

1. **Restart your server**:
   ```bash
   npm run dev
   ```

2. **Create a test order** on your website

3. **Check WhatsApp** - You should receive:
   - ✅ Order confirmation to customer
   - ✅ Order details to delivery person
   - ✅ Order notification to admin

---

## 📱 What Messages Are Sent?

### When Order is Placed:
- **Customer**: Order confirmation with order details
- **Delivery Person**: Full order details with customer address
- **Admin**: Order notification with summary

### When Payment is Received:
- **Customer**: Payment confirmation
- **Admin**: Payment received notification

### When Order is Shipped:
- **Customer**: Shipping notification with tracking

---

## 🆘 Troubleshooting

### "Invalid API key" Error
- ✅ Check your API key in `.env.local`
- ✅ Make sure there are no extra spaces
- ✅ Copy the key directly from 360dialog dashboard

### "Invalid phone number" Error
- ✅ Make sure phone number format is: `254712345678` (no +, no whatsapp:)
- ✅ Must include country code (254 for Kenya)
- ✅ Remove any spaces or dashes

### "Instance ID not found" Error
- ✅ If you see this, remove `WHATSAPP_INSTANCE_ID` from `.env.local`
- ✅ Some 360dialog accounts don't need instance ID

### Messages Not Arriving
- ✅ Check 360dialog dashboard → "Messages" for delivery status
- ✅ Make sure your WhatsApp number is connected (green status)
- ✅ Verify phone numbers are correct in `.env.local`

---

## 💰 Pricing

360dialog offers:
- **Free tier**: Limited messages for testing
- **Pay-as-you-go**: Pay only for messages sent
- **Monthly plans**: For higher volumes

Check current pricing at: https://www.360dialog.com/pricing

---

## ✅ Advantages Over Twilio

1. **No Sandbox Limitations**: Works with any WhatsApp number immediately
2. **Easier Setup**: Just scan QR code, no complex approval process
3. **Better for Kenya**: Good support and pricing for African markets
4. **Simpler API**: Cleaner REST API, easier to use
5. **No Phone Number Needed**: Uses your existing WhatsApp Business number

---

## 📚 Next Steps

After setup:
1. ✅ Test with a real order
2. ✅ Verify all recipients receive messages
3. ✅ Customize message templates if needed (in `src/lib/notifications/whatsapp-templates.ts`)

---

## 🔗 Useful Links

- **360dialog Dashboard**: https://dashboard.360dialog.com/
- **360dialog Documentation**: https://docs.360dialog.com/
- **360dialog Support**: https://www.360dialog.com/support

---

**That's it! Your WhatsApp notifications are now powered by 360dialog!** 🎉

