import LoginForm from '@/components/auth/LoginForm'
import Image from 'next/image'
import Link from 'next/link'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Image src="/icons/quest-genie-icon.png" height={50} width={50} alt="Logo" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your QuestGenie account</p>
        </div>
        <LoginForm />
        <div className="mt-6 text-center">
            <p className="text-gray-600">
              {`Don't have an account? `}
              <Link href="/register">
                <span className="font-medium text-primary hover:text-primary/80" data-testid="link-register">
                  Sign up
                </span>
              </Link>
            </p>
          </div>
      </div>
    </div>
  )
}