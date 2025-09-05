import { Inter } from 'next/font/google'
import './globals.css'
import { ReactQueryProvider } from './provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Quest Genie',
  description: 'Next.js app with Supabase authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}