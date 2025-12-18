'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'

type Currency = 'KES' | 'USD'

export default function CurrencySelector() {
  const [currency, setCurrency] = useState<Currency>('KES')

  useEffect(() => {
    const saved = localStorage.getItem('currency') as Currency
    if (saved && (saved === 'KES' || saved === 'USD')) {
      setCurrency(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('currency', currency)
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currency }))
  }, [currency])

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-400" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
      >
        <option value="KES">KES</option>
        <option value="USD">USD</option>
      </select>
    </div>
  )
}

