# Favicon Setup Guide

## Why Favicon Might Not Show

The favicon might not appear because:

1. **Browser Cache** - Most common reason
2. **File Format** - Next.js prefers PNG in app directory
3. **File Location** - Next.js 13+ looks in `app/` directory first

## Solution: Use Next.js 13+ App Directory Method

Next.js 13+ automatically detects favicons in the `app` directory:

### Option 1: Use `icon.png` (Recommended)

1. **Copy your logo to:**
   ```
   src/app/icon.png
   ```

2. **Next.js will automatically:**
   - Use it as favicon
   - Generate different sizes
   - Add to metadata

3. **No configuration needed!**

### Option 2: Use `favicon.ico`

1. **Place favicon.ico in:**
   ```
   src/app/favicon.ico
   ```

2. **Or keep in public:**
   ```
   public/favicon.ico
   ```

## Current Setup

I've configured both methods:
- ✅ Metadata in `layout.tsx` pointing to `/favicon.ico` and `/logo.png`
- ✅ Link tags in `<head>` section
- ✅ Next.js will also auto-detect `icon.png` in `app/` directory

## Quick Fix Steps

1. **Copy your logo image to:**
   ```bash
   cp public/logo.png src/app/icon.png
   ```

2. **Or copy favicon:**
   ```bash
   cp public/favicon.ico src/app/favicon.ico
   ```

3. **Hard refresh browser:**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)

4. **Check browser tab** - favicon should appear!

## File Requirements

- **Format:** PNG (recommended) or ICO
- **Size:** 32x32px to 512x512px
- **Location:** `src/app/icon.png` (best) or `public/favicon.ico`

## Testing

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for favicon request
5. Check status (should be 200)

## Troubleshooting

**Still not showing?**
1. Clear browser cache completely
2. Try incognito/private window
3. Check file exists and is valid image
4. Restart development server
5. Check browser console for errors

---

**Best Practice:** Place `icon.png` in `src/app/` directory - Next.js handles it automatically!

