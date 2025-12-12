import prisma from '@/lib/prisma'
import SettingsForm from '@/components/admin/settings/SettingsForm'

async function getSettings() {
  return prisma.settings.findFirst() || {
    siteName: 'Mombasa Shisha Bongs',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  }
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-700 mt-1">Manage site configuration</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}

