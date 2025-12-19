# Email Setup Guide

## Problem
You're not receiving order notification emails.

## Solution

The email system uses Gmail SMTP. You need to configure Gmail App Password.

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### Step 2: Generate Gmail App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter name: "Mombasa Shisha Bongs"
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Add Environment Variables to Vercel

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

   **Variable 1:**
   - **Name:** `GMAIL_USER`
   - **Value:** `mombasashishabongs@gmail.com`
   - **Environment:** Production, Preview, Development

   **Variable 2:**
   - **Name:** `GMAIL_APP_PASSWORD`
   - **Value:** `[Your 16-character app password from Step 2]` (no spaces)
   - **Environment:** Production, Preview, Development

4. **Redeploy** your application after adding the variables

### Step 4: Verify Email Configuration

After deployment, check the logs when an order is placed:
- If emails are sending successfully, you'll see: `Email sent successfully`
- If there's an error, you'll see: `Email sending error: [error message]`

You can also check the admin panel at `/admin/notifications` to see email delivery status.

## Testing

1. Place a test order
2. Check your email inbox (and spam folder)
3. Check `/admin/notifications` to see if the email was sent
4. Check Vercel logs for any email errors

## Troubleshooting

### Still not receiving emails?

1. **Check spam folder** - Gmail might mark automated emails as spam initially
2. **Check Vercel logs** - Look for email sending errors
3. **Verify app password** - Make sure you copied the full 16-character password without spaces
4. **Check notification status** - Go to `/admin/notifications` to see if emails are marked as "FAILED"
5. **Verify environment variables** - Make sure both `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in Vercel

### Common Errors

- **"Invalid login"** - App password is incorrect or expired
- **"Connection timeout"** - Gmail SMTP might be blocked, try again
- **"Authentication failed"** - 2FA not enabled or app password not generated correctly

