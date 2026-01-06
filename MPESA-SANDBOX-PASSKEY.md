# M-Pesa Sandbox Passkey

## Standard Sandbox Passkey

Based on the M-Pesa Daraja API documentation you shared, the **standard sandbox passkey** is:

```
bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

This is the passkey used in M-Pesa documentation examples and is commonly used for sandbox testing.

## How to Use It

Add this to your `.env.local` file:

```env
MPESA_CONSUMER_KEY=9DY8aKGLgIKFuf6cNrldJg70G1pPlomUSyCuc2Ck1aAXAkVe
MPESA_CONSUMER_SECRET=KdGhYSoiOXU6Nt6fK0yeTuNyt8PtpJHJzyWZDfTLFQgAGlgyVDRGyGwE5v6vGJXg
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

## How the Password is Generated

As shown in the documentation:
1. **Password** = Base64(Shortcode + Passkey + Timestamp)
2. Example from docs:
   - Shortcode: `174379`
   - Passkey: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
   - Timestamp: `20160216165627`
   - Combined: `174379bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c91920160216165627`
   - Base64: `MTc0Mzc5YmZiMjc5TliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMTYwMjE2MTY1NjI3`

## Important Notes

1. **This is for SANDBOX only** - Don't use this in production
2. **For production**, you'll need to get your own passkey from Safaricom
3. **Test phone numbers** - Use sandbox test numbers like:
   - `254708374149`
   - `254708786000`
   - `254708786001`

## Next Steps

1. Add the passkey to `.env.local`
2. Set up ngrok for callback URL (if testing locally):
   ```bash
   ngrok http 3000
   ```
3. Update `MPESA_CALLBACK_URL` with your ngrok URL
4. Restart your server:
   ```bash
   npm run dev
   ```
5. Test the payment flow!

