# STEP 8 — MPESA DARAJA STK PUSH INTEGRATION

## Overview

This step implements the complete Mpesa Daraja STK Push payment integration, allowing customers to pay for orders directly via Mpesa mobile money.

---

## Implementation Summary

### ✅ Completed Components

1. **Mpesa Utility Library** (`src/lib/mpesa.ts`)
   - Access token generation
   - STK Push initiation
   - Phone number formatting
   - Password generation
   - Status querying

2. **API Endpoints**
   - `POST /api/mpesa/initiate` - Initiate STK Push payment
   - `POST /api/mpesa/callback` - Handle Mpesa callback responses

3. **Payment UI Components**
   - `MpesaPaymentButton` - Payment initiation component
   - Updated order page with payment status display

4. **Checkout Flow Integration**
   - Order creation without immediate payment
   - Payment initiation on order confirmation page
   - Real-time payment status updates

---

## File Structure

```
src/
├── lib/
│   └── mpesa.ts                          # Mpesa utility functions
├── app/
│   └── api/
│       └── mpesa/
│           ├── initiate/
│           │   └── route.ts              # STK Push initiation endpoint
│           └── callback/
│               └── route.ts              # Mpesa callback handler
├── components/
│   └── payment/
│       └── MpesaPaymentButton.tsx        # Payment button component
└── app/
    └── orders/
        └── [id]/
            └── page.tsx                   # Order page with payment integration
```

---

## Mpesa Utility Functions

### `getMpesaAccessToken()`
Generates OAuth access token from Mpesa Daraja API.

**Returns:** `Promise<string>` - Access token

**Usage:**
```typescript
const token = await getMpesaAccessToken()
```

---

### `initiateSTKPush()`
Initiates STK Push payment request.

**Parameters:**
- `phoneNumber: string` - Customer phone number
- `amount: number` - Payment amount
- `accountReference: string` - Order number or reference
- `transactionDesc: string` - Transaction description

**Returns:**
```typescript
{
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}
```

**Usage:**
```typescript
const response = await initiateSTKPush(
  '+254712345678',
  5000,
  'ORD-123',
  'Payment for order ORD-123'
)
```

---

### `formatMpesaPhoneNumber()`
Formats phone number to Mpesa format (254XXXXXXXXX).

**Parameters:**
- `phone: string` - Phone number in any format

**Returns:** `string` - Formatted phone number

**Supported Formats:**
- `0712345678` → `254712345678`
- `+254712345678` → `254712345678`
- `254712345678` → `254712345678`

---

### `generateMpesaPassword()`
Generates Base64 encoded password for STK Push.

**Parameters:**
- `shortcode: string` - Business shortcode
- `passkey: string` - Mpesa passkey

**Returns:** `string` - Base64 encoded password

---

## API Endpoints

### POST /api/mpesa/initiate

**Purpose:** Initiate Mpesa STK Push payment

**Authentication:** Required (Clerk)

**Request Body:**
```json
{
  "orderId": "ord_123",
  "phoneNumber": "+254712345678"
}
```

**Validation:**
- Uses `initiateMpesaSchema` from `@/utils/validations`
- Validates Kenyan phone number format: `+254[17]XXXXXXXX`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "checkoutRequestId": "ws_CO_191220231020440123",
    "message": "Success. Request accepted for processing",
    "orderId": "ord_123"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Order not found
- `400` - Validation error or payment already processed

**Flow:**
1. Validate request and authenticate user
2. Fetch order from database
3. Check payment status (must be PENDING)
4. Generate Mpesa access token
5. Initiate STK Push request
6. Create/update payment record with `PROCESSING` status
7. Update order payment status to `PROCESSING`
8. Return checkout request ID

---

### POST /api/mpesa/callback

**Purpose:** Handle Mpesa callback responses

**Authentication:** None (public endpoint, secured by Mpesa IP whitelist)

**Request Body:**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_191220231020440123",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {
            "Name": "Amount",
            "Value": 5000
          },
          {
            "Name": "MpesaReceiptNumber",
            "Value": "QGH12345"
          },
          {
            "Name": "TransactionDate",
            "Value": "20231219102044"
          },
          {
            "Name": "PhoneNumber",
            "Value": "254712345678"
          }
        ]
      }
    }
  }
}
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Flow:**
1. Parse callback body
2. Find payment by `CheckoutRequestID`
3. If `ResultCode === 0` (success):
   - Extract receipt number, transaction ID, amount
   - Update payment status to `PAID`
   - Update order payment status to `PAID`
   - Update order status to `PROCESSING`
   - Set `paidAt` timestamp
