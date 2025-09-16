import { Subjects } from "./subjects";

export interface QuestionConfig {
  type: QuestionType[];
  quantity: number;
  bloom_level: BloomLevel;
  difficulty: DifficultyLevel;
  language: Language;
  content: string;
  topic?: string;
}

export interface GenerateQuestionConfig {
  type: QuestionType;
  quantity: number;
  bloom_level: BloomLevel;
  difficulty: DifficultyLevel;
  language: Language;
  content: string;
  topic?: string;
}

export interface Question {
  id?: number;
  type: QuestionType;
  difficulty: DifficultyLevel;
  language: Language;
  question: string;
  answer?: string;
  options?: Options; // mcq | scq
  explanation?: string;
  matching_questions?: {
    [key: string]: string;
  }[],
  matching_answers?: {
    [key: string]: string;
  }[],
  bloom_level: BloomLevel;
  mcq_answers?: (keyof Options)[]
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
    processingTime: number;
  };
}

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  TRUE_FALSE = 'true_false',
  FILL_IN_THE_BLANK = 'fill_in_the_blank',
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer',
  MATCHING = 'matching',
  MULTIPLE_CHOICE = 'multiple_choice',
  //   ORDERING = 'ordering'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HIGH = 'high',
  MIXED = 'mixed'
}

export enum BloomLevel {
  UNDERSTAND = 'understand',
  REMEMBER = 'remember',
  APPLY = 'apply',
  ANALYZE = 'analyze',
  EVALUATE = 'evaluate',
  CREATE = 'create',
  MIXED = 'mixed',
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

export interface SCQConfig {
  language: Language;
  difficulty: DifficultyLevel;
  bloom_level: BloomLevel;
  topic?: string;
  quantity: number;
  content: string;
  optionsCount?: 4 | 5;
}

export interface MCQConfig {
  language: Language;
  difficulty: DifficultyLevel;
  bloom_level: BloomLevel;
  topic?: string;
  quantity: number;
  content: string;
  optionsCount?: 4 | 5;
}


export type Options = {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
};

export interface SCQResponse {
  question: string;
  options: Options;
  correctAnswer: keyof Options; 
  contentReference?: string;
  explanation?: string;
}

export interface MCQResponse {
  question: string;
  options: Options;
  correctAnswer: (keyof Options)[];
  contentReference?: string;
  explanation?: string;
}

export interface FillInBlankConfig {
  language: Language;
  difficulty: DifficultyLevel;
  topic?: string;
  quantity: number;
  content: string;
  bloom_level: BloomLevel;
  includeExplanation?: boolean;
  avoidAmbiguity?: boolean;
  focusOnKeyPoints?: boolean;
  blankType?: 'single' | 'multiple' | 'mixed';
  provideChoices?: boolean;
  choicesCount?: number;
  contextLength?: 'short' | 'medium' | 'long';
}

export interface TrueFalseConfig {
  language: Language;
  difficulty: DifficultyLevel;
  topic?: string;
  quantity: number;
  content: string;
  bloom_level: BloomLevel;
  includeExplanation?: boolean;
  avoidAmbiguity?: boolean;
  focusOnKeyPoints?: boolean;
  balanceAnswers?: boolean; // Whether to balance true/false distribution
  requireJustification?: boolean; // Whether false questions need correction
}

export interface TrueFalseResponse {
  question: string;
  answer: boolean;
  contentReference: string;
  explanation?: string;
  correction?: string;
}

export interface ShortAnswerConfig {
  language: Language;
  difficulty: DifficultyLevel;
  quantity: number;
  bloom_level: BloomLevel;
  content: string;
  answerLength?: 'brief' | 'moderate' | 'detailed';
}
export interface ShortAnswerResponse {
  question: string;
  answer: string;
}

export interface LongAnswerConfig {
  language: Language;
  difficulty: DifficultyLevel;
  bloom_level: BloomLevel;
  quantity: number;
  content: string;
  answerLength?: 'standard' | 'extended' | 'comprehensive';
}

export interface LongAnswerResponse {
  question: string;
  answer: string;
  explanation?: string;
}

export interface MatchingQuestionConfig {
  language: Language;
  difficulty: DifficultyLevel;
  quantity: number;
  content: string;
  bloom_level: BloomLevel;
  topic?: string;
  matchingType?: 'definition' | 'concept' | 'cause-effect' | 'process' | 'classification' | 'general';
}

export interface MatchingQuestionResponse {
  question: string;
  matching_questions: {
    [key: string]: string;
  }[];
  matching_answers: {
    [key: string]: string;
  }[];
  explanation?: string;
}
export interface QuestionBank {
  id: number;
  subject_id: number;
  question_text: string;
  answer_text: string;
  updated_at: string;
  created_at: string;
  difficulty: string;
  language: string;
  type: string;
  bloom_level?: string;
  options?: Options,
  explanation?: string;
  matching_questions?: {
    [key: string]: string;
  }[],
  matching_answers?: {
    [key: string]: string;
  }[];
  mcq_answers?: (keyof Options)[];
  subjects?: Subjects
}