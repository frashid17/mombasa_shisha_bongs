# 🔧 Add Scheduled Delivery Column Migration

## ❌ Error
```
Invalid `prisma.order.create()` invocation:
The column `orders.scheduledDelivery` does not exist in the current database.
```

## ✅ Solution

The `scheduledDelivery` field exists in the Prisma schema but the database column is missing. A migration has been created to add it.

## 🚀 How to Apply the Migration

### Option 1: Using Prisma Migrate (Recommended)

```bash
# Make sure DATABASE_URL is set in your environment
# For production (Vercel), use the production DATABASE_URL

npx prisma migrate deploy
```

### Option 2: Using Prisma DB Push (Quick Fix)

```bash
# This will sync the schema directly to the database
npx prisma db push
```

### Option 3: Run SQL Manually (If needed)

If migrations don't work, you can run this SQL directly in your Neon console:

```sql
-- Add the column
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "scheduledDelivery" TIMESTAMP(3);

-- Add the index
CREATE INDEX IF NOT EXISTS "orders_scheduledDelivery_idx" ON "orders"("scheduledDelivery");
```

## 📍 Where to Run

### For Production (Vercel):

1. **Via Vercel CLI:**
   ```bash
   # Pull production environment variables
   vercel env pull .env.production
   
   # Run migration
   npx prisma migrate deploy
   ```

2. **Via Neon Console:**
   - Go to https://console.neon.tech
   - Select your database
   - Go to "SQL Editor"
   - Run the SQL commands above

3. **Via Local Machine:**
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="your-production-neon-connection-string"
   
   # Run migration
   npx prisma migrate deploy
   ```

## ✅ After Migration

1. The `scheduledDelivery` column will be added to the `orders` table
2. Orders can be created without errors
3. The field is optional (nullable), so existing orders won't be affected

## 🔍 Verify Migration

After running the migration, verify it worked:

```bash
# Check if column exists
npx prisma studio
# Or query directly:
# SELECT column_name FROM information_schema.columns 
# WHERE table_name = 'orders' AND column_name = 'scheduledDelivery';
```

## 📝 Notes

- The `scheduledDelivery` field is optional (nullable) in the schema
- It's used for future "schedule delivery" feature
- Existing orders will have `NULL` for this field
- The migration is idempotent (safe to run multiple times)

