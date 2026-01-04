# Snapchat Sharing Fix

## Problem
When sharing a product to Snapchat, it shows blank instead of displaying the product image and details.

## Root Cause
Snapchat (and other social media platforms) use Open Graph meta tags to generate link previews. The issues were:

1. **Image URLs not absolute**: Snapchat requires absolute URLs (starting with `https://`)
2. **Missing image dimensions**: Open Graph images need explicit width and height
3. **Incomplete metadata**: Some required Open Graph properties were missing

## Solution Applied

### 1. Fixed Image URL Formatting
- Ensured all product images are converted to absolute URLs
- Handles relative paths (`/uploads/...`) and converts them to full URLs
- Handles external URLs (Cloudinary, etc.) correctly

### 2. Enhanced Open Graph Metadata
Added comprehensive Open Graph tags:
- `og:image` with absolute URL
- `og:image:width` (1200px)
- `og:image:height` (630px)
- `og:image:type` (image/jpeg)
- `og:image:alt` (product name)
- `og:image:secure_url` (HTTPS URL for Snapchat)
- `og:title`, `og:description`, `og:url`, `og:type`
- `og:site_name` and `og:locale`

### 3. Twitter Card Support
- Added `summary_large_image` card type
- Proper image formatting for Twitter/X

### 4. Additional Meta Tags
- Added `snapchat:image` tag for Snapchat-specific support
- All images use HTTPS (secure URLs)

## Code Changes

### File: `src/app/products/[id]/page.tsx`

**Before:**
```typescript
const productImage = product.images[0]?.url || '/logo.png'
// Image might be relative path

openGraph: {
  images: [productImage.startsWith('http') ? productImage : `${siteUrl}${productImage}`],
  // Missing dimensions and other properties
}
```

**After:**
```typescript
// Ensure image URL is absolute
const getAbsoluteImageUrl = (imageUrl: string) => {
  if (!imageUrl) return `${siteUrl}/logo.png`
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  if (imageUrl.startsWith('/')) {
    return `${siteUrl}${imageUrl}`
  }
  return `${siteUrl}/${imageUrl}`
}

const productImage = getAbsoluteImageUrl(product.images[0]?.url || '/logo.png')

openGraph: {
  images: [
    {
      url: productImage,
      width: 1200,
      height: 630,
      alt: product.name,
      type: 'image/jpeg',
      secureUrl: productImage,
    },
  ],
  // ... other properties
}

other: {
  'og:image:secure_url': productImage,
  'og:image:type': 'image/jpeg',
  'og:image:width': '1200',
  'og:image:height': '630',
  'og:image:alt': product.name,
  'snapchat:image': productImage,
}
```

## Testing

### How to Test

1. **View Source:**
   - Open a product page (e.g., `/products/[id]`)
   - View page source (Right-click → View Page Source)
   - Search for `og:image` - should see absolute HTTPS URL
   - Verify all Open Graph tags are present

2. **Test with Snapchat:**
   - Open Snapchat
   - Try to share a product URL
   - The preview should now show:
     - Product image
     - Product name
     - Product description
     - Website name

3. **Test with Other Platforms:**
   - **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### Debugging Tools

1. **Facebook Sharing Debugger:**
   - Enter your product URL
   - Click "Debug"
   - Check for any errors or warnings
   - Click "Scrape Again" to refresh cache

2. **Open Graph Check:**
   - Use: https://www.opengraph.xyz/
   - Enter product URL
   - Verify all meta tags are detected

3. **Snapchat:**
   - Share the link in Snapchat
   - Check if preview appears correctly
   - If blank, check:
     - Image URL is accessible (not behind authentication)
     - Image is HTTPS (not HTTP)
     - Image dimensions are reasonable (not too large)

## Common Issues & Solutions

### Issue: Still showing blank in Snapchat

**Possible Causes:**
1. **Image not accessible**: Image URL might be behind authentication or CORS
2. **Cache**: Snapchat might have cached the old (blank) preview
3. **Image format**: Some image formats might not be supported

**Solutions:**
1. **Check image accessibility:**
   - Open the image URL directly in a browser
   - Should load without authentication
   - Should be HTTPS (not HTTP)

2. **Clear Snapchat cache:**
   - Share the link again after a few minutes
   - Snapchat caches previews, so changes might take time

3. **Verify image format:**
   - Use JPEG or PNG
   - Ensure image is not corrupted
   - Recommended size: 1200x630px

### Issue: Image shows but wrong size

**Solution:**
- Ensure product images are at least 1200x630px
- Use images with good aspect ratio (1.91:1)
- Consider using a service like Cloudinary to resize images

### Issue: Description is cut off

**Solution:**
- Descriptions are limited to 200 characters for social sharing
- HTML tags are stripped automatically
- Ensure product descriptions are concise and descriptive

## Best Practices

1. **Image Requirements:**
   - Minimum size: 1200x630px
   - Recommended aspect ratio: 1.91:1
   - Format: JPEG or PNG
   - File size: Under 5MB (preferably under 1MB)
   - Must be HTTPS

2. **Content Requirements:**
   - Title: Keep under 60 characters
   - Description: Keep under 200 characters
   - Use clear, descriptive text
   - Include relevant keywords

3. **Testing:**
   - Always test after making changes
   - Use Facebook Debugger to check for errors
   - Clear caches when testing
   - Test on multiple platforms

## Next Steps

1. ✅ **Deploy changes** to production
2. ✅ **Test sharing** on Snapchat
3. ✅ **Verify** preview appears correctly
4. ✅ **Monitor** for any issues

If issues persist:
- Check server logs for errors
- Verify image URLs are accessible
- Test with Facebook Debugger
- Check if images are being blocked by CORS

## Additional Resources

- [Open Graph Protocol](https://ogp.me/)
- [Snapchat Sharing Guidelines](https://developers.snap.com/)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

