import { OpenRouterClient } from './openrouter';
import { GenerationResult, QuestionConfig, QuestionType } from '@/types/questions';
import { validateQuestionConfig } from '@/lib/validation';
import { calculateProcessingTime, generateContentHash } from '@/lib/utils';
import { buildSCQPrompt } from '@/lib/prompts/scq_prompts';
import { parseSCQResponse } from '@/lib/parsers/parser_scq';
import { buildTrueFalsePrompt } from '@/lib/prompts/tf_prompts';
import { parseTrueFalseResponse } from '@/lib/parsers/parser_truefalse';
import { buildFillInBlankPrompt } from '@/lib/prompts/fill_in_blanks_prompts';
import { parseFillInBlankResponse } from '@/lib/parsers/parser_fillintheblanks';
import { buildShortAnswerPrompt } from '@/lib/prompts/short_answer_prompts';
import { parseShortAnswerResponse } from '@/lib/parsers/parser_shortAnswer';
import { buildLongAnswerPrompt } from '@/lib/prompts/long_answer_prompts';
import { parseLongAnswerResponse } from '@/lib/parsers/parser_longAnswer';
import { buildMatchingQuestionPrompt } from '@/lib/prompts/matching_prompts';
import { parseMatchingResponse } from '@/lib/parsers/parser_matchings';
import { generateRandomQuestionPromptMix } from '@/lib/prompts/mix_prompts';
import { buildMCQPrompt } from '@/lib/prompts/mcq_prompts';
import { parseMCQResponse } from '@/lib/parsers/parser_mcq';
import { type } from 'os';

export class QuestionGenerator {
  private openRouterClient: OpenRouterClient;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash-lite-preview-06-17') {
    this.openRouterClient = new OpenRouterClient({ apiKey, model });
    this.model = model;
  }

  async generateSCQQuestions(config: QuestionConfig): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      validateQuestionConfig(config);
      
      const prompt = buildSCQPrompt(config);
      const response = await this.openRouterClient.generateResponse(prompt);
      const questions = parseSCQResponse(response, config);

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

  async generateTrueFalseQuestions(config: QuestionConfig): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      validateQuestionConfig(config);
      
      const prompt = buildTrueFalsePrompt(config);
      const response = await this.openRouterClient.generateResponse(prompt);
      const questions = parseTrueFalseResponse(response, config);

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

  async generateFillInTheBlankQuestions(config: QuestionConfig): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      validateQuestionConfig(config);
      
      const prompt = buildFillInBlankPrompt(config);
      const response = await this.openRouterClient.generateResponse(prompt);
      const questions = parseFillInBlankResponse(response, config);

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

  async generateShortAnswerQuestions(config: QuestionConfig): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      validateQuestionConfig(config);
      
      const prompt = buildShortAnswerPrompt(config);
      const response = await this.openRouterClient.generateResponse(prompt);
      const questions = parseShortAnswerResponse(response, config);

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

  async generateLongAnswerQuestions(config: QuestionConfig): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      validateQuestionConfig(config);
      
      const prompt = buildLongAnswerPrompt(config);
      const response = await this.openRouterClient.generateResponse(prompt);
      const questions = parseLongAnswerResponse(response, config);

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

  async generateMatchingAnswerQuestions(config: QuestionConfig): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      validateQuestionConfig(config);
      
      const prompt = buildMatchingQuestionPrompt(config);
      const response = await this.openRouterClient.generateResponse(prompt);
      const questions = parseMatchingResponse(response, config);

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

  async generateMixQuestions(config: QuestionConfig): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      validateQuestionConfig(config);
      
      const prompts = generateRandomQuestionPromptMix({
        questionTypes: config.type,
        totalQuantity: config.quantity,
        content: config.content,
        language: config.language,
        difficulty: config.difficulty,
        bloomLevel: config.bloom_level
      });

      const questions = [];
      
      for (const p of prompts) {
        const response = await this.openRouterClient.generateResponse(p.prompt);
        
        let parsedQuestions;
        switch (p.type) {
          case QuestionType.FILL_IN_THE_BLANK:
            parsedQuestions = parseFillInBlankResponse(response, config);
            break;
          case QuestionType.LONG_ANSWER:
            parsedQuestions = parseLongAnswerResponse(response, config);
            break;
          case QuestionType.MATCHING:
            parsedQuestions = parseMatchingResponse(response, config);
            break;
          case QuestionType.MULTIPLE_CHOICE:
            parsedQuestions = parseMCQResponse(response, config);
            break;
          case QuestionType.SINGLE_CHOICE:
            parsedQuestions = parseSCQResponse(response, config);
            break;
          case QuestionType.SHORT_ANSWER:
            parsedQuestions = parseShortAnswerResponse(response, config);
            break;
          case QuestionType.TRUE_FALSE:
            parsedQuestions = parseTrueFalseResponse(response, config);
            break;
          default:
            parsedQuestions = parseShortAnswerResponse(response, config);
        }
        
        if (Array.isArray(parsedQuestions)) {
          questions.push(...parsedQuestions);
        } else {
          questions.push(parsedQuestions);
        }
      }

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


  async generateMCQQuestions(config: QuestionConfig): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      validateQuestionConfig(config);

      console.log(config);
      
      const prompt = buildMCQPrompt(config);
      const response = await this.openRouterClient.generateResponse(prompt);
      console.log(response)
      console.log(typeof response);
      const questions = parseMCQResponse(response, config);

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
}