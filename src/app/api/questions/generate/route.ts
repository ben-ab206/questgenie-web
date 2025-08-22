import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '@/app/api/questions/question-service';
import { DifficultyLevel, Language, QuestionType } from '@/types/questions';
import { ValidationError } from '@/app/api/validation';
import { generateRequestId, calculateProcessingTime } from '@/app/api/utils';
import { createClient } from '../../supabase/server';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      const processingTime = calculateProcessingTime(startTime);
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
          processingTime
        }
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      content, 
      quantity = 10, 
      difficulty = DifficultyLevel.MEDIUM,
      language = Language.ENGLISH,
      type,
      topic,
      model = 'openai/gpt-4'
    } = body;

    if (!content || typeof content !== 'string') {
      throw new ValidationError('Content is required and must be a string', 'content');
    }

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const questionService = new QuestionService(process.env.OPENROUTER_API_KEY, model);

    let questions;
    
    if (type) {
      questions = await questionService.generateSpecificType(
        content,
        type as QuestionType,
        quantity,
        difficulty,
        language,
        topic
      );
    } else {
      questions = await questionService.generateMixedQuestions(
        content,
        quantity,
        difficulty,
        language,
        topic
      );
    }

    const { error: dbError } = await supabase
      .from('generated_questions')
      .insert(
        questions.map(q => ({
          ...q,
          user_id: session.user.id,
          metadata: {
            model,
            difficulty,
            language,
            topic
          }
        }))
      );

    if (dbError) {
      console.error('Database save error:', dbError);
    }

    const processingTime = calculateProcessingTime(startTime);
    const response = questionService.formatAPIResponse(
      { 
        questions, 
        count: questions.length,
        saved: !dbError
      },
      requestId,
      processingTime
    );

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = calculateProcessingTime(startTime);
    const questionService = new QuestionService(process.env.OPENROUTER_API_KEY || '');
    
    if (error instanceof ValidationError) {
      const response = questionService.formatErrorResponse(
        error.message,
        requestId,
        processingTime
      );
      return NextResponse.json(response, { status: 400 });
    }

    console.error('API Error:', error);
    const response = questionService.formatErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      requestId,
      processingTime
    );
    return NextResponse.json(response, { status: 500 });
  }
}