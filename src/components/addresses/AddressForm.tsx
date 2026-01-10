'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { MapPin, Loader2 } from 'lucide-react'
import LocationPicker from '@/components/checkout/LocationPicker'

interface DeliveryAddress {
  id: string
  label: string
  fullName: string
  phone: string
  address: string
  city: string
  latitude?: number | null
  longitude?: number | null
  isDefault: boolean
  deliveryNotes?: string | null
}

interface LocationData {
  lat: number
  lng: number
  address: string
  isWithinMombasa?: boolean
}

interface AddressFormProps {
  address?: DeliveryAddress
  onSuccess: () => void
  onCancel: () => void
}

export default function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    label: address?.label || '',
    fullName: address?.fullName || user?.fullName || '',
    phone: address?.phone || user?.primaryPhoneNumber?.phoneNumber || '',
    address: address?.address || '',
    city: address?.city || 'Mombasa',
    deliveryNotes: address?.deliveryNotes || '',
    isDefault: address?.isDefault || false,
  })
  const [location, setLocation] = useState<LocationData | null>(
    address?.latitude && address?.longitude
      ? {
          lat: address.latitude,
          lng: address.longitude,
          address: address.address,
        }
      : null
  )

  useEffect(() => {
    if (location) {
      setFormData((prev) => ({
        ...prev,
        address: location.address,
      }))
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const url = address
        ? `/api/delivery-addresses/${address.id}`
        : '/api/delivery-addresses'
      const method = address ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: location?.lat,
          longitude: location?.lng,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to save address')
      }
    } catch (err) {
      console.error('Error saving address:', err)
      setError('Failed to save address. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="address-label" className="block text-sm font-semibold text-gray-900 mb-2">
          Label <span className="text-red-500">*</span>
        </label>
        <select
          id="address-label"
          name="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          autoComplete="off"
          className="w-full bg-gray-700/90 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required
        >
          <option value="">Select address type...</option>
          <option value="Home">🏠 Home</option>
          <option value="Work">💼 Work</option>
          <option value="Office">🏢 Office</option>
          <option value="Other">📍 Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shipping-fullname" className="block text-sm font-semibold text-gray-900 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="shipping-fullname"
            name="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            autoComplete="name"
            placeholder="Patrick Mwangi"
            className="w-full bg-gray-700/90 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="shipping-phone" className="block text-sm font-semibold text-gray-900 mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="shipping-phone"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            autoComplete="tel"
            placeholder="+254708786000"
            className="w-full bg-gray-700/90 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="shipping-city" className="block text-sm font-semibold text-gray-900 mb-2">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="shipping-city"
          name="city"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          autoComplete="address-level2"
          placeholder="Mombasa"
          className="w-full bg-gray-700/90 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-600" />
          Delivery Location <span className="text-red-500">*</span>
        </label>
        <div className="h-64 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
          <LocationPicker
            onLocationSelect={(loc) => {
              setLocation(loc)
              setFormData({ ...formData, address: loc.address })
            }}
            initialLocation={location ? { lat: location.lat, lng: location.lng } : undefined}
          />
        </div>
        {location && (
          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
            📍 {location.address}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="delivery-notes" className="block text-sm font-semibold text-gray-900 mb-2">
          Delivery Notes (Optional)
        </label>
        <textarea
          id="delivery-notes"
          name="deliveryNotes"
          value={formData.deliveryNotes}
          onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
          rows={3}
          placeholder="Any special delivery instructions..."
          autoComplete="off"
          className="w-full bg-gray-700/90 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="address-default"
          name="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
        />
        <label htmlFor="address-default" className="text-sm font-medium text-gray-900">
          ⭐ Set as default address
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !location}
          className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            address ? '✓ Update Address' : '✓ Save Address'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

