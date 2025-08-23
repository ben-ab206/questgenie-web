import MainLayout from '@/components/layouts/MainLayout'
import { requireAuth } from '@/app/api/auth'
import { signOutAction } from '@/app/api/actions/auth'

export default async function HomePage() {
 const user = await requireAuth()

  return <MainLayout>
<div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user.email}!
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Protected Dashboard Content
            </h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600">
                This content is only visible to authenticated users.
              </p>
              <div className="mt-4">
                <h3 className="font-semibold">User Information:</h3>
                <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </MainLayout>
}