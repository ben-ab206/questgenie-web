import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/Sidebar"
import { UserProvider } from "@/context/user-context"

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()


  if (sessionError || userError || !user || !session) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow">
        <Sidebar userEmail={profile.email} userName={profile.name} />
      </aside>

      <main className="flex-1 ml-64 h-full w-full overflow-y-auto">
        <UserProvider value={profile}>{children}</UserProvider>
      </main>
    </div>
  )
}