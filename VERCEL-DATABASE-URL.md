# 🔧 Add DATABASE_URL to Vercel

## Your Connection String

```
postgresql://neondb_owner:npg_Yyl7enbuC5fh@ep-late-lab-ag5xlbrr-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Recommended Version (without channel_binding)

If you encounter connection issues, try this version without `channel_binding`:

```
postgresql://neondb_owner:npg_Yyl7enbuC5fh@ep-late-lab-ag5xlbrr-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## Steps to Add in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `mombasa_shisha_bongs`

2. **Navigate to Environment Variables**
   - Click **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Add DATABASE_URL**
   - Click **Add New**
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the connection string above
   - **Environment**: 
     - ✅ Check **Production**
     - ✅ Check **Preview** (optional)
     - ✅ Check **Development** (optional, for local dev)
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click the **three dots** (⋯) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger auto-deploy

## Verify It's Set

After adding, you should see:
- `DATABASE_URL` listed in Environment Variables
- Status shows it's enabled for Production

## Test Connection

After redeploying, check:
1. Visit your deployed site
2. Check Vercel Function Logs for any database errors
3. Try accessing a page that uses the database (like `/products`)

## Troubleshooting

### If you get connection errors:

1. **Check the connection string format**
   - Must start with `postgresql://`
   - No extra spaces or line breaks
   - SSL mode should be `?sslmode=require`

2. **Try without channel_binding**
   - Some Neon instances don't support `channel_binding=require`
   - Use: `postgresql://neondb_owner:npg_Yyl7enbuC5fh@ep-late-lab-ag5xlbrr-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require`

3. **Check Neon Dashboard**
   - Verify your database is running
   - Check connection limits
   - Verify IP whitelist (if enabled)

4. **Check Vercel Logs**
   - Go to Deployments → Your Deployment → Functions
   - Look for Prisma connection errors
   - Check runtime logs for specific error messages

## Security Note

⚠️ **Important**: This connection string contains your database password. 
- Never commit it to Git
- Never share it publicly
- Only add it to Vercel Environment Variables
- Consider rotating the password periodically