4. If `ResultCode !== 0` (failure):
   - Update payment status to `FAILED`
   - Update order payment status to `FAILED`
   - Store error message

---

## Payment Flow

### 1. Order Creation
```
User fills checkout form
    ↓
POST /api/orders
    ↓
Order created with status: PENDING, paymentStatus: PENDING
    ↓
Redirect to /orders/[id]
```

### 2. Payment Initiation
```
User clicks "Pay with Mpesa" button
    ↓
Enter phone number
    ↓
POST /api/mpesa/initiate
    ↓
STK Push sent to user's phone
    ↓
Payment status: PROCESSING
```

### 3. Payment Completion
```
User enters Mpesa PIN on phone
    ↓
Mpesa sends callback to /api/mpesa/callback
    ↓
Payment status: PAID
Order status: PROCESSING
    ↓
User sees success message on order page
```

---

## Environment Variables

Add to `.env.local`:

```env
# Mpesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox  # or 'production'
```

**Important Notes:**
- `MPESA_CALLBACK_URL` must be publicly accessible (not localhost in production)
- For sandbox testing, use ngrok or similar to expose localhost
- In production, use your actual domain with HTTPS

---

## Testing

### Sandbox Testing

1. **Get Sandbox Credentials:**
   - Visit: https://developer.safaricom.co.ke/
   - Create account and app
   - Get consumer key, secret, passkey, and shortcode

2. **Test Phone Numbers:**
   - Use test numbers from Mpesa Daraja documentation
   - Example: `254708374149` (test number)

3. **Test Flow:**
   ```
   1. Create order
   2. Click "Pay with Mpesa"
   3. Enter test phone number
   4. Check phone for STK Push
   5. Enter test PIN (usually 0000)
   6. Verify callback received
   7. Check payment status updated
   ```

### Production Setup

1. **Get Production Credentials:**
   - Complete Mpesa Daraja onboarding
   - Get production consumer key, secret, passkey, shortcode

2. **Configure Callback URL:**
   - Set `MPESA_CALLBACK_URL` to your production domain
   - Whitelist your server IP in Mpesa dashboard

3. **Security:**
   - Use HTTPS for callback URL
   - Implement IP whitelist validation (optional)
   - Store credentials securely (use environment variables)

---

## Error Handling

### Common Errors

1. **"Invalid phone number"**
   - Ensure phone number is in Kenyan format
   - Use `+254` or `0` prefix

2. **"Failed to get Mpesa access token"**
   - Check consumer key and secret
   - Verify network connectivity
   - Check Mpesa API status

3. **"STK Push failed"**
   - Verify shortcode and passkey
   - Check account balance (for test account)
   - Ensure callback URL is accessible

4. **"Payment not found"**
   - CheckoutRequestID mismatch
   - Payment record not created
   - Database connection issue

---

## Security Considerations

1. **Authentication:**
   - Payment initiation requires user authentication
   - Only order owner can initiate payment

2. **Callback Security:**
   - Validate callback source (IP whitelist recommended)
   - Verify callback structure before processing
   - Log all callbacks for audit

3. **Data Protection:**
   - Never log full payment details
   - Encrypt sensitive data in database
   - Use HTTPS for all API calls

4. **Rate Limiting:**
   - Implement rate limiting on payment endpoints
   - Prevent payment spam/abuse

---

## Next Steps

After completing this step:

1. ✅ **Step 8 Complete** - Mpesa integration implemented
2. ⏭️ **Step 9** - Notifications System (Email + SMS/WhatsApp)
3. ⏭️ **Step 10** - Security Hardening
4. ⏭️ **Step 11** - Deployment
5. ⏭️ **Step 12** - Final Documentation

---

## Troubleshooting

### Payment Not Appearing on Phone

1. Check phone number format
2. Verify STK Push was sent (check logs)
3. Check Mpesa account balance
4. Ensure phone has network connection

### Callback Not Received

1. Verify callback URL is publicly accessible
2. Check server logs for incoming requests
3. Test callback URL manually
4. Verify IP whitelist (if configured)

### Payment Status Stuck on PROCESSING

1. Manually query STK Push status
2. Check callback logs
3. Verify database connection
4. Check for error messages in payment record

---

## Additional Resources

- [Mpesa Daraja API Documentation](https://developer.safaricom.co.ke/docs)
- [STK Push Guide](https://developer.safaricom.co.ke/docs#stk-push)
- [Sandbox Testing Guide](https://developer.safaricom.co.ke/docs#sandbox)

---

**Status:** ✅ Complete
**Date:** 2024-12-11
**Next Step:** Step 9 - Notifications System

