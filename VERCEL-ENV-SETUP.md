# 🔧 Vercel Environment Variables Setup

## ❌ Current Issue

The deployment is failing with:
```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

This means `DATABASE_URL` is **not set** or **incorrectly formatted** in Vercel.

## ✅ Solution: Add Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: `mombasa_shisha_bongs`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Required Variables

Add these environment variables one by one:

#### 1. Database (CRITICAL - Missing!)
```
Name: DATABASE_URL
Value: postgresql://user:password@host:port/database?sslmode=require
```
**Get this from your Neon dashboard:**
- Go to Neon Console
- Select your project
- Go to "Connection Details"
- Copy the connection string (should start with `postgresql://`)

#### 2. Clerk Authentication
```
Name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: pk_live_... (or pk_test_...)
```

```
Name: CLERK_SECRET_KEY
Value: sk_live_... (or sk_test_...)
```

#### 3. Email (Gmail SMTP)
```
Name: GMAIL_USER
Value: your-email@gmail.com
```

```
Name: GMAIL_APP_PASSWORD
Value: your-16-character-app-password
```

#### 4. Paystack
```
Name: PAYSTACK_SECRET_KEY
Value: sk_live_... (or sk_test_...)
```

```
Name: PAYSTACK_PUBLIC_KEY
Value: pk_live_... (or pk_test_...)
```

```
Name: PAYSTACK_WEBHOOK_SECRET
Value: whsec_...
```

### Step 3: Set Environment for Each Variable

For each variable:
- ✅ Check **Production**
- ✅ Check **Preview** (optional, for preview deployments)
- ✅ Check **Development** (optional, for local dev)

### Step 4: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

## 🔍 Verify DATABASE_URL Format

Your `DATABASE_URL` should look like:
```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

**Common Issues:**
- ❌ Missing `postgresql://` prefix
- ❌ Using `mysql://` instead of `postgresql://`
- ❌ Missing `?sslmode=require` at the end
- ❌ Extra spaces or line breaks

## 📝 Quick Checklist

- [ ] `DATABASE_URL` is set and starts with `postgresql://`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- [ ] `CLERK_SECRET_KEY` is set
- [ ] `GMAIL_USER` is set
- [ ] `GMAIL_APP_PASSWORD` is set
- [ ] `PAYSTACK_SECRET_KEY` is set
- [ ] `PAYSTACK_PUBLIC_KEY` is set
- [ ] `PAYSTACK_WEBHOOK_SECRET` is set (if using webhooks)
- [ ] All variables are enabled for **Production**
- [ ] Redeployed after adding variables

## ⚠️ About the Warnings

The warnings you see:
```
Route /admin/... couldn't be rendered statically because it used `headers`
```

These are **EXPECTED** and **OK**. Admin routes need to be dynamic because they:
- Check authentication
- Read headers for pathname
- Access user data

These routes will work fine at runtime - they just can't be pre-rendered statically.

## 🚨 After Adding DATABASE_URL

Once you add `DATABASE_URL`:
1. The build will complete successfully ✅
2. The runtime errors will stop ✅
3. Your site will work properly ✅

## 📞 Need Help?

If you're still having issues:
1. Check Vercel deployment logs for specific errors
2. Verify DATABASE_URL format in Neon dashboard
3. Make sure you copied the entire connection string
4. Check that SSL mode is set correctly (`?sslmode=require`)

