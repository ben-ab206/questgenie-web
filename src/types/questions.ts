export interface QuestionConfig {
  type: QuestionType;
  quantity: number;
  difficulty: DifficultyLevel;
  language: Language;
  content: string;
  topic?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  language: Language;
  question: string;
  answer: string;
  options?: string[];
  correctOptionIndex?: number;
  topic?: string;
  contentSource: string;
  createdAt: Date;
}

export interface GenerationResult {
  success: boolean;
  questions: Question[];
  error?: string;
  contentHash?: string;
  metadata: GenerationMetadata;
}

export interface GenerationMetadata {
  generatedAt: Date;
  model: string;
  processingTimeMs: number;
  tokensUsed?: number;
}

export interface BatchGenerationRequest {
  contents: ContentInput[];
  globalConfig: Partial<QuestionConfig>;
}

export interface ContentInput {
  text: string;
  topic?: string;
  quantity?: number;
  difficulty?: DifficultyLevel;
  type?: QuestionType;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    timestamp: string;
    requestId: string;
    processingTime: number;
  };
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_IN_THE_BLANK = 'fill_in_the_blank',
  SHORT_ANSWER = 'short_answer',
//   ESSAY = 'essay',
//   MATCHING = 'matching',
//   ORDERING = 'ordering'
}

export enum DifficultyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum Language {
  ENGLISH = 'english',
  BURMESE = 'burmese'
}

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}
