'use client'

import Image from 'next/image'

export default function MpesaTrustBadges() {
  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
      <div className="flex items-center gap-1.5">
        <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
          M-PESA
        </div>
        <span className="text-xs text-gray-600 font-medium">Secure Payment</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs text-gray-500">Verified</span>
      </div>
    </div>
  )
}

