#!/bin/bash

echo "🚀 Starting ngrok for Paystack Webhook"
echo ""

# Check if Next.js server is running
if ! lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Next.js server is not running on port 3000"
    echo "   Please start it first with: npm run dev"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if ngrok is already running
if pgrep -x ngrok > /dev/null; then
    echo "⚠️  ngrok is already running"
    echo "   Getting current URL..."
    sleep 2
    
    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$NGROK_URL" ]; then
        echo ""
        echo "✅ Current ngrok URL: $NGROK_URL"
        echo ""
        echo "📋 Paystack Webhook URL:"
        echo "   $NGROK_URL/api/paystack/webhook"
        echo ""
        echo "📝 Steps to configure in Paystack:"
        echo "   1. Go to https://dashboard.paystack.com/"
        echo "   2. Navigate to Settings > Webhooks"
        echo "   3. Add webhook URL: $NGROK_URL/api/paystack/webhook"
        echo "   4. Copy the webhook secret"
        echo "   5. Add to .env.local as PAYSTACK_WEBHOOK_SECRET"
    else
        echo "   Could not get ngrok URL. Please check ngrok terminal."
    fi
else
    echo "Starting ngrok..."
    echo ""
    echo "📋 After ngrok starts, you'll see a URL like:"
    echo "   https://abc123.ngrok-free.app"
    echo ""
    echo "📝 Your Paystack webhook URL will be:"
    echo "   https://abc123.ngrok-free.app/api/paystack/webhook"
    echo ""
    echo "⚠️  Keep this terminal open while testing!"
    echo ""
    
    ngrok http 3000
fi

