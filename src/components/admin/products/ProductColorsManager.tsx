'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Edit2, Trash2 } from 'lucide-react'

interface Color {
  id: string
  name: string
  value: string
  isActive: boolean
}

interface ProductColorsManagerProps {
  productId: string
  initialColors?: Color[]
}

export default function ProductColorsManager({ productId, initialColors = [] }: ProductColorsManagerProps) {
  const [colors, setColors] = useState<Color[]>(initialColors)
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', value: '#000000' })

  useEffect(() => {
    loadColors()
  }, [productId])

  const loadColors = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/colors`)
      if (res.ok) {
        const data = await res.json()
        setColors(data)
      }
    } catch (error) {
      console.error('Failed to load colors:', error)
    }
  }

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.value.trim()) {
      alert('Please enter color name and value')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await loadColors()
        setFormData({ name: '', value: '#000000' })
        setShowAddForm(false)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to add color')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add color')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (colorId: string) => {
    if (!formData.name.trim() || !formData.value.trim()) {
      alert('Please enter color name and value')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/colors/${colorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await loadColors()
        setFormData({ name: '', value: '#000000' })
        setEditingId(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update color')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to update color')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (colorId: string) => {
    if (!confirm('Are you sure you want to delete this color?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/colors/${colorId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await loadColors()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete color')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to delete color')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (color: Color) => {
    setEditingId(color.id)
    setFormData({ name: color.name, value: color.value })
    setShowAddForm(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', value: '#000000' })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">Product Colors (Optional)</label>
        {!showAddForm && !editingId && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Color
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Red, Blue"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color Value (Hex)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="#FF0000"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Colors List */}
      {colors.length > 0 && (
        <div className="space-y-2">
          {colors.map((color) => (
            <div
              key={color.id}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div
                className="w-10 h-10 rounded border-2 border-gray-300"
                style={{ backgroundColor: color.value }}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{color.name}</p>
                <p className="text-xs text-gray-500">{color.value}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(color)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(color.id)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {colors.length === 0 && !showAddForm && (
        <p className="text-sm text-gray-500 italic">No colors added. Colors are optional.</p>
      )}
    </div>
  )
}

