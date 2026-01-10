# Content Security Policy (CSP) - unsafe-eval Warning Guide

## 🔍 Current Status

Your CSP **already includes** `'unsafe-eval'` in the configuration:

**File**: `src/utils/security-headers.ts` (Line 38)
```typescript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com ..."
```

## ❓ Why Are You Still Seeing the Warning?

### Scenario 1: Development Environment ✅ **EXPECTED**
Your CSP is **disabled in development** (as designed in `src/proxy.ts`):
```typescript
if (process.env.NODE_ENV === 'production') {
  addSecurityHeaders(response)
} else {
  // In development, only add non-CSP headers
  // CSP disabled to avoid conflicts during development
}
```

**In Development:**
- ⚠️ Warning is normal - browser extensions or dev tools may show CSP warnings
- ✅ CSP is intentionally disabled during development
- 🔧 This prevents conflicts with hot reload, React DevTools, etc.

### Scenario 2: Production Environment ⚠️ **NEEDS INVESTIGATION**
If you're seeing this in production (on https://mombasashishabongs.com):

**Possible Causes:**
1. **Multiple CSP Headers**: Another middleware or service (Vercel, Cloudflare) may be adding a conflicting CSP
2. **Browser Extension**: Ad blockers or privacy extensions may inject their own CSP
3. **Meta Tag Conflict**: Check if there's a CSP meta tag in your HTML
4. **Caching Issue**: Old CSP headers may be cached

## 🔎 How to Diagnose

### Check Current CSP in Browser:
1. Open your site in production
2. Open DevTools (F12)
3. Go to **Network** tab
4. Refresh page
5. Click on the main document (first request)
6. Go to **Headers** tab
7. Look for `Content-Security-Policy` in **Response Headers**

### What to Look For:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' ...
```

✅ **GOOD**: You see `'unsafe-eval'` in `script-src`  
❌ **BAD**: No `'unsafe-eval'` or multiple CSP headers

---

## ✅ Solutions Based on Your Situation

### Solution 1: You're in Development (Most Likely)
**This is normal!** The warning is just informational.

**Why the warning appears:**
- Browser DevTools shows security best practices
- It's warning you that `unsafe-eval` has security implications
- This is informational, not an error

**Action Required:** ✅ **None** - This is expected behavior

---

### Solution 2: You're in Production and CSP is Missing
This shouldn't happen with your current setup, but if it does:

**Check Vercel Environment:**
```bash
# Ensure NODE_ENV is set correctly in Vercel
# Go to: Vercel Dashboard → Project → Settings → Environment Variables
# Verify: NODE_ENV = production
```

**Verify middleware is running:**
Add a log to `src/proxy.ts`:
```typescript
if (process.env.NODE_ENV === 'production') {
  console.log('✅ Adding CSP headers in production')
  addSecurityHeaders(response)
}
```

---

### Solution 3: Conflicting CSP from Vercel/Cloudflare
If you have multiple CSP headers:

**Option A: Use Vercel's Built-in Headers (Recommended)**

Update `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Security Headers via Next.js config
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://*.hcaptcha.com https://hcaptcha.com https://js.hcaptcha.com https://challenges.cloudflare.com https://*.cloudflare.com https://*.google.com https://www.google.com https://www.gstatic.com https://www.google-analytics.com https://js.stripe.com https://unpkg.com",
              "script-src-elem 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://*.hcaptcha.com https://hcaptcha.com https://js.hcaptcha.com https://challenges.cloudflare.com https://*.cloudflare.com https://*.google.com https://www.google.com https://www.gstatic.com https://js.stripe.com https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://*.hcaptcha.com https://hcaptcha.com https://*.cloudflare.com https://unpkg.com",
              "font-src 'self' https://fonts.gstatic.com data: https://*.clerk.com https://*.clerk.accounts.dev https://clerk.mombasashishabongs.com",
              "img-src 'self' data: https: blob: https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://*.hcaptcha.com https://hcaptcha.com https://*.cloudflare.com https://www.google.com https://www.gstatic.com https://*.tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org",
              "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://api.resend.com https://api.twilio.com https://sandbox.safaricom.co.ke https://api.safaricom.co.ke https://*.hcaptcha.com https://hcaptcha.com https://js.hcaptcha.com https://challenges.cloudflare.com https://*.cloudflare.com https://www.google.com https://www.gstatic.com https://*.tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org wss://*.clerk.com wss://clerk.mombasashishabongs.com",
              "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://*.hcaptcha.com https://hcaptcha.com https://js.hcaptcha.com https://challenges.cloudflare.com https://*.cloudflare.com https://www.google.com https://js.stripe.com",
              "worker-src 'self' blob: https://*.hcaptcha.com https://hcaptcha.com https://*.cloudflare.com https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  images: {
    // ... your existing config
  },
};

