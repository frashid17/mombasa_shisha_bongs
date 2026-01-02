# Production Email Setup Guide

## Problem
Admin emails are not being sent in production even though they work on localhost. This is because Gmail SMTP credentials are not configured in the production environment.

## Solution: Configure Gmail App Password

### Step 1: Enable 2-Step Verification on Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification (if not already enabled)

### Step 2: Generate App Password

1. Still in **Security** settings, scroll down to "Signing in to Google"
2. Click **App passwords** (you may need to search for it)
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: **Mombasa Shisha Bongs Production**
6. Click **Generate**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

⚠️ **Important:** Save this password immediately - you won't be able to see it again!

### Step 3: Set Environment Variables in Production

Add these environment variables to your production hosting platform (Vercel, Railway, etc.):

#### For Vercel:
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

```env
GMAIL_USER=mombasashishabongs@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password-here
ADMIN_EMAIL=mombasashishabongs@gmail.com
```

**Important Notes:**
- Remove spaces from the app password (e.g., `abcdefghijklmnop` not `abcd efgh ijkl mnop`)
- The `GMAIL_USER` should be the Gmail address you're using to send emails
- The `ADMIN_EMAIL` is where admin notifications will be sent

#### For Railway:
1. Go to your project dashboard
2. Click **Variables** tab
3. Add the same variables as above

#### For Other Platforms:
Add the environment variables in your platform's environment variable settings.

### Step 4: Redeploy Your Application

After adding the environment variables:
1. **Redeploy your application** to apply the changes
2. The new environment variables will be available on the next deployment

### Step 5: Verify Configuration

1. Place a test order in production
2. Check the admin panel at `/admin/notifications`
3. Look for the order confirmation notification
4. If status is **SENT**, emails are working! ✅
5. If status is **FAILED**, check the error message for details

## Troubleshooting

### Error: "Gmail credentials not configured"

**Cause:** Environment variables are not set or not loaded

**Solution:**
1. Verify environment variables are set in your hosting platform
2. Ensure variable names are exactly: `GMAIL_USER` and `GMAIL_APP_PASSWORD`
3. Redeploy the application after adding variables
4. Check that there are no typos or extra spaces

### Error: "Invalid login" or "Authentication failed"

**Cause:** Wrong Gmail credentials or app password

**Solution:**
1. Verify `GMAIL_USER` matches the Gmail account
2. Generate a new app password and update `GMAIL_APP_PASSWORD`
3. Ensure you're using an **App Password**, not your regular Gmail password
4. Make sure 2-Step Verification is enabled

### Error: "Connection timeout" or "SMTP error"

**Cause:** Network/firewall issues or Gmail blocking

**Solution:**
1. Check your hosting platform's network settings
2. Verify SMTP port 587 is not blocked
3. Try using port 465 with `secure: true` (requires code change)
4. Check Gmail account for security alerts

### Emails Still Not Sending

1. **Check notification logs:**
   - Go to `/admin/notifications` in admin panel
   - Look for failed notifications
   - Check the error message column

2. **Check server logs:**
   - Look for email-related errors in your hosting platform's logs
   - Search for "Email sending error" or "Gmail credentials"

3. **Test email sending:**
   - Create a test order
   - Immediately check `/admin/notifications`
   - Verify the notification status and error message

## Alternative: Using a Different Email Service

If Gmail doesn't work, you can use other email services:

### Option 1: Resend (Recommended)
- Sign up at https://resend.com
- Get API key
- Update code to use Resend API instead of Gmail SMTP

### Option 2: SendGrid
- Sign up at https://sendgrid.com
- Get API key
- Update code to use SendGrid API

### Option 3: AWS SES
- Set up AWS SES
- Get SMTP credentials
- Update SMTP configuration in code

## Current Email Configuration

The system currently uses:
- **SMTP Server:** smtp.gmail.com
- **Port:** 587
- **Encryption:** TLS
- **From Address:** mombasashishabongs@gmail.com (or EMAIL_FROM env var)
- **From Name:** Mombasa Shisha Bongs

## Verification Checklist

- [ ] 2-Step Verification enabled on Gmail account
- [ ] App Password generated and saved
- [ ] `GMAIL_USER` environment variable set in production
- [ ] `GMAIL_APP_PASSWORD` environment variable set in production (no spaces)
- [ ] `ADMIN_EMAIL` environment variable set in production
- [ ] Application redeployed after adding variables
- [ ] Test order placed to verify emails are sending
- [ ] Checked `/admin/notifications` for email status

## Need Help?

If emails still aren't working after following this guide:
1. Check the error message in `/admin/notifications`
2. Review server logs for detailed error information
3. Verify all environment variables are correctly set
4. Contact technical support with:
   - Error messages from notifications panel
   - Server log excerpts
   - Confirmation that environment variables are set

