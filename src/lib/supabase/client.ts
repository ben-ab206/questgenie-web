import { createBrowserClient } from '@supabase/ssr'

console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )