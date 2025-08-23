
import { getUser } from "@/app/api/auth";
import ClientMainLayout from "./ClientMainLayout";
import { signOutAction } from "@/app/api/actions/auth";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const user = await getUser();

    if (!user) {
        // Handle unauthenticated state - redirect or show login
        return null; // or redirect to login page
    }

    return (
        <ClientMainLayout 
            user={user}
            signOutAction={signOutAction}
        >
            {children}
        </ClientMainLayout>
    );
}
