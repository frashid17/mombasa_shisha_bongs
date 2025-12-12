# Logo Setup Instructions

## Adding Your Hookah Logo Image

To add your hookah logo image to the website:

### Step 1: Prepare Your Image

1. **Main Logo:**
   - Recommended size: 200x200px to 400x400px
   - Format: PNG (with transparency) or SVG
   - Name: `logo.png` or `logo.svg`

2. **Favicon:**
   - Recommended size: 32x32px or 64x64px
   - Format: ICO, PNG, or SVG
   - Name: `favicon.ico` or use the same `logo.png`

### Step 2: Add Images to Public Folder

1. **Copy your logo image** to the `public` folder:
   ```
   public/logo.png
   ```

2. **Copy your favicon** (or use the same logo):
   ```
   public/favicon.ico
   ```
   Or if using PNG:
   ```
   public/logo.png (will be used for favicon too)
   ```

### Step 3: Verify the Setup

The logo is now configured to appear in:
- ✅ **Navbar** - Top left of every page
- ✅ **Favicon** - Browser tab icon
- ✅ **Open Graph** - Social media previews
- ✅ **Metadata** - Site metadata

### Step 4: Test

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Check:
   - Logo appears in navbar (top left)
   - Favicon appears in browser tab
   - Logo is visible on all pages

## Current Configuration

The logo is configured in:
- `src/components/Logo.tsx` - Logo component
- `src/components/Navbar.tsx` - Uses Logo component
- `src/app/layout.tsx` - Favicon and metadata
- `public/logo.png` - Logo image file

## Image Requirements

- **Format:** PNG (recommended) or SVG
- **Background:** Transparent (for best results)
- **Size:** 200-400px width/height for logo
- **Aspect Ratio:** Square (1:1) works best

## Troubleshooting

### Logo not showing?
1. Check file exists at `public/logo.png`
2. Verify file name matches exactly (case-sensitive)
3. Clear browser cache
4. Restart development server

### Favicon not updating?
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser tab (may take a moment to update)

### Logo too large/small?
Edit `src/components/Navbar.tsx`:
```tsx
<Logo width={50} height={50} /> // Adjust these values
```

---

**Note:** The placeholder files in `public/` should be replaced with your actual logo image.

