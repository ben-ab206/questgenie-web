/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question, QuestionConfig } from '@/types/questions';
import { truncateContent } from '../../../../lib/utils';

export function parseResponse(response: string, config: QuestionConfig): Question[] {
  try {
    const jsonContent = extractJsonFromResponse(response);
    const parsedData = JSON.parse(jsonContent);

    if (!Array.isArray(parsedData)) {
      throw new Error('Response must be a JSON array');
    }

    return parsedData.map((item, index) => createQuestion(item, config, index));
  } catch (error) {
    console.error('Parse error:', error);
    console.error('Raw response preview:', response.substring(0, 500));
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractJsonFromResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove code block markers
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  
  // Find JSON array
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('No valid JSON array found in response');
  }

  return jsonMatch[0];
}

function createQuestion(item: any, config: QuestionConfig, index: number): Question {
  if (!item.question || !item.answer) {
    throw new Error(`Question ${index + 1} missing required fields (question, answer)`);
  }

  return {
    type: config.type,
    difficulty: config.difficulty,
    language: config.language,
    question: String(item.question).trim(),
    answer: String(item.answer).trim(),
    options: item.options ? item.options.map((opt: any) => String(opt).trim()) : undefined,
  };
}