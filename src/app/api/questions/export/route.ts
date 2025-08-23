import { NextRequest, NextResponse } from 'next/server';
import { calculateProcessingTime } from '@/lib/utils';
import { createClient } from '../../supabase/server';

export async function GET(request: NextRequest) {
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
          processingTime: calculateProcessingTime(startTime)
        }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const language = searchParams.get('language');

    let query = supabase
      .from('generated_questions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (language) query = query.eq('language', language);

    const { data: questions, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    const processingTime = calculateProcessingTime(startTime);

    if (format === 'csv') {
      const csvContent = convertToCSV(questions || []);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=questions.csv'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        questions: questions || [],
        count: questions?.length || 0,
        exportedAt: new Date().toISOString()
      },
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime
      }
    });

  } catch (error) {
    const processingTime = calculateProcessingTime(startTime);
    console.error('Export error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export questions',
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime
      }
    }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertToCSV(questions: any[]): string {
  if (questions.length === 0) return '';

  const headers = ['id', 'type', 'difficulty', 'language', 'question', 'answer', 'options', 'correctOptionIndex', 'topic', 'contentSource', 'createdAt'];
  const csvRows = [headers.join(',')];

  questions.forEach(q => {
    const row = [
      q.id,
      q.type,
      q.difficulty,
      q.language,
      `"${q.question.replace(/"/g, '""')}"`,
      `"${q.answer.replace(/"/g, '""')}"`,
      q.options ? `"${JSON.stringify(q.options)}"` : '',
      q.correctOptionIndex || '',
      q.topic || '',
      `"${q.contentSource?.replace(/"/g, '""') || ''}"`,
      q.createdAt
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}