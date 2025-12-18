# 🔑 Clerk Keys Troubleshooting

## ❓ Is Clerk Set to Development?

Yes, this could be the issue! Here's what to check:

## 🔍 Clerk Key Types

### Test Keys (Development)
- **Publishable Key**: Starts with `pk_test_...`
- **Secret Key**: Starts with `sk_test_...`
- **Use for**: Development, testing, local development
- **Works in**: All environments (local, preview, production)

### Live Keys (Production)
- **Publishable Key**: Starts with `pk_live_...`
- **Secret Key**: Starts with `sk_live_...`
- **Use for**: Production only
- **Works in**: Production environment only

## ✅ What You Need in Vercel

### Option 1: Use Test Keys (Recommended for now)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Pros:**
- Works in all environments
- Good for testing production deployment
- Can switch to live keys later

**Cons:**
- Limited features in test mode
- Should switch to live keys for real production

### Option 2: Use Live Keys (For real production)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**Pros:**
- Full production features
- Real user authentication
- Production-ready

**Cons:**
- Only works in production environment
- Need separate test keys for development

## 🔧 How to Check Your Current Keys

### In Vercel:
1. Go to **Settings** → **Environment Variables**
2. Look for:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Check if they start with `pk_test_` or `pk_live_`

### In Clerk Dashboard:
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys**
4. You'll see both **Test** and **Live** keys
5. Copy the ones you need

## ⚠️ Common Issues

### Issue 1: Keys Not Set
**Symptom**: 500 error, middleware fails
**Solution**: Add both keys to Vercel

### Issue 2: Wrong Key Type
**Symptom**: Authentication works locally but fails in production
**Solution**: Make sure you're using the right key type for the environment

### Issue 3: Keys Mismatch
**Symptom**: Some features work, others don't
**Solution**: Ensure publishable and secret keys are from the same set (both test or both live)

### Issue 4: Keys from Wrong Application
**Symptom**: Authentication doesn't work at all
**Solution**: Make sure keys are from the correct Clerk application

## 📋 Quick Fix Checklist

- [ ] Both Clerk keys are set in Vercel
- [ ] Keys are from the same set (both test or both live)
- [ ] Keys are enabled for **Production** environment
- [ ] Keys match your Clerk dashboard
- [ ] No typos or extra spaces in keys
- [ ] Redeployed after adding keys

## 🚀 Recommended Setup

### For Now (Testing Production):
Use **Test Keys**:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET
```

### Later (Real Production):
Switch to **Live Keys**:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
CLERK_SECRET_KEY=sk_live_YOUR_SECRET
```

## 🔍 How to Verify Keys Are Working

After adding keys and redeploying:

1. **Check Vercel Logs:**
   - Go to Deployments → Your Deployment → Functions
   - Look for Clerk-related errors
   - Should see no authentication errors

2. **Test Authentication:**
   - Visit `/sign-in` on your deployed site
   - Try to sign in
   - Should work without errors

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for Clerk errors
   - Should see no "Invalid publishable key" errors

## 📝 Notes

- **Test keys work in production** - you can use them for now
- **Live keys only work in production** - don't use them locally
- **Keys must match** - publishable and secret must be from same set
- **Environment variables are case-sensitive** - use exact names

## 🆘 Still Having Issues?

1. **Double-check key format:**
   - Publishable: `pk_test_...` or `pk_live_...`
   - Secret: `sk_test_...` or `sk_live_...`

2. **Verify in Clerk Dashboard:**
   - Make sure application is active
   - Check that keys are not revoked

3. **Check Vercel Logs:**
   - Look for specific error messages
   - Clerk errors will mention "publishable key" or "secret key"

4. **Try regenerating keys:**
   - In Clerk Dashboard → API Keys
   - Click "Regenerate" if needed
   - Update in Vercel

