# How to Find Your Mpesa Passkey

## Quick Steps

1. **Log in to Mpesa Developer Portal:**
   - Go to: https://developer.safaricom.co.ke/
   - Sign in with your account

2. **Navigate to Your App:**
   - Click on "My Apps" in the top menu
   - Find your app (e.g., "Mombasa Shisha Bongs")
   - Click on the app name to open it

3. **Find the Passkey:**
   - Look for a section labeled **"App Credentials"** or **"Credentials"**
   - You should see:
     - Consumer Key ✅ (you already have this)
     - Consumer Secret ✅ (you already have this)
     - **Passkey** ⚠️ (this is what you need)
     - Shortcode (usually `174379` for sandbox)

4. **Copy the Passkey:**
   - It's a long string of characters (usually 64+ characters)
   - Example format: `your_passkey_here` (64 character hex string)
   - Click the "Copy" button or select and copy it

5. **Update `.env.local`:**
   - Open `.env.local` file
   - Find the line: `MPESA_PASSKEY=your_passkey_here`
   - Replace `your_passkey_here` with your actual passkey
   - Save the file

## Where to Look in the Portal

The passkey is typically displayed in one of these locations:

- **App Details Page:** When you click on your app, it shows all credentials
- **Credentials Tab:** Some apps have a separate "Credentials" tab
- **API Keys Section:** Sometimes under "API Keys" or "Security"

## If You Can't Find It

1. **Check if the app is fully created:**
   - Make sure you completed all steps in app creation
   - Some credentials are generated after app creation

2. **Try regenerating credentials:**
   - Some portals have a "Regenerate" button
   - This will create new credentials (you'll need to update all of them)

3. **Contact Support:**
   - If you still can't find it, contact Mpesa Developer Support
   - They can help you locate or regenerate your credentials

## After Adding Passkey

Once you've added the passkey to `.env.local`:

1. **Restart your Next.js server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Test the connection:**
   ```bash
   npx tsx scripts/test-mpesa-connection.ts
   ```

3. **You should see:**
   ```
   ✅ Success! Access token generated
   ```

---

**Note:** The passkey is sensitive information. Never share it publicly or commit it to git!

