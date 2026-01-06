# Fix Payment Submission Error

## Error
```
Invalid `prisma.payment.create()` invocation: Unknown argument `mpesaSenderName`
```

## Solution

### Step 1: Run Database Migration

The `mpesaSenderName` field has been added to the schema but the database hasn't been updated yet. Run:

```bash
npx prisma db push
npx prisma generate
```

This will:
- Add the `mpesaSenderName` column to the `payments` table
- Regenerate the Prisma client with the new field

### Step 2: Restart Your Server

After running the migration, restart your Next.js development server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## What Was Updated

### 1. Database Schema
- Added `mpesaSenderName String?` field to `Payment` model

### 2. Payments Page (`/admin/payments`)
- Shows order items in an expandable section
- Click on the item count to expand/collapse
- Displays product images, names, quantities, prices, and subtotals
- Shows order total and amount paid

### 3. Email Notifications
- Admin email now includes:
  - Order items with images
  - Product names, quantities, prices
  - Order total
  - Amount paid

### 4. Payment Submission
- Customers can submit M-Pesa reference number and sender name
- Admin receives detailed email with order items
- Admin can approve/reject payments from `/admin/payments` page

## After Migration

Once you run `npx prisma db push`, the payment submission should work correctly and you'll be able to:
1. Submit payment details with reference number and sender name
2. See order items on the payments page
3. Receive emails with order details

