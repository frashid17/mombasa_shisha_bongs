# 🚀 Neon PostgreSQL Setup Guide

## What is Neon?

Neon is a serverless PostgreSQL database platform that's perfect for Next.js applications. It offers:
- ✅ **Free tier** with generous limits
- ✅ **Serverless** - scales automatically
- ✅ **Branching** - create database branches like Git
- ✅ **Fast** - optimized for modern apps
- ✅ **Easy setup** - no server management

## Step 1: Create Neon Account

1. Go to https://neon.tech
2. Sign up with GitHub (recommended) or email
3. Verify your email if needed

## Step 2: Create a New Project

1. Click **"Create a project"**
2. Choose a project name: `mombasa-shisha-bongs`
3. Select a region closest to you (or your users)
4. Choose PostgreSQL version: **15** (recommended)
5. Click **"Create project"**

## Step 3: Get Your Connection String

After creating the project:

1. You'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

2. **Copy this connection string** - you'll need it for your `.env.local`

3. **Important**: Neon provides two connection strings:
   - **Pooled connection** (recommended for serverless) - includes `?pgbouncer=true`
   - **Direct connection** (for migrations) - no `pgbouncer`

## Step 4: Update Your Environment Variables

### For Local Development (`.env.local`):

```env
# Neon PostgreSQL Connection String
# Use the DIRECT connection string (without pgbouncer) for migrations
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# For production (Vercel), use the POOLED connection:
# DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
```

### Connection String Format:

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

## Step 5: Run Database Migrations

Since you're switching from MySQL to PostgreSQL, you'll need to:

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Push schema to Neon** (creates all tables):
   ```bash
   npx prisma db push
   ```

   OR create a new migration:
   ```bash
   npx prisma migrate dev --name init_postgres
   ```

3. **Verify connection**:
   ```bash
   npx prisma studio
   ```
   This will open Prisma Studio where you can view your database.

## Step 6: Seed Your Database (Optional)

If you have seed data:

```bash
npm run db:seed
```

## Step 7: Update Vercel Environment Variables

When deploying to Vercel:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add `DATABASE_URL` with your Neon connection string
3. **Use the POOLED connection** for production:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
   ```

## Neon Connection Types

### Direct Connection (for migrations)
- Use for: `prisma migrate`, `prisma db push`, `prisma studio`
- Format: `postgresql://...?sslmode=require`
- **Not recommended** for production serverless functions

### Pooled Connection (for production)
- Use for: Vercel production, serverless functions
- Format: `postgresql://...?sslmode=require&pgbouncer=true`
- **Recommended** for Next.js API routes

## Important Notes

### Connection Limits

- **Free tier**: 100 connections
- **Pro tier**: 500 connections
- Use connection pooling (`pgbouncer=true`) to stay within limits

### SSL Required

Neon requires SSL connections. Always include `?sslmode=require` in your connection string.

### Database Branching

Neon supports database branching (like Git branches). Useful for:
- Testing new features
- Staging environments
- Rollbacks

To create a branch:
1. Go to Neon Dashboard
2. Click **"Branches"**
3. Click **"Create branch"**

## Troubleshooting

### Connection Timeout

If you get connection timeouts:
- Use the **pooled connection** (`pgbouncer=true`)
- Check your region selection
- Verify your connection string is correct

### Migration Errors

If migrations fail:
- Make sure you're using the **direct connection** (no `pgbouncer`)
- Check that your schema is valid
- Try `npx prisma db push` instead of `migrate dev`

### SSL Errors

If you see SSL errors:
- Ensure `?sslmode=require` is in your connection string
- Check that your Neon project is active

## Free Tier Limits

Neon's free tier includes:
- ✅ 0.5 GB storage
- ✅ 100 connections
- ✅ Unlimited projects
- ✅ Database branching
- ✅ Automatic backups

Perfect for development and small production apps!

## Next Steps

1. ✅ Create Neon account
2. ✅ Create project
3. ✅ Copy connection string
4. ✅ Update `.env.local`
5. ✅ Run `npx prisma db push`
6. ✅ Test with `npx prisma studio`
7. ✅ Deploy to Vercel with Neon connection string

---

**Need Help?** Check Neon docs: https://neon.tech/docs

