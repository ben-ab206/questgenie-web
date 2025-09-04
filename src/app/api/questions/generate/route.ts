import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '@/app/api/questions/question-service';
import { DifficultyLevel, Language, Question, QuestionType } from '@/types/questions';
import { ValidationError } from '@/app/api/validation';
import { calculateProcessingTime } from '@/lib/utils';
import { createClient } from '../../supabase/server';
import { getUser } from '../../auth';

interface RequestBody {
  content: string;
  quantity?: number;
  difficulty?: DifficultyLevel;
  language?: Language;
  type: QuestionType;
  topic?: string;
  source?: string;
  model?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let questionService: QuestionService;

  try {
    // Initialize services and validate user
    const { user, supabase } = await initializeServices();
    if (!user) {
      return createErrorResponse('Authentication required', 401, startTime);
    }

    // Parse and validate request body
    const body = await parseRequestBody(request);
    validateRequestBody(body);

    // Initialize question service
    questionService = createQuestionService(body.model);

    // Generate questions
    const questions = await questionService.generateSpecificType(
      body.content,
      body.type,
      body.quantity,
      body.difficulty,
      body.language,
    );

    // Save to database
    const subject = await createSubject(supabase, user.id, body);
    await saveQuestions(supabase, questions, subject.id);

    // Return success response
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
  const user = await getUser();
  return { user, supabase };
}

async function parseRequestBody(request: NextRequest): Promise<RequestBody> {
  const body = await request.json();
  return {
    content: body.content,
    quantity: body.quantity ?? 10,
    difficulty: body.difficulty ?? DifficultyLevel.MEDIUM,
    language: body.language ?? Language.ENGLISH,
    type: body.type,
    topic: body.topic,
    source: body.source,
    model: body.model ?? 'openai/gpt-4'
  };
}

function validateRequestBody(body: RequestBody): void {
  if (!body.content || typeof body.content !== 'string') {
    throw new ValidationError('Content is required and must be a string', 'content');
  }

  if (!body.type) {
    throw new ValidationError('Question type is required', 'type');
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
    matching_answers: question.matching_answers
  };

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