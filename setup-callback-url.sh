#!/bin/bash

# Script to help set up Mpesa callback URL with ngrok

echo "🚀 Mpesa Callback URL Setup"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed."
    echo "   Install it with: brew install ngrok"
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Check if Next.js server is running
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Next.js server is not running on port 3000"
    echo "   Start it with: npm run dev"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 Instructions:"
echo ""
echo "1. In a NEW terminal window, run:"
echo "   ngrok http 3000"
echo ""
echo "2. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok-free.app)"
echo ""
echo "3. Update your .env.local file:"
echo "   MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/mpesa/callback"
echo ""
echo "4. Restart your Next.js server"
echo ""
echo "Press Enter when you've completed these steps..."
read

echo ""
echo "✅ Setup complete!"
echo ""
echo "💡 Remember:"
echo "   - Keep ngrok running while testing"
echo "   - ngrok URL changes each time you restart (free accounts)"
echo "   - Update .env.local if ngrok URL changes"

