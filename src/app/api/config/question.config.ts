export const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  defaultModel: 'openai/gpt-4',
  timeout: 30000,
  maxRetries: 3
} as const;

export const SUPPORTED_MODELS = [
  'openai/gpt-4',
  'openai/gpt-4-turbo',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-3-haiku',
  'meta-llama/llama-3.1-8b-instruct'
] as const;

export const QUESTION_LIMITS = {
  minContentLength: 50,
  maxContentLength: 50000,
  minQuantity: 1,
  maxQuantity: 20
} as const;