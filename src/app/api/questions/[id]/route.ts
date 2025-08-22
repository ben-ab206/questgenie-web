import { NextRequest, NextResponse } from 'next/server';
import { generateRequestId, calculateProcessingTime } from '@/app/api/utils';
import { createClient } from '../../supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: question, error: fetchError } = await supabase
      .from('generated_questions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Question not found',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId,
            processingTime: calculateProcessingTime(startTime)
          }
        }, { status: 404 });
      }
      throw new Error(`Database error: ${fetchError.message}`);
    }

    const processingTime = calculateProcessingTime(startTime);

    return NextResponse.json({
      success: true,
      data: question,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        processingTime
      }
    });

  } catch (error) {
    const processingTime = calculateProcessingTime(startTime);
    console.error('Question fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch question',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        processingTime
      }
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error: deleteError } = await supabase
      .from('generated_questions')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (deleteError) {
      throw new Error(`Database error: ${deleteError.message}`);
    }

    const processingTime = calculateProcessingTime(startTime);

    return NextResponse.json({
      success: true,
      data: { deleted: true },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        processingTime
      }
    });

  } catch (error) {
    const processingTime = calculateProcessingTime(startTime);
    console.error('Question delete error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete question',
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        processingTime
      }
    }, { status: 500 });
  }
}