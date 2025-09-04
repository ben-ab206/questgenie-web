import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch additional data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
          <p className="text-gray-600">Email: {user.email}</p>
          <p className="text-gray-600">ID: {user.id}</p>
          {profile && (
            <p className="text-gray-600">Name: {profile.full_name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Statistics</h3>
            <p className="text-3xl font-bold text-blue-600">42</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">$12,345</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Users</h3>
            <p className="text-3xl font-bold text-purple-600">1,234</p>
          </div>
        </div>
      </div>
    </div>
  )
}