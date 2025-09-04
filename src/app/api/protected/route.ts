import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Your protected logic here
  return NextResponse.json({
    message: 'Hello from protected route!',
    user: {
      id: user.id,
      email: user.email,
    }
  })
}