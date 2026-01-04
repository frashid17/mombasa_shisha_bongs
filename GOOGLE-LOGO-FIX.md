# Google Search Logo Fix

## Problem
When searching "mombasa shisha bongs" on Google, the site appears in search results but shows a generic world/globe icon instead of your logo.

## Root Cause
Google uses several methods to find and display site logos:
1. **Favicon** - The small icon in browser tabs
2. **Organization Structured Data** - Schema.org markup with logo
3. **Site Logo** - Specific logo markup for Google
4. **Manifest.json** - PWA manifest with icons

The logo wasn't properly configured for Google's requirements.

## Solution Applied

### 1. Enhanced Organization Structured Data
Updated the Organization schema to include proper logo format:
- Changed from simple string URL to `ImageObject` with dimensions
- Added explicit width and height (512x512)
- Added `image` property alongside `logo`

### 2. Improved Favicon Configuration
Updated favicon setup in `layout.tsx`:
- Multiple icon sizes (512x512, 192x192, 32x32)
- Proper PNG format for Google
- Apple touch icon configuration
- Microsoft tile configuration

### 3. Updated Manifest.json
- Changed icon references from `/icon.png` to `/logo.png`
- Ensures PWA and mobile apps use the correct logo

### 4. Added Meta Tags
- `application-name` for app identification
- `msapplication-TileImage` for Windows tiles
- Multiple favicon sizes for different contexts

## Code Changes

### File: `src/components/seo/StructuredData.tsx`

**Before:**
```typescript
logo: `${siteUrl}/logo.png`,
```

**After:**
```typescript
logo: {
  '@type': 'ImageObject',
  url: `${siteUrl}/logo.png`,
  width: 512,
  height: 512,
},
image: `${siteUrl}/logo.png`,
```

### File: `src/app/layout.tsx`

**Before:**
```typescript
icons: {
  icon: [
    { url: '/uploads/hookah.svg', type: 'image/svg+xml' },
    { url: '/logo.png', type: 'image/png' },
    { url: '/favicon.ico', type: 'image/x-icon' },
  ],
}
```

**After:**
```typescript
icons: {
  icon: [
    { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    { url: '/logo.png', type: 'image/png', sizes: '192x192' },
    { url: '/logo.png', type: 'image/png', sizes: '32x32' },
    { url: '/uploads/hookah.svg', type: 'image/svg+xml' },
  ],
  apple: [
    { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    { url: '/uploads/hookah.svg', type: 'image/svg+xml' },
  ],
  shortcut: '/logo.png',
}
```

## Requirements for Google Logo

### Logo Image Requirements:
1. **Format**: PNG or SVG (PNG recommended)
2. **Size**: 
   - Minimum: 112x112px
   - Recommended: 512x512px
   - Maximum: 1024x1024px
3. **Aspect Ratio**: Square (1:1)
4. **File Size**: Under 1MB (preferably under 100KB)
5. **Accessibility**: Must be publicly accessible via HTTPS
6. **Location**: Should be in `/public/logo.png` or accessible root path

### Current Setup:
- ✅ Logo file: `/public/logo.png`
- ✅ Organization structured data with logo
- ✅ Multiple favicon sizes configured
- ✅ Manifest.json updated
- ✅ Meta tags added

## Testing

### 1. Verify Logo File
- Check that `/public/logo.png` exists
- Verify it's a square image (1:1 aspect ratio)
- Ensure it's at least 112x112px (preferably 512x512px)
- Check file size is reasonable (< 1MB)

### 2. Test Structured Data
Use Google's Rich Results Test:
1. Go to: https://search.google.com/test/rich-results
2. Enter your homepage URL: `https://mombasashishabongs.com`
3. Click "Test URL"
4. Check for "Organization" structured data
5. Verify logo URL is present and correct

### 3. Test Favicon
1. Open your site in a browser
2. Check browser tab - should show logo
3. View page source
4. Search for "favicon" or "icon"
5. Verify all icon links are present

### 4. Request Google to Re-crawl
After deploying changes:
1. Go to Google Search Console: https://search.google.com/search-console
2. Enter your site URL
3. Use "URL Inspection" tool
4. Enter homepage URL
5. Click "Request Indexing"
6. Wait 1-2 weeks for Google to update

## Additional Steps

### 1. Create a Site Logo File (Optional but Recommended)
Google also supports a dedicated site logo file. Create:
- File: `/public/site-logo.png`
- Size: 512x512px
- Square format

Then add to structured data:
```typescript
'logo': {
  '@type': 'ImageObject',
  url: `${siteUrl}/site-logo.png`,
  width: 512,
  height: 512,
}
```

### 2. Submit to Google Search Console
1. Verify your site in Google Search Console
2. Submit sitemap: `https://mombasashishabongs.com/sitemap.xml`
3. Request indexing for homepage
4. Monitor for any errors

### 3. Wait for Google to Update
- Google typically updates logos within 1-2 weeks
- Sometimes takes up to 4 weeks
- Logo appears automatically once Google detects it
- No manual approval needed

## Troubleshooting

### Logo Still Not Showing After 2 Weeks

**Check:**
1. **Logo file accessibility:**
   - Visit `https://mombasashishabongs.com/logo.png` directly
   - Should load without errors
   - Should be HTTPS (not HTTP)

2. **Structured data:**
   - Use Rich Results Test tool
   - Verify Organization schema is detected
   - Check logo URL in structured data

3. **File format:**
   - Ensure logo is PNG or SVG
   - Check image dimensions (should be square)
   - Verify file isn't corrupted

4. **Google Search Console:**
   - Check for any errors or warnings
   - Verify site is indexed
   - Check coverage report

### Logo Shows in Browser But Not in Google

**Possible causes:**
1. Google hasn't re-crawled yet (wait 1-2 weeks)
2. Logo file not accessible to Google's crawler
3. Structured data not properly formatted
4. Logo doesn't meet Google's requirements

**Solutions:**
1. Request re-indexing in Search Console
2. Verify logo URL is accessible
3. Check structured data with Rich Results Test
4. Ensure logo meets size/format requirements

## Best Practices

1. **Logo Design:**
   - Use a simple, recognizable logo
   - Ensure it's readable at small sizes (32x32px)
   - Use high contrast colors
   - Avoid text that's too small

2. **File Optimization:**
   - Compress PNG files (use tools like TinyPNG)
   - Keep file size under 100KB if possible
   - Use PNG-24 for better quality
   - Consider SVG for scalability

3. **Testing:**
   - Test on multiple devices
   - Check in different browsers
   - Verify in Google Search Console
   - Use Rich Results Test regularly

## Next Steps

1. ✅ **Deploy changes** to production
2. ✅ **Verify logo file** exists and is accessible
3. ✅ **Test structured data** with Rich Results Test
4. ✅ **Request re-indexing** in Google Search Console
5. ✅ **Wait 1-2 weeks** for Google to update
6. ✅ **Monitor** Google Search Console for any issues

## Additional Resources

- [Google Search Central - Site Logo](https://developers.google.com/search/docs/appearance/site-names)
- [Schema.org Organization](https://schema.org/Organization)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Console](https://search.google.com/search-console)

---

**Note:** Google logo updates can take 1-4 weeks to appear in search results. Be patient and monitor Google Search Console for any issues.

