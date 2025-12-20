'use client'

import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, Bookmark, ArrowLeftRight } from 'lucide-react'
import CartRecommendations from '@/components/cart/CartRecommendations'
import { useCurrency } from '@/contexts/CurrencyContext'

export default function CartPage() {
  const { 
    items, 
    savedItems, 
    updateQuantity, 
    removeItem, 
    saveForLater, 
    moveToCart, 
    removeSavedItem, 
    getTotal, 
    clearCart,
    clearSaved,
  } = useCartStore()
  const { format } = useCurrency()
  const total = getTotal()

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <p className="text-gray-400 mb-6">You have no items in your cart or saved for later.</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.length > 0 && (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 flex gap-4">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={100} height={100} className="rounded object-cover" />
                    ) : (
                      <div className="w-24 h-24 bg-gray-700 rounded" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{item.name}</h3>
                      {item.colorName && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-400">Color:</span>
                          <div className="flex items-center gap-2">
                            {item.colorValue && (
                              <div
                                className="w-4 h-4 rounded-full border border-gray-500"
                                style={{ backgroundColor: item.colorValue }}
                              />
                            )}
                            <span className="text-sm text-white">{item.colorName}</span>
                          </div>
                        </div>
                      )}
                      <p className="text-blue-400 font-bold mb-4">{format(item.price)}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 border border-gray-600 rounded-lg bg-gray-900">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-700 text-white rounded-l-lg transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-white font-semibold min-w-[3rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-700 text-white rounded-r-lg transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveForLater(item.id)}
                            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            <Bookmark className="w-4 h-4" />
                            Save for later
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        {format(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {savedItems.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-yellow-400" />
                    Saved for Later
                  </h2>
                  <button
                    onClick={clearSaved}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Clear saved items
                  </button>
                </div>
                <div className="space-y-4">
                  {savedItems.map((item) => (
                    <div key={item.id} className="bg-gray-850 bg-gray-900 border border-gray-700 rounded-lg shadow p-4 flex gap-4">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={80} height={80} className="rounded object-cover" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-700 rounded" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                        <p className="text-blue-400 font-bold mb-3">{format(item.price)}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => moveToCart(item.id)}
                            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            Move to cart
                          </button>
                          <button
                            onClick={() => removeSavedItem(item.id)}
                            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>{format(total)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>{format(0)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>{format(total)}</span>
                </div>
              </div>
            </div>
            <Link
              href="/products"
              className="block w-full bg-gray-700 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-600 mb-2"
            >
              Continue Shopping
            </Link>
            <Link
              href="/checkout"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 mb-2"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={clearCart}
              className="w-full text-gray-400 py-2 hover:text-white"
            >
              Clear Cart
            </button>
          </div>
        </div>
        {items.length > 0 && (
          <CartRecommendations cartItemIds={items.map((item) => item.id)} />
        )}
      </div>
    </div>
  )
}
