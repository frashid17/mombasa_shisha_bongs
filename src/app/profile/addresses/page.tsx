'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Star, Home, Building2, Briefcase } from 'lucide-react'
import AddressForm from '@/components/addresses/AddressForm'

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
  createdAt: string
  updatedAt: string
}

export default function AddressesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=/profile/addresses')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/delivery-addresses')
      const data = await response.json()
      if (data.success) {
        setAddresses(data.data)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/delivery-addresses/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setAddresses(addresses.filter((addr) => addr.id !== id))
      } else {
        alert(data.error || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      alert('Failed to delete address')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/delivery-addresses/${id}/set-default`, {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        // Update local state
        setAddresses(
          addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
          }))
        )
      } else {
        alert(data.error || 'Failed to set default address')
      }
    } catch (error) {
      console.error('Error setting default address:', error)
      alert('Failed to set default address')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingAddress(null)
    fetchAddresses()
  }

  const getLabelIcon = (label: string) => {
    const lowerLabel = label.toLowerCase()
    if (lowerLabel.includes('home')) return <Home className="w-4 h-4" />
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return <Briefcase className="w-4 h-4" />
    return <Building2 className="w-4 h-4" />
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Addresses</h1>
              <p className="text-gray-600">Manage your delivery addresses for faster checkout</p>
            </div>
            <button
              onClick={() => {
                setEditingAddress(null)
                setShowForm(true)
              }}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Address
            </button>
          </div>
        </div>

        {/* Address Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingAddress(null)
                    }}
                    className="text-gray-400 hover:text-gray-900"
                  >
                    ✕
                  </button>
                </div>
                <AddressForm
                  address={editingAddress || undefined}
                  onSuccess={handleFormSuccess}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingAddress(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Addresses List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading addresses...</div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
            <button
              onClick={() => {
                setEditingAddress(null)
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white border rounded-lg p-6 ${
                  address.isDefault ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getLabelIcon(address.label)}
                      <h3 className="text-lg font-semibold text-gray-900">{address.label}</h3>
                      {address.isDefault && (
                        <span className="flex items-center gap-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-gray-700">
                      <p className="font-medium">{address.fullName}</p>
                      <p>{address.phone}</p>
                      <p>{address.address}</p>
                      <p>{address.city}</p>
                      {address.deliveryNotes && (
                        <p className="text-sm text-gray-500 italic mt-2">
                          Note: {address.deliveryNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Set as default"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingAddress(address)
                        setShowForm(true)
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit address"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingId === address.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete address"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

