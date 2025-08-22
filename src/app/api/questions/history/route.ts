import { NextRequest, NextResponse } from 'next/server';
import { generateRequestId, calculateProcessingTime } from '@/app/api/utils';
import { createClient } from '../../supabase/server';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
          processingTime: calculateProcessingTime(startTime)
        }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const language = searchParams.get('language');

    let query = supabase
      .from('generated_questions')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (language) query = query.eq('language', language);

    const { data: questions, error: fetchError, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    const processingTime = calculateProcessingTime(startTime);

    return NextResponse.json({
      success: true,
      data: {
        questions: questions || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        processingTime
      }
    });

  } catch (error) {
    const processingTime = calculateProcessingTime(startTime);
    console.error('History fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch question history',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        processingTime
      }
    }, { status: 500 });
  }
}