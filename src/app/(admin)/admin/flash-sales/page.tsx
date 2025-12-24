'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Zap, Clock, Percent } from 'lucide-react'
import FlashSaleForm from '@/components/admin/flash-sales/FlashSaleForm'

interface FlashSale {
  id: string
  title: string
  description?: string | null
  productIds: string[]
  discountPercent: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null)

  useEffect(() => {
    fetchFlashSales()
  }, [])

  const fetchFlashSales = async () => {
    try {
      const response = await fetch('/api/admin/flash-sales')
      const data = await response.json()
      if (data.success) {
        setFlashSales(data.data)
      }
    } catch (error) {
      console.error('Error fetching flash sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flash sale?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/flash-sales/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setFlashSales(flashSales.filter((sale) => sale.id !== id))
      } else {
        alert(data.error || 'Failed to delete flash sale')
      }
    } catch (error) {
      console.error('Error deleting flash sale:', error)
      alert('Failed to delete flash sale')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingSale(null)
    fetchFlashSales()
  }

  const getStatus = (sale: FlashSale) => {
    const now = new Date()
    const start = new Date(sale.startDate)
    const end = new Date(sale.endDate)

    if (!sale.isActive) return { label: 'Inactive', color: 'bg-gray-500' }
    if (now < start) return { label: 'Upcoming', color: 'bg-red-500' }
    if (now >= start && now <= end) return { label: 'Active', color: 'bg-green-500' }
    return { label: 'Ended', color: 'bg-red-500' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading flash sales...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Flash Sales</h1>
          <p className="text-sm sm:text-base text-gray-700 mt-1">Create and manage limited-time flash sales</p>
        </div>
        <button
          onClick={() => {
            setEditingSale(null)
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Create Flash Sale</span>
        </button>
      </div>

      {/* Flash Sale Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSale ? 'Edit Flash Sale' : 'Create Flash Sale'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingSale(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <FlashSaleForm
                flashSale={editingSale || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false)
                  setEditingSale(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Flash Sales List */}
      {flashSales.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No flash sales yet</h3>
          <p className="text-gray-600 mb-6">Create your first flash sale to boost sales!</p>
          <button
            onClick={() => {
              setEditingSale(null)
              setShowForm(true)
            }}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            <Plus className="w-5 h-5" />
            Create Flash Sale
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flashSales.map((sale) => {
                const status = getStatus(sale)
                return (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.title}</div>
                      {sale.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">{sale.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-semibold text-red-600">
                        <Percent className="w-4 h-4" />
                        {sale.discountPercent}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.productIds.length} product{sale.productIds.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <div>
                          <div>{new Date(sale.startDate).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">to {new Date(sale.endDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingSale(sale)
                            setShowForm(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

