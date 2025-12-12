# How to Add Your Hookah Logo Image

## Quick Steps

1. **Save your hookah logo image** to the `public` folder:
   - File name: `logo.png` (or `logo.svg`)
   - Location: `/public/logo.png`

2. **For Favicon** (optional, can use same logo):
   - File name: `favicon.ico` or `logo.png`
   - Location: `/public/favicon.ico` or reuse `/public/logo.png`

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Image Requirements

- **Format:** PNG (recommended) or SVG
- **Size:** 200-400px width/height for logo
- **Background:** Transparent (for best results on dark background)
- **Aspect Ratio:** Square (1:1) works best

## Where the Logo Appears

✅ **Navbar** - Top left of every page  
✅ **Favicon** - Browser tab icon  
✅ **Open Graph** - Social media previews  
✅ **Metadata** - Site metadata  

## Current Setup

The logo is configured to use:
- **Path:** `/public/logo.png`
- **Component:** `src/components/Logo.tsx`
- **Navbar:** Uses Logo component automatically
- **Favicon:** Configured in `src/app/layout.tsx`

## Testing

After adding your logo:
1. Check navbar (top left) - logo should appear
2. Check browser tab - favicon should appear
3. Hard refresh if needed (Ctrl+Shift+R or Cmd+Shift+R)

## Troubleshooting

**Logo not showing?**
- Verify file exists at `public/logo.png`
- Check file name is exactly `logo.png` (case-sensitive)
- Clear browser cache
- Restart development server

**Want to adjust logo size?**
Edit `src/components/Navbar.tsx`:
```tsx
<Logo width={50} height={50} /> // Change these values
```

---

**Note:** The placeholder files have been removed. You need to add your actual logo image file to `public/logo.png`.

