// Currency conversion utilities
// Exchange rates should be updated regularly (daily recommended)

const EXCHANGE_RATES = {
  KES: 1,
  USD: 0.0067, // 1 KES = 0.0067 USD (approximate, should be fetched from API)
}

export type Currency = 'KES' | 'USD'

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount

  // Convert to KES first (base currency)
  const inKES = from === 'KES' ? amount : amount / EXCHANGE_RATES[from]

  // Convert to target currency
  return to === 'KES' ? inKES : inKES * EXCHANGE_RATES[to]
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'KES') {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === 'KES' ? 'KES' : '$'
}

// Fetch live exchange rates (call this periodically)
export async function updateExchangeRates() {
  try {
    // In production, use a real API like exchangerate-api.com or fixer.io
    // For now, using a static rate
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/KES')
    // const data = await response.json()
    // EXCHANGE_RATES.USD = data.rates.USD
  } catch (error) {
    console.error('Failed to update exchange rates:', error)
  }
}

