import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/admin')
  }

  // Check admin role
  const user = await currentUser()
  const role = (user?.publicMetadata as { role?: string })?.role

  if (role !== 'admin') {
    redirect('/')
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

