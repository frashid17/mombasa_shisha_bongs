# Fixing Favicon Not Showing

## The Issue

Favicon might not show because:
1. Browser cache (most common)
2. File format/name issues
3. Next.js needs time to process the favicon

## Quick Fixes

### 1. Hard Refresh Browser
- **Chrome/Edge:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox:** `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- **Safari:** `Cmd+Option+R`

### 2. Clear Browser Cache
- Go to browser settings
- Clear browsing data/cache
- Restart browser

### 3. Check File Location
Make sure you have:
- `/public/favicon.ico` - For favicon
- `/public/logo.png` - For logo

### 4. Restart Development Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 5. Check File Format
- `favicon.ico` should be a valid ICO file
- `logo.png` should be a valid PNG file

## Next.js Favicon Handling

Next.js 13+ automatically detects:
- `favicon.ico` in `public/` folder
- `icon.png` or `icon.ico` in `app/` folder

The current setup uses both:
- Metadata configuration in `layout.tsx`
- Direct link tags in `<head>`

## Testing

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for `favicon.ico` request
5. Check if it loads (status 200) or fails (404)

## Alternative: Use icon.png in app directory

You can also create `src/app/icon.png`:
- Next.js will automatically use it
- No need for metadata configuration
- Works immediately

---

**Most Common Solution:** Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

