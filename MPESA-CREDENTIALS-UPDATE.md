# M-Pesa Credentials Update

## ✅ Changes Completed

1. **Removed Paystack** - All Paystack payment options have been removed from the checkout and order pages
2. **Re-enabled M-Pesa** - M-Pesa payment is now the primary payment method
3. **Updated Checkout Page** - Removed WhatsApp redirect, restored normal order creation flow
4. **Updated Order Page** - Now uses `MpesaPaymentButton` instead of `PaystackPaymentButton`

## 🔑 M-Pesa Credentials to Add

Add these to your `.env.local` file (or production environment variables):

```env
# M-Pesa Daraja API Configuration (Sandbox)
MPESA_CONSUMER_KEY=9DY8aKGLgIKFuf6cNrldJg70G1pPlomUSyCuc2Ck1aAXAkVe
MPESA_CONSUMER_SECRET=KdGhYSoiOXU6Nt6fK0yeTuNyt8PtpJHJzyWZDfTLFQgAGlgyVDRGyGwE5v6vGJXg
MPESA_PASSKEY=YOUR_PASSKEY_HERE
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

## ⚠️ Important Notes

1. **Passkey Required**: You need to get the **Passkey** from your M-Pesa Developer Portal:
   - Go to: https://developer.safaricom.co.ke/
   - Log in to your account
   - Navigate to your app (MPESA express sandbox)
   - Copy the **Passkey** value
   - Add it to `MPESA_PASSKEY` in your `.env.local`

2. **Shortcode**: For sandbox, the shortcode is usually `174379`. If your app shows a different shortcode, use that instead.

3. **Callback URL**: 
   - For **local development**: Use ngrok to expose your localhost:
     ```bash
     ngrok http 3000
     ```
     Then set `MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback`
   
   - For **production**: Set to your actual domain:
     ```env
     MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
     ```

4. **Environment**: Currently set to `sandbox` for testing. Change to `production` when ready.

## 🧪 Testing

1. **Test Phone Numbers**: In sandbox mode, you can only use test phone numbers from the M-Pesa Developer Portal. Common test numbers:
   - `254708374149`
   - `254708786000`
   - `254708786001`

2. **Test Amount**: Start with small amounts (KES 1-10) for testing in sandbox.

3. **After adding credentials**:
   - Restart your development server
   - Try creating an order
   - Select "M-Pesa Payment" as payment method
   - Enter a test phone number
   - You should receive an STK Push on your phone

## 📝 Files Modified

- `src/app/checkout/page.tsx` - Removed Paystack, restored M-Pesa, removed WhatsApp redirect
- `src/app/orders/[id]/page.tsx` - Replaced PaystackPaymentButton with MpesaPaymentButton

## 🔄 Next Steps

1. Add the credentials to `.env.local`
2. Get the Passkey from M-Pesa Developer Portal
3. Set up ngrok for local testing (if needed)
4. Restart the development server
5. Test the payment flow

