# 🛒 Abandoned Cart Recovery Setup

## ✅ Implementation Complete

The abandoned cart recovery system is now fully implemented! Here's what was added:

### Features

1. **Automatic Cart Tracking**
   - Tracks carts after 30 minutes of inactivity
   - Works for both logged-in users and guests
   - Stores cart data, email, phone, and session info

2. **Email Reminders**
   - 3 automated reminder emails:
     - **1st reminder**: 1 hour after abandonment
     - **2nd reminder**: 24 hours after abandonment (includes 10% discount code)
     - **3rd reminder**: 3 days after abandonment (final reminder)

3. **Smart Conversion Tracking**
   - Automatically marks carts as converted when orders are placed
   - Prevents duplicate reminders

---

## 🔧 Setup Instructions

### Step 1: Database Migration

Run Prisma migration to add the new enum value:

```bash
npx prisma generate
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name add_abandoned_cart_reminder_type
```

### Step 2: Environment Variables

Add to your `.env.local` and Vercel environment variables:

```env
# Cron Secret (for securing the reminder endpoint)
CRON_SECRET=your-secure-random-string-here

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Generate a secure CRON_SECRET:**
```bash
# On macOS/Linux
openssl rand -hex 32

# Or use any secure random string generator
```

### Step 3: Set Up Cron Job

You need to call the reminder endpoint periodically (recommended: every hour).

#### Option A: Vercel Cron Jobs (Recommended)

1. Create `vercel.json` in your project root (if not exists):

```json
{
  "crons": [
    {
      "path": "/api/admin/abandoned-carts/send-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour (at minute 0).

2. Add the cron secret header in Vercel:
   - Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
   - Add `CRON_SECRET` with your secure value

3. Vercel will automatically call the endpoint with the secret in the `Authorization` header.

#### Option B: External Cron Service (Cron-job.org, EasyCron, etc.)

1. Set up a cron job to call:
   ```
   POST https://your-app.vercel.app/api/admin/abandoned-carts/send-reminders
   ```

2. Add header:
   ```
   Authorization: Bearer your-cron-secret-here
   ```

3. Schedule: Every hour (`0 * * * *`)

#### Option C: Manual Testing

You can manually trigger reminders for testing:

```bash
curl -X POST https://your-app.vercel.app/api/admin/abandoned-carts/send-reminders \
  -H "Authorization: Bearer your-cron-secret-here"
```

---

## 📊 How It Works

### Cart Abandonment Detection

1. **User adds items to cart** → Cart stored in localStorage (Zustand)
2. **30 minutes of inactivity** → Cart automatically tracked as abandoned
3. **Tracking happens automatically** via `useAbandonedCartTracking` hook
4. **Cart data saved** to database with user/session info

### Reminder Sending

1. **Cron job runs** (every hour)
2. **Finds carts needing reminders**:
   - Not converted
   - Have email address
   - Match timing criteria (1h, 24h, 3 days)
3. **Sends email reminders** with:
   - Cart items list
   - Total amount
   - Direct link to cart
   - Discount code (on 2nd+ reminders)
4. **Updates reminder count** to prevent duplicates

### Conversion Tracking

1. **User places order** → Order API checks for abandoned carts
2. **Marks carts as converted** by userId or email
3. **Prevents future reminders** for that cart

---

## 📧 Email Template Features

- **Professional HTML design** with gradient header
- **Cart items table** with images and prices
- **Clear call-to-action** button
- **Discount code** on 2nd and 3rd reminders (`COMEBACK10`)
- **Mobile-responsive** design
- **Plain text fallback** for email clients

---

## 🧪 Testing

### Test Cart Abandonment Tracking

1. Add items to cart
2. Wait 30+ minutes (or modify `ABANDONMENT_DELAY` in `useAbandonedCartTracking.ts` for testing)
3. Check database: `abandoned_carts` table should have new entry

### Test Reminder Sending

1. Create test abandoned cart in database:
   ```sql
   INSERT INTO abandoned_carts (id, "userId", email, "cartData", "createdAt", "updatedAt")
   VALUES (
     'test-id',
     NULL,
     'test@example.com',
     '[{"id":"prod-1","name":"Test Product","price":1000,"quantity":1}]',
     NOW() - INTERVAL '2 hours',
     NOW() - INTERVAL '2 hours'
   );
   ```

2. Call reminder endpoint manually (see Option C above)

3. Check email inbox for reminder

### Test Conversion

1. Place an order with email that has abandoned cart
2. Check database: `abandoned_carts.converted` should be `true`

---

## 📈 Monitoring

### View Abandoned Carts (Admin)

You can view abandoned carts via the API:

```bash
GET /api/abandoned-carts
Authorization: Bearer <your-auth-token>
```

### Check Reminder Stats

The reminder endpoint returns stats:

```json
{
  "success": true,
  "message": "Reminders sent: 5, Failed: 0",
  "data": {
    "sent": 5,
    "failed": 0,
    "total": 5
  }
}
```

---

## ⚙️ Configuration

### Adjust Timing

Edit `src/hooks/useAbandonedCartTracking.ts`:

```typescript
const ABANDONMENT_DELAY = 30 * 60 * 1000 // 30 minutes
const TRACKING_INTERVAL = 5 * 60 * 1000 // Check every 5 minutes
```

### Adjust Reminder Schedule

Edit `src/app/api/admin/abandoned-carts/send-reminders/route.ts`:

```typescript
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
```

### Customize Email Template

Edit `src/lib/notifications/abandoned-cart.ts` to customize:
- Subject lines
- Email content
- Discount codes
- Styling

---

## 🚀 Deployment Checklist

- [ ] Run `npx prisma generate` and `npx prisma db push`
- [ ] Set `CRON_SECRET` in Vercel environment variables
- [ ] Set up Vercel cron job (or external cron service)
- [ ] Test reminder endpoint manually
- [ ] Verify email delivery
- [ ] Monitor abandoned carts via API

---

## 📝 Notes

- **Privacy**: Only tracks carts with email addresses
- **Performance**: Tracking is non-blocking and async
- **Reliability**: Failed reminders don't block order creation
- **Scalability**: Can handle thousands of abandoned carts

---

**Status**: ✅ Ready for Production!

