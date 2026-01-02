# Connection Pool Timeout Fix

## Problem
You're getting this error:
```
Timed out fetching a new connection from the connection pool. 
More info: http://pris.ly/d/connection-pool 
(Current connection pool timeout: 10, connection limit: 5)
```

This happens when:
- Too many concurrent database requests
- Connection pool is too small (default: 5 connections)
- Pool timeout is too short (default: 10 seconds)

## Solution

### Option 1: Update DATABASE_URL (Recommended)

Add connection pool parameters to your `DATABASE_URL` environment variable:

**Current format:**
```
postgresql://user:password@host/database?sslmode=require
```

**Updated format (with pool parameters):**
```
postgresql://user:password@host/database?sslmode=require&connection_limit=20&pool_timeout=20
```

**For Neon/Supabase (with pgbouncer):**
```
postgresql://user:password@host/database?sslmode=require&pgbouncer=true&connection_limit=20&pool_timeout=20
```

### Parameters Explained

- **`connection_limit=20`**: Maximum number of connections in the pool (default: 5)
  - Increase this if you have many concurrent requests
  - Recommended: 10-20 for most applications
  - Higher values use more database connections

- **`pool_timeout=20`**: Time to wait for a connection in seconds (default: 10)
  - Increase this if you're getting timeout errors
  - Recommended: 20-30 seconds
  - Higher values give more time to get a connection

- **`pgbouncer=true`**: Enable connection pooling (for Neon/Supabase)
  - Required for serverless PostgreSQL providers
  - Helps manage connections efficiently

### Option 2: Update Environment Variables

#### For Vercel:
1. Go to your project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Update it to include pool parameters:
   ```
   postgresql://...?sslmode=require&connection_limit=20&pool_timeout=20&pgbouncer=true
   ```
4. **Redeploy** your application

#### For Railway:
1. Go to your project → **Variables**
2. Update `DATABASE_URL` with pool parameters
3. **Redeploy** your application

#### For Other Platforms:
Update the `DATABASE_URL` environment variable with the pool parameters and redeploy.

## Code Changes Made

I've updated the code to:
1. ✅ **Add retry logic** for connection pool timeouts
2. ✅ **Wrap all notification database operations** with retry logic
3. ✅ **Increase retry attempts** from 2 to 3
4. ✅ **Increase retry delay** from 500ms to 1000ms
5. ✅ **Detect connection pool timeout errors** and retry automatically

## Verification

After updating your `DATABASE_URL`:

1. **Redeploy your application**
2. **Test with concurrent requests:**
   - Place multiple orders simultaneously
   - Check if connection pool errors are resolved
3. **Monitor logs:**
   - Look for connection pool timeout errors
   - Should see retry attempts if issues occur

## Troubleshooting

### Still Getting Timeout Errors?

1. **Increase connection_limit:**
   ```
   connection_limit=30
   ```

2. **Increase pool_timeout:**
   ```
   pool_timeout=30
   ```

3. **Check database provider limits:**
   - Neon free tier: 100 connections
   - Supabase free tier: 60 connections
   - Ensure your `connection_limit` doesn't exceed provider limits

4. **Check for connection leaks:**
   - Ensure all database operations complete
   - Check for long-running queries
   - Monitor active connections in your database dashboard

### Database Provider Limits

- **Neon Free Tier**: 100 connections max
- **Neon Pro Tier**: 500 connections max
- **Supabase Free Tier**: 60 connections max
- **Supabase Pro Tier**: 200 connections max

Set `connection_limit` below your provider's limit.

## Example Connection Strings

### Neon (Pooled)
```
postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=20&pool_timeout=20
```

### Supabase (Pooled)
```
postgresql://user:pass@db.xxx.supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=20&pool_timeout=20
```

### Standard PostgreSQL
```
postgresql://user:pass@host:5432/database?sslmode=require&connection_limit=20&pool_timeout=20
```

## Next Steps

1. ✅ Update `DATABASE_URL` with pool parameters
2. ✅ Redeploy application
3. ✅ Test with concurrent requests
4. ✅ Monitor for connection pool errors
5. ✅ Adjust parameters if needed

The code now automatically retries on connection pool timeouts, but updating the `DATABASE_URL` is the best long-term solution.

