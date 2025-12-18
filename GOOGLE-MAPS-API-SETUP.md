# 🗺️ Google Maps API Key Setup

## ❓ What is the Google Maps API Key?

The Google Maps API key is used to display interactive maps on your checkout page for delivery location selection. It's **optional** - if you don't provide it, the system will automatically use **Leaflet (OpenStreetMap)** which is completely free.

## 🔑 Should You Add It to Vercel?

**Yes, if you want to use Google Maps instead of Leaflet.**

### Option 1: Use Google Maps (Requires API Key)

**Pros:**
- ✅ Better map quality and features
- ✅ More accurate geocoding (address lookup)
- ✅ Street view integration
- ✅ Better mobile experience

**Cons:**
- ❌ Requires Google Cloud account
- ❌ Has usage limits (free tier available)
- ❌ Costs money after free tier (first $200/month free)

### Option 2: Use Leaflet (No API Key Needed) - **Current Default**

**Pros:**
- ✅ Completely free
- ✅ No API key required
- ✅ Works out of the box
- ✅ No usage limits

**Cons:**
- ❌ Basic map features
- ❌ Less accurate geocoding (uses your server-side API)

## 📋 How to Set Up Google Maps API Key

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **"Maps JavaScript API"**:
   - Go to **APIs & Services** → **Library**
   - Search for "Maps JavaScript API"
   - Click **Enable**
4. Enable **"Geocoding API"** (for address lookup):
   - Search for "Geocoding API"
   - Click **Enable**
5. Create API Key:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy your API key

### Step 2: Restrict Your API Key (Recommended)

1. Click on your API key to edit it
2. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add your domains:
     - `localhost:3000/*` (for development)
     - `*.vercel.app/*` (for Vercel previews)
     - `yourdomain.com/*` (for production)
3. Under **API restrictions**:
   - Select **Restrict key**
   - Choose:
     - Maps JavaScript API
     - Geocoding API
4. Click **Save**

### Step 3: Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Key**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value**: Your Google Maps API key (starts with `AIza...`)
   - **Environment**: 
     - ✅ Production
     - ✅ Preview (optional)
     - ✅ Development (optional, for local testing)
4. Click **Save**

### Step 4: Add to Local Development (Optional)

If you want to test Google Maps locally, add to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Step 5: Redeploy

After adding the environment variable, redeploy your application:

```bash
# Or trigger redeploy from Vercel dashboard
git push
```

## 🔍 How It Works

The code automatically detects if you have a Google Maps API key:

- **If API key exists**: Uses Google Maps
- **If API key is missing/invalid**: Falls back to Leaflet (OpenStreetMap)

## 💰 Google Maps Pricing

- **Free Tier**: $200/month credit (usually covers small to medium sites)
- **After Free Tier**: Pay per use
- **Typical Costs**:
  - Maps JavaScript API: $7 per 1,000 loads
  - Geocoding API: $5 per 1,000 requests

**For most small e-commerce sites, the free tier is sufficient.**

## ✅ Current Status

Your app is currently using **Leaflet (OpenStreetMap)** because no Google Maps API key is set. This works perfectly fine and is completely free.

## 🎯 Recommendation

- **If you want better maps**: Set up Google Maps API key
- **If you want to keep it simple and free**: Keep using Leaflet (current setup)

Both options work perfectly! The choice is yours.

