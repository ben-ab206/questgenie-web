import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || user) {
        redirect("/dashboard")
    }
    return (
        <>{children}</>
    )
}