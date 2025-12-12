'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsForm({ settings }: { settings: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      siteName: formData.get('siteName'),
      siteDescription: formData.get('siteDescription'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      address: formData.get('address'),
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.refresh()
        alert('Settings saved!')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Site Name</label>
          <input
            type="text"
            name="siteName"
            defaultValue={settings.siteName}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Email</label>
          <input
            type="email"
            name="contactEmail"
            defaultValue={settings.contactEmail}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Phone</label>
          <input
            type="tel"
            name="contactPhone"
            defaultValue={settings.contactPhone}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
          <input
            type="text"
            name="address"
            defaultValue={settings.address}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Site Description</label>
        <textarea
          name="siteDescription"
          rows={3}
          defaultValue={settings.siteDescription}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  )
}

