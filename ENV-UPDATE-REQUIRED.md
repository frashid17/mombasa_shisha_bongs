# 🔄 Environment Variables Update Required

## ⚠️ Action Required: Update Your .env.local

You've migrated from Twilio to 360dialog for WhatsApp. Update your `.env.local` file:

---

## ❌ Remove These (Old Twilio WhatsApp Config)

```env
# Remove these lines:
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_PHONE=whatsapp:+254712345678
DELIVERY_WHATSAPP_PHONE=whatsapp:+254712345678
```

---

## ✅ Add These (New 360dialog Config)

```env
# ============================================
# WHATSAPP CONFIGURATION (360dialog)
# ============================================
# Get from: https://www.360dialog.com/ → Dashboard → API
WHATSAPP_API_KEY=your_360dialog_api_key_here
WHATSAPP_INSTANCE_ID=your_instance_id  # Optional - only if provided by 360dialog
WHATSAPP_API_URL=https://waba.360dialog.io/v1

# WhatsApp Recipients (format: 254712345678 - no +, no whatsapp:)
ADMIN_WHATSAPP_PHONE=254712345678  # Your admin WhatsApp number
DELIVERY_WHATSAPP_PHONE=254712345678  # Delivery person WhatsApp number
```

---

## 📝 Phone Number Format Change

**Old Format (Twilio):**
- `whatsapp:+254712345678`

**New Format (360dialog):**
- `254712345678` (no `+`, no `whatsapp:` prefix)

---

## 🚀 Quick Setup Steps

1. **Sign up**: https://www.360dialog.com/
2. **Connect WhatsApp**: Scan QR code in dashboard
3. **Get API Key**: Copy from dashboard → API section
4. **Update .env.local**: Add the new variables above
5. **Restart server**: `npm run dev`

---

## 📚 Full Guide

See `360DIALOG-SETUP-GUIDE.md` for complete setup instructions.

