'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function DebugClerkPage() {
  const { isLoaded, userId, sessionId } = useAuth()
  const [envVars, setEnvVars] = useState({
    publishableKey: '',
    appUrl: '',
  })

  useEffect(() => {
    setEnvVars({
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'NOT SET',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Clerk Debug Information</h1>

        <div className="space-y-6">
          {/* Environment Variables */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</span>{' '}
                <span className={envVars.publishableKey === 'NOT SET' ? 'text-red-400' : 'text-green-400'}>
                  {envVars.publishableKey === 'NOT SET' 
                    ? '❌ NOT SET' 
                    : `${envVars.publishableKey.substring(0, 20)}... ✅`}
                </span>
              </div>
              <div>
                <span className="text-gray-400">NEXT_PUBLIC_APP_URL:</span>{' '}
                <span className={envVars.appUrl === 'NOT SET' ? 'text-red-400' : 'text-green-400'}>
                  {envVars.appUrl === 'NOT SET' ? '❌ NOT SET' : `${envVars.appUrl} ✅`}
                </span>
              </div>
            </div>
          </div>

          {/* Clerk Status */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Clerk Status</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Clerk Loaded:</span>{' '}
                <span className={isLoaded ? 'text-green-400' : 'text-yellow-400'}>
                  {isLoaded ? '✅ Yes' : '⏳ Loading...'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">User ID:</span>{' '}
                <span className={userId ? 'text-green-400' : 'text-gray-500'}>
                  {userId || 'Not signed in'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Session ID:</span>{' '}
                <span className={sessionId ? 'text-green-400' : 'text-gray-500'}>
                  {sessionId || 'No session'}
                </span>
              </div>
            </div>
          </div>

          {/* Browser Info */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Browser Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Current URL:</span>{' '}
                <span className="text-blue-400">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Origin:</span>{' '}
                <span className="text-blue-400">{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Console Errors Check */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Troubleshooting</h2>
            <div className="space-y-2 text-gray-300">
              <p>1. Open browser DevTools (F12) → Console tab</p>
              <p>2. Look for Clerk-related errors</p>
              <p>3. Check Network tab for failed requests to clerk.com</p>
              <p>4. Verify environment variables are set in Vercel</p>
              <p>5. Make sure you're using LIVE keys (pk_live_...) not test keys</p>
            </div>
          </div>

          {/* Links */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Test Links</h2>
            <div className="space-x-4">
              <a href="/sign-in" className="text-blue-400 hover:text-blue-300 underline">
                Go to Sign In
              </a>
              <a href="/sign-up" className="text-blue-400 hover:text-blue-300 underline">
                Go to Sign Up
              </a>
              <a href="/" className="text-blue-400 hover:text-blue-300 underline">
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

