import { NextRequest, NextResponse } from 'next/server'
import { calculateProcessingTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now()
  const { id } = params

  try {
    const { user, supabase } = await initializeServices()

    if (!user) {
      return createErrorResponse('Authentication required', 401, startTime)
    }

    const { data: subject, error } = await supabase
      .from('subjects')
      .select('*, questions_bank(*)')
      .eq('user_id', user.id)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Database error:', error)
      return createErrorResponse('Failed to fetch subject', 500, startTime)
    }

    if (!subject) {
      return createErrorResponse('Subject not found', 404, startTime)
    }

    const processingTime = calculateProcessingTime(startTime)

    return NextResponse.json({
      success: true,
      data: subject,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return createErrorResponse('Internal server error', 500, startTime)
  }
}

async function initializeServices() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (data) {
      return { user: data, supabase }
    }
  }

  return { user: undefined, supabase }
}

function createErrorResponse(message: string, status: number, startTime: number) {
  const processingTime = calculateProcessingTime(startTime)

  return NextResponse.json(
    {
      success: false,
      error: message,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
      },
    },
    { status }
  )
}
