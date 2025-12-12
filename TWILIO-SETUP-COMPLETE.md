# Twilio Setup - Add These to .env.local

## ✅ Your Twilio Credentials

Add these to your `.env.local` file:

```env
# Email Configuration (Resend)
EMAIL_API_KEY=re_RdKA1u9P_4NPzyvWxWxdrZ8wmsTyHr8aN
EMAIL_FROM=noreply@mombasashishabongs.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # ⚠️ You need to get this from Twilio (see below)
```

## 📱 Get Your Twilio Phone Number

You still need to get a phone number from Twilio:

### Step 1: Log into Twilio Console
1. Go to: https://console.twilio.com
2. Log in with your account

### Step 2: Get a Phone Number
1. Click **Phone Numbers** in the left sidebar
2. Click **Manage** → **Buy a number**
3. Select a country (US numbers are free during trial)
4. Click **Search**
5. Click **Buy** on any available number
6. Copy the number (it will look like `+1234567890`)

### Step 3: Add to .env.local
Replace `+1234567890` in the example above with your actual Twilio phone number.

## 🧪 Test It

After adding the phone number:

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Create a test order
3. Check console logs - you should see SMS being sent
4. Check your phone for the SMS!

## ✅ Complete .env.local Example

```env
# Database Configuration
DATABASE_URL="mysql://root@localhost:3306/mombasa_shisha_bongs"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d29ya2FibGUtbXV0dC00My5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_xGShHZ3hcXsw7yWmHXZF9SPUbdX2rHGtMeTvYszWYv
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Mpesa Daraja API Configuration
MPESA_CONSUMER_KEY=rLzMJTQmdZ9sMHAQl0RdiDKdgprdyKNMYcS1ZInmyoxNBPHQ
MPESA_CONSUMER_SECRET=7g1eLaIOebWYe5MrVoGN5612Pfqh4VVyF4m8dLQJ7COVFwysS4DMNz6cnwjlScVq
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox

# Email Configuration (Resend)
EMAIL_API_KEY=re_RdKA1u9P_4NPzyvWxWxdrZ8wmsTyHr8aN
EMAIL_FROM=noreply@mombasashishabongs.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # ⚠️ Replace with your Twilio phone number

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Admin Configuration
ADMIN_EMAIL=admin@mombasashishabongs.com
```

## 🎉 You're Almost Done!

Just get the phone number from Twilio and add it to `.env.local`, then restart your server!

