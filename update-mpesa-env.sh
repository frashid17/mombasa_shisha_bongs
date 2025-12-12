#!/bin/bash

# Script to update Mpesa credentials in .env.local
# Usage: ./update-mpesa-env.sh

ENV_FILE=".env.local"

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env.local file..."
    touch "$ENV_FILE"
fi

# Update or add Mpesa credentials
echo "Updating Mpesa credentials in .env.local..."

# Consumer Key
if grep -q "MPESA_CONSUMER_KEY" "$ENV_FILE"; then
    sed -i '' "s|MPESA_CONSUMER_KEY=.*|MPESA_CONSUMER_KEY=rLzMJTQmdZ9sMHAQl0RdiDKdgprdyKNMYcS1ZInmyoxNBPHQ|" "$ENV_FILE"
else
    echo "MPESA_CONSUMER_KEY=rLzMJTQmdZ9sMHAQl0RdiDKdgprdyKNMYcS1ZInmyoxNBPHQ" >> "$ENV_FILE"
fi

# Consumer Secret
if grep -q "MPESA_CONSUMER_SECRET" "$ENV_FILE"; then
    sed -i '' "s|MPESA_CONSUMER_SECRET=.*|MPESA_CONSUMER_SECRET=7g1eLaIOebWYe5MrVoGN5612Pfqh4VVyF4m8dLQJ7COVFwysS4DMNz6cnwjlScVq|" "$ENV_FILE"
else
    echo "MPESA_CONSUMER_SECRET=7g1eLaIOebWYe5MrVoGN5612Pfqh4VVyF4m8dLQJ7COVFwysS4DMNz6cnwjlScVq" >> "$ENV_FILE"
fi

# Shortcode (use 174379 for sandbox)
if grep -q "MPESA_SHORTCODE" "$ENV_FILE"; then
    sed -i '' "s|MPESA_SHORTCODE=.*|MPESA_SHORTCODE=174379|" "$ENV_FILE"
else
    echo "MPESA_SHORTCODE=174379" >> "$ENV_FILE"
fi

# Environment
if grep -q "MPESA_ENVIRONMENT" "$ENV_FILE"; then
    sed -i '' "s|MPESA_ENVIRONMENT=.*|MPESA_ENVIRONMENT=sandbox|" "$ENV_FILE"
else
    echo "MPESA_ENVIRONMENT=sandbox" >> "$ENV_FILE"
fi

# Callback URL (default to localhost, user should update with ngrok)
if ! grep -q "MPESA_CALLBACK_URL" "$ENV_FILE"; then
    echo "MPESA_CALLBACK_URL=http://localhost:3000/api/mpesa/callback" >> "$ENV_FILE"
fi

# Passkey placeholder (user needs to add this)
if ! grep -q "MPESA_PASSKEY" "$ENV_FILE"; then
    echo "" >> "$ENV_FILE"
    echo "# TODO: Add your Passkey from Mpesa Developer Portal" >> "$ENV_FILE"
    echo "MPESA_PASSKEY=your_passkey_here" >> "$ENV_FILE"
fi

echo "✅ Credentials updated!"
echo ""
echo "⚠️  IMPORTANT: You still need to add your Passkey!"
echo "   1. Go to https://developer.safaricom.co.ke/"
echo "   2. Navigate to 'My Apps'"
echo "   3. Click on your app"
echo "   4. Copy the 'Passkey' value"
echo "   5. Update MPESA_PASSKEY in .env.local"
echo ""
echo "📝 Current configuration:"
grep "MPESA_" "$ENV_FILE" | grep -v "PASSKEY" || echo "   (No Mpesa variables found)"

