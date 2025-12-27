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
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">You have no items in your cart or saved for later.</p>
          <Link
            href="/products"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.length > 0 && (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.cartItemId || item.id} className="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:border-red-300 transition-all duration-300">
                    {item.isBundle ? (
                      // Bundle Item Display
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={100} height={100} className="rounded-lg object-cover" />
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-lg" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-semibold">Bundle</span>
                              </div>
                              <p className="font-bold text-red-600 text-lg">
                                {format(item.price * item.quantity)}
                              </p>
                            </div>
                            {item.bundleDiscount && (
                              <p className="text-sm text-green-600 font-semibold mb-2">
                                You saved {format(item.bundleDiscount * item.quantity)}!
                              </p>
                            )}
                            {item.bundleItems && item.bundleItems.length > 0 && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Bundle includes:</p>
                                <ul className="space-y-1">
                                  {item.bundleItems.map((bundleItem, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                      Product {idx + 1} {bundleItem.quantity > 1 && `(x${bundleItem.quantity})`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-4">
                              <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                                <button
                                  onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                                  className="p-2 hover:bg-gray-200 text-gray-700 rounded-l-md transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-gray-900 font-bold min-w-[3rem] text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                                  className="p-2 hover:bg-gray-200 text-gray-700 rounded-r-md transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.cartItemId || item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Remove bundle"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Regular Product Item Display
                      <div className="flex gap-4">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={100} height={100} className="rounded-lg object-cover" />
                        ) : (
                          <div className="w-24 h-24 bg-gray-100 rounded-lg" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2">{item.name}</h3>
                          <div className="space-y-1 mb-2">
                            {item.colorName && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 font-medium">Color:</span>
                                <div className="flex items-center gap-2">
                                  {item.colorValue && (
                                    <div
                                      className="w-4 h-4 rounded-full border-2 border-gray-300"
                                      style={{ backgroundColor: item.colorValue }}
                                    />
                                  )}
                                  <span className="text-sm text-gray-800 font-semibold">{item.colorName}</span>
                                </div>
                              </div>
                            )}
                            {item.specName && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 font-medium">{item.specType}:</span>
                                <span className="text-sm text-gray-800 font-semibold">{item.specName}</span>
                                {item.specValue && (
                                  <span className="text-xs text-gray-500">({item.specValue})</span>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-red-600 font-bold text-lg mb-4">{format(item.price)}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                              <button
                                onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-200 text-gray-700 rounded-l-md transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-gray-900 font-bold min-w-[3rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-200 text-gray-700 rounded-r-md transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => saveForLater(item.cartItemId || item.id)}
                                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                              >
                                <Bookmark className="w-4 h-4" />
                                Save for later
                              </button>
                              <button
                                onClick={() => removeItem(item.cartItemId || item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600 text-lg">
                            {format(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {savedItems.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-yellow-500" />
                    Saved for Later
                  </h2>
                  <button
                    onClick={clearSaved}
                    className="text-xs text-gray-600 hover:text-red-600 transition-colors font-medium"
                  >
                    Clear saved items
                  </button>
                </div>
                <div className="space-y-4">
                  {savedItems.map((item) => (
                    <div key={item.cartItemId || item.id} className="bg-white border-2 border-gray-200 rounded-xl shadow p-4 flex gap-4">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-lg object-cover" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <div className="space-y-1 mb-2">
                          {item.colorName && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Color:</span>
                              <span className="text-xs text-gray-800 font-semibold">{item.colorName}</span>
                            </div>
                          )}
                          {item.specName && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">{item.specType}:</span>
                              <span className="text-xs text-gray-800 font-semibold">{item.specName}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-red-600 font-bold mb-3">{format(item.price)}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => moveToCart(item.cartItemId || item.id)}
                            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            Move to cart
                          </button>
                          <button
                            onClick={() => removeSavedItem(item.cartItemId || item.id)}
                            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">{format(total)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="font-semibold">{format(0)}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold text-red-600">
                  <span>Total</span>
                  <span>{format(total)}</span>
                </div>
              </div>
            </div>
            <Link
              href="/products"
              className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-xl font-semibold hover:bg-gray-200 mb-2 transition-all duration-300"
            >
              Continue Shopping
            </Link>
            <Link
              href="/checkout"
              className="block w-full bg-red-600 text-white text-center py-3 rounded-md font-semibold hover:bg-red-700 mb-2 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={clearCart}
              className="w-full text-gray-500 py-2 hover:text-red-600 transition-colors font-medium"
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
