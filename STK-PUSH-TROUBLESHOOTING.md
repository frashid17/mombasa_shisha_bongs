# STK Push Not Received - Troubleshooting Guide

If you're not receiving the STK push on your phone, follow these steps:

## 🔍 Step 1: Check Server Logs

When you initiate a payment, check your server console logs. You should see:

```
🚀 Initiating STK Push with: { ... }
📥 STK Push API Response: { ... }
✅ STK Push initiated successfully!
```

**Look for:**
- ✅ Success message with `ResponseCode: "0"` = Request was sent successfully
- ❌ Error messages = Something is wrong with the request

---

## 🔴 Common Issue #1: Using Real Phone Number in Sandbox

**Problem:** In sandbox mode, Mpesa ONLY works with test phone numbers.

**Solution:**
1. Go to https://developer.safaricom.co.ke/
2. Log in to your developer account
3. Find your test phone numbers (usually in the app details or documentation)
4. Common test numbers:
   - `254708374149`
   - `254708786000`
   - `254708786001`
   - `254712345678`

**How to check:**
- Look at server logs - you'll see an error if using a real number
- The error will say: "Cannot use real phone number in sandbox mode"

---

## 🔴 Common Issue #2: Callback URL Not Accessible

**Problem:** Mpesa needs to send callbacks to your server. If the URL is `localhost`, Mpesa cannot reach it.

**Solution for Local Development:**
1. Install ngrok:
   ```bash
   brew install ngrok
   ```

2. Start your Next.js server:
   ```bash
   npm run dev
   ```

3. In a new terminal, expose port 3000:
   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Update `.env.local`:
   ```env
   MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
   ```

6. **Restart your Next.js server** (important!)

**How to check:**
- Look at server logs - you'll see an error if callback URL is invalid
- The error will say: "Callback URL is not publicly accessible"

---

## 🔴 Common Issue #3: Wrong Phone Number Format

**Problem:** Phone number must be in format `254XXXXXXXXX` (12 digits, starting with 254).

**Valid formats:**
- `254708786000` ✅
- `+254708786000` ✅ (will be converted)
- `0708786000` ✅ (will be converted to 254708786000)

**Invalid formats:**
- `708786000` ❌ (missing country code)
- `25470878600` ❌ (only 11 digits)

**How to check:**
- Look at server logs - the formatted phone number will be shown
- Should be exactly 12 digits starting with `254`

---

## 🔴 Common Issue #4: Amount Too High in Sandbox

**Problem:** Sandbox mode may have issues with large amounts.

**Solution:**
- Try with KES 1 first to test
- If KES 1 works, gradually increase the amount

**How to check:**
- Look at server logs - you'll see a warning if amount > KES 100

---

## 🔴 Common Issue #5: Phone Not Receiving Push (Even with Test Number)

**Possible causes:**

1. **Phone is off or no network:**
   - Ensure phone is ON
   - Check network signal
   - Try a different phone

2. **Mpesa account not active:**
   - Ensure the test phone number has an active Mpesa account
   - In sandbox, you may need to register the test number

3. **STK Push blocked:**
   - Check phone settings for blocked notifications
   - Ensure Mpesa app is installed and updated

4. **Timing:**
   - STK push usually arrives within 10-30 seconds
   - Wait at least 60 seconds before retrying

---

## 📋 Debugging Checklist

When STK push is not received, check:

- [ ] Server logs show `ResponseCode: "0"` (success)
- [ ] Using test phone number in sandbox mode
- [ ] Phone number format is correct (254XXXXXXXXX)
- [ ] Callback URL is publicly accessible (not localhost)
- [ ] Callback URL uses HTTPS
- [ ] Phone is ON and has network signal
- [ ] Amount is reasonable (try KES 1 first)
- [ ] Mpesa credentials are correct
- [ ] Environment is set correctly (`MPESA_ENVIRONMENT=sandbox`)

---

## 🔧 Quick Test

1. **Check your `.env.local`:**
   ```env
   MPESA_ENVIRONMENT=sandbox
   MPESA_SHORTCODE=174379
   MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback
   ```

2. **Use a test phone number:**
   - From Mpesa Developer Portal
   - Format: `254708374149` or similar

3. **Try with KES 1:**
   - Small amounts work better in sandbox

4. **Check server logs:**
   - Look for error messages
   - Look for success messages with `CheckoutRequestID`

5. **Wait 30-60 seconds:**
   - STK push may take time to arrive

---

## 📞 Still Not Working?

If you've checked everything above and still not receiving STK push:

1. **Check Mpesa Developer Portal:**
   - Log in to https://developer.safaricom.co.ke/
   - Check your app status
   - Verify credentials are correct
   - Check for any account restrictions

2. **Test with Mpesa API directly:**
   - Use Postman or curl to test the API
   - Compare with our implementation

3. **Check network/firewall:**
   - Ensure your server can reach `sandbox.safaricom.co.ke`
   - Check for firewall blocking outbound requests

4. **Contact Mpesa Support:**
   - If using production credentials, contact Mpesa support
   - For sandbox issues, check Mpesa developer documentation

---

## 📝 Example Successful Log Output

```
🚀 Initiating STK Push with: {
  phone: '254708374149',
  amount: '1',
  shortcode: '174379',
  environment: 'sandbox',
  callbackUrl: 'https://abc123.ngrok.io/api/mpesa/callback',
  stkPushUrl: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
  timestamp: '20251213170934',
  requestBody: { ... }
}

📥 STK Push API Response:
   Status: 200 OK
   Body: {
     "ResponseCode": "0",
     "CheckoutRequestID": "ws_CO_131220251709341234567890",
     "ResponseDescription": "Success. Request accepted for processing",
     "CustomerMessage": "Success. Request accepted for processing"
   }

✅ STK Push initiated successfully!
   CheckoutRequestID: ws_CO_131220251709341234567890
   CustomerMessage: Success. Request accepted for processing

📱 Next steps:
   1. Check the phone number: 254708374149
   2. Ensure the phone is ON and has network coverage
   3. Wait for STK push notification (usually within 10-30 seconds)
```

If you see this output but still don't receive the push, the issue is likely with:
- Phone number (not a valid test number)
- Phone network/coverage
- Mpesa account status

