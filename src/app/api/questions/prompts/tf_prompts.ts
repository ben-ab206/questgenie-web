import { QuestionConfig, Language, DifficultyLevel, TrueFalseConfig, TrueFalseResponse } from "@/types/questions";

export function buildTrueFalsePrompt(config: TrueFalseConfig): string {
  const languageInstruction = getTrueFalseLanguageInstruction(config.language);
  const difficultyInstruction = getTrueFalseDifficultyInstruction(config.difficulty);
  const topicInstruction = getTrueFalseTopicInstruction(config.topic);
  const qualityInstructions = getTrueFalseQualityInstructions(config);
  const balanceInstruction = getTrueFalseBalanceInstruction(config.balanceAnswers);

  return `${languageInstruction}

TASK: Generate True/False Questions
${topicInstruction}
${difficultyInstruction}
${balanceInstruction}

TRUE/FALSE SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} true/false statement(s)
2. Each statement must be definitively either TRUE or FALSE based on the content
3. Base ALL statements strictly on the provided content below
4. Do not use external knowledge beyond the given content
5. Ensure statements are clear, unambiguous, and testable
6. Make statements substantive - test understanding, not trivial details
7. Avoid statements that could be interpreted as partially true or contextually dependent
${config.includeExplanation ? '8. Provide brief explanations for all answers' : ''}
${config.requireJustification ? '9. For FALSE statements, provide the correct information' : ''}

${qualityInstructions}

CONTENT TO ANALYZE:
"""
${config.content}
"""

OUTPUT FORMAT (JSON array only, no additional text):
[
  {
    "statement": "Clear, specific statement to be evaluated as true or false",
    "answer": true,
    "contentReference": "Brief reference to content section used"${config.includeExplanation ? ',\n    "explanation": "Brief explanation of why this statement is true/false"' : ''}${config.requireJustification ? ',\n    "correction": "For false statements: the correct information from the content"' : ''}
  }
]`;
}

function getTrueFalseLanguageInstruction(language: Language): string {
  const instructions = {
    [Language.BURMESE]: 'Generate all True/False statements, explanations, and corrections in Burmese (Myanmar) language using proper Burmese script and grammar.',
    [Language.ENGLISH]: 'Generate all True/False statements, explanations, and corrections in clear, proper English.',
  };

  return instructions[language] || instructions[Language.ENGLISH];
}

function getTrueFalseDifficultyInstruction(difficulty: DifficultyLevel): string {
  const instructions = {
    [DifficultyLevel.EASY]: `DIFFICULTY: EASY
- Focus on direct facts and explicit information from the content
- Create statements that are obviously true or false to careful readers
- Use straightforward, literal interpretations of the content
- Avoid complex relationships or nuanced interpretations`,

    [DifficultyLevel.MEDIUM]: `DIFFICULTY: MEDIUM  
- Test understanding of concepts and relationships in the content
- Create statements requiring careful reading and comprehension
- Include statements about cause-and-effect relationships
- Test understanding of implications and connections between ideas`,

    [DifficultyLevel.HIGH]: `DIFFICULTY: HIGH
- Require synthesis of multiple parts of the content
- Test deep comprehension and inference abilities
- Create statements about complex relationships and implications
- Challenge understanding of subtle distinctions and nuanced concepts
- Require critical analysis of the content's meaning and implications`
  };

  return instructions[difficulty];
}

function getTrueFalseTopicInstruction(topic?: string): string {
  return topic 
    ? `TOPIC FOCUS: Concentrate specifically on "${topic}" within the provided content.`
    : 'TOPIC FOCUS: Identify and focus on the most important concepts and factual information in the content.';
}

function getTrueFalseBalanceInstruction(balanceAnswers?: boolean): string {
  if (balanceAnswers === false) {
    return 'ANSWER DISTRIBUTION: Create questions naturally based on content - no need to balance true/false answers.';
  }
  
  return `ANSWER DISTRIBUTION: Try to create a roughly balanced mix of TRUE and FALSE statements when possible, but prioritize content accuracy over forced balance.`;
}

function getTrueFalseQualityInstructions(config: TrueFalseConfig): string {
  let instructions = `QUALITY STANDARDS:`;

  if (config.avoidAmbiguity !== false) {
    instructions += `
- Ensure statements are unambiguous - clearly true or false
- Avoid statements that could be "sometimes true" or contextually dependent
- Make statements specific and testable against the content`;
  }

  if (config.focusOnKeyPoints !== false) {
    instructions += `
- Prioritize testing the most important information and concepts
- Focus on significant facts rather than trivial details
- Ensure statements assess meaningful understanding of the content`;
  }

  instructions += `
- Write complete, grammatically correct statements
- Ensure statements stand alone without requiring additional context
- Avoid double negatives or complex sentence structures
- Make FALSE statements believable but clearly incorrect based on content
- Ensure TRUE statements are definitively supported by the provided material
- Maintain consistent tone and style across all statements`;

  return instructions;
}

// Alternative simplified version for basic True/False generation
export function buildSimpleTrueFalsePrompt(
  content: string, 
  quantity: number = 5, 
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  
  const config: TrueFalseConfig = {
    language,
    difficulty, 
    quantity,
    content,
    includeExplanation: false,
    avoidAmbiguity: true,
    focusOnKeyPoints: true,
    balanceAnswers: true,
    requireJustification: false
  };

  return buildTrueFalsePrompt(config);
}

// Export for backward compatibility with existing QuestionConfig
export function buildTrueFalseFromQuestionConfig(config: QuestionConfig): string {
  const tfConfig: TrueFalseConfig = {
    language: config.language,
    difficulty: config.difficulty,
    topic: config.topic,
    quantity: config.quantity,
    content: config.content,
    includeExplanation: false,
    avoidAmbiguity: true,
    focusOnKeyPoints: true,
    balanceAnswers: true,
    requireJustification: false
  };

  return buildTrueFalsePrompt(tfConfig);
}

// Enhanced version with more features
export function buildAdvancedTrueFalsePrompt(config: TrueFalseConfig): string {
  // Set enhanced defaults for advanced version
  const enhancedConfig: TrueFalseConfig = {
    ...config,
    includeExplanation: config.includeExplanation ?? true,
    requireJustification: config.requireJustification ?? true,
    balanceAnswers: config.balanceAnswers ?? true
  };

  return buildTrueFalsePrompt(enhancedConfig);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateTrueFalseResponse(response: any): response is TrueFalseResponse {
  return (
    typeof response === 'object' &&
    typeof response.statement === 'string' &&
    typeof response.answer === 'boolean' &&
    typeof response.contentReference === 'string' &&
    response.statement.length > 0 &&
    response.contentReference.length > 0
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateTrueFalseResponses(responses: any[]): TrueFalseResponse[] {
  if (!Array.isArray(responses)) {
    throw new Error('Response must be an array of True/False questions');
  }

  const validResponses = responses.filter(validateTrueFalseResponse);
  
  if (validResponses.length !== responses.length) {
    throw new Error('Some True/False responses are invalid or malformed');
  }

  return validResponses;
}