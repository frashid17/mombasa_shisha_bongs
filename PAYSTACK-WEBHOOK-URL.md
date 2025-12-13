# Paystack Webhook Configuration

## ✅ Your Webhook URL

**Current ngrok URL:** `https://ab2d648e112f.ngrok-free.app`

**Paystack Webhook URL:**
```
https://ab2d648e112f.ngrok-free.app/api/paystack/webhook
```

---

## 📋 Steps to Configure in Paystack Dashboard

### 1. Go to Paystack Dashboard
- Visit: https://dashboard.paystack.com/
- Log in to your account

### 2. Navigate to Webhooks
- Click on **Settings** (gear icon)
- Select **Webhooks** from the menu

### 3. Add Webhook URL
- Click **Add Webhook** or **Create Webhook**
- Enter the webhook URL:
  ```
  https://ab2d648e112f.ngrok-free.app/api/paystack/webhook
  ```
- Select events to listen for (or leave default):
  - ✅ `charge.success`
  - ✅ `charge.failed`

### 4. Copy Webhook Secret
- After creating the webhook, Paystack will show a **Webhook Secret**
- It starts with `whsec_`
- Copy this secret

### 5. Add to .env.local
Open your `.env.local` file and add:
```env
PAYSTACK_WEBHOOK_SECRET=whsec_your_secret_here
```

### 6. Restart Your Server
After adding the webhook secret, restart your Next.js server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## ⚠️ Important Notes

### ngrok URL Changes
- **Free ngrok accounts:** The URL changes every time you restart ngrok
- **If URL changes:**
  1. Update webhook URL in Paystack dashboard
  2. Update `NEXT_PUBLIC_APP_URL` in `.env.local` if needed
  3. Restart your Next.js server

### Keep ngrok Running
- You must keep the ngrok terminal window open while testing
- If you close ngrok, the webhook will stop working
- Restart ngrok if needed, then update Paystack dashboard

### Testing
1. Create a test order
2. Initiate Paystack payment
3. Complete payment on Paystack
4. Check server logs for webhook receipt:
   ```
   📥 Paystack Webhook Received
   ✅ Webhook signature verified
   ```

---

## 🔍 Verify Webhook is Working

### Check Server Logs
When a payment is made, you should see:
```
📥 Paystack Webhook Received
📋 Webhook Event: charge.success
✅ Payment successful for order ORD-xxxxx
```

### Check Paystack Dashboard
- Go to **Transactions** in Paystack dashboard
- You should see the transaction
- Check webhook delivery status

---

## 🆘 Troubleshooting

### Webhook Not Received
1. Check ngrok is still running
2. Verify webhook URL in Paystack dashboard matches ngrok URL
3. Check server logs for errors
4. Verify `PAYSTACK_WEBHOOK_SECRET` is set in `.env.local`

### Signature Verification Failed
1. Check webhook secret matches in Paystack and `.env.local`
2. Ensure secret starts with `whsec_`
3. Restart server after updating secret

### URL Not Accessible
1. Check ngrok is running: `pgrep -x ngrok`
2. Verify Next.js server is running on port 3000
3. Test URL manually: `curl https://ab2d648e112f.ngrok-free.app/api/paystack/webhook`

---

## 📝 Quick Reference

**Current Setup:**
- ngrok URL: `https://ab2d648e112f.ngrok-free.app`
- Webhook Endpoint: `/api/paystack/webhook`
- Full URL: `https://ab2d648e112f.ngrok-free.app/api/paystack/webhook`

**To get new URL if ngrok restarts:**
```bash
curl http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"'
```

