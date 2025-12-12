'use client'

import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link
          href="/products"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
              {item.image ? (
                <Image src={item.image} alt={item.name} width={100} height={100} className="rounded" />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-blue-600 font-bold mb-4">KES {item.price.toLocaleString()}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border rounded">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  KES {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span>KES 0</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>KES {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Link
            href="/checkout"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 mb-2"
          >
            Proceed to Checkout
          </Link>
          <button
            onClick={clearCart}
            className="w-full text-gray-600 py-2 hover:text-gray-900"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  )
}

