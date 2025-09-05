import { QuestionConfig, Language, DifficultyLevel, LongAnswerConfig, LongAnswerResponse } from "@/types/questions";

export function buildLongAnswerPrompt(config: LongAnswerConfig): string {
  const languageInstruction = getLongAnswerLanguageInstruction(config.language);
  const difficultyInstruction = getLongAnswerDifficultyInstruction(config.difficulty);
  const qualityInstructions = getLongAnswerQualityInstructions(config);
  const lengthInstruction = getLongAnswerLengthInstruction(config.answerLength);

  return `${languageInstruction}

TASK: Generate Long Answer Questions
${difficultyInstruction}
${lengthInstruction}

LONG ANSWER SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} long answer question(s)
2. Each question must require comprehensive, detailed responses
3. Base ALL questions and answers strictly on the provided content below
4. Do not use external knowledge beyond the given content
5. Questions should test deep understanding, analysis, and synthesis
6. Require multi-paragraph responses with structured arguments
7. Include questions that need explanation of processes, relationships, or concepts
8. Ensure questions promote critical thinking and detailed elaboration

${qualityInstructions}

CONTENT TO ANALYZE:
"""
${config.content}
"""

OUTPUT FORMAT (JSON array only, no additional text):
[
  {
    "question": "Complex, analytical question requiring detailed explanation",
    "answer": "Comprehensive answer with multiple paragraphs, examples, and analysis",
    "keyPoints": ["Main point 1", "Main point 2", "Main point 3"],
    ${config.difficulty === DifficultyLevel.HIGH ? '"rubricCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"],' : ''}
  }
]`;
}

function getLongAnswerLanguageInstruction(language: Language): string {
  const instructions = {
    [Language.BURMESE]: 'Generate all Long Answer questions, answers, key points, and explanations in Burmese (Myanmar) language using proper Burmese script and grammar.',
    [Language.ENGLISH]: 'Generate all Long Answer questions, answers, key points, and explanations in clear, proper English.',
  };

  return instructions[language] || instructions[Language.ENGLISH];
}

function getLongAnswerDifficultyInstruction(difficulty: DifficultyLevel): string {
  const instructions = {
    [DifficultyLevel.EASY]: `DIFFICULTY: EASY
- Focus on explaining basic concepts and processes from the content
- Ask questions requiring description and simple analysis
- Use question words like "Explain how...", "Describe why...", "What are the steps..."
- Answers should demonstrate understanding of fundamental concepts
- Require 2-3 main points with supporting details`,

    [DifficultyLevel.MEDIUM]: `DIFFICULTY: MEDIUM  
- Test comprehension of complex relationships and cause-effect patterns
- Ask questions requiring comparison, contrast, and analysis
- Include questions about applications, implications, and connections
- Require synthesis of multiple concepts from different sections
- Answers should demonstrate deeper analytical thinking with 3-4 main points
- Include questions like "Compare and contrast...", "Analyze the relationship...", "Evaluate the impact..."`,

    [DifficultyLevel.HIGH]: `DIFFICULTY: HIGH
- Require critical evaluation, synthesis, and complex analysis
- Ask questions about theoretical implications and abstract concepts
- Challenge understanding of underlying principles and their applications
- Require argumentation with evidence and counterarguments
- Answers should demonstrate sophisticated reasoning with 4-5 main points
- Include questions like "Critically evaluate...", "Justify your position...", "Synthesize the evidence for..."`
  };

  return instructions[difficulty];
}


function getLongAnswerLengthInstruction(answerLength?: LongAnswerConfig['answerLength']): string {
  const instructions = {
    'standard': 'ANSWER LENGTH: Expect answers to be 150-300 words with 2-3 well-developed paragraphs',
    'extended': 'ANSWER LENGTH: Expect answers to be 300-500 words with 3-4 comprehensive paragraphs',
    'comprehensive': 'ANSWER LENGTH: Expect answers to be 500-800 words with 4-6 detailed paragraphs including examples and analysis'
  };

  return instructions[answerLength || 'standard'];
}

function getLongAnswerQualityInstructions(config: LongAnswerConfig): string {
  let instructions = `QUALITY STANDARDS:`;

  instructions += `
- Ensure questions require comprehensive, multi-faceted responses
- Create questions that test deep understanding rather than surface-level recall
- Questions should require structured, well-organized answers`;

  instructions += `
- Focus on the most significant and complex aspects of the content
- Prioritize questions that reveal understanding of key relationships and principles
- Ensure questions assess critical thinking and analytical skills`;

    instructions += `
- Include questions that naturally break down into multiple sub-topics
- Structure questions to encourage organized, point-by-point responses`;


    instructions += `
- Require answers to include specific evidence and examples from the content
- Ask for justification and support for claims made in responses`;

  instructions += `
- Write clear, unambiguous questions with specific expectations
- Use appropriate academic language and question structures
- Ensure answers can be fully supported by the provided content
- Make questions appropriately challenging for the difficulty level
- Avoid questions that require extensive external knowledge
- Maintain consistent complexity and depth across all questions
- Ensure each question explores different aspects of the content
- Include key points that should be covered in ideal answers
- For high difficulty, include rubric criteria for assessment`;

  return instructions;
}

// Alternative simplified version for basic Long Answer generation
export function buildSimpleLongAnswerPrompt(
  content: string, 
  quantity: number = 3, 
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  
  const config: LongAnswerConfig = {
    language,
    difficulty, 
    quantity,
    content,
    answerLength: 'standard'
  };

  return buildLongAnswerPrompt(config);
}

// Export for backward compatibility with existing QuestionConfig
export function buildLongAnswerFromQuestionConfig(config: QuestionConfig): string {
  const laConfig: LongAnswerConfig = {
    language: config.language,
    difficulty: config.difficulty,
    quantity: config.quantity,
    content: config.content,
    answerLength: 'standard'
  };

  return buildLongAnswerPrompt(laConfig);
}

// Enhanced version with advanced features
export function buildAdvancedLongAnswerPrompt(config: LongAnswerConfig): string {
  // Set enhanced defaults for advanced version
  const enhancedConfig: LongAnswerConfig = {
    ...config,
    answerLength: config.answerLength ?? 'comprehensive',
  };

  return buildLongAnswerPrompt(enhancedConfig);
}

// Validation functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateLongAnswerResponse(response: any): response is LongAnswerResponse {
  return (
    typeof response === 'object' &&
    typeof response.question === 'string' &&
    typeof response.answer === 'string'
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateLongAnswerResponses(responses: any[]): LongAnswerResponse[] {
  if (!Array.isArray(responses)) {
    throw new Error('Response must be an array of Long Answer questions');
  }

  const validResponses = responses.filter(validateLongAnswerResponse);
  
  if (validResponses.length !== responses.length) {
    throw new Error('Some Long Answer responses are invalid or malformed');
  }

  return validResponses;
}

// Utility function to generate topic-specific long answer questions
export function buildTopicSpecificLongAnswerPrompt(
  content: string,
  topic: string,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
  quantity: number = 2,
  language: Language = Language.ENGLISH
): string {
  const config: LongAnswerConfig = {
    language,
    difficulty,
    quantity,
    content,
  };

  return buildLongAnswerPrompt(config);
}

export function buildRubricBasedLongAnswerPrompt(
  content: string,
  quantity: number = 2,
  language: Language = Language.ENGLISH
): string {
  const config: LongAnswerConfig = {
    language,
    difficulty: DifficultyLevel.HIGH,
    quantity,
    content,
    answerLength: 'comprehensive'
  };

  return buildLongAnswerPrompt(config);
}