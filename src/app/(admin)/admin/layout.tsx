import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Check authentication
    const { userId } = await auth()

    if (!userId) {
      redirect('/sign-in?redirect_url=/admin')
    }

    // Check admin role
    const user = await currentUser()
    const role = (user?.publicMetadata as { role?: string })?.role

    if (role !== 'admin') {
      // Show helpful error page instead of silent redirect
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
            <p className="text-gray-600 mb-6">
              You need admin privileges to access this page. Your current role: <strong>{role || 'none'}</strong>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <h2 className="font-semibold text-blue-900 mb-2">How to get admin access:</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Go to your <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="underline">Clerk Dashboard</a></li>
                <li>Navigate to <strong>Users</strong> → Find your user</li>
                <li>Go to <strong>Metadata</strong> tab</li>
                <li>In <strong>Public metadata</strong>, add: <code className="bg-blue-100 px-1 rounded">{"role": "admin"}</code></li>
                <li>Save and refresh this page</li>
              </ol>
            </div>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      )
    }
  } catch (error: any) {
    // Handle Clerk API errors gracefully
    console.error('Admin layout error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">
            There was an error checking your authentication. Please try signing out and signing back in.
          </p>
          <div className="space-y-3">
            <a
              href="/sign-out"
              className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors mr-3"
            >
              Sign Out
            </a>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <AdminHeader />

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

