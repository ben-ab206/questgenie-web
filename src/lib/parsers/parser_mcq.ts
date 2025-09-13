/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question, QuestionConfig, QuestionType, Options } from '@/types/questions';

export function parseMCQResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => createMCQQuestion(item, config, index));
  } catch (error) {
    console.error('MCQ Parse error:', error);
    console.error('Raw response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse MCQ AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove common AI response prefixes
  cleaned = cleaned.replace(/^(Here's the|Here are the|The questions are:|Generated questions:).*?\n/i, '');
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  cleaned = cleaned.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '');

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in MCQ response');
  }

  return jsonMatch[0];
}

function createMCQQuestion(item: any, config: QuestionConfig, index: number): Question {
  try {
    validateMCQItem(item, index);
    
    const correctAnswers = validateAndNormalizeCorrectAnswers(item.correctAnswer, item.options);
    
    return {
      type: QuestionType.MULTIPLE_CHOICE,
      difficulty: config.difficulty,
      bloom_level: config.bloom_level,
      language: config.language,
      question: String(item.question).trim(),
      options: item.options,
      mcq_answers: correctAnswers, // All correct answer keys
      explanation: item.explanation ? String(item.explanation).trim() : undefined,
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

  // Validate correctAnswer format (should be array)
  if (!Array.isArray(item.correctAnswer)) {
    throw new Error(`correctAnswer must be an array for MCQ`);
  }

  // Validate correctAnswer has at least 1 answer (removed upper limit)
  if (item.correctAnswer.length < 1) {
    throw new Error(`correctAnswer must have at least 1 answer, got ${item.correctAnswer.length}`);
  }

  // Validate all correct answers exist in options
  const invalidAnswers = item.correctAnswer.filter((answer: string) => !item.options[answer]);
  if (invalidAnswers.length > 0) {
    throw new Error(`correctAnswer contains invalid options: ${invalidAnswers.join(', ')}`);
  }

  // Optional: Validate that not all options are correct (would make the question meaningless)
  const totalOptions = Object.keys(item.options).length;
  if (item.correctAnswer.length >= totalOptions) {
    throw new Error(`correctAnswer cannot include all available options (${totalOptions} options, ${item.correctAnswer.length} correct)`);
  }
}

function validateAndNormalizeCorrectAnswers(correctAnswer: any, options: Options): (keyof Options)[] {
  if (!Array.isArray(correctAnswer)) {
    throw new Error('correctAnswer must be an array');
  }

  const normalizedAnswers = correctAnswer.map((answer: any) => {
    const upperAnswer = String(answer).toUpperCase() as keyof Options;
    
    if (!options[upperAnswer]) {
      throw new Error(`Invalid correctAnswer: ${answer}`);
    }
    
    return upperAnswer;
  });

  // Remove duplicates and sort for consistency
  const uniqueAnswers = [...new Set(normalizedAnswers)].sort();
  
  // Validate minimum answers (removed maximum limit)
  if (uniqueAnswers.length < 1) {
    throw new Error(`MCQ must have at least 1 correct answer, got ${uniqueAnswers.length}`);
  }

  // Optional: Validate that not all options are correct
  const totalOptions = Object.keys(options).length;
  if (uniqueAnswers.length >= totalOptions) {
    throw new Error(`MCQ cannot have all options as correct (${totalOptions} options, ${uniqueAnswers.length} correct)`);
  }

  return uniqueAnswers;
}

// Legacy parser for backward compatibility with old MCQ format
export function parseLegacyMCQResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      // Handle old format: options as array, correctAnswers as array of indices
      if (Array.isArray(item.options) && Array.isArray(item.correctAnswers)) {
        return createLegacyMCQQuestion(item, config, index);
      }
      
      // Handle new format
      return createMCQQuestion(item, config, index);
    });
  } catch (error) {
    console.error('Legacy MCQ Parse error:', error);
    throw new Error(`Failed to parse legacy MCQ response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function createLegacyMCQQuestion(item: any, config: QuestionConfig, index: number): Question {
  if (!item.question) {
    throw new Error(`Question ${index + 1} missing required field: question`);
  }

  if (!Array.isArray(item.options) || item.options.length < 2) {
    throw new Error(`Question ${index + 1} must have at least 2 options`);
  }

  if (!Array.isArray(item.correctAnswers) || item.correctAnswers.length < 1) {
    throw new Error(`Question ${index + 1} must have at least 1 correct answer`);
  }

  // Validate correct answer indices
  const invalidIndices = item.correctAnswers.filter((idx: number) => 
    typeof idx !== 'number' || idx < 0 || idx >= item.options.length
  );
  
  if (invalidIndices.length > 0) {
    throw new Error(`Question ${index + 1} has invalid correctAnswers indices: ${invalidIndices.join(', ')}`);
  }

  // Convert array format to Options format
  const optionsObj: Options = {
    A: item.options[0],
    B: item.options[1],
    C: item.options[2] || '',
    D: item.options[3] || '',
  };
  
  if (item.options[4]) {
    optionsObj.E = item.options[4];
  }

  // Convert indices to option keys
  const optionKeys = ['A', 'B', 'C', 'D', 'E'];
  const mcqAnswers = item.correctAnswers.map((idx: number) => optionKeys[idx] as keyof Options);
  
  // Get primary answer text
  const primaryAnswerText = item.correctAnswers.length === 1 
    ? item.options[item.correctAnswers[0]]
    : item.correctAnswers.map((idx: number) => item.options[idx]).join(' | ');

  return {
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: config.difficulty,
    bloom_level: config.bloom_level,
    language: config.language,
    question: String(item.question).trim(),
    answer: primaryAnswerText,
    options: optionsObj,
    mcq_answers: mcqAnswers,
    explanation: item.explanation ? String(item.explanation).trim() : undefined,
  };
}

export function validateMCQQuestions(questions: Question[]): void {
  questions.forEach((question, index) => {
    if (question.type !== QuestionType.MULTIPLE_CHOICE) {
      throw new Error(`Question ${index + 1}: Expected MCQ type`);
    }

    if (!question.options) {
      throw new Error(`Question ${index + 1}: MCQ must have options`);
    }

    if (!question.mcq_answers || question.mcq_answers.length < 1) {
      throw new Error(`Question ${index + 1}: MCQ must have at least 1 correct answer`);
    }

    // Validate mcq_answers match available options
    const availableKeys = Object.keys(question.options) as (keyof Options)[];
    const invalidAnswers = question.mcq_answers.filter(answer => !availableKeys.includes(answer));
    
    if (invalidAnswers.length > 0) {
      throw new Error(`Question ${index + 1}: Invalid MCQ answers: ${invalidAnswers.join(', ')}`);
    }

    // Optional: Validate that not all options are correct
    if (question.mcq_answers.length >= availableKeys.length) {
      throw new Error(`Question ${index + 1}: MCQ cannot have all options as correct`);
    }
  });
}

// Helper function to get all correct answer texts from a Question
export function getMCQCorrectAnswerTexts(question: Question): string[] {
  if (!question.mcq_answers || !question.options) {
    return [];
  }
  
  return question.mcq_answers
    .map(key => question.options![key])
    .filter((text): text is string => text !== undefined);
}

// Helper function to check if a specific option is correct
export function isMCQOptionCorrect(question: Question, optionKey: keyof Options): boolean {
  return question.mcq_answers?.includes(optionKey) || false;
}

export { parseMCQResponse as parseResponse };