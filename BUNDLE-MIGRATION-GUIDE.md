# 🔧 Bundle Schema Migration Guide

## ❌ Error
When creating a bundle, you're getting: "Failed to create bundle"

## ✅ Solution

The schema has been updated with new fields, but the database needs to be migrated.

### Quick Fix (Recommended)

Run this command to sync your schema to the database:

```bash
npx prisma db push
```

This will:
- Add `image` field to `product_bundles` table
- Add `colorId`, `specId`, `allowColorSelection`, `allowSpecSelection` to `product_bundle_items` table
- Add relations for `color` and `specification` in `product_bundle_items`

### Alternative: Create Migration

If you prefer to create a proper migration:

```bash
npx prisma migrate dev --name add_bundle_image_and_specs
```

### After Migration

1. Regenerate Prisma Client:
   ```bash
   npx prisma generate
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

3. Try creating a bundle again

## 📋 Schema Changes

### ProductBundle Model
- Added `image String?` - Bundle featured image

### ProductBundleItem Model
- Added `colorId String?` - Pre-selected color
- Added `specId String?` - Pre-selected spec
- Added `allowColorSelection Boolean @default(true)` - Allow customer color selection
- Added `allowSpecSelection Boolean @default(true)` - Allow customer spec selection
- Added relations to `ProductColor` and `ProductSpecification`

## 🔍 Verify Migration

After running the migration, verify it worked:

```bash
# Check tables
npx prisma studio
```

Or check directly:
```sql
-- Check if columns exist
DESCRIBE product_bundles;
DESCRIBE product_bundle_items;
```

