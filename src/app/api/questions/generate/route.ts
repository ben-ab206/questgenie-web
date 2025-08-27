import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '@/app/api/questions/question-service';
import { DifficultyLevel, Language, QuestionType } from '@/types/questions';
import { ValidationError } from '@/app/api/validation';
import { calculateProcessingTime } from '@/lib/utils';
import { createClient } from '../../supabase/server';
import { getUser } from '../../auth';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();
    const user = await getUser();
    
    if (!user) {
      const processingTime = calculateProcessingTime(startTime);
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        metadata: {
          timestamp: new Date().toISOString(),
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
      source,
      model = 'openai/gpt-4'
    } = body;

    if (!content || typeof content !== 'string') {
      throw new ValidationError('Content is required and must be a string', 'content');
    }

    if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const questionService = new QuestionService(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY, model);

    const questions = await questionService.generateSpecificType(
        content,
        type as QuestionType,
        quantity,
        difficulty,
        language,
        topic
      );

    // Insert subject and get the returned data
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .insert({
        user_id: user.id,
        type: type,
        content: content,
        topic: topic,
        source: source,
        metadata: {
          originalContentLength: content.length,
        }
      })
      .select()
      .single();

    if (subjectError) {
      throw new Error(`Subject creation failed: ${subjectError.message}`);
    }

    // Insert questions into database
    let dbError = null;
    
    if (type === QuestionType.MULTIPLE_CHOICE) {
      const { error } = await supabase
        .from('questions_bank')
        .insert(
          questions.map(q => ({
            subject_id: subject.id,
            question_text: q.question,
            answer_text: q.answer,
            language: q.language,
            difficulty: q.difficulty,
            type: q.type,
            options: q.options,
          }))
        );
      dbError = error;
    } if(type === QuestionType.TRUE_FALSE){
      const { error } = await supabase
        .from('questions_bank')
        .insert(
          questions.map(q => ({
            subject_id: subject.id,
            question_text: q.question,
            answer_text: q.answer,
            language: q.language,
            difficulty: q.difficulty,
            type: q.type,
          }))
        );
      dbError = error;
    } else {
      const { error } = await supabase
        .from('questions_bank')
        .insert(
          questions.map(q => ({
            ...q,
            subject_id: subject.id,
            user_id: user.id,
            metadata: {
              model,
              difficulty,
              language,
              topic
            }
          }))
        );
      dbError = error;
    }

    if (dbError) {
      console.error('Database save error:', dbError);
    }

    const processingTime = calculateProcessingTime(startTime);
    const response = questionService.formatAPIResponse(
      { 
        questions, 
        count: questions.length,
        saved: !dbError,
        subject_id: subject.id
      },
      processingTime
    );

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = calculateProcessingTime(startTime);
    const questionService = new QuestionService(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '');
    
    if (error instanceof ValidationError) {
      const response = questionService.formatErrorResponse(
        error.message,
        processingTime
      );
      return NextResponse.json(response, { status: 400 });
    }

    console.error('API Error:', error);
    const response = questionService.formatErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      processingTime
    );
    return NextResponse.json(response, { status: 500 });
  }
}