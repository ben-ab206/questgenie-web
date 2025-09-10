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
  
  // Remove common prefixes and markdown
  cleaned = cleaned
    .replace(/^(Here's the|Here are the|The questions are:|Generated questions:|Matching questions:).*?\n/i, '')
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .replace(/^[^[\{]*/, '')
    .replace(/[^}\]]*$/, '');

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in response');
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
      bloom_level: config.bloom_level,
      question: String(item.question).trim(),
      answer: '', // Not used for matching questions
      matching_questions: normalizeMatchingPairs(item.matching_questions),
      matching_answers: normalizeMatchingPairs(item.matching_answers),
      explanation: item.explanation ? String(item.explanation).trim() : undefined,
    };
  } catch (error) {
    throw new Error(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function normalizeMatchingPairs(pairs: any[]): { [key: string]: string }[] {
  return pairs.map(pair => {
    // Handle both old format {A: "...", B: "..."} and new format {"1": "...", "A": "..."}
    const entries = Object.entries(pair);
    if (entries.length === 2) {
      const [first, second] = entries;
      return {
        [first[0]]: String(first[1]).trim(),
        [second[0]]: String(second[1]).trim()
      };
    }
    throw new Error('Invalid pair format');
  });
}

function validateMatchingItem(item: any, index: number): void {
  if (!item.question || typeof item.question !== 'string' || item.question.trim().length === 0) {
    throw new Error('Question must be a non-empty string');
  }

  if (!Array.isArray(item.matching_questions) || item.matching_questions.length === 0) {
    throw new Error('matching_questions must be a non-empty array');
  }

  if (!Array.isArray(item.matching_answers) || item.matching_answers.length === 0) {
    throw new Error('matching_answers must be a non-empty array');
  }

  if (item.matching_questions.length !== item.matching_answers.length) {
    throw new Error('matching_questions and matching_answers must have same length');
  }

  // Validate pair structure
  [...item.matching_questions, ...item.matching_answers].forEach((pair, pairIndex) => {
    if (typeof pair !== 'object' || Object.keys(pair).length !== 2) {
      throw new Error(`Pair ${pairIndex + 1} must have exactly 2 properties`);
    }
    
    Object.values(pair).forEach(value => {
      if (typeof value !== 'string' || String(value).trim().length === 0) {
        throw new Error(`All pair values must be non-empty strings`);
      }
    });
  });

  // Basic length checks
  if (item.question.trim().length < 10) {
    throw new Error('Question appears too short');
  }

  if (item.matching_questions.length < 3 || item.matching_questions.length > 12) {
    console.warn(`Question ${index + 1}: ${item.matching_questions.length} pairs may not be optimal (3-8 recommended)`);
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
      const question = item.question || item.prompt || item.instruction || item.task;
      const matchingQuestions = item.matching_questions || item.questions || item.pairs || item.items;
      const matchingAnswers = item.matching_answers || item.answers || item.solutions || item.correct_matches;

      if (!question || !matchingQuestions || !matchingAnswers) {
        throw new Error(`Question ${index + 1}: Missing required fields`);
      }

      const normalizedItem = {
        question,
        matching_questions: matchingQuestions,
        matching_answers: matchingAnswers,
        explanation: item.explanation || item.reasoning || item.justification
      };

      return createMatchingQuestion(normalizedItem, config, index);
    });
  } catch (error) {
    console.error('Flexible Matching Parse error:', error);
    throw new Error(`Failed to parse flexible response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateMatchingQuestions(questions: Question[]): void {
  questions.forEach((question, index) => {
    if (question.type !== QuestionType.MATCHING) {
      throw new Error(`Question ${index + 1}: Expected Matching type`);
    }

    if (!question.question?.trim()) {
      throw new Error(`Question ${index + 1}: Question cannot be empty`);
    }

    if (!Array.isArray(question.matching_questions) || !Array.isArray(question.matching_answers)) {
      throw new Error(`Question ${index + 1}: matching_questions and matching_answers must be arrays`);
    }

    if (question.matching_questions.length !== question.matching_answers.length) {
      throw new Error(`Question ${index + 1}: Mismatched array lengths`);
    }

    // Check for duplicates and overly long items
    const getKeys = (pairs: any[]) => pairs.map(pair => Object.keys(pair)).flat();
    const getValues = (pairs: any[]) => pairs.map(pair => Object.values(pair)).flat();
    
    const allKeys = getKeys(question.matching_questions);
    const allValues = getValues(question.matching_questions);
    
    if (new Set(allKeys).size !== allKeys.length) {
      console.warn(`Question ${index + 1}: Duplicate keys found`);
    }
    
    if (new Set(allValues).size !== allValues.length) {
      console.warn(`Question ${index + 1}: Duplicate values found`);
    }

    // Warn about long items
    allValues.forEach((value, i) => {
      if (typeof value === 'string' && value.split(/\s+/).length > 15) {
        console.warn(`Question ${index + 1}: Item ${i + 1} is very long - consider shortening`);
      }
    });
  });
}

export function analyzeMatchingComplexity(questions: Question[]): {
  totalQuestions: number;
  averagePairsPerQuestion: number;
  pairDistribution: { few: number; moderate: number; many: number };
  averageItemLength: { columnA: number; columnB: number };
} {
  if (questions.length === 0) {
    return {
      totalQuestions: 0,
      averagePairsPerQuestion: 0,
      pairDistribution: { few: 0, moderate: 0, many: 0 },
      averageItemLength: { columnA: 0, columnB: 0 }
    };
  }

  const pairCounts = questions.map(q => q.matching_questions?.length || 0);
  const averagePairsPerQuestion = Math.round((pairCounts.reduce((sum, count) => sum + count, 0) / questions.length) * 100) / 100;

  const pairDistribution = {
    few: pairCounts.filter(count => count >= 3 && count <= 4).length,
    moderate: pairCounts.filter(count => count >= 5 && count <= 7).length,
    many: pairCounts.filter(count => count >= 8).length
  };

  // Calculate average item lengths
  let totalALength = 0, totalBLength = 0, totalPairs = 0;

  questions.forEach(q => {
    q.matching_questions?.forEach(pair => {
      const values = Object.values(pair);
      if (values.length >= 2) {
        totalALength += String(values[0]).split(/\s+/).length;
        totalBLength += String(values[1]).split(/\s+/).length;
        totalPairs++;
      }
    });
  });

  return {
    totalQuestions: questions.length,
    averagePairsPerQuestion,
    pairDistribution,
    averageItemLength: {
      columnA: totalPairs > 0 ? Math.round((totalALength / totalPairs) * 100) / 100 : 0,
      columnB: totalPairs > 0 ? Math.round((totalBLength / totalPairs) * 100) / 100 : 0
    }
  };
}

export function formatMatchingForDisplay(question: Question): {
  question: string;
  columnA: string[];
  columnB: string[];
  correctMatches: { [key: string]: string }[];
} {
  const columnA = question.matching_questions?.map(pair => Object.values(pair)[0] as string) || [];
  const columnB = question.matching_questions?.map(pair => Object.values(pair)[1] as string) || [];
  const correctMatches = question.matching_answers || [];

  return {
    question: question.question,
    columnA,
    columnB,
    correctMatches
  };
}

export function checkMatchingAnswers(
  userMatches: { [key: string]: string }[], 
  correctMatches: { [key: string]: string }[]
): {
  totalPairs: number;
  correctPairs: number;
  incorrectPairs: number;
  score: number;
  details: {
    correct: { columnA: string; columnB: string; userColumnB: string }[];
    incorrect: { columnA: string; correctColumnB: string; userColumnB: string }[];
  };
} {
  const totalPairs = correctMatches.length;
  const correct: { columnA: string; columnB: string; userColumnB: string }[] = [];
  const incorrect: { columnA: string; correctColumnB: string; userColumnB: string }[] = [];

  // Create lookup maps for easier comparison
  const correctAnswerMap = new Map<string, string>();
  correctMatches.forEach(pair => {
    const entries = Object.entries(pair);
    if (entries.length >= 2) {
      // Map Column A value to Column B value
      correctAnswerMap.set(entries[0][1], entries[1][1]);
    }
  });

  const userAnswerMap = new Map<string, string>();
  userMatches.forEach(pair => {
    const entries = Object.entries(pair);
    if (entries.length >= 2) {
      // Map Column A value to Column B value
      userAnswerMap.set(entries[0][1], entries[1][1]);
    }
  });

  // Compare user answers with correct answers
  correctAnswerMap.forEach((correctColumnB, columnA) => {
    const userColumnB = userAnswerMap.get(columnA);
    
    if (userColumnB === correctColumnB) {
      correct.push({
        columnA,
        columnB: correctColumnB,
        userColumnB
      });
    } else {
      incorrect.push({
        columnA,
        correctColumnB,
        userColumnB: userColumnB || 'Not answered'
      });
    }
  });

  const score = totalPairs > 0 ? Math.round((correct.length / totalPairs) * 10000) / 100 : 0;

  return {
    totalPairs,
    correctPairs: correct.length,
    incorrectPairs: incorrect.length,
    score,
    details: { correct, incorrect }
  };
}

// Helper function to verify matching question integrity
export function verifyMatchingIntegrity(question: Question): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!question.matching_questions || !question.matching_answers) {
    issues.push('Missing matching_questions or matching_answers');
    return { isValid: false, issues, suggestions };
  }

  // Check if arrays are identical (the main issue we're fixing)
  const questionsStr = JSON.stringify(question.matching_questions);
  const answersStr = JSON.stringify(question.matching_answers);
  
  if (questionsStr === answersStr) {
    issues.push('matching_questions and matching_answers are identical - no shuffling detected');
    suggestions.push('Column B should be shuffled in matching_questions to create a proper matching exercise');
  }

  // Check Column A consistency
  const questionColumnA = question.matching_questions.map(pair => Object.entries(pair)[0][1]);
  const answerColumnA = question.matching_answers.map(pair => Object.entries(pair)[0][1]);
  
  if (JSON.stringify(questionColumnA.sort()) !== JSON.stringify(answerColumnA.sort())) {
    issues.push('Column A items differ between matching_questions and matching_answers');
    suggestions.push('Column A should contain the same items in both arrays');
  }

  // Check Column B completeness
  const questionColumnB = question.matching_questions.map(pair => Object.entries(pair)[1][1]);
  const answerColumnB = question.matching_answers.map(pair => Object.entries(pair)[1][1]);
  
  if (JSON.stringify(questionColumnB.sort()) !== JSON.stringify(answerColumnB.sort())) {
    issues.push('Column B items differ between arrays');
    suggestions.push('Column B should contain the same items in both arrays but in different order');
  }

  // Check for duplicates
  const uniqueColumnA = new Set(questionColumnA);
  const uniqueColumnB = new Set(questionColumnB);
  
  if (uniqueColumnA.size !== questionColumnA.length) {
    issues.push('Duplicate items found in Column A');
    suggestions.push('Each Column A item should be unique');
  }
  
  if (uniqueColumnB.size !== questionColumnB.length) {
    issues.push('Duplicate items found in Column B');
    suggestions.push('Each Column B item should be unique');
  }

  // Performance suggestions
  if (question.matching_questions.length > 8) {
    suggestions.push('Consider reducing pairs to 6-8 for better usability');
  }
  
  if (question.matching_questions.length < 4) {
    suggestions.push('Consider adding more pairs (4-6 is optimal)');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

export function shuffleMatchingItems(question: Question): Question {
  if (!question.matching_questions?.length) {
    return question;
  }

  // Get all second values (Column B) and shuffle them
  const columnBItems = question.matching_questions.map(pair => Object.values(pair)[1]);
  
  // Fisher-Yates shuffle
  for (let i = columnBItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [columnBItems[i], columnBItems[j]] = [columnBItems[j], columnBItems[i]];
  }

  // Rebuild pairs with shuffled Column B
  const shuffledMatchingQuestions = question.matching_questions.map((pair, index) => {
    const entries = Object.entries(pair);
    return {
      [entries[0][0]]: entries[0][1], // Keep Column A key and value
      [entries[1][0]]: columnBItems[index] // Keep Column B key, use shuffled value
    };
  });

  return {
    ...question,
    matching_questions: shuffledMatchingQuestions
    // matching_answers remains unchanged as it contains correct matches
  };
}

// Utility functions
export function convertToMatchingResponse(questions: Question[]): MatchingQuestionResponse[] {
  return questions.map(q => ({
    question: q.question,
    matching_questions: q.matching_questions || [],
    matching_answers: q.matching_answers || [],
    explanation: q.explanation
  }));
}

export { parseMatchingResponse as parseResponse };