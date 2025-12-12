# Mpesa API Troubleshooting - 400 Bad Request

## Current Issue

You're getting a **400 Bad Request** error when trying to generate an access token. This typically means:

1. **Invalid Credentials** - Consumer Key or Secret might be incorrect
2. **App Not Activated** - The app might not be fully set up in the Mpesa Developer Portal
3. **Wrong Environment** - Credentials might be for a different environment

## Verification Steps

### 1. Verify Your Credentials in Mpesa Portal

1. Go to https://developer.safaricom.co.ke/
2. Log in to your account
3. Navigate to **"My Apps"**
4. Click on your app
5. **Double-check** these values match what's in your `.env.local`:
   - Consumer Key
   - Consumer Secret
   - Passkey
   - Shortcode

### 2. Check App Status

Make sure your app is:
- ✅ **Created** and visible in "My Apps"
- ✅ **Active** (not pending or disabled)
- ✅ **Has the correct product** (Lipa Na M-Pesa Sandbox)

### 3. Verify Credentials Format

Your credentials should be:
- **Consumer Key**: Long string (usually 40-50 characters)
- **Consumer Secret**: Long string (usually 60-70 characters)
- **Passkey**: Long string (usually 64+ characters, hex format)
- **Shortcode**: `174379` for sandbox

### 4. Common Issues

#### Issue: Credentials Copied Incorrectly
- Make sure there are **no extra spaces** before or after the values
- Don't include quotes around the values in `.env.local`
- Check for hidden characters

#### Issue: App Not Fully Created
- Sometimes apps need a few minutes to activate
- Try refreshing the portal and checking again
- Make sure you completed all steps in app creation

#### Issue: Wrong Product Selected
- Make sure you selected **"Lipa Na M-Pesa Sandbox"** when creating the app
- If you didn't, you may need to create a new app

### 5. Test with Manual API Call

You can test the credentials directly using curl:

```bash
# Get your credentials from .env.local
CONSUMER_KEY="your_consumer_key"
CONSUMER_SECRET="your_consumer_secret"

# Create base64 encoded credentials
CREDENTIALS=$(echo -n "$CONSUMER_KEY:$CONSUMER_SECRET" | base64)

# Test the API call
curl -X GET "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" \
  -H "Authorization: Basic $CREDENTIALS"
```

If this works, you should get:
```json
{
  "access_token": "abc123...",
  "expires_in": "3599"
}
```

If it fails, the credentials are definitely wrong.

## Next Steps

1. **Double-check credentials** in the Mpesa Developer Portal
2. **Verify app is active** and has the correct product
3. **Try regenerating credentials** if needed (some portals have this option)
4. **Contact Mpesa Support** if credentials are definitely correct but still failing

## Alternative: Create New App

If you're having persistent issues, you can:
1. Create a new app in the Mpesa Developer Portal
2. Make sure to select **"Lipa Na M-Pesa Sandbox"**
3. Copy the new credentials
4. Update `.env.local` with the new credentials

---

**Note:** The 400 error specifically means the API rejected your request, which almost always indicates invalid credentials or an inactive app.

