import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Make this function async to await cookies()
export const createClient = async () => {
  const cookieStore = await cookies(); // ✅ Await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors in server-only context
          }
        },
      },
    }
  );
};
