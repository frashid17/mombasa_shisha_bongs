'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Edit2, Trash2 } from 'lucide-react'

interface Specification {
  id: string
  type: string
  name: string
  value: string | null
  price: number | null
  isActive: boolean
  position: number
}

// Predefined specification types and their common values
const specTypes = [
  { value: 'Size', label: 'Size', commonValues: ['250g', '500g', '1kg', '50g', '100g'] },
  { value: 'Flavor', label: 'Flavor', commonValues: ['Mint', 'Gum with Mint', 'Apple', 'Grape', 'Watermelon', 'Strawberry', 'Blueberry', 'Cherry', 'Vanilla', 'Chocolate'] },
  { value: 'Weight', label: 'Weight', commonValues: ['250g', '500g', '1kg'] },
  { value: 'Volume', label: 'Volume', commonValues: ['250ml', '500ml', '1L'] },
  { value: 'Other', label: 'Other', commonValues: [] },
]

interface ProductSpecsManagerProps {
  productId: string
  initialSpecs?: Specification[]
}

export default function ProductSpecsManager({ productId, initialSpecs = [] }: ProductSpecsManagerProps) {
  const [specs, setSpecs] = useState<Specification[]>(initialSpecs)
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ 
    type: 'Size', 
    name: '', 
    value: '',
    price: '',
    position: 0 
  })

  useEffect(() => {
    loadSpecs()
  }, [productId])

  const loadSpecs = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/specs`)
      if (res.ok) {
        const data = await res.json()
        setSpecs(data.specs || [])
      }
    } catch (error) {
      console.error('Failed to load specifications:', error)
    }
  }

  const handleAdd = async () => {
    if (!formData.type || !formData.name.trim()) {
      alert('Please enter specification type and name')
      return
    }

    setLoading(true)
    try {
      // Parse comma-separated values
      const names = formData.name
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0)

      if (names.length === 0) {
        alert('Please enter at least one specification name')
        setLoading(false)
        return
      }

      // Determine if price should be allowed for this type
      const priceAllowedTypes = ['Size', 'Weight', 'Volume']
      const allowPrice = priceAllowedTypes.includes(formData.type)
      const priceValue = allowPrice && formData.price.trim() ? parseFloat(formData.price.trim()) : null

      // Create all specifications
      const promises = names.map((name, index) =>
        fetch(`/api/admin/products/${productId}/specs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: formData.type,
            name: name,
            value: formData.value.trim() || null,
            price: priceValue,
            position: formData.position + index,
          }),
        })
      )

      const results = await Promise.all(promises)
      const errors = results.filter(r => !r.ok)

      if (errors.length > 0) {
        let errorData
        try {
          errorData = await errors[0].json()
        } catch (e) {
          const text = await errors[0].text()
          console.error('Failed to parse error response:', text)
          errorData = { error: text || 'Failed to add some specifications' }
        }
        
        const errorMessage = errorData.error || 'Failed to add some specifications'
        console.error('Error creating specification:', errorData)
        console.error('Full error response:', errors[0])
        
        // Show more helpful error message if it's a schema issue
        if (errorMessage.includes('Database schema error') || errorMessage.includes('Unknown argument')) {
          alert(`Database Error: ${errorMessage}\n\nPlease run: npx prisma db push && npx prisma generate`)
        } else {
          const details = errorData.details ? `\n\nDetails: ${errorData.details}` : ''
          const code = errorData.code ? `\n\nError Code: ${errorData.code}` : ''
          alert(`${errorMessage}${details}${code}`)
        }
      } else {
        await loadSpecs()
        setFormData({ type: 'Size', name: '', value: '', price: '', position: 0 })
        setShowAddForm(false)
        if (names.length > 1) {
          alert(`Successfully added ${names.length} specifications`)
        }
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add specification')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (specId: string) => {
    if (!formData.type || !formData.name.trim()) {
      alert('Please enter specification type and name')
      return
    }

    setLoading(true)
    try {
      // Determine if price should be allowed for this type
      const priceAllowedTypes = ['Size', 'Weight', 'Volume']
      const allowPrice = priceAllowedTypes.includes(formData.type)
      const priceValue = allowPrice && formData.price.trim() ? parseFloat(formData.price.trim()) : null

      const res = await fetch(`/api/admin/products/${productId}/specs/${specId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          name: formData.name.trim(),
          value: formData.value.trim() || null,
          price: priceValue,
          position: formData.position,
        }),
      })

      if (res.ok) {
        await loadSpecs()
        setFormData({ type: 'Size', name: '', value: '', price: '', position: 0 })
        setEditingId(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update specification')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to update specification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (specId: string) => {
    if (!confirm('Are you sure you want to delete this specification?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/specs/${specId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await loadSpecs()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete specification')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to delete specification')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (spec: Specification) => {
    setEditingId(spec.id)
    setFormData({ 
      type: spec.type, 
      name: spec.name, 
      value: spec.value || '',
      price: spec.price ? spec.price.toString() : '',
      position: spec.position 
    })
    setShowAddForm(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ type: 'Size', name: '', value: '', price: '', position: 0 })
    setShowAddForm(false)
  }

  const selectedType = specTypes.find(t => t.value === formData.type)
  const commonValues = selectedType?.commonValues || []
  
  // Types that allow pricing
  const priceAllowedTypes = ['Size', 'Weight', 'Volume']
  const allowPrice = priceAllowedTypes.includes(formData.type)

  // Group specs by type
  const specsByType = specs.reduce((acc, spec) => {
    if (!acc[spec.type]) acc[spec.type] = []
    acc[spec.type].push(spec)
    return acc
  }, {} as Record<string, Specification[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">
          Product Specifications (Optional)
          <span className="text-xs font-normal text-gray-500 ml-2">
            e.g., Size (250g), Flavor (Mint)
          </span>
        </label>
        {!showAddForm && !editingId && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Specification
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, name: '' })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
              >
                {specTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name {!editingId && <span className="text-gray-500 font-normal">(comma-separated for multiple)</span>}
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  id="spec-name"
                  name="specName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={editingId 
                    ? `e.g., ${commonValues[0] || 'Enter name'}` 
                    : `e.g., ${commonValues[0] || 'Mint'} or ${commonValues.slice(0, 3).join(', ') || 'Mint, Apple, Grape'}`}
                  autoComplete="off"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
                  list={editingId ? `common-${formData.type}` : undefined}
                />
                {commonValues.length > 0 && editingId && (
                  <datalist id={`common-${formData.type}`}>
                    {commonValues.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                )}
                {!editingId && (
                  <p className="text-xs text-gray-500">
                    💡 Tip: Separate multiple values with commas (e.g., "Mint, Gum with Mint, Apple")
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Value (Optional)
                <span className="text-gray-500 font-normal ml-1">- Additional info</span>
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Optional value"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
              />
            </div>
            {allowPrice && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price (Optional)
                  <span className="text-gray-500 font-normal ml-1">- Override product price</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 1500.00"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use product base price
                </p>
              </div>
            )}
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

      {/* Specifications List */}
      {specs.length > 0 && (
        <div className="space-y-3">
          {Object.entries(specsByType).map(([type, typeSpecs]) => (
            <div key={type} className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{type}</h4>
              {typeSpecs.map((spec) => (
                <div
                  key={spec.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{spec.name}</p>
                      {spec.price !== null && priceAllowedTypes.includes(spec.type) && (
                        <span className="text-xs font-semibold text-green-600">
                          KES {spec.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {spec.value && (
                      <p className="text-xs text-gray-500">{spec.value}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(spec)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(spec.id)}
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
          ))}
        </div>
      )}

      {specs.length === 0 && !showAddForm && (
        <p className="text-sm text-gray-500 italic">No specifications added. Specifications are optional.</p>
      )}
    </div>
  )
}

