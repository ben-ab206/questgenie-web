/* eslint-disable @typescript-eslint/no-explicit-any */
import { MCQResponse, Question, QuestionConfig, QuestionType } from '@/types/questions';

export function parseMCQResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => createQuestion(item, config, index));
  } catch (error) {
    console.error('MCQ Parse error:', error);
    console.error('Raw response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse MCQ AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();
  
  cleaned = cleaned.replace(/^(Here's the|Here are the|The questions are:|Generated questions:).*?\n/i, '');
  
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  cleaned = cleaned.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '');

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in MCQ response');
  }

  return jsonMatch[0];
}

function createQuestion(item: any, config: QuestionConfig, index: number): Question {
  try {
    validateMCQItem(item, index);
    
    const optionsArray = convertOptionsToArray(item.options);
    const correctIndex = getCorrectOptionIndex(item.correctAnswer, item.options);
    
    return {
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: config.difficulty,
      bloom_level: config.bloom_level,
      language: config.language,
      question: String(item.question).trim(),
      answer: optionsArray[correctIndex],
      options: item.options,
    };
  } catch (error) {
    throw new Error(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateMCQItem(item: any, index: number): void {
  if (!item.question) {
    throw new Error(`Missing required field 'question'`);
  }

  if (!item.options || typeof item.options !== 'object') {
    throw new Error(`Missing or invalid 'options' object`);
  }

  if (!item.correctAnswer) {
    throw new Error(`Missing required field 'correctAnswer'`);
  }

  // Validate options structure
  const requiredOptions = ['A', 'B', 'C', 'D'];
  const hasAllRequired = requiredOptions.every(opt => 
    item.options[opt] && typeof item.options[opt] === 'string'
  );

  if (!hasAllRequired) {
    throw new Error(`Options must include A, B, C, D with string values`);
  }

  // Validate correct answer
  if (!item.options[item.correctAnswer]) {
    throw new Error(`correctAnswer '${item.correctAnswer}' does not match any option`);
  }
}

function convertOptionsToArray(options: MCQResponse['options']): string[] {
  const optionsArray: string[] = [];
  
  // Always include A, B, C, D in order
  const optionKeys = ['A', 'B', 'C', 'D', 'E'] as const;
  
  for (const key of optionKeys) {
    if (options[key]) {
      optionsArray.push(String(options[key]).trim());
    }
  }

  return optionsArray;
}

function getCorrectOptionIndex(correctAnswer: string, options: MCQResponse['options']): number {
  const optionKeys = ['A', 'B', 'C', 'D', 'E'];
  const index = optionKeys.indexOf(correctAnswer.toUpperCase());
  
  if (index === -1 || !options[correctAnswer as keyof typeof options]) {
    throw new Error(`Invalid correctAnswer: ${correctAnswer}`);
  }

  return index;
}


// Legacy parser for backward compatibility with old format
export function parseLegacyMCQResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      // Handle old format: options as array, correctOptionIndex as number
      if (Array.isArray(item.options) && typeof item.correctOptionIndex === 'number') {
        return createLegacyMCQQuestion(item, config, index);
      }
      
      // Handle new format
      return createQuestion(item, config, index);
    });
  } catch (error) {
    console.error('Legacy MCQ Parse error:', error);
    throw new Error(`Failed to parse legacy MCQ response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function createLegacyMCQQuestion(item: any, config: QuestionConfig, index: number): Question {
  if (!item.question || !item.answer) {
    throw new Error(`Question ${index + 1} missing required fields (question, answer)`);
  }

  if (!Array.isArray(item.options) || item.options.length < 2) {
    throw new Error(`Question ${index + 1} must have at least 2 options`);
  }

  if (typeof item.correctOptionIndex !== 'number' || 
      item.correctOptionIndex < 0 || 
      item.correctOptionIndex >= item.options.length) {
    throw new Error(`Question ${index + 1} has invalid correctOptionIndex`);
  }

  return {
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: config.difficulty,
    bloom_level: config.bloom_level,
    language: config.language,
    question: String(item.question).trim(),
    answer: String(item.options[item.correctOptionIndex]).trim(),
    options: item.options.map((opt: any) => String(opt).trim())
  };
}

export function validateMCQQuestions(questions: Question[]): void {
  questions.forEach((question, index) => {
    if (question.type !== QuestionType.MULTIPLE_CHOICE) {
      throw new Error(`Question ${index + 1}: Expected MCQ type`);
    }

    if (!question.options) {
      throw new Error(`Question ${index + 1}: MCQ must have at least 2 options`);
    }
  });
}

export { parseMCQResponse as parseResponse };