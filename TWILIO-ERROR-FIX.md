# Twilio Error 21612 Fix

## The Problem

**Error Code: 21612** - "Message cannot be sent with the current combination of 'To' and/or 'From' parameters"

This happens because **Twilio trial accounts can only send SMS to verified phone numbers**.

## ✅ Solution Options

### Option 1: Verify Your Phone Number (Recommended for Testing)

1. Go to: https://console.twilio.com
2. Click **Phone Numbers** → **Verified Caller IDs**
3. Click **Add a new Caller ID**
4. Enter your phone number (the one you want to receive SMS on)
5. Twilio will send you a verification code
6. Enter the code to verify

**Now you can send SMS to this verified number!**

### Option 2: Upgrade to Paid Account (For Production)

If you want to send SMS to any phone number:

1. Go to: https://console.twilio.com
2. Click **Billing** → **Upgrade**
3. Add payment method
4. Once upgraded, you can send to any number

**Note**: You still get the $15.50 credit, and Twilio is very affordable (~$0.0075 per SMS in Kenya).

### Option 3: Use Development Mode (For Now)

If you just want to test the system without sending real SMS:

- Don't add Twilio credentials to `.env.local`
- The system will log SMS to console instead
- No errors, no charges!

## 🔧 Quick Fix: Verify Your Number

1. **Go to Twilio Console**: https://console.twilio.com
2. **Navigate to**: Phone Numbers → Verified Caller IDs
3. **Add your number**: Click "Add a new Caller ID"
4. **Enter your phone**: Format: `+254712345678` (Kenyan number)
5. **Verify**: Enter the code Twilio sends you

## 📱 Phone Number Format

Make sure phone numbers are in **E.164 format**:
- ✅ Correct: `+254712345678`
- ❌ Wrong: `0712345678`
- ❌ Wrong: `254712345678`

The code already handles this, but double-check your `.env.local`:

```env
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio number (from Twilio)
```

And make sure customer phone numbers are formatted as `+254XXXXXXXXX`.

## 🧪 Test After Verification

1. Verify your phone number in Twilio
2. Create a test order with your verified phone number
3. Check your phone for the SMS!

## 💡 For Production

When you're ready for production:
- Upgrade Twilio account (add payment method)
- You can then send to any phone number
- Very affordable: ~$0.0075 per SMS in Kenya

---

**Quick Summary**: Verify your phone number in Twilio Console, then try again!

