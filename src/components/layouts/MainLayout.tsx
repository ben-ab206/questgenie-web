import { signOutAction } from "../../app/api/actions/auth"
import { getUser } from "../../app/api/auth"
import Sidebar from "../Sidebar"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const user = await getUser()

    if (user) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar userEmail={user?.email} userName={user?.name} onLogout={signOutAction} />

                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">{children}</div>
                </main>
            </div>
        )
    }
}