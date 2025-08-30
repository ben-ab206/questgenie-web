/* eslint-disable @typescript-eslint/no-explicit-any */
import { MatchingQuestionResponse, Question, QuestionConfig, QuestionType } from '@/types/questions';

export function parseMatchingResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => createMatchingQuestion(item, config, index));
  } catch (error) {
    console.error('Matching Parse error:', error);
    console.error('Raw response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse Matching AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(Here's the|Here are the|The questions are:|Generated questions:|Matching questions:).*?\n/i, '');
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  
  // Remove non-JSON content before and after
  cleaned = cleaned.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '');

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in Matching response');
  }

  return jsonMatch[0];
}

function createMatchingQuestion(item: any, config: QuestionConfig, index: number): Question {
  try {
    validateMatchingItem(item, index);
    
    return {
      type: QuestionType.MATCHING,
      difficulty: config.difficulty,
      language: config.language,
      question: String(item.question).trim(),
      answer: '', // Not used for matching questions
      matching_questions: item.matching_questions,
      matching_answers: item.matching_answers,
      explanation: item.explanation ? String(item.explanation).trim() : undefined,
    };
  } catch (error) {
    throw new Error(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateMatchingItem(item: any, index: number): void {
  if (!item.question) {
    throw new Error(`Missing required field 'question'`);
  }

  if (!item.matching_questions) {
    throw new Error(`Missing required field 'matching_questions'`);
  }

  if (!item.matching_answers) {
    throw new Error(`Missing required field 'matching_answers'`);
  }

  if (typeof item.question !== 'string' || item.question.trim().length === 0) {
    throw new Error(`Question must be a non-empty string`);
  }

  if (!Array.isArray(item.matching_questions)) {
    throw new Error(`matching_questions must be an array`);
  }

  if (!Array.isArray(item.matching_answers)) {
    throw new Error(`matching_answers must be an array`);
  }

  if (item.matching_questions.length === 0) {
    throw new Error(`matching_questions cannot be empty`);
  }

  if (item.matching_answers.length === 0) {
    throw new Error(`matching_answers cannot be empty`);
  }

  if (item.matching_questions.length !== item.matching_answers.length) {
    throw new Error(`matching_questions and matching_answers must have the same length`);
  }

  // Validate matching_questions structure
  item.matching_questions.forEach((pair: any, pairIndex: number) => {
    if (!pair.A || !pair.B) {
      throw new Error(`matching_questions[${pairIndex}] must have both A and B properties`);
    }
    if (typeof pair.A !== 'string' || typeof pair.B !== 'string') {
      throw new Error(`matching_questions[${pairIndex}] A and B must be strings`);
    }
    if (pair.A.trim().length === 0 || pair.B.trim().length === 0) {
      throw new Error(`matching_questions[${pairIndex}] A and B cannot be empty`);
    }
  });

  // Validate matching_answers structure
  item.matching_answers.forEach((pair: any, pairIndex: number) => {
    if (!pair.A || !pair.B) {
      throw new Error(`matching_answers[${pairIndex}] must have both A and B properties`);
    }
    if (typeof pair.A !== 'string' || typeof pair.B !== 'string') {
      throw new Error(`matching_answers[${pairIndex}] A and B must be strings`);
    }
    if (pair.A.trim().length === 0 || pair.B.trim().length === 0) {
      throw new Error(`matching_answers[${pairIndex}] A and B cannot be empty`);
    }
  });

  // Validate that all answer pairs exist in question pairs
  const questionPairs = item.matching_questions;
  const answerPairs = item.matching_answers;

  answerPairs.forEach((answer: any, answerIndex: number) => {
    const matchExists = questionPairs.some((question: any) => 
      question.A === answer.A && question.B === answer.B
    );
    if (!matchExists) {
      throw new Error(`matching_answers[${answerIndex}] does not correspond to any pair in matching_questions`);
    }
  });

  // Check for reasonable question length
  if (item.question.trim().length < 10) {
    throw new Error(`Question appears to be too short`);
  }

  // Check for reasonable number of pairs (should be 4-10 typically)
  if (item.matching_questions.length < 3) {
    console.warn(`Question ${index + 1}: Very few matching pairs (${item.matching_questions.length}) - consider adding more`);
  }

  if (item.matching_questions.length > 12) {
    console.warn(`Question ${index + 1}: Many matching pairs (${item.matching_questions.length}) - consider reducing for usability`);
  }
}

export function parseFlexibleMatchingResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      // Handle different possible field names
      const question = item.question || item.prompt || item.instruction || item.task;
      const matchingQuestions = item.matching_questions || item.questions || item.pairs || item.items;
      const matchingAnswers = item.matching_answers || item.answers || item.solutions || item.correct_matches;

      if (!question) {
        throw new Error(`Question ${index + 1}: No question field found`);
      }

      if (!matchingQuestions) {
        throw new Error(`Question ${index + 1}: No matching_questions field found`);
      }

      if (!matchingAnswers) {
        throw new Error(`Question ${index + 1}: No matching_answers field found`);
      }

      const normalizedItem = {
        question: question,
        matching_questions: matchingQuestions,
        matching_answers: matchingAnswers,
        explanation: item.explanation || item.reasoning || item.justification || item.rationale
      };

      return createMatchingQuestion(normalizedItem, config, index);
    });
  } catch (error) {
    console.error('Flexible Matching Parse error:', error);
    throw new Error(`Failed to parse flexible Matching response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateMatchingQuestions(questions: Question[]): void {
  questions.forEach((question, index) => {
    if (question.type !== QuestionType.MATCHING) {
      throw new Error(`Question ${index + 1}: Expected Matching type`);
    }

    if (!question.question || question.question.trim().length === 0) {
      throw new Error(`Question ${index + 1}: Question cannot be empty`);
    }

    if (!question.matching_questions || !Array.isArray(question.matching_questions)) {
      throw new Error(`Question ${index + 1}: matching_questions must be an array`);
    }

    if (!question.matching_answers || !Array.isArray(question.matching_answers)) {
      throw new Error(`Question ${index + 1}: matching_answers must be an array`);
    }

    if (question.matching_questions.length !== question.matching_answers.length) {
      throw new Error(`Question ${index + 1}: matching_questions and matching_answers must have the same length`);
    }

    // Check for duplicate items in Column A or B
    const columnAItems = question.matching_questions.map(pair => pair.A);
    const columnBItems = question.matching_questions.map(pair => pair.B);
    
    const uniqueAItems = new Set(columnAItems);
    const uniqueBItems = new Set(columnBItems);
    
    if (uniqueAItems.size !== columnAItems.length) {
      console.warn(`Question ${index + 1}: Duplicate items found in Column A`);
    }
    
    if (uniqueBItems.size !== columnBItems.length) {
      console.warn(`Question ${index + 1}: Duplicate items found in Column B`);
    }

    // Check for overly long items that might be hard to match
    question.matching_questions.forEach((pair, pairIndex) => {
      if (pair.A.split(/\s+/).length > 15) {
        console.warn(`Question ${index + 1}, Pair ${pairIndex + 1}: Column A item is very long - consider shortening`);
      }
      if (pair.B.split(/\s+/).length > 15) {
        console.warn(`Question ${index + 1}, Pair ${pairIndex + 1}: Column B item is very long - consider shortening`);
      }
    });
  });
}

export function analyzeMatchingComplexity(questions: Question[]): {
  totalQuestions: number;
  averagePairsPerQuestion: number;
  pairDistribution: {
    few: number; // 3-4 pairs
    moderate: number; // 5-7 pairs
    many: number; // 8+ pairs
  };
  averageItemLength: {
    columnA: number;
    columnB: number;
  };
} {
  const totalQuestions = questions.length;
  
  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      averagePairsPerQuestion: 0,
      pairDistribution: { few: 0, moderate: 0, many: 0 },
      averageItemLength: { columnA: 0, columnB: 0 }
    };
  }

  const pairCounts = questions.map(q => q.matching_questions?.length || 0);
  const averagePairsPerQuestion = Math.round((pairCounts.reduce((sum, count) => sum + count, 0) / totalQuestions) * 100) / 100;

  const few = pairCounts.filter(count => count >= 3 && count <= 4).length;
  const moderate = pairCounts.filter(count => count >= 5 && count <= 7).length;
  const many = pairCounts.filter(count => count >= 8).length;

  // Calculate average item lengths
  let totalALength = 0;
  let totalBLength = 0;
  let totalPairs = 0;

  questions.forEach(q => {
    if (q.matching_questions) {
      q.matching_questions.forEach(pair => {
        totalALength += pair.A.split(/\s+/).length;
        totalBLength += pair.B.split(/\s+/).length;
        totalPairs++;
      });
    }
  });

  const averageALength = totalPairs > 0 ? Math.round((totalALength / totalPairs) * 100) / 100 : 0;
  const averageBLength = totalPairs > 0 ? Math.round((totalBLength / totalPairs) * 100) / 100 : 0;

  return {
    totalQuestions,
    averagePairsPerQuestion,
    pairDistribution: {
      few,
      moderate,
      many
    },
    averageItemLength: {
      columnA: averageALength,
      columnB: averageBLength
    }
  };
}

export function formatMatchingForDisplay(question: Question): {
  question: string;
  columnA: string[];
  columnB: string[];
  correctMatches: { A: string; B: string }[];
} {
  const columnA = question.matching_questions?.map(pair => pair.A) || [];
  const columnB = question.matching_questions?.map(pair => pair.B) || [];
  const correctMatches = question.matching_answers || [];

  return {
    question: question.question,
    columnA,
    columnB,
    correctMatches
  };
}

export function checkMatchingAnswers(
  userMatches: { A: string; B: string }[], 
  correctMatches: { A: string; B: string }[]
): {
  totalPairs: number;
  correctPairs: number;
  incorrectPairs: number;
  score: number;
  details: {
    correct: { A: string; B: string }[];
    incorrect: { A: string; B: string; correctB: string }[];
  };
} {
  const totalPairs = correctMatches.length;
  const correct: { A: string; B: string }[] = [];
  const incorrect: { A: string; B: string; correctB: string }[] = [];

  userMatches.forEach(userMatch => {
    const correctMatch = correctMatches.find(cm => cm.A === userMatch.A);
    
    if (correctMatch && correctMatch.B === userMatch.B) {
      correct.push(userMatch);
    } else {
      incorrect.push({
        A: userMatch.A,
        B: userMatch.B,
        correctB: correctMatch?.B || 'Unknown'
      });
    }
  });

  const correctPairs = correct.length;
  const incorrectPairs = incorrect.length;
  const score = totalPairs > 0 ? Math.round((correctPairs / totalPairs) * 10000) / 100 : 0;

  return {
    totalPairs,
    correctPairs,
    incorrectPairs,
    score,
    details: {
      correct,
      incorrect
    }
  };
}

export function convertToMatchingResponse(questions: Question[]): MatchingQuestionResponse[] {
  return questions.map(q => ({
    question: q.question,
    matching_questions: q.matching_questions || [],
    matching_answers: q.matching_answers || [],
    explanation: q.explanation
  }));
}

export function shuffleMatchingItems(question: Question): Question {
  if (!question.matching_questions || !question.matching_answers) {
    return question;
  }

  // Shuffle Column B items while keeping Column A in order
  const shuffledBItems = [...question.matching_questions.map(pair => pair.B)];
  
  // Fisher-Yates shuffle
  for (let i = shuffledBItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledBItems[i], shuffledBItems[j]] = [shuffledBItems[j], shuffledBItems[i]];
  }

  const shuffledMatchingQuestions = question.matching_questions.map((pair, index) => ({
    A: pair.A,
    B: shuffledBItems[index]
  }));

  return {
    ...question,
    matching_questions: shuffledMatchingQuestions
    // matching_answers remains the same as it contains the correct matches
  };
}

export { parseMatchingResponse as parseResponse };