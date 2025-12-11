import { auth } from '@clerk/nextjs/server'

export default async function TestClerkPage() {
  const { userId } = await auth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Clerk Connection Test</h1>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">User ID:</p>
            <p className="font-mono text-sm">
              {userId || '❌ Not signed in'}
            </p>
          </div>

          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">Clerk Status:</p>
            <p className={`font-semibold ${userId ? 'text-green-600' : 'text-red-600'}`}>
              {userId ? '✅ Clerk is working!' : '❌ Clerk not initialized'}
            </p>
          </div>

          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">Environment:</p>
            <p className="text-sm">
              Publishable Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}
            </p>
            <p className="text-sm">
              Secret Key: {process.env.CLERK_SECRET_KEY ? '✅ Set' : '❌ Missing'}
            </p>
          </div>

          <div className="space-y-2">
            <a
              href="/sign-in"
              className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Go to Sign In
            </a>
            <a
              href="/sign-up"
              className="block w-full text-center bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Go to Sign Up
            </a>
            <a
              href="/"
              className="block w-full text-center bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

