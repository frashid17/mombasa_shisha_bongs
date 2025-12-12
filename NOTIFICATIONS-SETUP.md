# Notifications Setup Guide

## ✅ Resend Email API Setup

Your Resend API key has been configured. Add this to your `.env.local`:

```env
# Email Configuration (Resend)
EMAIL_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@mombasashishabongs.com
```

**Note**: You need to verify your domain in Resend before sending emails. For now, you can use their test domain or verify your own domain.

---

## 📱 Twilio SMS Setup (Free Alternative to Africa's Talking)

We've replaced Africa's Talking with **Twilio** - it's simpler, has a free trial, and works great in Kenya!

### Step 1: Get Free Twilio Account

1. Go to: https://www.twilio.com/try-twilio
2. Sign up for a free account (no credit card required for trial)
3. You'll get **$15.50 free credit** - enough for ~1,000 SMS messages!

### Step 2: Get Your Credentials

After signing up, you'll find these in your Twilio Console:

1. **Account SID**: Found on your dashboard (starts with `AC...`)
2. **Auth Token**: Found on your dashboard (click "Show" to reveal)
3. **Phone Number**: Get a free trial phone number from Twilio (or use your own)

### Step 3: Add to .env.local

```env
# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number (format: +1234567890)
```

### Step 4: Get a Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select a number (you can get a US number for free during trial)
3. Copy the number (including +) and add it to `TWILIO_PHONE_NUMBER`

**Note**: For Kenya, you can:
- Use a US number during trial (works for testing)
- Later upgrade to get a Kenyan number (requires paid account)

---

## 🧪 Testing

### Test Email (Resend)

The email service will automatically work once you add the API key to `.env.local`.

### Test SMS (Twilio)

1. Make sure all Twilio credentials are in `.env.local`
2. Create a test order
3. Check the console logs - you should see SMS being sent
4. Check your phone for the SMS

---

## 💰 Pricing

### Resend (Email)
- **Free Tier**: 3,000 emails/month
- **Paid**: $20/month for 50,000 emails

### Twilio (SMS)
- **Free Trial**: $15.50 credit (enough for ~1,000 SMS)
- **After Trial**: ~$0.0075 per SMS in Kenya
- **Very affordable** for small to medium businesses

---

## 🔧 Development Mode

If you don't add the credentials, the system will:
- **Email**: Log to console in development
- **SMS**: Log to console in development

This allows you to develop without spending credits!

---

## 📝 Complete .env.local Example

```env
# Email Configuration (Resend)
EMAIL_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@mombasashishabongs.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🆘 Troubleshooting

### Email Not Sending?
1. Check if domain is verified in Resend
2. Check API key is correct
3. Check console for error messages

### SMS Not Sending?
1. Verify all Twilio credentials are correct
2. Check phone number format (must include +)
3. Check Twilio Console for error logs
4. Make sure you have credits in your Twilio account

### Still Having Issues?
- Check `src/lib/notifications/email.ts` and `src/lib/notifications/sms.ts`
- Check browser console and terminal logs
- Verify credentials in Twilio/Resend dashboards

---

## ✅ Why Twilio Instead of Africa's Talking?

1. **Simpler Setup**: Just 3 credentials vs multiple fields
2. **Free Trial**: $15.50 credit to start
3. **Better Documentation**: Clear, easy-to-follow guides
4. **Global Support**: Works everywhere, including Kenya
5. **WhatsApp Support**: Can upgrade to WhatsApp Business API later
6. **Better Dashboard**: Easy to track messages and usage

---

**Ready to go!** Add the credentials to `.env.local` and restart your dev server.

