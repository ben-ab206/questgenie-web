import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function PublicLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()

  if (session && user) {
    redirect("/dashboard")
  }

  return <>{children}</>
}