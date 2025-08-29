import { QuestionConfig, Language, DifficultyLevel, FillInBlankConfig } from "@/types/questions";

export function buildFillInBlankPrompt(config: FillInBlankConfig): string {
  const languageInstruction = getFillInBlankLanguageInstruction(config.language);
  const difficultyInstruction = getFillInBlankDifficultyInstruction(config.difficulty);
  const qualityInstructions = getFillInBlankQualityInstructions(config);

  return `${languageInstruction}

TASK: Generate Fill-in-the-Blank Questions
${difficultyInstruction}

FILL-IN-THE-BLANK SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} fill-in-the-blank question(s)
2. Each question must have clear context with one or more blanks marked as ______
3. Base ALL questions strictly on the provided content below
4. Do not use external knowledge beyond the given content
5. Ensure blanks test meaningful understanding, not trivial details
6. Make sure each blank has only one correct answer based on the content
7. Provide sufficient context so blanks can be answered from the given material

${qualityInstructions}

CONTENT TO ANALYZE:
"""
${config.content}
"""

OUTPUT FORMAT (JSON array only, no additional text):
[
  {
    "question": "Complete sentence with blank(s) marked as ______ here",
    "answer": "answer"
  }
]`;
}

function getFillInBlankLanguageInstruction(language: Language): string {
  const instructions = {
    [Language.BURMESE]: 'Generate all Fill-in-the-Blank questions, answers, and explanations in Burmese (Myanmar) language using proper Burmese script and grammar.',
    [Language.ENGLISH]: 'Generate all Fill-in-the-Blank questions, answers, and explanations in clear, proper English.',
  };

  return instructions[language] || instructions[Language.ENGLISH];
}

function getFillInBlankDifficultyInstruction(difficulty: DifficultyLevel): string {
  const instructions = {
    [DifficultyLevel.EASY]: `DIFFICULTY: EASY
- Focus on direct facts and key terms from the content
- Use blanks for obvious missing words that are explicitly stated
- Provide sufficient context to make answers clear
- Test basic recall of important information`,

    [DifficultyLevel.MEDIUM]: `DIFFICULTY: MEDIUM  
- Test understanding of concepts and relationships
- Use blanks for terms that require comprehension of context
- Create questions that test application of knowledge
- Focus on important concepts and their connections`,

    [DifficultyLevel.HIGH]: `DIFFICULTY: HIGH
- Test synthesis and deeper understanding
- Use blanks for complex concepts requiring inference
- Create questions demanding analysis of multiple content parts
- Challenge understanding of nuanced relationships and implications`
  };

  return instructions[difficulty];
}

function getFillInBlankQualityInstructions(config: FillInBlankConfig): string {
  let instructions = `QUALITY STANDARDS:`;

  if (config.avoidAmbiguity !== false) {
    instructions += `
- Ensure each blank has only one correct answer
- Avoid ambiguous context that could lead to multiple valid answers
- Make questions clear and specific`;
  }

  if (config.focusOnKeyPoints !== false) {
    instructions += `
- Prioritize testing the most important information
- Focus on key concepts rather than trivial details
- Ensure blanks test meaningful understanding`;
  }

  instructions += `
- Use clear, grammatically correct sentences
- Ensure blanks are essential to sentence meaning
- Provide sufficient context for answering from the given content
- Make blank positions natural within the sentence flow
- Avoid overly obvious or overly obscure blanks
- Ensure consistent formatting and style
- Test understanding, not just memorization`;

  return instructions;
}

// Alternative simplified version for basic Fill-in-the-Blank generation
export function buildSimpleFillInBlankPrompt(
  content: string, 
  quantity: number = 5, 
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  
  const config: FillInBlankConfig = {
    language,
    difficulty, 
    quantity,
    content,
    blankType: 'mixed',
    includeExplanation: false,
    avoidAmbiguity: true,
    focusOnKeyPoints: true,
    provideChoices: false,
    contextLength: 'medium'
  };

  return buildFillInBlankPrompt(config);
}

// Export for backward compatibility with existing QuestionConfig
export function buildFillInBlankFromQuestionConfig(config: QuestionConfig): string {
  const fibConfig: FillInBlankConfig = {
    language: config.language,
    difficulty: config.difficulty,
    topic: config.topic,
    quantity: config.quantity,
    content: config.content,
  };

  return buildFillInBlankPrompt(fibConfig);
}

// Enhanced version with choices for easier answering
export function buildMultipleChoiceFillInBlankPrompt(
  content: string,
  quantity: number = 5,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
): string {
  
  const config: FillInBlankConfig = {
    language,
    difficulty,
    quantity,
    content,
  };

  return buildFillInBlankPrompt(config);
}

// Specialized version for vocabulary/terminology testing
export function buildVocabularyFillInBlankPrompt(
  content: string,
  quantity: number = 10,
  language: Language = Language.ENGLISH
): string {
  
  const config: FillInBlankConfig = {
    language,
    difficulty: DifficultyLevel.MEDIUM,
    quantity,
    content,
    topic: 'key terms and vocabulary',
    blankType: 'single',
    includeExplanation: true,
    avoidAmbiguity: true,
    focusOnKeyPoints: true,
    provideChoices: true,
    choicesCount: 4,
    contextLength: 'short'
  };

  return buildFillInBlankPrompt(config);
}

// Advanced version for testing processes and sequences
export function buildProcessFillInBlankPrompt(
  content: string,
  quantity: number = 5,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.HIGH
): string {
  
  const config: FillInBlankConfig = {
    language,
    difficulty,
    quantity,
    content,
    topic: 'processes, sequences, and procedures',
    blankType: 'multiple',
    includeExplanation: true,
    avoidAmbiguity: true,
    focusOnKeyPoints: true,
    provideChoices: false,
    contextLength: 'long'
  };

  return buildFillInBlankPrompt(config);
}

// Utility function for creating cloze-style tests (multiple blanks in paragraphs)
export function buildClozeTestPrompt(
  content: string,
  quantity: number = 3,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  
  const config: FillInBlankConfig = {
    language,
    difficulty,
    quantity,
    content,
    blankType: 'multiple',
    includeExplanation: false,
    avoidAmbiguity: true,
    focusOnKeyPoints: true,
    provideChoices: false,
    contextLength: 'long'
  };

  return buildFillInBlankPrompt(config) + `

CLOZE TEST SPECIFIC INSTRUCTIONS:
- Create paragraph-length passages with 4-6 strategic blanks per passage
- Remove key terms, connecting words, and important concepts
- Ensure passages remain comprehensible despite missing words
- Test both content knowledge and language comprehension
- Space blanks appropriately throughout the passage`;
}