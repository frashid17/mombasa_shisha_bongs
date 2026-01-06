# M-Pesa Manual Payment Setup

## Overview
The payment system has been changed from STK Push to manual "Send Money" flow. Customers now send money directly to your M-Pesa number and submit payment details for admin approval.

## Changes Made

### 1. Database Schema
- Added `mpesaSenderName` field to `Payment` model
- Run migration: `npx prisma db push` and `npx prisma generate`

### 2. Payment Component
- **New Component**: `src/components/payment/MpesaManualPayment.tsx`
  - Shows M-Pesa number to send money to
  - Form for reference number and sender name
  - Submits payment details for admin approval

### 3. API Endpoints
- **POST `/api/payments/submit`**: Submit payment details (reference number, sender name)
- **GET `/api/admin/payments`**: Get all pending payments
- **POST `/api/admin/payments/[id]/approve`**: Approve a payment
- **POST `/api/admin/payments/[id]/reject`**: Reject a payment

### 4. Admin Pages
- **New Page**: `/admin/payments`
  - Lists all pending M-Pesa payments
  - Shows order details, customer info, payment reference, and sender name
  - Approve/Reject buttons for each payment

### 5. Email Notifications
- Admin receives email when payment details are submitted
- Customer receives email when payment is approved
- Includes order details and payment information

## Configuration

### M-Pesa Number
Update the M-Pesa number in `src/components/payment/MpesaManualPayment.tsx`:
```typescript
const MPESA_NUMBER = '+2547117037140' // Change this to your M-Pesa number
```

## Admin Navigation

Add a "Payments" link to your admin sidebar navigation. The link should point to `/admin/payments`.

## Workflow

1. **Customer places order** → Selects M-Pesa payment
2. **Customer sees M-Pesa number** → Sends money via their M-Pesa app
3. **Customer submits payment details** → Enters reference number and sender name
4. **Admin receives email** → Notification with payment details
5. **Admin reviews payment** → Goes to `/admin/payments` page
6. **Admin approves payment** → Verifies payment in M-Pesa account, clicks "Approve"
7. **Order status updates** → Payment status changes to PAID, order status to CONFIRMED
8. **Customer receives email** → Notification that payment was approved and order will be processed

## Testing

1. Create an order with M-Pesa payment
2. Submit payment details with test reference number
3. Check admin email for notification
4. Go to `/admin/payments` page
5. Approve the payment
6. Verify order status changed to PAID
7. Check customer email for approval notification

## Next Steps

1. **Run database migration**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. **Update M-Pesa number** in `MpesaManualPayment.tsx`

3. **Add Payments link** to admin sidebar navigation (if not already added)

4. **Test the flow** end-to-end

