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
          <label htmlFor="settings-sitename" className="block text-sm font-semibold text-gray-900 mb-2">Site Name</label>
          <input
            type="text"
            id="settings-sitename"
            name="siteName"
            defaultValue={settings.siteName}
            autoComplete="organization"
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
            style={{ color: '#111827' }}
          />
        </div>
        <div>
          <label htmlFor="settings-email" className="block text-sm font-semibold text-gray-900 mb-2">Contact Email</label>
          <input
            type="email"
            id="settings-email"
            name="contactEmail"
            defaultValue={settings.contactEmail}
            autoComplete="email"
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
            style={{ color: '#111827' }}
          />
        </div>
        <div>
          <label htmlFor="settings-phone" className="block text-sm font-semibold text-gray-900 mb-2">Contact Phone</label>
          <input
            type="tel"
            id="settings-phone"
            name="contactPhone"
            defaultValue={settings.contactPhone}
            autoComplete="tel"
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
            style={{ color: '#111827' }}
          />
        </div>
        <div>
          <label htmlFor="settings-address" className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
          <input
            type="text"
            id="settings-address"
            name="address"
            defaultValue={settings.address}
            autoComplete="street-address"
            className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
            style={{ color: '#111827' }}
          />
        </div>
      </div>
      <div>
        <label htmlFor="settings-description" className="block text-sm font-semibold text-gray-900 mb-2">Site Description</label>
        <textarea
          id="settings-description"
          name="siteDescription"
          rows={3}
          defaultValue={settings.siteDescription}
          autoComplete="off"
          className="w-full border rounded-lg px-4 py-2 bg-white text-gray-900"
          style={{ color: '#111827' }}
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

