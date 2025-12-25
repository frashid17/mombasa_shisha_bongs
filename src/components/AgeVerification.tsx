'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function AgeVerification() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Check if user has already verified age in this session
    const ageVerified = sessionStorage.getItem('ageVerified')
    if (!ageVerified) {
      setShowModal(true)
    }
  }, [])

  const handleConfirm = () => {
    sessionStorage.setItem('ageVerified', 'true')
    setShowModal(false)
  }

  const handleDecline = () => {
    // Redirect to a safe page or show message
    window.location.href = 'https://www.google.com'
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white border-2 border-red-600 rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 relative">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Age Verification</h2>
          <p className="text-gray-700 text-lg mb-2">
            You must be 21 years or older to access this website.
          </p>
          <p className="text-gray-600 text-sm">
            This website contains products intended for adults only.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full bg-red-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            I am 21 years or older
          </button>
          <button
            onClick={handleDecline}
            className="w-full bg-gray-200 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            I am under 21
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          By entering this site, you agree to our Terms and Conditions and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

