'use server'

import { QuestionConfig, GenerationResult } from '../../../types/questions';
import { OpenRouterClient } from './openrouter';
import { buildPrompt } from './prompts';
import { parseResponse } from './parser';
import { validateQuestionConfig } from '../validation';
import { generateContentHash, calculateProcessingTime, delay } from '../utils';

export class QuestionGenerator {
  private openRouterClient: OpenRouterClient;
  private model: string;

  constructor(apiKey: string, model: string = 'openai/gpt-4') {
    this.openRouterClient = new OpenRouterClient({ apiKey, model });
    this.model = model;
  }

  async generateQuestions(config: QuestionConfig): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      validateQuestionConfig(config);
      
      const prompt = buildPrompt(config);
      const response = await this.openRouterClient.generateResponse(prompt);
      const questions = parseResponse(response, config);

      return {
        success: true,
        questions,
        contentHash: generateContentHash(config.content),
        metadata: {
          generatedAt: new Date(),
          model: this.model,
          processingTimeMs: calculateProcessingTime(startTime)
        }
      };
    } catch (error) {
      return {
        success: false,
        questions: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          generatedAt: new Date(),
          model: this.model,
          processingTimeMs: calculateProcessingTime(startTime)
        }
      };
    }
  }

  async generateBatch(configs: QuestionConfig[]): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];
    
    for (const config of configs) {
      const result = await this.generateQuestions(config);
      results.push(result);
      
      if (configs.length > 1) {
        await delay(1000);
      }
    }
    
    return results;
  }
}