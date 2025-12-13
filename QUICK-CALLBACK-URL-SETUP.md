# Quick Callback URL Setup with ngrok

## 🚀 Step-by-Step Instructions

### Step 1: Install ngrok

```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
```

### Step 2: Start Your Next.js Server

```bash
npm run dev
```

Your server should be running on `http://localhost:3000`

### Step 3: Expose Port 3000 with ngrok

Open a **new terminal window** and run:

```bash
ngrok http 3000
```

You'll see output like:
```
ngrok                                                                            

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Step 4: Copy the HTTPS URL

Copy the **HTTPS URL** from the "Forwarding" line:
- Example: `https://abc123xyz.ngrok-free.app`

### Step 5: Update Your `.env.local`

Open your `.env.local` file and update the callback URL:

```env
MPESA_CALLBACK_URL=https://abc123xyz.ngrok-free.app/api/mpesa/callback
```

**Important:** 
- Replace `abc123xyz.ngrok-free.app` with YOUR actual ngrok URL
- Make sure it starts with `https://`
- Include `/api/mpesa/callback` at the end

### Step 6: Restart Your Next.js Server

**CRITICAL:** You must restart your server for the new environment variable to take effect:

1. Stop your server (Ctrl+C)
2. Start it again: `npm run dev`

### Step 7: Verify It Works

1. Try initiating a payment
2. Check your server logs - you should NOT see the callback URL error anymore
3. The STK push should now be sent

---

## ⚠️ Important Notes

### ngrok URL Changes
- **Free ngrok accounts:** The URL changes every time you restart ngrok
- **Solution:** Keep ngrok running, or upgrade to a paid plan for a static URL

### Keep ngrok Running
- You must keep the ngrok terminal window open while testing
- If you close ngrok, the URL will stop working
- Restart ngrok if needed, then update `.env.local` with the new URL

### Testing the Callback URL
You can test if your callback URL is accessible by visiting:
```
https://your-ngrok-url.ngrok-free.app/api/mpesa/callback
```

You should see a response (even if it's an error about missing data - that's fine, it means the URL is accessible).

---

## 🔄 Alternative: Use a Static ngrok URL (Paid)

If you want a permanent URL that doesn't change:

1. Sign up for ngrok paid plan
2. Reserve a static domain
3. Use that domain in your `.env.local`

---

## 📝 Complete `.env.local` Example

```env
# Mpesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_PASSKEY=your_passkey_here
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://abc123xyz.ngrok-free.app/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

---

## 🆘 Troubleshooting

**"ngrok: command not found"**
→ Install ngrok: `brew install ngrok`

**"Address already in use"**
→ Port 3000 is already in use. Stop other servers or use a different port.

**"Callback URL still not working"**
→ Make sure you restarted your Next.js server after updating `.env.local`

**"ngrok URL keeps changing"**
→ This is normal for free accounts. Update `.env.local` each time.

