# 🗺️ Fix: Leaflet Map Not Showing on Vercel

## ❌ Problem

The Leaflet map was working on localhost but not showing on Vercel. Users saw:
- Blank map area
- Error: "Unable to get your location. Location permission was denied..."

## 🔍 Root Cause

The **Content Security Policy (CSP)** in production was blocking:
1. **Leaflet JavaScript** from `unpkg.com` - not allowed in `script-src`
2. **Leaflet CSS** from `unpkg.com` - not allowed in `style-src`
3. **OpenStreetMap tiles** from `*.tile.openstreetmap.org` - not allowed in `img-src` and `connect-src`
4. **Geolocation API** - blocked by `geolocation=()` in Permissions-Policy

## ✅ Solution

### 1. Updated Security Headers (`src/utils/security-headers.ts`)

**Added to CSP:**
- `https://unpkg.com` to `script-src` (for Leaflet JS)
- `https://unpkg.com` to `style-src` (for Leaflet CSS)
- `https://*.tile.openstreetmap.org` and specific tile servers to `img-src` (for map tiles)
- `https://*.tile.openstreetmap.org` to `connect-src` (for tile requests)

**Updated Permissions-Policy:**
- Changed `geolocation=()` to `geolocation=(self)` to allow location access

### 2. Improved Error Handling (`src/components/checkout/LocationPicker.tsx`)

- **Permission Denied**: No longer shows blocking error - map still works, user can click to select location
- **Better Loading State**: Shows "Loading map..." while initializing
- **Non-blocking Errors**: Only shows errors for actual failures, not permission denials

## 📋 Changes Made

### `src/utils/security-headers.ts`

```typescript
// Before
'Permissions-Policy': [
  'geolocation=()', // Blocked geolocation
  ...
].join(', '),

'Content-Security-Policy': [
  "script-src 'self' ...", // Missing unpkg.com
  "style-src 'self' ...", // Missing unpkg.com
  "img-src 'self' ...", // Missing tile.openstreetmap.org
  "connect-src 'self' ...", // Missing tile.openstreetmap.org
  ...
].join('; '),

// After
'Permissions-Policy': [
  'geolocation=(self)', // ✅ Allow geolocation
  ...
].join(', '),

'Content-Security-Policy': [
  "script-src 'self' ... https://unpkg.com", // ✅ Added
  "style-src 'self' ... https://unpkg.com", // ✅ Added
  "img-src 'self' ... https://*.tile.openstreetmap.org ...", // ✅ Added
  "connect-src 'self' ... https://*.tile.openstreetmap.org ...", // ✅ Added
  ...
].join('; '),
```

### `src/components/checkout/LocationPicker.tsx`

- Improved geolocation error handling
- Better loading states
- Map works even if location permission is denied

## 🚀 Deployment

1. **Commit changes:**
   ```bash
   git add src/utils/security-headers.ts src/components/checkout/LocationPicker.tsx
   git commit -m "Fix: Allow Leaflet map to load on Vercel (CSP updates)"
   ```

2. **Push to GitHub:**
   ```bash
   git push
   ```

3. **Vercel will auto-deploy** - the map should now work!

## ✅ Expected Behavior After Fix

- ✅ Map loads and displays OpenStreetMap tiles
- ✅ Users can click on map to select location
- ✅ "Use My Location" button works if permission granted
- ✅ If permission denied, map still works (user can click to select)
- ✅ No CSP errors in browser console
- ✅ Map tiles load from OpenStreetMap servers

## 🧪 Testing

After deployment, test:
1. Navigate to checkout page
2. Map should load automatically (no blank area)
3. Click on map - marker should appear
4. Click "Use My Location" - should work if permission granted
5. If permission denied, map should still be clickable
6. Check browser console - no CSP errors

## 📝 Notes

- **Leaflet is free** - no API key needed
- **OpenStreetMap tiles** are free and open source
- **CSP is important** for security - we only added necessary domains
- **Geolocation permission** is optional - map works without it

---

**Status**: ✅ Fixed - Ready to deploy!

