# STK Push Not Working - Quick Fix Guide

If STK push was working yesterday but not working now, here are the most common causes:

## 🔴 Most Common Issue: ngrok URL Changed

**Problem:** Free ngrok URLs change every time you restart ngrok.

**Solution:**
1. Check your ngrok terminal window
2. Look for the current URL (e.g., `https://abc123.ngrok-free.app`)
3. Compare it with the URL in `.env.local`
4. If different, update `.env.local`:
   ```bash
   # Update the callback URL
   sed -i '' 's|MPESA_CALLBACK_URL=.*|MPESA_CALLBACK_URL=https://NEW-URL-HERE.ngrok-free.app/api/mpesa/callback|' .env.local
   ```
5. **Restart your Next.js server** (important!)

---

## 🔴 Issue #2: Server Not Restarted

**Problem:** Environment variables are only loaded when the server starts.

**Solution:**
1. Stop your Next.js server (Ctrl+C)
2. Start it again: `npm run dev`
3. Try the payment again

---

## 🔴 Issue #3: ngrok Not Running

**Problem:** If ngrok was closed, the URL won't work.

**Solution:**
1. Check if ngrok is running:
   ```bash
   pgrep -x ngrok
   ```
2. If not running, start it:
   ```bash
   ngrok http 3000
   ```
3. Copy the new URL and update `.env.local`
4. Restart your Next.js server

---

## 🔍 How to Debug

### Step 1: Check Server Logs

When you try to initiate a payment, check your server console. You should see:

**✅ Success:**
```
🚀 Initiating STK Push with: { ... }
📥 STK Push API Response: { ... }
✅ STK Push initiated successfully!
   ResponseCode: "0"
```

**❌ Error:**
```
❌ CRITICAL: Callback URL is not publicly accessible!
```

### Step 2: Run Diagnostic

Run the diagnostic script:
```bash
./diagnose-stk-issue.sh
```

This will check:
- ngrok URL accessibility
- Environment variables
- ngrok process status
- Next.js server status

### Step 3: Check ngrok Terminal

Look at your ngrok terminal window. You should see:
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3000
```

**If the URL is different from `.env.local`, that's your problem!**

---

## 🔧 Quick Fix Steps

1. **Check ngrok URL:**
   ```bash
   # In ngrok terminal, find the URL
   # Or check ngrok web interface: http://127.0.0.1:4040
   ```

2. **Update .env.local:**
   ```bash
   # Replace NEW-URL with your actual ngrok URL
   sed -i '' 's|MPESA_CALLBACK_URL=.*|MPESA_CALLBACK_URL=https://NEW-URL.ngrok-free.app/api/mpesa/callback|' .env.local
   ```

3. **Restart Next.js server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Test again:**
   - Try initiating a payment
   - Check server logs for errors
   - Look for `ResponseCode: "0"` (success)

---

## 📋 Checklist

Before testing, make sure:
- [ ] ngrok is running (`pgrep -x ngrok`)
- [ ] ngrok URL matches `.env.local`
- [ ] Next.js server was restarted after updating `.env.local`
- [ ] Using test phone number in sandbox (254708374149)
- [ ] Server logs show no errors

---

## 🆘 Still Not Working?

1. **Check server logs** - Look for specific error messages
2. **Verify ngrok URL** - Make sure it matches `.env.local`
3. **Restart everything:**
   - Stop ngrok (Ctrl+C)
   - Stop Next.js server (Ctrl+C)
   - Start ngrok: `ngrok http 3000`
   - Update `.env.local` with new URL
   - Start Next.js: `npm run dev`
4. **Check Mpesa credentials** - Verify they're still valid in developer portal

---

## 💡 Pro Tip: Use ngrok Static URL

To avoid URL changes, consider:
1. Sign up for ngrok paid plan
2. Reserve a static domain
3. Use that domain in `.env.local`

This way, the URL won't change when you restart ngrok.

