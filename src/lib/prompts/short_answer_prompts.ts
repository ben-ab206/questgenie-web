import { QuestionConfig, Language, DifficultyLevel, ShortAnswerConfig, ShortAnswerResponse } from "@/types/questions";

export function buildShortAnswerPrompt(config: ShortAnswerConfig): string {
  const languageInstruction = getShortAnswerLanguageInstruction(config.language);
  const difficultyInstruction = getShortAnswerDifficultyInstruction(config.difficulty);
  const qualityInstructions = getShortAnswerQualityInstructions(config);
  const lengthInstruction = getShortAnswerLengthInstruction(config.answerLength);

  return `${languageInstruction}

TASK: Generate Short Answer Questions
${difficultyInstruction}
${lengthInstruction}

SHORT ANSWER SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} short answer question(s)
2. Each question must have a clear, specific answer based on the content
3. Base ALL questions and answers strictly on the provided content below
4. Do not use external knowledge beyond the given content
5. Ensure questions are clear, focused, and answerable from the content
6. Make questions substantive - test understanding, not trivial memorization
7. Avoid questions that are too broad or have multiple valid interpretations

${qualityInstructions}

CONTENT TO ANALYZE:
"""
${config.content}
"""

OUTPUT FORMAT (JSON array only, no additional text):
[
  {
    "question": "Clear, specific question requiring a short answer",
    "answer": "Concise, accurate answer based on the content",
  }
]`;
}

function getShortAnswerLanguageInstruction(language: Language): string {
  const instructions = {
    [Language.BURMESE]: 'Generate all Short Answer questions, answers, and explanations in Burmese (Myanmar) language using proper Burmese script and grammar.',
    [Language.ENGLISH]: 'Generate all Short Answer questions, answers, and explanations in clear, proper English.',
  };

  return instructions[language] || instructions[Language.ENGLISH];
}

function getShortAnswerDifficultyInstruction(difficulty: DifficultyLevel): string {
  const instructions = {
    [DifficultyLevel.EASY]: `DIFFICULTY: EASY
- Focus on direct facts and explicit information from the content
- Ask questions with straightforward, factual answers
- Use simple question words (what, when, where, who)
- Answers should be easily found in the content without inference`,

    [DifficultyLevel.MEDIUM]: `DIFFICULTY: MEDIUM  
- Test understanding of concepts and relationships in the content
- Ask questions requiring comprehension and connection of ideas
- Include questions about cause-and-effect, purposes, and methods
- Answers may require combining information from different parts of content`,

    [DifficultyLevel.HIGH]: `DIFFICULTY: HIGH
- Require analysis and synthesis of multiple concepts
- Ask questions about implications, significance, and complex relationships
- Challenge understanding of underlying principles and applications
- Require critical thinking and deeper interpretation of the content
- Answers should demonstrate comprehensive understanding`,

[DifficultyLevel.MIXED]: `DIFFICULTY: MIXED
- Combine questions from all difficulty levels (Easy, Medium, High)
- Start with easier recall questions to build confidence
- Progress to medium-level conceptual understanding questions
- Include some challenging synthesis and analysis questions
- Ensure balanced coverage: ~40% Easy, ~40% Medium, ~20% High
- Create a natural learning progression from basic to advanced concepts`
  };

  return instructions[difficulty];
}

function getShortAnswerLengthInstruction(answerLength?: 'brief' | 'moderate' | 'detailed'): string {
  const instructions = {
    'brief': 'ANSWER LENGTH: Expect answers to be 1-3 words or a short phrase (5-15 words maximum)',
    'moderate': 'ANSWER LENGTH: Expect answers to be 1-2 sentences (15-50 words)',
    'detailed': 'ANSWER LENGTH: Expect answers to be 2-4 sentences with explanation (50-100 words)'
  };

  return instructions[answerLength || 'moderate'];
}

function getShortAnswerQualityInstructions(config: ShortAnswerConfig): string {
  let instructions = `QUALITY STANDARDS:`;

    instructions += `
- Ensure questions have clear, unambiguous answers
- Avoid questions that could have multiple interpretations
- Make questions specific enough to have definitive answers`;
  

    instructions += `
- Prioritize testing the most important information and concepts
- Focus on significant understanding rather than trivial details
- Ensure questions assess meaningful comprehension of the content`;
  
  instructions += `
- Write complete, grammatically correct questions
- Use appropriate question words and structures
- Ensure answers are directly supported by the provided content
- Make questions challenging but fair based on the difficulty level
- Avoid questions that require external knowledge or assumptions
- Maintain consistent style and complexity across all questions
- Ensure each question tests a distinct aspect of the content`;

  return instructions;
}

// Alternative simplified version for basic Short Answer generation
export function buildSimpleShortAnswerPrompt(
  content: string, 
  quantity: number = 5, 
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  
  const config: ShortAnswerConfig = {
    language,
    difficulty, 
    quantity,
    content,
    answerLength: 'moderate',
  };

  return buildShortAnswerPrompt(config);
}

// Export for backward compatibility with existing QuestionConfig
export function buildShortAnswerFromQuestionConfig(config: QuestionConfig): string {
  const saConfig: ShortAnswerConfig = {
    language: config.language,
    difficulty: config.difficulty,
    quantity: config.quantity,
    content: config.content,
    answerLength: 'moderate'
  };

  return buildShortAnswerPrompt(saConfig);
}

// Enhanced version with more features
export function buildAdvancedShortAnswerPrompt(config: ShortAnswerConfig): string {
  // Set enhanced defaults for advanced version
  const enhancedConfig: ShortAnswerConfig = {
    ...config,
    answerLength: config.answerLength ?? 'detailed'
  };

  return buildShortAnswerPrompt(enhancedConfig);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateShortAnswerResponse(response: any): response is ShortAnswerResponse {
  return (
    typeof response === 'object' &&
    typeof response.question === 'string' &&
    typeof response.answer === 'string' &&
    typeof response.contentReference === 'string' &&
    response.question.length > 0 &&
    response.answer.length > 0 &&
    response.contentReference.length > 0
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateShortAnswerResponses(responses: any[]): ShortAnswerResponse[] {
  if (!Array.isArray(responses)) {
    throw new Error('Response must be an array of Short Answer questions');
  }

  const validResponses = responses.filter(validateShortAnswerResponse);
  
  if (validResponses.length !== responses.length) {
    throw new Error('Some Short Answer responses are invalid or malformed');
  }

  return validResponses;
}