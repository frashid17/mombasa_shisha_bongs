'use client'

import { Globe } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import type { Currency } from '@/lib/currency'

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-400" />
      <select
        id="currency-selector"
        name="currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        aria-label="Select currency"
        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
      >
        <option value="KES">KES</option>
        <option value="USD">USD</option>
      </select>
    </div>
  )
}

