# Check STK Push Status

If STK push is not received, you can check the status using the CheckoutRequestID.

## From Your Logs

Your last STK push:
- **CheckoutRequestID**: `ws_CO_13122025172908648708786000`
- **Status**: Successfully initiated (ResponseCode: "0")
- **Phone**: `254708786000`

## Common Reasons STK Push Not Received

### 1. Mpesa Sandbox Limitations
- Sandbox sometimes doesn't send STK push even with test numbers
- This is a known limitation of the Mpesa sandbox environment
- The API returns success, but the push may not be delivered

### 2. Test Phone Number Issues
- The number `254708786000` might not be properly registered
- Try other test numbers:
  - `254708374149`
  - `254708786001`
  - `254712345678`

### 3. Check if Callback Was Received
Even if you didn't receive the STK push, Mpesa might have sent a callback. Check your server logs for:
```
📥 Mpesa Callback Received
```

If you see this, the payment might have been processed (or failed) without you seeing the STK push.

### 4. Check Payment Status in Database
You can check if the payment status was updated:
- Go to your admin panel
- Check the order details
- Look at payment status

## What to Do

1. **Check server logs** for callback messages
2. **Check payment status** in admin panel or database
3. **Try a different test number** from Mpesa Developer Portal
4. **Wait 1-2 minutes** - sometimes callbacks are delayed
5. **Try with KES 1** - smaller amounts sometimes work better in sandbox

## If Still Not Working

The Mpesa sandbox can be unreliable. Consider:
- Testing with production credentials (if available)
- Using Mpesa's test simulator (if available in developer portal)
- Contacting Mpesa support for sandbox issues

