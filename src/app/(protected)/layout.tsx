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
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-primary/10">
      <Sidebar userEmail={profile.email} userName={profile.name} />
      <main className="flex-1">
        <UserProvider value={profile}>{children}</UserProvider>
      </main>
    </div>
  )
}
