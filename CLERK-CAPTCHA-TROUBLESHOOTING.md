# 🔧 Clerk CAPTCHA Troubleshooting Guide

## Problem
CAPTCHA fails to load on sign-up page with error:
> "The CAPTCHA failed to load. This may be due to an unsupported browser or a browser extension."

## ✅ Solutions Applied

### 1. Updated Content Security Policy
- Added all necessary Clerk domains
- Added hCaptcha domains
- Added Google reCAPTCHA domains (if used)
- Made CSP more permissive for development

### 2. Additional Troubleshooting Steps

#### Step 1: Clear Browser Cache & Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

Then in browser:
- **Chrome/Edge**: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Select "Cached images and files"
- Click "Clear data"
- **Or use Incognito/Private window**

#### Step 2: Disable Browser Extensions
- Ad blockers (uBlock Origin, AdBlock Plus)
- Privacy extensions (Privacy Badger, Ghostery)
- Security extensions
- Try in **Incognito/Private mode** (extensions usually disabled)

#### Step 3: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for CSP errors (red text mentioning "Content Security Policy")
4. Look for network errors (failed requests)
5. Share any errors you see

#### Step 4: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to sign up
4. Look for failed requests (red)
5. Check if hCaptcha or Clerk requests are being blocked

#### Step 5: Verify Clerk Configuration
1. Go to: https://dashboard.clerk.com
2. Select your application
3. Go to **Settings** → **Allowed Origins**
4. Make sure these are added:
   - `http://localhost:3000`
   - `http://localhost:3000/*`
5. Go to **Settings** → **Authentication**
6. Check if CAPTCHA is enabled
7. Try disabling and re-enabling CAPTCHA

#### Step 6: Try Different Browser
- If using Chrome, try Firefox or Safari
- This helps identify browser-specific issues

#### Step 7: Temporarily Disable CSP (Development Only)
If nothing works, we can temporarily disable CSP for Clerk routes in development:

```typescript
// In src/middleware.ts - temporarily modify
export default clerkMiddleware(async (auth, req) => {
  const response = NextResponse.next()
  
  // Only add security headers in production
  if (process.env.NODE_ENV === 'production') {
    addSecurityHeaders(response)
  }
  
  // ... rest of code
})
```

**⚠️ WARNING**: Only do this in development! Never disable CSP in production.

---

## 🔍 Common Issues

### Issue 1: Ad Blocker Blocking CAPTCHA
**Solution**: Disable ad blocker for localhost or use incognito mode

### Issue 2: Privacy Extension Blocking
**Solution**: Disable privacy extensions or whitelist localhost

### Issue 3: CSP Still Too Restrictive
**Solution**: Check browser console for specific CSP errors and add those domains

### Issue 4: Network/Firewall Blocking
**Solution**: Check if your network/firewall is blocking hCaptcha or Clerk domains

---

## 📝 Current CSP Configuration

The CSP now allows:
- ✅ All Clerk domains (`*.clerk.com`, `*.clerk.accounts.dev`, `*.clerk.dev`)
- ✅ hCaptcha (`*.hcaptcha.com`, `hcaptcha.com`)
- ✅ Google reCAPTCHA (`www.google.com`, `www.gstatic.com`)
- ✅ WebSocket connections (`wss://*.clerk.com`)
- ✅ All necessary script, style, frame, and connect sources

---

## 🆘 Still Not Working?

If the issue persists:

1. **Check browser console** for specific errors
2. **Try incognito mode** to rule out extensions
3. **Check Clerk dashboard** for configuration issues
4. **Try different browser** to rule out browser issues
5. **Share the specific error** from browser console

---

## 🔗 Useful Links

- **Clerk CAPTCHA Docs**: https://clerk.com/docs/customization/captcha
- **Clerk Support**: https://clerk.com/support
- **hCaptcha Docs**: https://docs.hcaptcha.com/

---

**The CSP has been updated. Try clearing cache and restarting the server!** 🚀

