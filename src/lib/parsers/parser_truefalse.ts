/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question, QuestionConfig, QuestionType } from '@/types/questions';

export function parseTrueFalseResponse(response: string, config: QuestionConfig): Question[] {
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
  
  cleaned = cleaned.replace(/^(Here's the|Here are the|The questions are:|Generated questions:|True\/False questions:).*?\n/i, '');
  
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  
  cleaned = cleaned.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '');

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in True/False response');
  }

  return jsonMatch[0];
}

function createTrueFalseQuestion(item: any, config: QuestionConfig, index: number): Question {
  try {
    validateTrueFalseItem(item, index);
    
    const answer = normalizeAnswerToString(item.answer);
    
    return {
      type: QuestionType.TRUE_FALSE,
      difficulty: config.difficulty,
      language: config.language,
      bloom_level: config.bloom_level,
      question: String(item.question || item.question).trim(),
      answer: answer,
      explanation: item.explanation ? String(item.explanation).trim() : undefined,
    };
  } catch (error) {
    throw new Error(`question ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateTrueFalseItem(item: any, index: number): void {
  const question = item.question || item.question;
  
  if (!question) {
    throw new Error(`Missing required field 'question' or 'question'`);
  }

  if (item.answer === undefined || item.answer === null) {
    throw new Error(`Missing required field 'answer'`);
  }

  if (typeof question !== 'string' || question.trim().length === 0) {
    throw new Error(`question/question must be a non-empty string`);
  }

  try {
    normalizeAnswerToString(item.answer);
  } catch (error) {
    throw new Error(`Invalid answer format: ${item.answer}. Must be boolean, 'true', 'false', 1, or 0`);
  }
}

function normalizeAnswerToString(answer: any): string {
  if (typeof answer === 'boolean') {
    return answer ? 'True' : 'False';
  }

  if (typeof answer === 'string') {
    const lowercased = answer.toLowerCase().trim();
    
    if (lowercased === 'true' || lowercased === '1' || lowercased === 'yes') {
      return 'True';
    }
    
    if (lowercased === 'false' || lowercased === '0' || lowercased === 'no') {
      return 'False';
    }
  }

  if (typeof answer === 'number') {
    return answer !== 0 ? 'True' : 'False';
  }

  throw new Error(`Invalid answer format: ${answer}`);
}

export function parseLegacyTrueFalseResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      if (item.question && item.isTrue !== undefined) {
        return createLegacyTrueFalseQuestion(item, config, index);
      }
      
      return createTrueFalseQuestion(item, config, index);
    });
  } catch (error) {
    console.error('Legacy True/False Parse error:', error);
    throw new Error(`Failed to parse legacy True/False response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function createLegacyTrueFalseQuestion(item: any, config: QuestionConfig, index: number): Question {
  if (!item.question && !item.question) {
    throw new Error(`question ${index + 1} missing required field 'question' or 'question'`);
  }

  if (item.isTrue === undefined && item.answer === undefined) {
    throw new Error(`question ${index + 1} missing required field 'isTrue' or 'answer'`);
  }

  const answerValue = item.answer !== undefined ? item.answer : item.isTrue;
  const answer = normalizeAnswerToString(answerValue);

  return {
    type: QuestionType.TRUE_FALSE,
    difficulty: config.difficulty,
    language: config.language,
    bloom_level: config.bloom_level,
    question: String(item.question || item.question).trim(),
    answer: answer,
    explanation: item.explanation ? String(item.explanation).trim() : undefined,
  };
}

export function parseFlexibleTrueFalseResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      const question = item.question || item.question || item.text;
      const answer = item.answer !== undefined ? item.answer : 
                    item.isTrue !== undefined ? item.isTrue :
                    item.correct !== undefined ? item.correct :
                    item.value;

      if (!question) {
        throw new Error(`question ${index + 1}: No question field found`);
      }

      if (answer === undefined || answer === null) {
        throw new Error(`question ${index + 1}: No answer field found`);
      }

      const normalizedItem = {
        question: question,
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

export function validateTrueFalseQuestions(questions: Question[]): void {
  questions.forEach((question, index) => {
    if (question.type !== QuestionType.TRUE_FALSE) {
      throw new Error(`Question ${index + 1}: Expected True/False type`);
    }

    const tfQuestion = question as Question;

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

export function analyzeAnswerDistribution(questions: Question[]): {
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

export function formatTrueFalseForDisplay(question: Question): {
  question: string;
  answerText: string;
  hasExplanation: boolean;
} {
  return {
    question: question.question,
    answerText: question.answer ?? "",
    hasExplanation: !!question.explanation
  };
}

export { parseTrueFalseResponse as parseResponse };