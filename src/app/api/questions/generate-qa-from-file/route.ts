import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '@/app/api/questions/question-service';
import { DifficultyLevel, Language, QuestionType } from '@/types/questions';
import { ValidationError } from '@/app/api/validation';
import { calculateProcessingTime } from '@/lib/utils';
import { createClient } from '../../supabase/server';
import { getUser } from '../../auth';
import mammoth from 'mammoth';

export const runtime = 'nodejs';
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  }

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfParse = (await import('pdf-parse')).default;

    const data = await pdfParse(buffer);
    return data.text;
  }

  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}


function validateFileType(file: File): boolean {
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const allowedExtensions = ['.txt', '.pdf', '.docx'];
  const fileName = file.name.toLowerCase();
  
  return allowedTypes.includes(file.type) || 
         allowedExtensions.some(ext => fileName.endsWith(ext));
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.info('=== API Route Started ===');
    console.info('Timestamp:', new Date().toISOString());
    
    const supabase = await createClient();
    const user = await getUser();
    
    if (!user) {
      console.error('Authentication failed - no user');
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

    console.info('✅ User authenticated:', user.id);

    const contentType = request.headers.get('content-type') || '';
    let content: string;
    let quantity = 10;
    let difficulty = DifficultyLevel.MEDIUM;
    let language = Language.ENGLISH;
    let type: QuestionType;
    let topic: string;
    let source: string;
    let model = 'openai/gpt-4';

    console.info('Content type:', contentType);

    if (contentType.includes('multipart/form-data')) {
      console.info('Processing multipart form data...');
      
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        console.info('File details:', {
          name: file?.name,
          size: file?.size,
          type: file?.type,
          lastModified: file?.lastModified
        });
        
        if (!file) {
          throw new ValidationError('No file provided', 'file');
        }

        if (!validateFileType(file)) {
          throw new ValidationError(
            'Invalid file type. Only TXT, PDF, and DOCX files are supported.',
            'file'
          );
        }

        const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSizeInBytes) {
          throw new ValidationError(
            'File size too large. Maximum allowed size is 10MB.',
            'file'
          );
        }

        console.info('✅ File validation passed, extracting text...');
        content = await extractTextFromFile(file);
        console.info('✅ Text extracted successfully, length:', content.length);
        
        if (!content || content.trim().length === 0) {
          throw new ValidationError('No readable content found in the file', 'file');
        }

        const quantityStr = formData.get('quantity')?.toString();
        quantity = quantityStr ? parseInt(quantityStr) : 10;
        difficulty = (formData.get('difficulty')?.toString() as DifficultyLevel) || DifficultyLevel.MEDIUM;
        language = (formData.get('language')?.toString() as Language) || Language.ENGLISH;
        type = formData.get('type')?.toString() as QuestionType;
        topic = formData.get('topic')?.toString() || '';
        source = formData.get('source')?.toString() || '';
        model = formData.get('model')?.toString() || 'openai/gpt-4';

        console.info('✅ Form data parsed:', { 
          quantity, 
          difficulty, 
          language, 
          type, 
          topic, 
          source, 
          model,
          contentLength: content.length 
        });

      } catch (error) {
        console.error('❌ Form data processing error:', error);
        throw error;
      }
    } else {
      console.info('Processing JSON request...');
      try {
        const body = await request.json();
        ({ 
          content, 
          quantity = 10, 
          difficulty = DifficultyLevel.MEDIUM,
          language = Language.ENGLISH,
          type,
          topic,
          source,
          model = 'openai/gpt-4'
        } = body);

        if (!content || typeof content !== 'string') {
          throw new ValidationError('Content is required and must be a string', 'content');
        }
        
        console.info('✅ JSON data parsed successfully');
      } catch (error) {
        console.error('❌ JSON parsing error:', error);
        throw new ValidationError('Invalid JSON in request body', 'body');
      }
    }

    // Validate processed data
    if (!type) {
      throw new ValidationError('Question type is required', 'type');
    }

    if (content.length < 10) {
      throw new ValidationError('Content is too short. Please provide more substantial content.', 'content');
    }

    // if (content.length > 50000) {
    //   throw new ValidationError('Content is too long. Please provide shorter content or split into multiple requests.', 'content');
    // }

    if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    console.info('✅ All validations passed, generating questions...');
    const questionService = new QuestionService(process.env.NEXT_PUBLIC_OPENROUTER_API_KEY, model);

    console.info(content)

    const questions = await questionService.generateSpecificType(
      content,
      type as QuestionType,
      quantity,
      difficulty,
      language,
      topic
    );

    console.info('✅ Questions generated:', questions.length);

    // Save to database
    console.info('Saving subject to database...');
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .insert({
        user_id: user.id,
        type: type,
        content: content,
        topic: topic,
        source,
        metadata: {
          originalContentLength: content.length,
          processingMethod: contentType.includes('multipart/form-data') ? 'file_upload' : 'text_input'
        }
      })
      .select()
      .single();

    if (subjectError) {
      console.error('❌ Subject creation error:', subjectError);
      throw new Error(`Subject creation failed: ${subjectError.message}`);
    }

    console.info('✅ Subject created:', subject.id);

    // Save questions
    console.info('Saving questions to database...');
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
    } else if(type === QuestionType.TRUE_FALSE){
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
              topic,
              contentSource: contentType.includes('multipart/form-data') ? 'file' : 'text'
            }
          }))
        );
      dbError = error;
    }

    if (dbError) {
      console.error('❌ Database save error:', dbError);
    } else {
      console.info('✅ Questions saved to database');
    }

    const processingTime = calculateProcessingTime(startTime);
    console.info('✅ Processing completed in', processingTime + 'ms');
    
    const response = questionService.formatAPIResponse(
      { 
        questions, 
        count: questions.length,
        saved: !dbError,
        subject_id: subject.id,
        contentLength: content.length,
        processingMethod: contentType.includes('multipart/form-data') ? 'file_upload' : 'text_input'
      },
      processingTime
    );

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ API Error:', error);
    const processingTime = calculateProcessingTime(startTime);
    
    // Ensure we can create a QuestionService instance even when there's an error
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
    const questionService = new QuestionService(apiKey);
    
    if (error instanceof ValidationError) {
      console.error('Validation error:', error.message);
      const response = questionService.formatErrorResponse(
        error.message,
        processingTime
      );
      return NextResponse.json(response, { status: 400 });
    }

    console.error('Internal server error:', error);
    const response = questionService.formatErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      processingTime
    );
    return NextResponse.json(response, { status: 500 });
  }
}