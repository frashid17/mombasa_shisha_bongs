# 💾 Storage Optimization Guide

## 📊 Current Storage Usage

Your Neon PostgreSQL database stores:
- **Products** (~2KB each)
- **Orders** (~1.5KB each)
- **Reviews** (~0.8KB each)
- **Notifications** (~0.5KB each) - **Can grow large!**
- **Admin Logs** (~1KB each) - **Can grow very large!**
- **Recently Viewed** (~0.1KB each)
- **Saved Cart Items** (~0.3KB each)

## 🎯 Storage Saving Strategies

### 1. **Automatic Cleanup Script**

Run periodically to clean old data:

```bash
npm run db:optimize
```

This script:
- ✅ Deletes notifications older than 90 days (already sent/delivered)
- ✅ Deletes admin logs older than 90 days
- ✅ Deletes recently viewed items older than 30 days
- ✅ Deletes saved cart items older than 60 days
- ✅ Deletes notified stock notifications older than 30 days
- ✅ Runs `VACUUM ANALYZE` to optimize PostgreSQL

**Estimated savings**: 10-50 MB per month (depending on traffic)

### 2. **Check Storage Stats**

View current storage usage:

```bash
# Via API (requires admin auth)
GET /api/admin/storage/stats
```

Or visit in browser (if logged in as admin):
```
http://localhost:3000/api/admin/storage/stats
```

### 3. **Manual Cleanup via Admin Panel**

Use the cleanup API endpoint:

```bash
POST /api/admin/cleanup/old-data
```

With options:
```json
{
  "deleteOldNotifications": true,
  "deleteOldAdminLogs": true,
  "deleteOldRecentlyViewed": true,
  "deleteOldSavedCarts": true,
  "deleteOldStockNotifications": true,
  "daysToKeep": 90
}
```

### 4. **Set Up Automated Cleanup (Recommended)**

#### Option A: Vercel Cron Job

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/admin/cleanup/old-data",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

This runs every Sunday at 2 AM.

#### Option B: GitHub Actions

Create `.github/workflows/cleanup.yml`:
```yaml
name: Database Cleanup
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM
  workflow_dispatch:  # Manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Run Cleanup
        run: |
          curl -X POST https://your-domain.com/api/admin/cleanup/old-data \
            -H "Authorization: Bearer ${{ secrets.CLEANUP_TOKEN }}"
```

## 📈 Storage Optimization Tips

### 1. **Text Field Optimization**

Your schema uses `@db.Text` for:
- Product descriptions
- Order addresses
- Review comments
- Admin log descriptions
- Notification messages

**Optimization**: 
- ✅ Keep descriptions concise
- ✅ Use `VarChar(500)` for short text instead of `Text`
- ✅ Consider truncating very long descriptions

### 2. **Image Storage**

**Current**: Images stored as URLs (external) ✅ **Good!**

**Best Practice**:
- Use CDN (Vercel Blob, Cloudinary, etc.)
- Compress images before upload
- Use WebP format when possible
- Don't store base64 images in database

### 3. **Index Optimization**

Your schema already has good indexes ✅

**Monitor**:
- Unused indexes can waste space
- Run `VACUUM ANALYZE` regularly

### 4. **Data Retention Policies**

| Data Type | Recommended Retention | Action |
|-----------|---------------------|--------|
| **Notifications** | 90 days | Delete after sent |
| **Admin Logs** | 90 days | Delete or archive |
| **Recently Viewed** | 30 days | Delete |
| **Saved Carts** | 60 days | Delete |
| **Stock Notifications** | 30 days (after notified) | Delete |
| **Orders** | Forever | Keep (archive old ones) |
| **Reviews** | Forever | Keep |
| **Products** | Forever | Keep |

### 5. **PostgreSQL Specific Optimizations**

```sql
-- Vacuum and analyze (run weekly)
VACUUM ANALYZE;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index sizes
SELECT
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

## 🚀 Quick Start

1. **Check current storage**:
   ```bash
   # Visit in browser (admin only)
   http://localhost:3000/api/admin/storage/stats
   ```

2. **Run cleanup**:
   ```bash
   npm run db:optimize
   ```

3. **Set up automated cleanup** (choose one):
   - Vercel Cron (easiest)
   - GitHub Actions
   - External cron service

## 📊 Expected Results

After implementing cleanup:
- **Notifications**: Save ~5-20 MB/month
- **Admin Logs**: Save ~10-50 MB/month (depends on admin activity)
- **Recently Viewed**: Save ~1-5 MB/month
- **Saved Carts**: Save ~2-10 MB/month

**Total potential savings**: 20-85 MB/month

## ⚠️ Important Notes

1. **Backup before cleanup**: Always backup before running cleanup
2. **Test first**: Run on staging before production
3. **Monitor**: Check storage stats regularly
4. **Don't delete orders**: Orders are critical - archive instead of delete
5. **Keep recent data**: Adjust `daysToKeep` based on your needs

## 🔧 Advanced: Archive Old Orders

For very old orders (>1 year), consider:
1. Create `archived_orders` table
2. Move old orders there
3. Keep only order summary in main table

This can save significant space while preserving data.

