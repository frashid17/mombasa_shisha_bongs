import BundleForm from '@/components/admin/bundles/BundleForm'

export default function NewBundlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Product Bundle</h1>
        <p className="text-gray-700 mt-1">Create a new product bundle with discounted pricing</p>
      </div>
      <BundleForm />
    </div>
  )
}

