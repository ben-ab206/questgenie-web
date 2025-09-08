import {
  Question,
  QuestionType,
  DifficultyLevel,
  Language,
  APIResponse,
  BloomLevel,
} from '@/types/questions';
import { QuestionGenerator } from './question-generator';

export class QuestionService {
  private generator: QuestionGenerator;

  constructor(apiKey: string, model?: string) {
    this.generator = new QuestionGenerator(apiKey, model);
  }

  async generateSpecificType(
    content: string,
    type: QuestionType[],
    quantity: number = 5,
    bloom_level: BloomLevel = BloomLevel.MIXED,
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
    language: Language = Language.ENGLISH,
    topic?: string
  ): Promise<Question[]> {
    const result = type[0] === QuestionType.MULTIPLE_CHOICE ? await this.generator.generateMCQQuestions({
      type,
      quantity,
      difficulty,
      language,
      bloom_level,
      content,
      topic
    }) : type[0] === QuestionType.TRUE_FALSE ? await this.generator.generateTrueFalseQuestions({
      type,
      quantity,
      difficulty,
      language,
      content,
      bloom_level,
      topic
    })
      : type[0] === QuestionType.FILL_IN_THE_BLANK ? await this.generator.generateFillInTheBlankQuestions({
        type,
        quantity,
        difficulty,
        language,
        bloom_level,
        content
      }) : type[0] === QuestionType.SHORT_ANSWER ? await this.generator.generateShortAnswerQuestions({
        type,
        quantity,
        difficulty,
        language,
        bloom_level,
        content
      }) : type[0] === QuestionType.LONG_ANSWER ? await this.generator.generateLongAnswerQuestions({
        type,
        quantity,
        difficulty,
        language,
        bloom_level,
        content
      }) : type[0] === QuestionType.MATCHING ? await this.generator.generateMatchingAnswerQuestions({
        type,
        quantity,
        difficulty,
        language,
        bloom_level,
        content
      }) : await this.generator.generateMatchingAnswerQuestions({
        type,
        quantity,
        difficulty,
        language,
        bloom_level,
        content
      }) 

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate questions');
    }

    return result.questions;
  }

  async generateMixedType(
    content: string,
    type: QuestionType[],
    quantity: number = 5,
    bloom_level: BloomLevel = BloomLevel.MIXED,
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
    language: Language = Language.ENGLISH,
    topic?: string
  ): Promise<Question[]> {
    const result = await this.generator.generateMixQuestions({
      type,
      quantity,
      difficulty,
      language,
      bloom_level,
      content,
      topic
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate questions');
    }

    return result.questions;
  }

  formatAPIResponse<T>(
    data: T,
    processingTime: number
  ): APIResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime
      }
    };
  }

  formatErrorResponse(
    error: string,
    processingTime: number
  ): APIResponse<null> {
    return {
      success: false,
      error,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime
      }
    };
  }
}
