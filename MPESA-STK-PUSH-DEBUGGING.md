# Mpesa STK Push Debugging Guide

If you're not receiving STK push notifications on your phone, follow these steps to debug:

## 1. Check Console Logs

When you click "Pay with Mpesa", check your browser console and server logs for:

### Browser Console (F12 → Console tab)
- Look for any error messages
- Check the network tab to see the API response

### Server Logs (Terminal where `npm run dev` is running)
- Look for logs starting with "Initiating STK Push with:"
- Check for "STK Push response status:" and "STK Push response body:"
- Look for any error messages

## 2. Verify Environment Variables

Make sure your `.env.local` file has all required Mpesa credentials:

```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=http://localhost:3000/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

**Important for Sandbox:**
- Shortcode should be `174379` for sandbox
- You MUST use a test phone number registered in the Mpesa Developer Portal
- The callback URL must be publicly accessible (use ngrok for local testing)

## 3. Test Phone Numbers (Sandbox Only)

For **sandbox environment**, you can only use test phone numbers. To get test numbers:

1. Go to https://developer.safaricom.co.ke/
2. Log in to your account
3. Navigate to "Test Credentials" or "Test Phone Numbers"
4. Use one of the provided test numbers (usually starts with 254708...)

**Real phone numbers will NOT work in sandbox mode!**

## 4. Check Phone Number Format

The system automatically formats phone numbers to `254XXXXXXXXX` format. Make sure:
- You enter 9 digits (e.g., `708786000`)
- The number starts with `7` or `1`
- No spaces or special characters

## 5. Verify Callback URL (For Production)

If using production environment:
- Callback URL must be HTTPS
- Must be publicly accessible (not localhost)
- Must return a 200 status code

For local development with sandbox, use ngrok:
```bash
ngrok http 3000
# Then update MPESA_CALLBACK_URL to the ngrok URL
```

## 6. Common Error Messages

### "Mpesa credentials are missing"
- Check your `.env.local` file
- Restart your dev server after updating env vars
- Make sure there are no extra spaces in the values

### "Mpesa API Error: ResponseCode 1032"
- Invalid phone number format
- Using a real phone number in sandbox (use test number instead)

### "Mpesa API Error: ResponseCode 1037"
- Request timeout
- Try again after a few seconds

### "Mpesa API Error: ResponseCode 2001"
- Invalid shortcode or passkey
- Check your credentials in the developer portal

### "HTTP 401: Unauthorized"
- Invalid consumer key or secret
- Credentials may have expired (regenerate in developer portal)

## 7. Test the Connection

Check your server logs when initiating payment. You should see:
```
Initiating STK Push with: { phone: '254708786000', amount: 100, ... }
STK Push response status: 200
STK Push response body: { "ResponseCode": "0", "CustomerMessage": "...", ... }
```

If you see errors, the logs will show what's wrong.

## 8. Production Checklist

Before going to production:
- [ ] Switch `MPESA_ENVIRONMENT=production`
- [ ] Update all credentials to production values
- [ ] Set `MPESA_CALLBACK_URL` to your production URL (HTTPS)
- [ ] Test with a real phone number
- [ ] Verify callback endpoint is working

## Need Help?

Check the server console logs for detailed error messages. The enhanced logging will show:
- What phone number is being used
- What amount is being sent
- The exact API response
- Any configuration issues

