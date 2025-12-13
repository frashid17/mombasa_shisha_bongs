# Paystack Integration Plan

## Why Paystack?

### Advantages over Mpesa Daraja:
1. **Easier Integration** - Better documentation, simpler API
2. **More Reliable** - Better sandbox environment, fewer issues
3. **Multiple Payment Methods** - Cards, Bank Transfer, Mobile Money (including Mpesa)
4. **Better Webhooks** - More reliable callback system
5. **Better Dashboard** - Easy to track payments and transactions
6. **Supports Kenya** - Paystack operates in Kenya

### Payment Methods Supported:
- ✅ Credit/Debit Cards (Visa, Mastercard)
- ✅ Mpesa (via Paystack)
- ✅ Bank Transfer
- ✅ Mobile Money (Airtel Money, etc.)

---

## Implementation Plan

### Phase 1: Setup Paystack Account
1. Sign up at https://paystack.com/
2. Get API keys (Test and Live)
3. Configure webhook URL

### Phase 2: Database Changes
- Add Paystack-specific fields to Payment model
- Update PaymentMethod enum to include `PAYSTACK`

### Phase 3: Backend Implementation
1. Create Paystack utility library (`src/lib/paystack.ts`)
2. Create payment initiation endpoint (`/api/paystack/initiate`)
3. Create webhook handler (`/api/paystack/webhook`)
4. Update order creation to support Paystack

### Phase 4: Frontend Implementation
1. Create PaystackPaymentButton component
2. Update checkout page to show Paystack option
3. Add payment status handling

### Phase 5: Testing
1. Test with Paystack test cards
2. Test webhook callbacks
3. Test payment flow end-to-end

---

## Required Changes

### 1. Database Schema Updates
```prisma
enum PaymentMethod {
  MPESA
  PAYSTACK      // New
  CARD
  BANK_TRANSFER
  CASH_ON_DELIVERY
}

model Payment {
  // ... existing fields
  
  // Paystack Specific Fields
  paystackReference    String?  @unique
  paystackAuthorizationCode String?
  paystackCustomerCode  String?
  paystackChannel      String?  // card, bank, mobile_money
}
```

### 2. Environment Variables
```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. New Files to Create
- `src/lib/paystack.ts` - Paystack API utilities
- `src/app/api/paystack/initiate/route.ts` - Payment initiation
- `src/app/api/paystack/webhook/route.ts` - Webhook handler
- `src/components/payment/PaystackPaymentButton.tsx` - Payment button

### 4. Files to Update
- `prisma/schema.prisma` - Add Paystack fields
- `src/app/checkout/page.tsx` - Add Paystack option
- `src/utils/validations.ts` - Update payment method enum
- `src/app/orders/[id]/page.tsx` - Show Paystack payment status

---

## Paystack Integration Flow

### 1. Payment Initiation
```
User clicks "Pay with Paystack"
    ↓
POST /api/paystack/initiate
    ↓
Create Paystack transaction
    ↓
Return payment URL or authorization URL
    ↓
Redirect user to Paystack payment page
```

### 2. Payment Completion
```
User completes payment on Paystack
    ↓
Paystack sends webhook to /api/paystack/webhook
    ↓
Verify webhook signature
    ↓
Update payment status in database
    ↓
Update order status
    ↓
Send confirmation email
```

---

## Benefits

1. **No ngrok needed** - Paystack webhooks work with production URLs
2. **Better testing** - Test cards work reliably
3. **Multiple payment options** - Users can choose card or mobile money
4. **Better UX** - Paystack handles the payment UI
5. **Automatic retries** - Paystack handles failed payments better

---

## Migration Strategy

### Option 1: Replace Mpesa (Recommended)
- Remove Mpesa integration
- Use Paystack for all payments
- Simpler codebase

### Option 2: Support Both
- Keep Mpesa for users who prefer it
- Add Paystack as alternative
- More complex but gives users choice

---

## Next Steps

Would you like me to:
1. ✅ Implement Paystack integration (recommended)
2. Keep both Mpesa and Paystack
3. Just add Paystack as an alternative

Let me know and I'll start implementing!

