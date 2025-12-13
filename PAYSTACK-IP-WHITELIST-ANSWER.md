# Paystack IP Whitelisting - Answer

## ❌ Paystack Does NOT Require IP Whitelisting

**You don't need to add any IP addresses to a whitelist!**

### Why?

Paystack uses **webhook signature verification** instead of IP whitelisting for security:

1. **HMAC SHA512 Signatures**: Every webhook is signed with a secret key
2. **Signature Verification**: Our server verifies the signature before processing
3. **More Secure**: Works with any IP address (Vercel, Railway, etc.)
4. **Easier Setup**: No need to manage IP addresses

### What You Need Instead:

1. **Webhook Secret**: Get this from Paystack Dashboard > Settings > Webhooks
2. **Webhook URL**: Configure in Paystack dashboard (e.g., `https://yourdomain.com/api/paystack/webhook`)
3. **Environment Variable**: Add `PAYSTACK_WEBHOOK_SECRET` to `.env.local`

### Security Flow:

```
Paystack sends webhook
    ↓
Includes signature in header (x-paystack-signature)
    ↓
Our server verifies signature using webhook secret
    ↓
If signature matches → Process webhook
If signature doesn't match → Reject webhook
```

### Setup Steps:

1. **Get Webhook Secret**:
   - Go to https://dashboard.paystack.com/
   - Settings > Webhooks
   - Copy the webhook secret (starts with `whsec_`)

2. **Add to .env.local**:
   ```env
   PAYSTACK_WEBHOOK_SECRET=whsec_your_secret_here
   ```

3. **Configure Webhook URL**:
   - In Paystack dashboard, add your webhook URL
   - Development: `https://your-ngrok-url.ngrok-free.app/api/paystack/webhook`
   - Production: `https://yourdomain.com/api/paystack/webhook`

That's it! No IP whitelisting needed. 🎉

