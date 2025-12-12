# 🔧 Clerk CAPTCHA Fix

## Problem

When trying to sign up, you get:
> "The CAPTCHA failed to load. This may be due to an unsupported browser or a browser extension. Please try a different browser or disabling extensions."

## ✅ Solution Applied

Updated the Content Security Policy (CSP) to allow Clerk's CAPTCHA service (hCaptcha/reCAPTCHA) to load properly.

### What Changed

Added the following domains to the CSP:
- `https://*.hcaptcha.com` - For hCaptcha CAPTCHA
- `https://www.google.com` - For reCAPTCHA (if Clerk uses it)
- `https://www.gstatic.com` - For Google static resources

### Files Updated

- `src/utils/security-headers.ts` - Updated CSP to include CAPTCHA domains

---

## 🧪 Testing

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Clear browser cache** (important):
   - Chrome/Edge: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cached images and files"
   - Click "Clear data"

3. **Try signing up again**:
   - Go to: `http://localhost:3000/sign-up`
   - The CAPTCHA should now load properly

---

## 🔍 Additional Troubleshooting

If CAPTCHA still doesn't load:

### 1. Check Browser Console
- Open browser DevTools (F12)
- Go to Console tab
- Look for CSP errors (they'll mention "Content Security Policy")
- Share any errors you see

### 2. Disable Browser Extensions
- Some ad blockers or privacy extensions block CAPTCHA
- Try disabling extensions temporarily
- Or use an incognito/private window

### 3. Check Clerk Dashboard
- Go to: https://dashboard.clerk.com
- Navigate to your app → Settings
- Check "Allowed Origins":
  - Should include: `http://localhost:3000`
  - Should include: `http://localhost:3000/*`

### 4. Try Different Browser
- If using Chrome, try Firefox or Safari
- This helps identify browser-specific issues

### 5. Check Network Tab
- Open DevTools → Network tab
- Try signing up
- Look for failed requests (red)
- Check if hCaptcha/reCAPTCHA requests are being blocked

---

## 📝 CSP Configuration

The updated CSP now allows:
- ✅ Clerk domains (`*.clerk.com`, `*.clerk.accounts.dev`)
- ✅ CAPTCHA services (`*.hcaptcha.com`, `www.google.com`)
- ✅ Google static resources (`www.gstatic.com`)
- ✅ All necessary script, style, and frame sources

---

## 🆘 Still Not Working?

If the issue persists:

1. **Check the browser console** for specific errors
2. **Verify Clerk configuration** in dashboard
3. **Try incognito mode** to rule out extensions
4. **Check if it's a network/firewall issue**

Share the specific error message from the browser console, and I can help further!

---

**The fix has been applied. Restart your server and try again!** 🚀