export default nextConfig;
```

Then **remove** CSP from middleware (keep it simple):
```typescript
// src/proxy.ts - simplified
export default clerkMiddleware(async (auth, req) => {
  const response = NextResponse.next()
  
  try {
    const pathname = req.nextUrl.pathname || '/'
    response.headers.set('x-pathname', pathname)

    // Security headers now handled by next.config.ts
    // Only add pathname header here
    
    const authResult = await auth()
    if (authResult?.userId) {
      response.headers.set('x-user-id', authResult.userId)
    }
  } catch (error) {
    console.error('Proxy error (non-fatal):', error)
  }

  return response
})
```

---

## 🛡️ Security Implications of unsafe-eval

### Why We Need It:
1. **Clerk CAPTCHA**: Uses eval() for anti-bot protection
2. **hCaptcha/Cloudflare Turnstile**: Requires eval()
3. **Some Analytics Tools**: May use dynamic code evaluation

### Security Risk:
- ⚠️ Allows JavaScript to execute strings as code
- 🔴 If attacker injects code, `eval()` could execute it
- ⚠️ Increases XSS (Cross-Site Scripting) risk

### Mitigation:
1. ✅ Input validation on all user inputs
2. ✅ Output encoding/escaping
3. ✅ Keep `unsafe-inline` to minimum
4. ✅ Use nonces for inline scripts (advanced)
5. ✅ Regular security audits

---

## 🚀 Best Practice Recommendation

### For Your Use Case:
Given you're using Clerk CAPTCHA, hCaptcha, and other third-party services that require `unsafe-eval`, **keeping it is necessary**.

### Safer Alternative (Future Enhancement):
Use **CSP Nonces** for better security:

```typescript
// Generate nonce per request
const nonce = crypto.randomBytes(16).toString('base64')

// Add to CSP
`script-src 'self' 'nonce-${nonce}' https://...`

// Add to inline scripts
<script nonce={nonce}>...</script>
```

This is more secure but requires more configuration with Clerk and other services.

---

## 📊 Summary

| Scenario | Action Required | Status |
|----------|----------------|--------|
| **Development** | None - warning is normal | ✅ OK |
| **Production with CSP working** | None - already configured correctly | ✅ OK |
| **Production without CSP** | Check Vercel env vars, rebuild | ⚠️ Fix needed |
| **Multiple CSP headers** | Move to next.config.ts | ⚠️ Fix needed |

---

## 🧪 Quick Test

Run this in your browser console on production site:
```javascript
// Check CSP
const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
console.log('Meta CSP:', csp ? csp.content : 'None')

// Check headers (view in Network tab)
console.log('Check Network tab → Headers → Response Headers for Content-Security-Policy')

// Test if eval is allowed
try {
  eval('console.log("eval works!")')
  console.log('✅ unsafe-eval is allowed')
} catch (e) {
  console.error('❌ unsafe-eval is blocked:', e)
}
```

---

## 💡 Quick Answer

**If you're just seeing the warning in DevTools:**
- ✅ This is normal and expected
- ✅ Your CSP already includes `unsafe-eval`
- ✅ The warning is just the browser informing you of the security implication
- ✅ No action needed unless something is actually broken

**Is anything broken?** (CAPTCHA not working, scripts failing, etc.)
- If YES → Follow "Solution 2" or "Solution 3" above
- If NO → You can safely ignore this warning

---

**Status**: Your CSP is correctly configured. The warning is informational, not an error! ✅
