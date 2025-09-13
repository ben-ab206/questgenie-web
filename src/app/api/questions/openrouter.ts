import axios, { AxiosResponse } from 'axios';
import { OpenRouterConfig } from '@/types/questions';
import { OPENROUTER_CONFIG } from '@/lib/question.config';
import { validateApiKey } from '@/lib/validation';
import { delay } from '../../../lib/utils';

export class OpenRouterClient {
  private config: Required<OpenRouterConfig>;

  constructor(config: OpenRouterConfig) {
    validateApiKey(config.apiKey);
    
    this.config = {
      ...OPENROUTER_CONFIG,
      model: config.model ?? "",
      ...config
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async generateResponse(prompt: string): Promise<any> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(prompt);
        
        if (!response.data?.choices?.[0]?.message?.content) {
          throw new Error('Invalid response structure from OpenRouter API');
        }

        const processingTime = Date.now() - startTime;
        console.log(`OpenRouter request completed in ${processingTime}ms (attempt ${attempt})`);

        return response.data.choices[0].message.content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === this.config.maxRetries) {
          break;
        }

        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retrying OpenRouter request in ${backoffDelay}ms (attempt ${attempt + 1}/${this.config.maxRetries})`);
        await delay(backoffDelay);
      }
    }

    throw new Error(`OpenRouter API failed after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  private async makeRequest(prompt: string): Promise<AxiosResponse> {
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'Question Generator'
    };

    const payload = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator who creates high-quality questions based strictly on provided content. Never use external knowledge.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 0.9,
      response_format: { type: "json_object" }
    };

    return axios.post(
      `${this.config.baseUrl}/chat/completions`,
      payload,
      { 
        headers,
        timeout: this.config.timeout
      }
    );
  }
}
