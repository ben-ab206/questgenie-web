import MainLayout from "@/components/layouts/MainLayout"

export default function GenerateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <MainLayout>
            {children}</MainLayout>
    )
}