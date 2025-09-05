export interface QuestionConfig {
  type: QuestionType;
  quantity: number;
  difficulty: DifficultyLevel;
  language: Language;
  content: string;
  topic?: string;
}

export interface MCQOption {
  A: string;
  B: string;
  C: string;
  D: string;
  E?: string;
}

export interface Question {
  id?: number;
  type: QuestionType;
  difficulty: DifficultyLevel;
  language: Language;
  question: string;
  answer: string;
  options?: string[]; // mcq
  explanation?: string;
  matching_questions?: {
      A: string
      B: string
    }[],
  matching_answers?: {
    A: string
    B: string
  }[]
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
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_IN_THE_BLANK = 'fill_in_the_blank',
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer',
  MATCHING = 'matching',
  //   ORDERING = 'ordering'
}

export enum DifficultyLevel {
  EASY = 'easy',
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

export interface MCQConfig {
  language: Language;
  difficulty: DifficultyLevel;
  topic?: string;
  quantity: number;
  content: string;
  optionsCount?: 4 | 5;
}


export interface MCQResponse {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  contentReference?: string;
  explanation?: string;
}

export interface FillInBlankConfig {
  language: Language;
  difficulty: DifficultyLevel;
  topic?: string;
  quantity: number;
  content: string;
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
  includeExplanation?: boolean;
  avoidAmbiguity?: boolean;
  focusOnKeyPoints?: boolean;
  balanceAnswers?: boolean; // Whether to balance true/false distribution
  requireJustification?: boolean; // Whether false statements need correction
}

export interface TrueFalseResponse {
  statement: string;
  answer: boolean;
  contentReference: string;
  explanation?: string;
  correction?: string;
}

export interface ShortAnswerConfig {
  language: Language;
  difficulty: DifficultyLevel;
  quantity: number;
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
  topic?: string;
  matchingType?: 'definition' | 'concept' | 'cause-effect' | 'process' | 'classification' | 'general';
}

export interface MatchingQuestionResponse {
  question: string;
  matching_questions: {
    A: string;
    B: string;
  }[];
  matching_answers: {
    A: string;
    B: string;
  }[];
  explanation?: string;
}