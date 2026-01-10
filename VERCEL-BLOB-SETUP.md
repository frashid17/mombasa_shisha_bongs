# 📦 Vercel Blob Storage Setup

## ✅ What's Been Done

The upload route has been updated to use **Vercel Blob Storage** in production. This fixes the "read-only file system" error on Vercel.

## 🔧 Setup Instructions

### Step 1: Enable Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database**
3. Select **Blob** (or **Blob Storage**),
4. Click **Create**

### Step 2: Get Your Token

After creating the Blob storage, you'll get a token. Add it to your Vercel environment variables:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your Blob storage token (starts with `vercel_blob_rw_...`)
   - **Environment**: ✅ Production (and Preview if needed)

### Step 3: Redeploy

After adding the environment variable, redeploy your application:

```bash
# Or trigger redeploy from Vercel dashboard
git push
```

## 📋 How It Works

- **Development**: Files are saved to `public/uploads/` (local filesystem)
- **Production**: Files are uploaded to Vercel Blob Storage (cloud storage)

## ✅ Benefits

- ✅ No read-only filesystem errors
- ✅ Scalable cloud storage
- ✅ CDN delivery (fast image loading)
- ✅ Automatic cleanup options
- ✅ Free tier available

## 🔍 Verify It's Working

After setup, try uploading an image in the admin panel. You should see:
- ✅ No errors
- ✅ Image URL starts with `https://...` (Vercel Blob URL)
- ✅ Image displays correctly

## 📝 Notes

- The `@vercel/blob` package has been installed
- Upload route automatically detects production vs development
- Images are stored with public access for easy retrieval
- File size limit: 5MB (configurable in the code)

## 🆘 Troubleshooting

### Error: "Failed to upload to storage"

**Solution**: Make sure `BLOB_READ_WRITE_TOKEN` is set in Vercel environment variables.

### Images not displaying

**Solution**: Check that the Blob storage is set to "public" access (default in the code).

### Still getting read-only errors

**Solution**: Make sure you've redeployed after adding the token.

