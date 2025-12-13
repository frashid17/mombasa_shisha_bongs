#!/bin/bash

echo "🔍 STK Push Diagnostic Tool"
echo "============================"
echo ""

# Check 1: ngrok URL accessibility
echo "1️⃣  Checking ngrok URL accessibility..."
NGROK_URL=$(grep "MPESA_CALLBACK_URL" .env.local | cut -d'=' -f2 | sed 's|/api/mpesa/callback||')
if [ -z "$NGROK_URL" ]; then
    echo "   ❌ Cannot find ngrok URL in .env.local"
else
    echo "   Found URL: $NGROK_URL"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$NGROK_URL" 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "405" ] || [ "$HTTP_CODE" = "404" ]; then
        echo "   ✅ ngrok URL is accessible (HTTP $HTTP_CODE)"
    else
        echo "   ❌ ngrok URL is NOT accessible (HTTP $HTTP_CODE)"
        echo "   💡 ngrok might not be running. Start it with: ngrok http 3000"
    fi
fi
echo ""

# Check 2: Environment variables
echo "2️⃣  Checking Mpesa configuration..."
if [ -f .env.local ]; then
    echo "   ✅ .env.local exists"
    CONSUMER_KEY=$(grep "MPESA_CONSUMER_KEY" .env.local | cut -d'=' -f2)
    CONSUMER_SECRET=$(grep "MPESA_CONSUMER_SECRET" .env.local | cut -d'=' -f2)
    PASSKEY=$(grep "MPESA_PASSKEY" .env.local | cut -d'=' -f2)
    SHORTCODE=$(grep "MPESA_SHORTCODE" .env.local | cut -d'=' -f2)
    CALLBACK_URL=$(grep "MPESA_CALLBACK_URL" .env.local | cut -d'=' -f2)
    ENVIRONMENT=$(grep "MPESA_ENVIRONMENT" .env.local | cut -d'=' -f2)
    
    if [ -z "$CONSUMER_KEY" ] || [ "$CONSUMER_KEY" = "your_consumer_key_here" ]; then
        echo "   ❌ MPESA_CONSUMER_KEY is missing or placeholder"
    else
        echo "   ✅ MPESA_CONSUMER_KEY is set"
    fi
    
    if [ -z "$CONSUMER_SECRET" ] || [ "$CONSUMER_SECRET" = "your_consumer_secret_here" ]; then
        echo "   ❌ MPESA_CONSUMER_SECRET is missing or placeholder"
    else
        echo "   ✅ MPESA_CONSUMER_SECRET is set"
    fi
    
    if [ -z "$PASSKEY" ] || [ "$PASSKEY" = "your_passkey_here" ]; then
        echo "   ❌ MPESA_PASSKEY is missing or placeholder"
    else
        echo "   ✅ MPESA_PASSKEY is set"
    fi
    
    if [ -z "$SHORTCODE" ]; then
        echo "   ❌ MPESA_SHORTCODE is missing"
    else
        echo "   ✅ MPESA_SHORTCODE = $SHORTCODE"
    fi
    
    if [ -z "$CALLBACK_URL" ] || [[ "$CALLBACK_URL" == *"yourdomain.com"* ]] || [[ "$CALLBACK_URL" == *"localhost"* ]]; then
        echo "   ❌ MPESA_CALLBACK_URL is invalid: $CALLBACK_URL"
    else
        echo "   ✅ MPESA_CALLBACK_URL = $CALLBACK_URL"
    fi
    
    if [ -z "$ENVIRONMENT" ]; then
        echo "   ❌ MPESA_ENVIRONMENT is missing"
    else
        echo "   ✅ MPESA_ENVIRONMENT = $ENVIRONMENT"
    fi
else
    echo "   ❌ .env.local file not found"
fi
echo ""

# Check 3: ngrok process
echo "3️⃣  Checking if ngrok is running..."
if pgrep -x "ngrok" > /dev/null; then
    echo "   ✅ ngrok process is running"
    echo "   💡 Check the ngrok terminal to see the current URL"
    echo "   💡 If the URL changed, update .env.local and restart your server"
else
    echo "   ❌ ngrok is NOT running"
    echo "   💡 Start ngrok with: ngrok http 3000"
fi
echo ""

# Check 4: Next.js server
echo "4️⃣  Checking if Next.js server is running..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✅ Next.js server is running on port 3000"
    echo "   💡 If you updated .env.local, make sure you restarted the server"
else
    echo "   ❌ Next.js server is NOT running on port 3000"
    echo "   💡 Start it with: npm run dev"
fi
echo ""

# Check 5: Common issues
echo "5️⃣  Common issues checklist:"
echo ""
echo "   ⚠️  Did you restart ngrok? (URL might have changed)"
echo "      → Check ngrok terminal for current URL"
echo "      → Update .env.local if URL changed"
echo "      → Restart Next.js server"
echo ""
echo "   ⚠️  Did you restart Next.js server after updating .env.local?"
echo "      → Stop server (Ctrl+C)"
echo "      → Start again: npm run dev"
echo ""
echo "   ⚠️  Are you using a test phone number in sandbox?"
echo "      → Use: 254708374149 or 254708786000"
echo "      → Real numbers won't work in sandbox"
echo ""
echo "   ⚠️  Check server logs when initiating payment"
echo "      → Look for error messages"
echo "      → Look for 'ResponseCode: 0' (success)"
echo ""

echo "📋 Next Steps:"
echo "1. Check your server console logs when you try to pay"
echo "2. Look for error messages or 'ResponseCode' in the logs"
echo "3. If ngrok URL changed, update .env.local and restart server"
echo "4. Make sure ngrok is running and Next.js server is restarted"
echo ""

