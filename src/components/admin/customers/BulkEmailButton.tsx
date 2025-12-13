'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import BulkEmailModal from './BulkEmailModal'

interface BulkEmailButtonProps {
  customerCount: number
}

export default function BulkEmailButton({ customerCount }: BulkEmailButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        <Send className="w-5 h-5" />
        Send Bulk Email
      </button>
      <BulkEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customerCount={customerCount}
      />
    </>
  )
}

