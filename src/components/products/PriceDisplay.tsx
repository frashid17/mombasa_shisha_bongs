'use client'

import { useCurrency } from '@/contexts/CurrencyContext'

interface PriceDisplayProps {
  price: number
  compareAtPrice?: number | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCompare?: boolean
}

export default function PriceDisplay({ 
  price, 
  compareAtPrice, 
  size = 'md',
  showCompare = true 
}: PriceDisplayProps) {
  const { format } = useCurrency()
  const hasDiscount = showCompare && compareAtPrice && compareAtPrice > price

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  return (
    <div className="flex flex-col">
      <p className={`text-blue-400 font-bold ${sizeClasses[size]}`}>
        {format(price)}
      </p>
      {hasDiscount && (
        <p className="text-gray-500 text-sm line-through">
          {format(Number(compareAtPrice))}
        </p>
      )}
    </div>
  )
}

