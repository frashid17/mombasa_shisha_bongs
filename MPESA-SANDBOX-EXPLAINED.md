# Mpesa Sandbox Environment Explained

## 🔍 Where Does the Money Go in Sandbox?

**Short Answer: Nowhere - it's all simulated! No real money is transferred.**

---

## How Mpesa Sandbox Works

### 1. **Virtual Money Only**
- The sandbox environment uses **virtual/test money**
- No actual Mpesa accounts are debited
- No real money is transferred
- All transactions are **simulated** for testing purposes

### 2. **Test Phone Numbers**
When you use sandbox, you can use special test phone numbers:
- `254708374149` (Test number 1)
- `254712345678` (Test number 2)
- These are **virtual numbers** that don't belong to real Mpesa accounts

### 3. **What Happens During STK Push in Sandbox**

1. **STK Push is Sent:**
   - The API call succeeds
   - A simulated STK Push notification appears (if using test tools)
   - The transaction appears to go through

2. **Payment is "Processed":**
   - The callback is received
   - Payment status is updated to "PAID" in your database
   - Order status changes to "PROCESSING"

3. **But No Real Money Moves:**
   - No actual Mpesa account is debited
   - No real money is sent to your business account
   - Everything is **simulated** for testing

---

## Why Sandbox Exists

The sandbox environment allows you to:
- ✅ Test your integration without risking real money
- ✅ Develop and debug payment flows safely
- ✅ Verify that your code works correctly
- ✅ Test error handling and edge cases
- ✅ Train your team on the payment process

---

## Important Notes

### ⚠️ Sandbox Limitations

1. **No Real Transactions:**
   - You cannot receive real payments in sandbox
   - All transactions are virtual/simulated

2. **Test Data Only:**
   - Use test phone numbers provided by Mpesa
   - Real phone numbers won't work in sandbox

3. **No Business Account:**
   - Sandbox doesn't connect to your real business Mpesa account
   - Money doesn't go anywhere - it's all simulated

### ✅ What You CAN Test in Sandbox

- STK Push initiation
- Callback handling
- Payment status updates
- Error scenarios
- Order processing flow
- Database updates

---

## Moving to Production

### To Receive Real Payments:

1. **Complete Production Onboarding:**
   - Register your business with Safaricom
   - Provide business documents
   - Get approved for Mpesa Daraja production

2. **Get Production Credentials:**
   - Consumer Key (production)
   - Consumer Secret (production)
   - Passkey (production)
   - Shortcode (your actual business shortcode)

3. **Configure Production:**
   ```env
   MPESA_ENVIRONMENT=production
   MPESA_SHORTCODE=your_business_shortcode
   MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
   ```

4. **Where Real Money Goes:**
   - Real payments go to your **business Mpesa account** (Till Number or Paybill)
   - The shortcode you use determines which account receives the money
   - You can withdraw to your bank account from your Mpesa business account

---

## Sandbox vs Production

| Feature | Sandbox | Production |
|---------|---------|------------|
| **Real Money** | ❌ No | ✅ Yes |
| **Test Phone Numbers** | ✅ Yes | ❌ No |
| **Real Phone Numbers** | ❌ No | ✅ Yes |
| **Business Account** | ❌ No | ✅ Yes |
| **Money Destination** | Nowhere (simulated) | Your business Mpesa account |
| **Purpose** | Testing/Development | Real transactions |

---

## Current Status

Since you're using sandbox:
- ✅ Your integration is working correctly
- ✅ STK Push is being sent successfully
- ✅ Callbacks are being received
- ✅ Payment flow is functioning
- ⚠️ But no real money is being transferred

---

## Next Steps

1. **Continue Testing:**
   - Test all payment scenarios
   - Verify error handling
   - Test the complete order flow

2. **When Ready for Production:**
   - Complete Mpesa production onboarding
   - Get production credentials
   - Update environment variables
   - Test with small amounts first

3. **Production Setup:**
   - Your business shortcode will receive real payments
   - Money goes to your Mpesa business account
   - You can withdraw to your bank account

---

## Summary

**In Sandbox:**
- Money goes **nowhere** - it's all virtual/simulated
- Perfect for testing without risk
- No real transactions occur

**In Production:**
- Money goes to **your business Mpesa account** (Till/Paybill)
- Real payments from real customers
- You can withdraw to your bank account

---

**Need Help?** Check the Mpesa Developer Portal for sandbox testing guidelines and production onboarding requirements.

