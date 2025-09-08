/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question, QuestionConfig, QuestionType } from '@/types/questions';

export function parseLongAnswerResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => createLongAnswerQuestion(item, config, index));
  } catch (error) {
    console.error('Long Answer Parse error:', error);
    console.error('Raw response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse Long Answer AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(Here's the|Here are the|The questions are:|Generated questions:|Long answer questions:|Essay questions:).*?\n/i, '');
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  
  // Remove non-JSON content before and after
  cleaned = cleaned.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '');

  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in Long Answer response');
  }

  return jsonMatch[0];
}

function createLongAnswerQuestion(item: any, config: QuestionConfig, index: number): Question {
  try {
    validateLongAnswerItem(item);
    
    return {
      type: QuestionType.LONG_ANSWER,
      difficulty: config.difficulty,
      bloom_level: config.bloom_level,
      language: config.language,
      question: String(item.question).trim(),
      answer: String(item.answer).trim(),
      explanation: item.explanation ? String(item.explanation).trim() : undefined,
    };
  } catch (error) {
    throw new Error(`Question ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateLongAnswerItem(item: any): void {
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
  if (item.question.trim().length < 10) {
    throw new Error(`Question appears to be too short for a long answer question`);
  }

  // Check for reasonable answer length (long answers should be substantial)
  const wordCount = item.answer.trim().split(/\s+/).length;
  if (wordCount < 30) {
    throw new Error(`Answer appears to be too short for a long answer question (${wordCount} words)`);
  }

  // Validate keyPoints if provided
  if (item.keyPoints !== undefined) {
    if (!Array.isArray(item.keyPoints)) {
      throw new Error(`keyPoints must be an array`);
    }
    
    if (item.keyPoints.length === 0) {
      throw new Error(`keyPoints array cannot be empty if provided`);
    }

    item.keyPoints.forEach((point: any, pointIndex: number) => {
      if (typeof point !== 'string' || point.trim().length === 0) {
        throw new Error(`keyPoints[${pointIndex}] must be a non-empty string`);
      }
    });
  }

  // Validate rubricCriteria if provided
  if (item.rubricCriteria !== undefined) {
    if (!Array.isArray(item.rubricCriteria)) {
      throw new Error(`rubricCriteria must be an array`);
    }
    
    item.rubricCriteria.forEach((criterion: any, criterionIndex: number) => {
      if (typeof criterion !== 'string' || criterion.trim().length === 0) {
        throw new Error(`rubricCriteria[${criterionIndex}] must be a non-empty string`);
      }
    });
  }

  // Validate keywords if provided
  if (item.keywords !== undefined) {
    if (!Array.isArray(item.keywords)) {
      throw new Error(`keywords must be an array`);
    }
    
    item.keywords.forEach((keyword: any, keywordIndex: number) => {
      if (typeof keyword !== 'string' || keyword.trim().length === 0) {
        throw new Error(`keywords[${keywordIndex}] must be a non-empty string`);
      }
    });
  }
}

export function parseFlexibleLongAnswerResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => {
      // Handle different possible field names
      const question = item.question || item.prompt || item.text || item.question || item.essayQuestion;
      const answer = item.answer || item.response || item.solution || item.sampleAnswer || item.modelAnswer;

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
      };

      return createLongAnswerQuestion(normalizedItem, config, index);
    });
  } catch (error) {
    console.error('Flexible Long Answer Parse error:', error);
    throw new Error(`Failed to parse flexible Long Answer response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateLongAnswerQuestions(questions: Question[]): void {
  questions.forEach((question, index) => {
    if (question.type !== QuestionType.LONG_ANSWER) {
      throw new Error(`Question ${index + 1}: Expected Long Answer type`);
    }

    const laQuestion = question as Question;

    if (!laQuestion.question || laQuestion.question.trim().length === 0) {
      throw new Error(`Question ${index + 1}: Question cannot be empty`);
    }

    if (!laQuestion.answer || laQuestion.answer.trim().length === 0) {
      throw new Error(`Question ${index + 1}: Answer cannot be empty`);
    }

    // Check for question complexity appropriate for long answers
    const questionWords = ['explain', 'analyze', 'discuss', 'evaluate', 'compare', 'contrast', 'describe', 'justify', 'argue', 'assess'];
    const hasComplexQuestionWord = questionWords.some(word => 
      laQuestion.question.toLowerCase().includes(word)
    );
    
    if (!hasComplexQuestionWord) {
      console.warn(`Question ${index + 1}: May not be complex enough for a long answer question`);
    }

    // Check answer length is appropriate for long answers
    const wordCount = laQuestion.answer.split(/\s+/).length;
    if (wordCount < 50) {
      console.warn(`Question ${index + 1}: Answer is quite short (${wordCount} words) - consider if this should be a short answer question`);
    } else if (wordCount > 1000) {
      console.warn(`Question ${index + 1}: Answer is very long (${wordCount} words) - consider breaking into multiple questions`);
    }
  });
}


export function formatLongAnswerForDisplay(question: Question): {
  question: string;
  answer: string;
} {
  return {
    question: question.question,
    answer: question.answer,
  };
}

export function assessLongAnswerQuality(userAnswer: string, modelAnswer: string, keyPoints?: string[]): {
  score: number; // 0-100
  coverageScore: number; // How well key points are covered
  lengthScore: number; // Appropriate length
  structureScore: number; // Organization and structure
  feedback: string[];
  coveredPoints: string[];
  missedPoints: string[];
} {
  const normalizeText = (text: string) => text.toLowerCase().trim();
  const normalizedUser = normalizeText(userAnswer);
  const normalizedModel = normalizeText(modelAnswer);
  
  const feedback: string[] = [];
  const coveredPoints: string[] = [];
  const missedPoints: string[] = [];
  
  // Length assessment
  const userWordCount = userAnswer.split(/\s+/).length;
  const modelWordCount = modelAnswer.split(/\s+/).length;
  
  let lengthScore = 100;
  if (userWordCount < modelWordCount * 0.5) {
    lengthScore = 60;
    feedback.push("Answer could be more detailed and comprehensive");
  } else if (userWordCount < modelWordCount * 0.7) {
    lengthScore = 80;
    feedback.push("Answer could include more detail");
  } else if (userWordCount > modelWordCount * 1.5) {
    lengthScore = 85;
    feedback.push("Answer is quite lengthy - ensure all content is relevant");
  }
  
  // Key points coverage
  let coverageScore = 0;
  if (keyPoints && keyPoints.length > 0) {
    keyPoints.forEach(point => {
      const normalizedPoint = normalizeText(point);
      const pointWords = normalizedPoint.split(/\s+/).filter(word => word.length > 3);
      const covered = pointWords.some(word => normalizedUser.includes(word));
      
      if (covered) {
        coveredPoints.push(point);
        coverageScore += (100 / keyPoints.length);
      } else {
        missedPoints.push(point);
      }
    });
    
    if (missedPoints.length > 0) {
      feedback.push(`Consider addressing: ${missedPoints.slice(0, 2).join(', ')}`);
    }
  } else {
    // Fallback: check semantic similarity with model answer
    const userWords = normalizedUser.split(/\s+/).filter(word => word.length > 3);
    const modelWords = normalizedModel.split(/\s+/).filter(word => word.length > 3);
    const commonWords = userWords.filter(word => modelWords.includes(word));
    
    coverageScore = (commonWords.length / Math.max(modelWords.length, 1)) * 100;
  }
  
  // Structure assessment
  const paragraphs = userAnswer.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  let structureScore = 70; // Base score
  
  if (paragraphs.length >= 2) {
    structureScore += 15; // Well-structured with multiple paragraphs
  }
  
  if (userAnswer.includes('first') || userAnswer.includes('second') || userAnswer.includes('finally')) {
    structureScore += 10; // Good use of transition words
  }
  
  if (userAnswer.includes('however') || userAnswer.includes('therefore') || userAnswer.includes('moreover')) {
    structureScore += 5; // Advanced transition words
  }
  
  structureScore = Math.min(structureScore, 100);
  
  // Overall score
  const score = Math.round((coverageScore * 0.5) + (lengthScore * 0.3) + (structureScore * 0.2));
  
  if (score >= 90) {
    feedback.push("Excellent comprehensive answer");
  } else if (score >= 80) {
    feedback.push("Good answer with room for minor improvements");
  } else if (score >= 70) {
    feedback.push("Adequate answer that could be enhanced");
  } else {
    feedback.push("Answer needs significant improvement");
  }
  
  return {
    score,
    coverageScore: Math.round(coverageScore),
    lengthScore,
    structureScore,
    feedback,
    coveredPoints,
    missedPoints
  };
}

export { parseLongAnswerResponse as parseResponse };