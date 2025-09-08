/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question, QuestionConfig, QuestionType } from '@/types/questions';

export function parseFillInBlankResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => createQuestion(item, config, index));
  } catch (error) {
    console.error('Fill-in-the-Blank Parse error:', error);
    console.error('Raw response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse Fill-in-the-Blank AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();
  
  cleaned = cleaned.replace(/^(Here's the|Here are the|The questions are:|Generated questions:|Fill-in-the-blank questions:).*?\n/i, '');
  
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  cleaned = cleaned.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '');

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in Fill-in-the-Blank response');
  }

  return jsonMatch[0];
}

function createQuestion(item: any, config: QuestionConfig, index: number): Question {
  try {
    validateFillInBlankItem(item, index);
    
    return {
      type: QuestionType.FILL_IN_THE_BLANK,
      difficulty: config.difficulty,
      language: config.language,
      bloom_level: config.bloom_level,
      question: String(item.question).trim(),
      answer: item.answer,
    };
  } catch (error) {
    throw new Error(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateFillInBlankItem(item: any, index: number): void {
  if (!item.question) {
    throw new Error(`Missing required field 'question'`);
  }

  if (item.answer === undefined || item.answer === null) {
    throw new Error(`Missing required field 'answer'`);
  }

  if (typeof item.question !== 'string' || item.question.trim().length === 0) {
    throw new Error(`Question must be a non-empty string`);
  }

  if (!item.question.includes('______') && !item.question.includes('____') && !item.question.includes('___')) {
    throw new Error(`Question must contain blanks marked with underscores (____)`);
  }

  if (item.choices && (!Array.isArray(item.choices) || item.choices.length < 2)) {
    throw new Error(`Choices must be an array with at least 2 options`);
  }
}

function countBlanks(question: string): number {
  const blankPatterns = [
    /______/g,
    /____/g,
    /___/g
  ];
  
  let totalBlanks = 0;
  for (const pattern of blankPatterns) {
    const matches = question.match(pattern);
    if (matches) {
      totalBlanks += matches.length;
    }
  }
  
  return totalBlanks;
}

export function parseLegacyFillInBlankResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      if (item.text || item.statement || item.sentence) {
        return createLegacyQuestion(item, config, index);
      }
      
      return createQuestion(item, config, index);
    });
  } catch (error) {
    console.error('Legacy Fill-in-the-Blank Parse error:', error);
    throw new Error(`Failed to parse legacy Fill-in-the-Blank response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function createLegacyQuestion(item: any, config: QuestionConfig, index: number): Question {
  const question = item.question || item.text || item.statement || item.sentence;
  const answer = item.answer || item.correctAnswer || item.solution;

  if (!question) {
    throw new Error(`Question ${index + 1} missing required field 'question'`);
  }

  if (!answer) {
    throw new Error(`Question ${index + 1} missing required field 'answer'`);
  }

  return {
    type: QuestionType.FILL_IN_THE_BLANK,
    difficulty: config.difficulty,
    language: config.language,
    bloom_level: config.bloom_level,
    question: String(question).trim(),
    answer: answer
  };
}

export function parseFlexibleFillInBlankResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      const question = item.question || item.text || item.statement || item.sentence || item.prompt;
      const answer = item.answer || item.correctAnswer || item.solution || item.fill || item.blank;
      const choices = item.choices || item.options || item.alternatives;

      if (!question) {
        throw new Error(`Question ${index + 1}: No question field found`);
      }

      if (!answer) {
        throw new Error(`Question ${index + 1}: No answer field found`);
      }

      const normalizedItem = {
        question,
        answer,
        choices,
        explanation: item.explanation || item.reason || item.justification,
        contentReference: item.contentReference || item.source || item.reference
      };

      return createQuestion(normalizedItem, config, index);
    });
  } catch (error) {
    console.error('Flexible Fill-in-the-Blank Parse error:', error);
    throw new Error(`Failed to parse flexible Fill-in-the-Blank response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateQuestions(questions: Question[]): void {
  questions.forEach((question, index) => {
    if (question.type !== QuestionType.FILL_IN_THE_BLANK) {
      throw new Error(`Question ${index + 1}: Expected Fill-in-the-Blank type`);
    }

    const fibQuestion = question as Question;

    if (!fibQuestion.question || fibQuestion.question.trim().length === 0) {
      throw new Error(`Question ${index + 1}: Question cannot be empty`);
    }

    if (!fibQuestion.answer) {
      throw new Error(`Question ${index + 1}: Answer cannot be empty`);
    }

    const blankCount = countBlanks(fibQuestion.question);
    if (blankCount === 0) {
      throw new Error(`Question ${index + 1}: Question must contain blanks marked with underscores`);
    }

    const answerCount = Array.isArray(fibQuestion.answer) ? fibQuestion.answer.length : 1;
    if (blankCount !== answerCount) {
      console.warn(`Question ${index + 1}: Blank count (${blankCount}) doesn't match answer count (${answerCount})`);
    }

  });
}

export function analyzeQuestions(questions: Question[]): {
  totalQuestions: number;
  singleBlankCount: number;
  multipleBlankCount: number;
  questionsWithExplanations: number;
  averageBlanksPerQuestion: number;
} {
  const totalQuestions = questions.length;
  let singleBlankCount = 0;
  let multipleBlankCount = 0;
  let questionsWithExplanations = 0;
  let totalBlanks = 0;

  questions.forEach(question => {
    const blankCount = countBlanks(question.question);
    totalBlanks += blankCount;

    if (blankCount === 1) {
      singleBlankCount++;
    } else if (blankCount > 1) {
      multipleBlankCount++;
    }

    if (question.explanation) {
      questionsWithExplanations++;
    }
  });

  return {
    totalQuestions,
    singleBlankCount,
    multipleBlankCount,
    questionsWithExplanations,
    averageBlanksPerQuestion: totalQuestions > 0 ? Math.round((totalBlanks / totalQuestions) * 100) / 100 : 0
  };
}

export function formatFillInBlankForDisplay(question: Question): {
  question: string;
  answerText: string;
} {
  const answerText = Array.isArray(question.answer) 
    ? question.answer.join(', ') 
    : question.answer;

  return {
    question: question.question,
    answerText,
  };
}

export function validateAnswerFormat(question: Question): {
  isValid: boolean;
  blankCount: number;
  answerCount: number;
  message?: string;
} {
  const blankCount = countBlanks(question.question);
  const answerCount = Array.isArray(question.answer) ? question.answer.length : 1;
  
  if (blankCount === answerCount) {
    return { isValid: true, blankCount, answerCount };
  }
  
  return {
    isValid: false,
    blankCount,
    answerCount,
    message: `Question has ${blankCount} blank(s) but ${answerCount} answer(s) provided`
  };
}

export { parseFillInBlankResponse as parseResponse };