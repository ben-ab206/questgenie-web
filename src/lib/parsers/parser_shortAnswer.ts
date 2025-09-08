/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question, QuestionConfig, QuestionType, ShortAnswerResponse } from '@/types/questions';

export function parseShortAnswerResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => createShortAnswerQuestion(item, config, index));
  } catch (error) {
    console.error('Short Answer Parse error:', error);
    console.error('Raw response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse Short Answer AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(Here's the|Here are the|The questions are:|Generated questions:|Short answer questions:).*?\n/i, '');
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  
  // Remove non-JSON content before and after
  cleaned = cleaned.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '');

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in Short Answer response');
  }

  return jsonMatch[0];
}

function createShortAnswerQuestion(item: any, config: QuestionConfig, index: number): Question {
  try {
    validateShortAnswerItem(item, index);
    
    return {
      type: QuestionType.SHORT_ANSWER,
      difficulty: config.difficulty,
      language: config.language,
      bloom_level: config.bloom_level,
      question: String(item.question).trim(),
      answer: String(item.answer).trim(),
      explanation: item.explanation ? String(item.explanation).trim() : undefined,
    };
  } catch (error) {
    throw new Error(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateShortAnswerItem(item: any, index: number): void {
  if (!item.question) {
    throw new Error(`Missing required field 'question'`);
  }

  if (!item.answer) {
    throw new Error(`Missing required field 'answer'`);
  }

  if (typeof item.question !== 'string' || item.question.trim().length === 0) {
    throw new Error(`Question must be a non-empty string`);
  }

  if (typeof item.answer !== 'string' || item.answer.trim().length === 0) {
    throw new Error(`Answer must be a non-empty string`);
  }

  // Check for reasonable question length
  if (item.question.trim().length < 5) {
    throw new Error(`Question appears to be too short`);
  }

  // Check for reasonable answer length
  if (item.answer.trim().length < 1) {
    throw new Error(`Answer appears to be too short`);
  }
}

export function parseFlexibleShortAnswerResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      // Handle different possible field names
      const question = item.question || item.prompt || item.text || item.question;
      const answer = item.answer || item.response || item.solution || item.correctAnswer;

      if (!question) {
        throw new Error(`Question ${index + 1}: No question field found`);
      }

      if (!answer) {
        throw new Error(`Question ${index + 1}: No answer field found`);
      }

      const normalizedItem = {
        question: question,
        answer: answer,
        explanation: item.explanation || item.reasoning || item.justification || item.rationale,
        contentReference: item.contentReference || item.source || item.reference || item.citation,
        keywords: item.keywords || item.keyTerms || item.importantWords,
        acceptableAnswers: item.acceptableAnswers || item.alternativeAnswers || item.validAnswers
      };

      return createShortAnswerQuestion(normalizedItem, config, index);
    });
  } catch (error) {
    console.error('Flexible Short Answer Parse error:', error);
    throw new Error(`Failed to parse flexible Short Answer response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateShortAnswerQuestions(questions: Question[]): void {
  questions.forEach((question, index) => {
    if (question.type !== QuestionType.SHORT_ANSWER) {
      throw new Error(`Question ${index + 1}: Expected Short Answer type`);
    }

    const saQuestion = question as Question;

    if (!saQuestion.question || saQuestion.question.trim().length === 0) {
      throw new Error(`Question ${index + 1}: Question cannot be empty`);
    }

    if (!saQuestion.answer || saQuestion.answer.trim().length === 0) {
      throw new Error(`Question ${index + 1}: Answer cannot be empty`);
    }

    // Check for question words to ensure it's actually a question
    const questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'which', 'whose'];
    const hasQuestionWord = questionWords.some(word => 
      saQuestion.question.toLowerCase().includes(word)
    );
    const endsWithQuestionMark = saQuestion.question.trim().endsWith('?');
    
    if (!hasQuestionWord && !endsWithQuestionMark) {
      console.warn(`Question ${index + 1}: May not be properly formatted as a question`);
    }

    // Check for overly long answers that might indicate essay questions instead
    const wordCount = saQuestion.answer.split(/\s+/).length;
    if (wordCount > 100) {
      console.warn(`Question ${index + 1}: Answer is very long (${wordCount} words) - consider if this should be an essay question`);
    }
  });
}

export function analyzeAnswerLengthDistribution(questions: Question[]): {
  totalQuestions: number;
  averageAnswerLength: number;
  shortAnswers: number; // 1-10 words
  mediumAnswers: number; // 11-30 words
  longAnswers: number; // 31+ words
  lengthDistribution: {
    brief: number;
    moderate: number;
    detailed: number;
  };
} {
  const totalQuestions = questions.length;
  
  const answerLengths = questions.map(q => q.answer.split(/\s+/).length);
  const averageAnswerLength = totalQuestions > 0 ? 
    Math.round((answerLengths.reduce((sum, len) => sum + len, 0) / totalQuestions) * 100) / 100 : 0;

  const shortAnswers = answerLengths.filter(len => len <= 10).length;
  const mediumAnswers = answerLengths.filter(len => len > 10 && len <= 30).length;
  const longAnswers = answerLengths.filter(len => len > 30).length;

  return {
    totalQuestions,
    averageAnswerLength,
    shortAnswers,
    mediumAnswers,
    longAnswers,
    lengthDistribution: {
      brief: shortAnswers,
      moderate: mediumAnswers,
      detailed: longAnswers
    }
  };
}

export function formatShortAnswerForDisplay(question: Question): {
  question: string;
  answer: string;
} {
  return {
    question: question.question,
    answer: question.answer
  };
}

export function checkAnswerSimilarity(userAnswer: string, correctAnswer: string, acceptableAnswers?: string[]): {
  isCorrect: boolean;
  similarity: number;
  matchType: 'exact' | 'partial' | 'keyword' | 'acceptable' | 'none';
} {
  const normalizeText = (text: string) => text.toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  const normalizedUser = normalizeText(userAnswer);
  const normalizedCorrect = normalizeText(correctAnswer);
  
  // Check exact match
  if (normalizedUser === normalizedCorrect) {
    return { isCorrect: true, similarity: 1.0, matchType: 'exact' };
  }
  
  // Check acceptable answers
  if (acceptableAnswers) {
    const normalizedAcceptable = acceptableAnswers.map(normalizeText);
    if (normalizedAcceptable.includes(normalizedUser)) {
      return { isCorrect: true, similarity: 0.9, matchType: 'acceptable' };
    }
  }
  
  // Check partial match
  if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
    const similarity = Math.min(normalizedUser.length, normalizedCorrect.length) / 
                     Math.max(normalizedUser.length, normalizedCorrect.length);
    return { 
      isCorrect: similarity > 0.7, 
      similarity, 
      matchType: similarity > 0.7 ? 'partial' : 'none' 
    };
  }
  
  // Check keyword overlap
  const userWords = normalizedUser.split(/\s+/);
  const correctWords = normalizedCorrect.split(/\s+/);
  const commonWords = userWords.filter(word => correctWords.includes(word) && word.length > 2);
  
  if (commonWords.length > 0) {
    const similarity = (commonWords.length * 2) / (userWords.length + correctWords.length);
    return { 
      isCorrect: similarity > 0.5, 
      similarity, 
      matchType: similarity > 0.5 ? 'keyword' : 'none' 
    };
  }
  
  return { isCorrect: false, similarity: 0, matchType: 'none' };
}

export function convertToShortAnswerResponse(questions: Question[]): ShortAnswerResponse[] {
  return questions.map(q => ({
    question: q.question,
    answer: q.answer
  }));
}

export { parseShortAnswerResponse as parseResponse };