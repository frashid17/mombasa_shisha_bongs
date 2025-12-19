import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">You're Offline</h1>
          <p className="text-gray-400 mb-2">
            It looks like you're not connected to the internet.
          </p>
          <p className="text-gray-500 text-sm">
            Check your connection and try again.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            Some features may be limited while offline. Cached pages will still work.
          </p>
        </div>
      </div>
    </div>
  )
}

