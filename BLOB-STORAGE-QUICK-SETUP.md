# 🚀 Quick Setup: Vercel Blob Storage

## ⚠️ Current Status

You're seeing this error because `BLOB_READ_WRITE_TOKEN` is not set in your Vercel environment variables.

**Temporary Fix**: The upload route will use Base64 encoding as a fallback, but this is **not recommended** for production as it stores images in the database.

## ✅ Proper Setup (5 minutes)

### Step 1: Create Blob Storage

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab (in the sidebar)
4. Click **Create Database**
5. Select **Blob**
6. Click **Create**

### Step 2: Get Your Token

After creating the Blob storage:

1. You'll see a token that starts with `vercel_blob_rw_...`
2. Copy this token (you can also find it later in Storage → Your Blob → Settings)

### Step 3: Add Environment Variable

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Enter:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your token (starts with `vercel_blob_rw_...`)
   - **Environment**: 
     - ✅ Production
     - ✅ Preview (optional but recommended)
4. Click **Save**

### Step 4: Redeploy

After adding the environment variable:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

## ✅ Verify It's Working

After redeploying, try uploading an image again. You should see:
- ✅ No errors
- ✅ Image URL starts with `https://...` (Vercel Blob URL)
- ✅ Image displays correctly

## 📋 Alternative: Use Cloudinary (Free Tier)

If you prefer not to use Vercel Blob Storage, you can use Cloudinary instead:

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Get your Cloudinary URL from the dashboard
3. Add to Vercel environment variables:
   - **Key**: `CLOUDINARY_URL`
   - **Value**: `cloudinary://api_key:api_secret@cloud_name`
4. Update the upload route to use Cloudinary SDK

## 🆘 Still Having Issues?

1. **Check token format**: Should start with `vercel_blob_rw_`
2. **Verify environment**: Make sure it's set for **Production**
3. **Redeploy**: Environment variables require a redeploy to take effect
4. **Check logs**: Look at Vercel function logs for detailed error messages

## 📝 Notes

- **Free Tier**: Vercel Blob Storage has a generous free tier
- **CDN**: Images are automatically served via CDN (fast loading)
- **Scalable**: No need to worry about storage limits
- **Automatic**: No manual cleanup needed

