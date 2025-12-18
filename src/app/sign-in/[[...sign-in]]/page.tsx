import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue shopping
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-xl rounded-lg mx-auto',
                formButtonPrimary:
                  'bg-primary-600 hover:bg-primary-700 text-white',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'border border-gray-300 hover:bg-gray-50',
                formFieldInput:
                  'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
                footerActionLink: 'text-primary-600 hover:text-primary-700',
              },
            }}
            redirectUrl="/"
          />
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

