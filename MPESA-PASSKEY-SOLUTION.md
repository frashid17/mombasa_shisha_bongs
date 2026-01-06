# M-Pesa Passkey Solution

## The Issue
The Passkey is not visible in your M-Pesa Developer Portal or Daraja Simulator.

## Why You Need the Passkey
The Passkey is required for STK Push (Lipa na M-Pesa Online) transactions. It's used to generate the password for API requests.

## Solutions

### Option 1: Check Your Email (Most Common)
1. **Check your email inbox** (including spam/junk folder)
2. Look for an email from Safaricom with subject like:
   - "M-Pesa Daraja API Credentials"
   - "Your Passkey for [App Name]"
   - "Lipa na M-Pesa Online Passkey"
3. The passkey is usually a long string (64+ characters)

### Option 2: Verify Your App Type
1. Go to https://developer.safaricom.co.ke/
2. Click on "My Apps"
3. Check your app details
4. **Ensure it includes:**
   - "M-Pesa Express (STK Push)" product
   - OR "Lipa na M-Pesa Online" product
5. If it doesn't, you may need to:
   - Create a new app with STK Push enabled
   - OR add STK Push to your existing app

### Option 3: Use Daraja Simulator
1. In the Daraja Simulator you showed:
   - Try clicking "Test Credentials" button
   - This might reveal or generate a passkey
   - Check if the simulator shows any credentials after testing

### Option 4: Contact Safaricom Support
1. Go to the Developer Portal
2. Look for "Support" or "Help" section
3. Contact them and ask for:
   - "STK Push Passkey for [Your App Name]"
   - "Lipa na M-Pesa Online Passkey"
4. Provide your:
   - App name
   - Consumer Key
   - Account email

### Option 5: Check App Settings
1. In your app dashboard, look for:
   - "API Settings"
   - "STK Push Settings"
   - "Lipa na M-Pesa Online" section
2. The passkey might be hidden behind a "Show" or "Reveal" button

## Temporary Workaround (For Testing Only)

If you need to test the code structure while waiting for the passkey, you can temporarily use a placeholder. **This will NOT work for actual API calls**, but will let you test the UI:

```env
MPESA_PASSKEY=placeholder_passkey_for_testing_only
```

**Important:** Replace this with the real passkey once you receive it from Safaricom.

## What the Passkey Looks Like
- Usually 64+ characters
- Hex string format
- Example: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`

## Next Steps
1. Check your email first
2. Verify your app has STK Push enabled
3. Try the Daraja Simulator "Test Credentials" button
4. Contact Safaricom support if still not found

Once you have the passkey, add it to `.env.local`:
```env
MPESA_PASSKEY=your_actual_passkey_here
```

Then restart your server:
```bash
npm run dev
```

