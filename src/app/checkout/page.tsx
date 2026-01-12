'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useUser } from '@clerk/nextjs'
import LocationPicker from '@/components/checkout/LocationPicker'
import { MapPin, CreditCard, Wallet, Loader2, Star, Home, Building2, Briefcase, Plus, Calendar } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import Link from 'next/link'

type PaymentMethod = 'MPESA' | 'CASH_ON_DELIVERY'

interface LocationData {
  lat: number
  lng: number
  address: string
  isWithinMombasa?: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useUser()
  const { items, getTotal, clearCart } = useCartStore()
  const { format } = useCurrency()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MPESA')
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [isWithinMombasa, setIsWithinMombasa] = useState<boolean | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    additionalAddress: '',
    city: 'Mombasa',
    notes: '',
    scheduledDelivery: '',
  })
  
  // Track if we've initialized from user data to prevent overwriting manual input
  const userDataInitialized = useRef(false)

  const total = getTotal()

  // Initialize form data from user when user loads (only once on mount)
  useEffect(() => {
    if (user && !userDataInitialized.current) {
      const userName = user.fullName || ''
      const userEmail = user.primaryEmailAddress?.emailAddress || ''
      
      // Only initialize if we have user data
      if (userName || userEmail) {
        setFormData((prev) => {
          // Only set if fields are empty (preserve any manual input)
          if (!prev.customerName.trim() && !prev.customerEmail.trim()) {
            userDataInitialized.current = true
            return {
              ...prev,
              customerName: userName,
              customerEmail: userEmail,
            }
          }
          // Mark as initialized even if we don't update (to prevent future runs)
          userDataInitialized.current = true
          return prev
        })
      } else {
        // Mark as initialized even if no user data (to prevent future runs)
        userDataInitialized.current = true
      }
    }
  }, [user?.id]) // Only depend on user ID, not the properties that might change

  // Fetch saved addresses if user is logged in
  useEffect(() => {
    if (user) {
      fetch('/api/delivery-addresses')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            setSavedAddresses(data.data)
            // Auto-select default address if available
            const defaultAddress = data.data.find((addr: any) => addr.isDefault)
            if (defaultAddress) {
              handleSelectSavedAddress(defaultAddress)
            }
          }
        })
        .catch((err) => console.error('Error fetching addresses:', err))
    }
  }, [user])

  // Redirect to cart if empty - use useEffect to avoid render error
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) {
    return null
  }

  const handleSelectSavedAddress = (address: any) => {
    setSelectedAddressId(address.id)
    setUseSavedAddress(true)
    setSelectedLocation({
      lat: address.latitude || 0,
      lng: address.longitude || 0,
      address: address.address,
      isWithinMombasa: address.city.toLowerCase() === 'mombasa',
    })
    setFormData((prev) => ({
      ...prev,
      customerName: address.fullName,
      customerPhone: address.phone.replace('+254', ''),
      deliveryAddress: address.address,
      city: address.city,
      notes: address.deliveryNotes || '',
    }))
    setIsWithinMombasa(address.city.toLowerCase() === 'mombasa')
    if (address.city.toLowerCase() === 'mombasa') {
      setPaymentMethod('CASH_ON_DELIVERY')
    }
  }

  const handleLocationSelect = async (location: LocationData) => {
    setUseSavedAddress(false)
    setSelectedAddressId(null)
    setSelectedLocation(location)
    setFormData((prev) => ({
      ...prev,
      deliveryAddress: location.address,
      additionalAddress: '',
    }))

    // Use isWithinMombasa from location if provided, otherwise check via API
    if (location.isWithinMombasa !== undefined) {
      setIsWithinMombasa(location.isWithinMombasa)
      // Auto-select payment method based on location
      if (location.isWithinMombasa) {
        setPaymentMethod('CASH_ON_DELIVERY')
      } else {
        setPaymentMethod('MPESA')
      }
    } else {
      // Fallback: Check if location is within Mombasa via API
      try {
        const response = await fetch('/api/location/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: location.lat, lng: location.lng }),
        })
        const data = await response.json()
        setIsWithinMombasa(data.isWithinMombasa)

        // Auto-select payment method based on location
        if (data.isWithinMombasa) {
          setPaymentMethod('CASH_ON_DELIVERY')
        } else {
          setPaymentMethod('MPESA')
        }
      } catch (error) {
        console.error('Error checking location:', error)
        // Default to M-Pesa if check fails
        setIsWithinMombasa(false)
        setPaymentMethod('MPESA')
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedLocation) {
      alert('Please select a delivery location on the map')
      return
    }

    setLoading(true)

    try {
      // Expand bundles into individual items for order creation
      const orderItems: any[] = []
      items.forEach((item) => {
        if (item.isBundle && item.bundleItems) {
          // For bundles, expand into individual products
          // Calculate total items in bundle for price distribution
          const totalBundleItems = item.bundleItems.reduce((sum, bi) => sum + bi.quantity, 0)
          const bundleTotalPrice = Number(item.price) * item.quantity // Total price for all bundle quantities
          const bundlePricePerItem = bundleTotalPrice / (totalBundleItems * item.quantity)
          
          // Track if we need to adjust for rounding errors
          let distributedTotal = 0
          const bundleOrderItems: any[] = []
          
          item.bundleItems.forEach((bundleItem, idx) => {
            const itemQuantity = item.quantity * bundleItem.quantity
            const isLastItem = idx === (item.bundleItems?.length || 0) - 1
            const itemPrice = isLastItem
              ? (bundleTotalPrice - distributedTotal) / itemQuantity // Last item gets remainder to avoid rounding errors
              : bundlePricePerItem
            
            const subtotal = itemPrice * itemQuantity
            distributedTotal += subtotal
            
            bundleOrderItems.push({
              productId: bundleItem.productId,
              quantity: itemQuantity,
              price: itemPrice,
              colorId: bundleItem.colorId || null,
              colorName: null, // Will be fetched from product
              colorValue: null,
              specId: bundleItem.specId || null,
              specType: null,
              specName: null,
              specValue: null,
            })
          })
          
          orderItems.push(...bundleOrderItems)
        } else {
          // Regular product
          orderItems.push({
            productId: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            colorId: item.colorId || null,
            colorName: item.colorName || null,
            colorValue: item.colorValue || null,
            specId: item.specId || null,
            specType: item.specType || null,
            specName: item.specName || null,
            specValue: item.specValue || null,
          })
        }
      })

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone ? `+254${formData.customerPhone}` : formData.customerPhone,
          deliveryAddress: formData.additionalAddress
            ? `${formData.deliveryAddress}, ${formData.additionalAddress}`
            : formData.deliveryAddress,
          deliveryLatitude: selectedLocation ? parseFloat(selectedLocation.lat.toFixed(7)) : null,
          deliveryLongitude: selectedLocation ? parseFloat(selectedLocation.lng.toFixed(7)) : null,
          city: formData.city,
          deliveryAddressId: selectedAddressId || undefined,
          notes: formData.notes,
          paymentMethod: paymentMethod,
          scheduledDelivery: formData.scheduledDelivery || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        if (paymentMethod === 'CASH_ON_DELIVERY') {
          // For COD, clear cart and redirect to success page
          clearCart()
          router.push(`/orders/${data.order.id}?cod=true`)
        } else {
          // For M-Pesa, DON'T clear cart yet - wait for successful payment
          // Redirect to order page where payment button will be shown
          router.push(`/orders/${data.order.id}`)
        }
      } else {
        alert(data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
        
        {/* Account Benefits Message */}
        {!user && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-800 font-semibold mb-1">Creating an account is optional but recommended</p>
                <p className="text-red-700 text-sm mb-3">
                  With an account, you can track your orders, view order history, and get faster checkout next time. 
                  You can still checkout as a guest, but you'll need your order number to track your delivery.
                </p>
                <div className="flex gap-2">
                  <a
                    href="/sign-up"
                    className="text-sm bg-red-600 hover:bg-red-700 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Create Account
                  </a>
                  <a
                    href="/sign-in"
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="checkout-name" className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                  <input
                    type="text"
                    id="checkout-name"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                    autoComplete="name"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-email" className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    id="checkout-email"
                    name="customerEmail"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
                    autoComplete="email"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 text-gray-700 px-3 py-2 rounded-l-lg border border-r-0 border-gray-300">
                      +254
                    </span>
                    <input
                      type="tel"
                      id="checkout-phone"
                      name="customerPhone"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 9)
                        setFormData((prev) => ({
                          ...prev,
                          customerPhone: value,
                        }))
                      }}
                      autoComplete="tel"
                      className="flex-1 bg-white border border-gray-300 rounded-r-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
                      placeholder="71234567"
                      pattern="[0-9]{9}"
                      maxLength={9}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Enter 9 digits (e.g., 708786000)</p>
                </div>
              </div>
            </div>

            {/* Saved Addresses */}
            {user && savedAddresses.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                  <Link
                    href="/profile/addresses"
                    className="text-sm text-red-600 hover:text-red-600 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Manage
                  </Link>
                </div>
                <div className="space-y-2">
                  {savedAddresses.map((address) => {
                    const getIcon = (label: string) => {
                      const lower = label.toLowerCase()
                      if (lower.includes('home')) return <Home className="w-4 h-4" />
                      if (lower.includes('work') || lower.includes('office')) return <Briefcase className="w-4 h-4" />
                      return <Building2 className="w-4 h-4" />
                    }
                    return (
                      <button
                        key={address.id}
                        onClick={() => handleSelectSavedAddress(address)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-red-500 bg-red-100/20'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getIcon(address.label)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{address.label}</span>
                                {address.isDefault && (
                                  <span className="flex items-center gap-1 bg-red-600 text-gray-900 text-xs px-2 py-0.5 rounded-full">
                                    <Star className="w-3 h-3 fill-current" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{address.fullName}</p>
                              <p className="text-sm text-gray-600">{address.address}</p>
                              <p className="text-sm text-gray-600">{address.city}</p>
                            </div>
                          </div>
                          {selectedAddressId === address.id && (
                            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => {
                    setUseSavedAddress(false)
                    setSelectedAddressId(null)
                  }}
                  className="mt-4 w-full text-center text-red-600 hover:text-red-600 text-sm"
                >
                  Use different address
                </button>
              </div>
            )}

            {/* Location Picker */}
            {(!useSavedAddress || !selectedAddressId) && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Location</h2>
                <LocationPicker 
                  onLocationSelect={handleLocationSelect}
                  initialLocation={selectedLocation || undefined}
                />
              </div>
            )}

            {/* Additional Address Details */}
            {selectedLocation && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Additional Address Details (Optional)
                    </label>
                    <textarea
                      value={formData.additionalAddress}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          additionalAddress: e.target.value,
                        }))
                      }}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
                      rows={2}
                      placeholder="Building name, floor, apartment number, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Order Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none"
                      rows={2}
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Delivery */}
            {selectedLocation && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Delivery (Optional)
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Preferred Delivery Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledDelivery}
                      onChange={(e) => {
                        const selectedDate = new Date(e.target.value)
                        const now = new Date()
                        const maxDate = new Date()
                        maxDate.setDate(maxDate.getDate() + 30) // Max 30 days ahead
                        
                        if (selectedDate < now) {
                          alert('Please select a future date')
                          return
                        }
                        if (selectedDate > maxDate) {
                          alert('Delivery can only be scheduled up to 30 days in advance')
                          return
                        }
                        setFormData((prev) => ({ ...prev, scheduledDelivery: e.target.value }))
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-red-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Leave empty for immediate delivery. You can schedule up to 30 days in advance.
                    </p>
                  </div>
                  {formData.scheduledDelivery && (
                    <div className="bg-red-100/30 border border-blue-700 rounded-lg p-3">
                      <p className="text-sm text-red-600">
                        ✓ Delivery scheduled for:{' '}
                        <span className="font-semibold">
                          {new Date(formData.scheduledDelivery).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            {selectedLocation && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* Pay on Delivery - Show if within Mombasa or if checking */}
                  {(isWithinMombasa === true || isWithinMombasa === null) && (
                    <label
                      className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                          ? 'bg-green-900/30 border-2 border-green-500 ring-2 ring-green-500/50'
                          : isWithinMombasa === true
                          ? 'bg-white/50 border-2 border-gray-300 hover:border-gray-400'
                          : 'bg-white/30 border-2 border-gray-300 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="relative mt-1">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="CASH_ON_DELIVERY"
                          checked={paymentMethod === 'CASH_ON_DELIVERY'}
                          onChange={() => {
                            if (isWithinMombasa === true) {
                              setPaymentMethod('CASH_ON_DELIVERY')
                            }
                          }}
                          disabled={isWithinMombasa !== true}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-500 bg-transparent'
                          }`}
                        >
                          {paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className={`w-5 h-5 ${
                            paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                              ? 'text-green-400'
                              : 'text-gray-500'
                          }`} />
                          <span className={`font-semibold ${
                            paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                              ? 'text-gray-900'
                              : 'text-gray-600'
                          }`}>
                            Pay on Delivery
                            {paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true && (
                              <span className="ml-2 text-green-400">✓ Selected</span>
                            )}
                          </span>
                          {isWithinMombasa === true && (
                            <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">
                              Available
                            </span>
                          )}
                          {selectedLocation && isWithinMombasa !== null && !isWithinMombasa && (
                            <span className="text-xs bg-red-900 text-red-400 px-2 py-0.5 rounded-full">
                              Not Available
                            </span>
                          )}
                          {isWithinMombasa === null && selectedLocation && (
                            <span className="text-xs bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          paymentMethod === 'CASH_ON_DELIVERY' && isWithinMombasa === true
                            ? 'text-gray-700'
                            : 'text-gray-500'
                        }`}>
                          {isWithinMombasa === true
                            ? 'Pay with cash when your order is delivered. Delivery fees will be collected separately in cash by the delivery person based on your area (CBD/town areas may have different fees).'
                            : isWithinMombasa === false
                              ? 'Pay on Delivery is only available for locations within Mombasa. Please use M-Pesa payment.'
                              : 'Checking if location is within Mombasa...'}
                        </p>
                      </div>
                    </label>
                  )}

                  {/* M-Pesa Payment - Always available */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'MPESA'
                        ? 'bg-red-50 border-2 border-red-500 ring-2 ring-red-500/50'
                        : 'bg-white/50 border-2 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="relative mt-1">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="MPESA"
                        checked={paymentMethod === 'MPESA'}
                        onChange={() => setPaymentMethod('MPESA')}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'MPESA'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-500 bg-transparent'
                        }`}
                      >
                        {paymentMethod === 'MPESA' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet className={`w-5 h-5 ${
                          paymentMethod === 'MPESA'
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`} />
                        <span className={`font-semibold ${
                          paymentMethod === 'MPESA'
                            ? 'text-gray-900'
                            : 'text-gray-600'
                        }`}>
                          M-Pesa Payment
                          {paymentMethod === 'MPESA' && (
                            <span className="ml-2 text-red-600">✓ Selected</span>
                          )}
                        </span>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          Always Available
                        </span>
                      </div>
                      <p className={`text-sm ${
                        paymentMethod === 'MPESA'
                          ? 'text-gray-700'
                          : 'text-gray-500'
                      }`}>
                        Send money via M-Pesa to our number. After sending, you'll be asked to enter your M-Pesa reference number and sender name for verification.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedLocation}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? 'Processing...'
                : paymentMethod === 'CASH_ON_DELIVERY'
                  ? 'Place Order (Pay on Delivery)'
                  : 'Place Order & Pay with M-Pesa'}
            </button>
          </form>

          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.cartItemId || item.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium">{item.name}</span>
                      {item.isBundle && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold">Bundle</span>
                      )}
                    </div>
                    <span className="text-gray-900 font-semibold">{format(item.price * item.quantity)}</span>
                  </div>
                  {item.isBundle && item.bundleItems && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <p className="font-semibold text-gray-700 mb-1">Includes:</p>
                      <ul className="space-y-1">
                        {item.bundleItems.map((bundleItem, idx) => (
                          <li key={idx} className="text-gray-600">
                            • Product {idx + 1} {bundleItem.quantity > 1 && `(x${bundleItem.quantity})`}
                          </li>
                        ))}
                      </ul>
                      {item.bundleDiscount && (
                        <p className="mt-2 text-green-600 font-semibold">
                          You saved {format(item.bundleDiscount * item.quantity)}!
                        </p>
                      )}
                    </div>
                  )}
                  {!item.isBundle && (
                    <div className="space-y-1">
                      {item.colorName && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>Color:</span>
                          {item.colorValue && (
                            <div
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.colorValue }}
                            />
                          )}
                          <span>{item.colorName}</span>
                        </div>
                      )}
                      {item.specName && (
                        <div className="text-xs text-gray-600">
                          <span>{item.specType || 'Spec'}:</span> <span className="text-gray-700">{item.specName}</span>
                          {item.specValue && (
                            <span className="text-gray-500"> ({item.specValue})</span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Qty: {item.quantity} × {format(item.price)}
                      </div>
                    </div>
                  )}
                  {item.isBundle && (
                    <div className="text-xs text-gray-500 mt-1">
                      Qty: {item.quantity} × {format(item.price)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{format(total)}</span>
              </div>
              {paymentMethod === 'CASH_ON_DELIVERY' && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-green-600 font-semibold">
                    ✓ Pay this amount when your order is delivered
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 font-semibold mb-1">📦 Delivery Fee Notice</p>
                    <p className="text-xs text-yellow-700">
                      Delivery fees are not included in this total. The delivery person will collect the delivery fee separately in cash based on your area (CBD/town areas may have different fees).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
