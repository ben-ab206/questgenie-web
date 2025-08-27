/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrueFalseQuestion, Question, QuestionConfig, QuestionType, DifficultyLevel } from '@/types/questions';
import { truncateContent } from '../../../lib/utils';

export function parseTrueFalseResponse(response: string, config: QuestionConfig): TrueFalseQuestion[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => createTrueFalseQuestion(item, config, index));
  } catch (error) {
    console.error('True/False Parse error:', error);
    console.error('Raw response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse True/False AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove common AI response prefixes
  cleaned = cleaned.replace(/^(Here's the|Here are the|The statements are:|Generated statements:|True\/False questions:).*?\n/i, '');
  
  // Remove code block markers
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  
  // Remove text before first [ and after last ]
  cleaned = cleaned.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '');

  // Extract JSON array
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in True/False response');
  }

  return jsonMatch[0];
}

function createTrueFalseQuestion(item: any, config: QuestionConfig, index: number): TrueFalseQuestion {
  try {
    validateTrueFalseItem(item, index);
    
    const answer = normalizeAnswerToString(item.answer);
    
    return {
      type: QuestionType.TRUE_FALSE,
      difficulty: config.difficulty,
      language: config.language.toString(),
      question: String(item.statement || item.question).trim(),
      answer: answer,
      explanation: item.explanation ? String(item.explanation).trim() : undefined,
      contentReference: item.contentReference ? String(item.contentReference).trim() : undefined
    };
  } catch (error) {
    throw new Error(`Statement ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateTrueFalseItem(item: any, index: number): void {
  const statement = item.statement || item.question;
  
  if (!statement) {
    throw new Error(`Missing required field 'statement' or 'question'`);
  }

  if (item.answer === undefined || item.answer === null) {
    throw new Error(`Missing required field 'answer'`);
  }

  // Validate statement is a meaningful string
  if (typeof statement !== 'string' || statement.trim().length === 0) {
    throw new Error(`Statement/question must be a non-empty string`);
  }

  // Validate answer can be normalized
  try {
    normalizeAnswerToString(item.answer);
  } catch (error) {
    throw new Error(`Invalid answer format: ${item.answer}. Must be boolean, 'true', 'false', 1, or 0`);
  }
}

function normalizeAnswerToString(answer: any): string {
  // Handle boolean values
  if (typeof answer === 'boolean') {
    return answer ? 'True' : 'False';
  }

  // Handle string values
  if (typeof answer === 'string') {
    const lowercased = answer.toLowerCase().trim();
    
    if (lowercased === 'true' || lowercased === '1' || lowercased === 'yes') {
      return 'True';
    }
    
    if (lowercased === 'false' || lowercased === '0' || lowercased === 'no') {
      return 'False';
    }
  }

  // Handle number values
  if (typeof answer === 'number') {
    return answer !== 0 ? 'True' : 'False';
  }

  throw new Error(`Invalid answer format: ${answer}`);
}

// Legacy parser for backward compatibility with old format
export function parseLegacyTrueFalseResponse(response: string, config: QuestionConfig): TrueFalseQuestion[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      // Handle old format: question instead of statement, isTrue instead of answer
      if (item.question && item.isTrue !== undefined) {
        return createLegacyTrueFalseQuestion(item, config, index);
      }
      
      // Handle new format
      return createTrueFalseQuestion(item, config, index);
    });
  } catch (error) {
    console.error('Legacy True/False Parse error:', error);
    throw new Error(`Failed to parse legacy True/False response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function createLegacyTrueFalseQuestion(item: any, config: QuestionConfig, index: number): TrueFalseQuestion {
  if (!item.question && !item.statement) {
    throw new Error(`Statement ${index + 1} missing required field 'question' or 'statement'`);
  }

  if (item.isTrue === undefined && item.answer === undefined) {
    throw new Error(`Statement ${index + 1} missing required field 'isTrue' or 'answer'`);
  }

  const answerValue = item.answer !== undefined ? item.answer : item.isTrue;
  const answer = normalizeAnswerToString(answerValue);

  return {
    type: QuestionType.TRUE_FALSE,
    difficulty: config.difficulty,
    language: config.language.toString(),
    question: String(item.question || item.statement).trim(),
    answer: answer,
    explanation: item.explanation ? String(item.explanation).trim() : undefined,
    contentReference: item.contentReference ? String(item.contentReference).trim() : undefined
  };
}

// Alternative parser for different response formats
export function parseFlexibleTrueFalseResponse(response: string, config: QuestionConfig): TrueFalseQuestion[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      // Try different field name variations
      const statement = item.statement || item.question || item.text;
      const answer = item.answer !== undefined ? item.answer : 
                    item.isTrue !== undefined ? item.isTrue :
                    item.correct !== undefined ? item.correct :
                    item.value;

      if (!statement) {
        throw new Error(`Statement ${index + 1}: No statement/question field found`);
      }

      if (answer === undefined || answer === null) {
        throw new Error(`Statement ${index + 1}: No answer field found`);
      }

      const normalizedItem = {
        statement: statement,
        answer,
        explanation: item.explanation || item.reason || item.justification,
        contentReference: item.contentReference || item.source || item.reference
      };

      return createTrueFalseQuestion(normalizedItem, config, index);
    });
  } catch (error) {
    console.error('Flexible True/False Parse error:', error);
    throw new Error(`Failed to parse flexible True/False response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function to validate parsed True/False questions
export function validateTrueFalseQuestions(questions: Question[]): void {
  questions.forEach((question, index) => {
    if (question.type !== QuestionType.TRUE_FALSE) {
      throw new Error(`Question ${index + 1}: Expected True/False type`);
    }

    const tfQuestion = question as TrueFalseQuestion;

    if (!tfQuestion.question || tfQuestion.question.trim().length === 0) {
      throw new Error(`Question ${index + 1}: Question cannot be empty`);
    }

    if (!tfQuestion.answer || (tfQuestion.answer !== 'True' && tfQuestion.answer !== 'False')) {
      throw new Error(`Question ${index + 1}: Answer must be 'True' or 'False'`);
    }

    // Check for ambiguous language
    const ambiguousWords = ['sometimes', 'usually', 'often', 'might', 'could', 'possibly', 'probably'];
    const hasAmbiguousWords = ambiguousWords.some(word => 
      tfQuestion.question.toLowerCase().includes(word)
    );
    
    if (hasAmbiguousWords) {
      console.warn(`Question ${index + 1}: Contains potentially ambiguous language`);
    }
  });
}

// Utility to check answer distribution
export function analyzeAnswerDistribution(questions: TrueFalseQuestion[]): {
  totalQuestions: number;
  trueCount: number;
  falseCount: number;
  truePercentage: number;
  falsePercentage: number;
  isBalanced: boolean;
} {
  const totalQuestions = questions.length;
  const trueCount = questions.filter(q => q.answer === 'True').length;
  const falseCount = questions.filter(q => q.answer === 'False').length;
  
  const truePercentage = totalQuestions > 0 ? (trueCount / totalQuestions) * 100 : 0;
  const falsePercentage = totalQuestions > 0 ? (falseCount / totalQuestions) * 100 : 0;
  
  // Consider balanced if neither true nor false exceeds 70%
  const isBalanced = Math.abs(truePercentage - falsePercentage) <= 40;

  return {
    totalQuestions,
    trueCount,
    falseCount,
    truePercentage: Math.round(truePercentage * 100) / 100,
    falsePercentage: Math.round(falsePercentage * 100) / 100,
    isBalanced
  };
}

// Utility to format True/False questions for display
export function formatTrueFalseForDisplay(question: TrueFalseQuestion): {
  question: string;
  answerText: string;
  hasExplanation: boolean;
} {
  return {
    question: question.question,
    answerText: question.answer,
    hasExplanation: !!question.explanation
  };
}

// Export main parser function
export { parseTrueFalseResponse as parseResponse };