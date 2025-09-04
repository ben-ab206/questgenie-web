import { User } from '@/types/auth'
import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'

export const getUser = async () : Promise<User | undefined> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle();
    if (data) return data
  }
  return undefined
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireNoAuth() {
  const user = await getUser()
  if (user) {
    redirect('/dashboard')
  }
}