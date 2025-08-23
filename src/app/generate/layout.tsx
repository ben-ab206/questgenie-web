import MainLayout from "@/components/layouts/MainLayout"

export default function GenerateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <MainLayout>
                    {children}</MainLayout>
            </body>
        </html>
    )
}