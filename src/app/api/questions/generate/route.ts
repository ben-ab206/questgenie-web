import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '@/app/api/questions/question-service';
import { BloomLevel, DifficultyLevel, Language, Question, QuestionType } from '@/types/questions';
import { ValidationError } from '@/lib/validation';
import { calculateProcessingTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

interface RequestBody {
  content: string;
  quantity?: number;
  difficulty?: DifficultyLevel;
  language?: Language;
  type: QuestionType[];
  topic?: string;
  source?: string;
  bloom_level?: string;
  model?: string;
  title: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let questionService: QuestionService;

  try {
    const { user, supabase } = await initializeServices();
    if (!user) {
      return createErrorResponse('Authentication required', 401, startTime);
    }

    const body = await parseRequestBody(request);
    validateRequestBody(body);

    questionService = createQuestionService(body.model);

    let questions = [] as Question[]

    if (body.type.length > 1) {
      questions = await questionService.generateMixedType(body.content,
        body.type,
        body.quantity,
        body.bloom_level as BloomLevel,
        body.difficulty,
        body.language)
    } else {
      questions = await questionService.generateSpecificType(
        body.content,
        body.type,
        body.quantity,
        body.bloom_level as BloomLevel,
        body.difficulty,
        body.language
      );
    }

    const subject = await createSubject(supabase, user.id, body);
    await saveQuestions(supabase, questions, subject.id);

    const processingTime = calculateProcessingTime(startTime);
    const response = questionService.formatAPIResponse(
      {
        questions,
        count: questions.length,
        saved: true,
        subject_id: subject.id
      },
      processingTime
    );

    return NextResponse.json(response);

  } catch (error) {
    return handleError(error, startTime);
  }
}

async function initializeServices() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle();
    if (data) return { user: data, supabase };
  }
  return { user: undefined, supabase }

}

async function parseRequestBody(request: NextRequest): Promise<RequestBody> {
  const body = await request.json();
  return {
    content: body.content,
    quantity: body.quantity ?? 10,
    difficulty: body.difficulty ?? DifficultyLevel.MEDIUM,
    language: body.language ?? Language.ENGLISH,
    bloom_level: body.bloom_level,
    type: body.type,
    topic: body.topic,
    source: body.source,
    model: body.model ?? 'openai/gpt-4',
    title: body.title,
    description: body.description,
  };
}

function validateRequestBody(body: RequestBody): void {
  if (!body.content || typeof body.content !== 'string') {
    throw new ValidationError('Content is required and must be a string', 'content');
  }

  if (!body.type) {
    throw new ValidationError('Question type is required', 'type');
  }

  if (!body.title) {
    throw new ValidationError('Question title is required', 'title');
  }
}

function createQuestionService(model?: string): QuestionService {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }
  return new QuestionService(apiKey, model);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createSubject(supabase: any, userId: number, body: RequestBody) {
  const { data: subject, error } = await supabase
    .from('subjects')
    .insert({
      user_id: userId,
      title: body.title,
      description: body.description,
      type: body.type,
      content: body.content,
      topic: body.topic,
      source: body.source,
      metadata: {
        originalContentLength: body.content.length,
      }
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Subject creation failed: ${error.message}`);
  }

  return subject;
}

async function saveQuestions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  questions: Question[],
  subjectId: string,
): Promise<void> {
  const questionData = questions.map(q => createQuestionData(q, subjectId));

  const { error } = await supabase
    .from('questions_bank')
    .insert(questionData);

  if (error) {
    console.error('Database save error:', error);
    throw new Error(`Failed to save questions: ${error.message}`);
  }
}

function createQuestionData(question: Question, subjectId: string) {
  const baseData = {
    subject_id: subjectId,
    question_text: question.question,
    answer_text: question.answer,
    language: question.language,
    difficulty: question.difficulty,
    type: question.type,
    explanation: question.explanation,
    matching_questions: question.matching_questions,
    matching_answers: question.matching_answers,
    mcq_answers: question.mcq_answers,
  };

  // Add options for multiple choice questions
  if (question.type === QuestionType.MULTIPLE_CHOICE && question.options) {
    return { ...baseData, options: question.options };
  }

  return baseData;
}

function createErrorResponse(message: string, status: number, startTime: number) {
  const processingTime = calculateProcessingTime(startTime);
  return NextResponse.json({
    success: false,
    error: message,
    metadata: {
      timestamp: new Date().toISOString(),
      processingTime
    }
  }, { status });
}

function handleError(error: unknown, startTime: number, questionService?: QuestionService) {
  const processingTime = calculateProcessingTime(startTime);
  const service = questionService || new QuestionService('', '');

  if (error instanceof ValidationError) {
    const response = service.formatErrorResponse(error.message, processingTime);
    return NextResponse.json(response, { status: 400 });
  }

  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : 'Internal server error';
  const response = service.formatErrorResponse(message, processingTime);
  return NextResponse.json(response, { status: 500 });
}