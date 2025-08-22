import { QuestionConfig, QuestionType, DifficultyLevel, Language } from '../../types/questions';
import { QUESTION_LIMITS } from './config/question.config';

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateQuestionConfig(config: QuestionConfig): void {
  validateContent(config.content);
  validateQuantity(config.quantity);
  validateType(config.type);
  validateDifficulty(config.difficulty);
  validateLanguage(config.language);
}

function validateContent(content: string): void {
  if (!content || typeof content !== 'string') {
    throw new ValidationError('Content is required and must be a string', 'content', 'MISSING_CONTENT');
  }
  
  const trimmedContent = content.trim();
  if (trimmedContent.length < QUESTION_LIMITS.minContentLength) {
    throw new ValidationError(
      `Content must be at least ${QUESTION_LIMITS.minContentLength} characters long`, 
      'content', 
      'CONTENT_TOO_SHORT'
    );
  }
  
  if (trimmedContent.length > QUESTION_LIMITS.maxContentLength) {
    throw new ValidationError(
      `Content must be less than ${QUESTION_LIMITS.maxContentLength} characters`, 
      'content', 
      'CONTENT_TOO_LONG'
    );
  }
}

function validateQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || 
      quantity < QUESTION_LIMITS.minQuantity || 
      quantity > QUESTION_LIMITS.maxQuantity) {
    throw new ValidationError(
      `Quantity must be an integer between ${QUESTION_LIMITS.minQuantity} and ${QUESTION_LIMITS.maxQuantity}`, 
      'quantity', 
      'INVALID_QUANTITY'
    );
  }
}

function validateType(type: QuestionType): void {
  if (!Object.values(QuestionType).includes(type)) {
    throw new ValidationError(
      `Invalid question type. Must be one of: ${Object.values(QuestionType).join(', ')}`,
      'type',
      'INVALID_TYPE'
    );
  }
}

function validateDifficulty(difficulty: DifficultyLevel): void {
  if (!Object.values(DifficultyLevel).includes(difficulty)) {
    throw new ValidationError(
      `Invalid difficulty level. Must be one of: ${Object.values(DifficultyLevel).join(', ')}`,
      'difficulty',
      'INVALID_DIFFICULTY'
    );
  }
}

function validateLanguage(language: Language): void {
  if (!Object.values(Language).includes(language)) {
    throw new ValidationError(
      `Invalid language. Must be one of: ${Object.values(Language).join(', ')}`,
      'language',
      'INVALID_LANGUAGE'
    );
  }
}

export function validateApiKey(apiKey: string): void {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new ValidationError('OpenRouter API key is required', 'apiKey', 'MISSING_API_KEY');
  }
}