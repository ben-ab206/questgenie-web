import {
  Question,
  QuestionType,
  DifficultyLevel,
  Language,
  // BatchGenerationRequest,
  APIResponse,
  MCQQuestion,
  // MCQQuestion
} from '../../../types/questions';
// import { shuffleArray } from '../utils';
import { QuestionGenerator } from './question-generator';

export class QuestionService {
  private generator: QuestionGenerator;

  constructor(apiKey: string, model?: string) {
    this.generator = new QuestionGenerator(apiKey, model);
  }

  // async generateMixedQuestions(
  //   content: string,
  //   quantity: number = 10,
  //   difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
  //   language: Language = Language.ENGLISH,
  //   topic?: string
  // ): Promise<Question[] | MCQQuestion[]> {
  //   const distribution = this.calculateQuestionDistribution(quantity);
  //   const configs = distribution.map(({ type, count }) => ({
  //     type,
  //     quantity: count,
  //     difficulty,
  //     language,
  //     content,
  //     topic
  //   }));

  //   const results = await this.generator.generateBatch(configs);
  //   const allQuestions = results
  //     .filter(result => result.success)
  //     .flatMap(result => result.questions);

  //   return shuffleArray(allQuestions).slice(0, quantity);
  // }

  async generateSpecificType(
    content: string,
    type: QuestionType,
    quantity: number = 5,
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
    language: Language = Language.ENGLISH,
    topic?: string
  ): Promise<Question[] | MCQQuestion[]> {
    const result = type === QuestionType.MULTIPLE_CHOICE ? await this.generator.generateMCQQuestions({
      type,
      quantity,
      difficulty,
      language,
      content,
      topic
    }) : await this.generator.generateQuestions({
      type,
      quantity,
      difficulty,
      language,
      content,
      topic
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate questions');
    }

    return result.questions;
  }

  // async processBatchRequest(request: BatchGenerationRequest): Promise<Question[]> {
  //   const allQuestions: Question[] = [];

  //   for (const contentInput of request.contents) {
  //     const config = {
  //       ...request.globalConfig,
  //       content: contentInput.text,
  //       topic: contentInput.topic || request.globalConfig.topic,
  //       quantity: contentInput.quantity || 5,
  //       difficulty: contentInput.difficulty || request.globalConfig.difficulty || DifficultyLevel.MEDIUM,
  //       type: contentInput.type || request.globalConfig.type || QuestionType.MULTIPLE_CHOICE,
  //       language: request.globalConfig.language || Language.ENGLISH
  //     };

  //     const questions = await this.generateMixedQuestions(
  //       config.content,
  //       config.quantity,
  //       config.difficulty,
  //       config.language,
  //       config.topic
  //     );

  //     allQuestions.push(...questions);
  //   }

  //   return allQuestions;
  // }

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

  private calculateQuestionDistribution(total: number): Array<{ type: QuestionType; count: number }> {
    const baseDistribution = [
      { type: QuestionType.MULTIPLE_CHOICE, percentage: 0.4 },
      { type: QuestionType.SHORT_ANSWER, percentage: 0.3 },
      { type: QuestionType.TRUE_FALSE, percentage: 0.3 }
    ];

    return baseDistribution.map(item => ({
      type: item.type,
      count: Math.max(1, Math.ceil(total * item.percentage))
    }));
  }
}
