'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Currency, convertCurrency, formatCurrency, getCurrencySymbol } from '@/lib/currency'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convert: (amount: number) => number
  format: (amount: number) => string
  symbol: string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('KES')
  const [isMounted, setIsMounted] = useState(false)

  // Load currency from localStorage on mount
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('currency') as Currency
    if (saved && (saved === 'KES' || saved === 'USD')) {
      setCurrencyState(saved)
    }
  }, [])

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    if (isMounted) {
      localStorage.setItem('currency', newCurrency)
      // Dispatch event for components that might be listening
      window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }))
    }
  }

  // Convert amount from KES (base currency) to current currency
  const convert = (amount: number): number => {
    return convertCurrency(amount, 'KES', currency)
  }

  // Format amount in current currency
  const format = (amount: number): string => {
    const converted = convert(amount)
    return formatCurrency(converted, currency)
  }

  // Get currency symbol
  const symbol = getCurrencySymbol(currency)

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convert,
        format,
        symbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    // Return a default context during SSR or if provider isn't available
    // This prevents errors during initial render/hydration
    // IMPORTANT: Use the same formatCurrency function to ensure SSR/client consistency
    if (typeof window === 'undefined') {
      return {
        currency: 'KES' as Currency,
        setCurrency: () => {},
        convert: (amount: number) => amount,
        format: (amount: number) => formatCurrency(amount, 'KES'),
        symbol: 'KES',
      }
    }
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

