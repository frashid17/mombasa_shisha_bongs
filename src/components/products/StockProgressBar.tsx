'use client'

interface StockProgressBarProps {
  stock: number
  maxStock?: number
  showText?: boolean
}

export default function StockProgressBar({
  stock,
  maxStock = 100,
  showText = true,
}: StockProgressBarProps) {
  if (stock === 0) {
    return (
      <div className="w-full">
        {showText && (
          <p className="text-red-600 font-semibold text-sm mb-1">Out of Stock</p>
        )}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }} />
        </div>
      </div>
    )
  }

  const percentage = Math.min((stock / maxStock) * 100, 100)
  const isLow = stock <= 10
  const isMedium = stock > 10 && stock <= 30

  const barColor = isLow ? 'bg-red-600' : isMedium ? 'bg-yellow-500' : 'bg-green-600'
  const textColor = isLow ? 'text-red-600' : isMedium ? 'text-yellow-600' : 'text-green-600'

  return (
    <div className="w-full">
      {showText && (
        <div className="flex items-center justify-between mb-1">
          <p className={`font-semibold text-sm ${textColor}`}>
            {stock <= 10 ? `Only ${stock} left!` : `${stock} in stock`}
          </p>
          <p className="text-xs text-gray-500">{Math.round(percentage)}%</p>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

