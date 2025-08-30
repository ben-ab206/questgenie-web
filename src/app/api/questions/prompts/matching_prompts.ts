import { QuestionConfig, Language, DifficultyLevel, MatchingQuestionConfig, MatchingQuestionResponse } from "@/types/questions";

export function buildMatchingQuestionPrompt(config: MatchingQuestionConfig): string {
  const languageInstruction = getMatchingLanguageInstruction(config.language);
  const difficultyInstruction = getMatchingDifficultyInstruction(config.difficulty);
  const typeInstruction = getMatchingTypeInstruction(config.matchingType);
  const qualityInstructions = getMatchingQualityInstructions(config);

  return `${languageInstruction}

TASK: Generate Matching Questions
${difficultyInstruction}
${typeInstruction}

MATCHING QUESTION SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} matching question(s)
2. Each question must have items in Column A that correspond to items in Column B
3. Base ALL questions and answers strictly on the provided content below
4. Do not use external knowledge beyond the given content
5. Create meaningful connections between Column A and Column B items
6. Ensure all matches have clear, logical relationships
7. Include 4-8 matching pairs per question (optimal is 5-6 pairs)
8. Avoid obvious or trivial matches - require understanding of content

${qualityInstructions}

CONTENT TO ANALYZE:
"""
${config.content}
"""

OUTPUT FORMAT (JSON array only, no additional text):
[
  {
    "question": "Clear instruction for the matching task",
    "matching_questions": [
      { "A": "Item from Column A", "B": "Corresponding item from Column B" },
      { "A": "Item from Column A", "B": "Corresponding item from Column B" },
      { "A": "Item from Column A", "B": "Corresponding item from Column B" },
      { "A": "Item from Column A", "B": "Corresponding item from Column B" },
      { "A": "Item from Column A", "B": "Corresponding item from Column B" }
    ],
    "matching_answers": [
      { "A": "Item from Column A", "B": "Corresponding item from Column B" },
      { "A": "Item from Column A", "B": "Corresponding item from Column B" },
      { "A": "Item from Column A", "B": "Corresponding item from Column B" },
      { "A": "Item from Column A", "B": "Corresponding item from Column B" },
      { "A": "Item from Column A", "B": "Corresponding item from Column B" }
    ],
    ${config.difficulty === DifficultyLevel.HIGH ? '"explanation": "Brief explanation of the matching relationships and key concepts",' : ''}
  }
]`;
}

function getMatchingLanguageInstruction(language: Language): string {
  const instructions = {
    [Language.BURMESE]: 'Generate all Matching questions, items, titles, and explanations in Burmese (Myanmar) language using proper Burmese script and grammar.',
    [Language.ENGLISH]: 'Generate all Matching questions, items, titles, and explanations in clear, proper English.',
  };

  return instructions[language] || instructions[Language.ENGLISH];
}

function getMatchingDifficultyInstruction(difficulty: DifficultyLevel): string {
  const instructions = {
    [DifficultyLevel.EASY]: `DIFFICULTY: EASY
- Create straightforward, direct relationships between items
- Focus on basic concepts, definitions, and simple associations
- Use clear, obvious connections that test fundamental understanding
- Column A might contain: terms, names, basic concepts
- Column B might contain: simple definitions, direct descriptions, basic facts
- Relationships should be one-to-one and unambiguous`,

    [DifficultyLevel.MEDIUM]: `DIFFICULTY: MEDIUM
- Create relationships requiring deeper understanding of concepts
- Include cause-and-effect relationships, processes, and applications
- Test comprehension of relationships between different elements
- Column A might contain: concepts, processes, causes, categories
- Column B might contain: effects, results, examples, characteristics
- Some relationships may require analysis or synthesis of information`,

    [DifficultyLevel.HIGH]: `DIFFICULTY: HIGH
- Create complex relationships requiring critical thinking and analysis
- Include abstract concepts, theoretical connections, and nuanced relationships
- Test sophisticated understanding of interconnections and implications
- Column A might contain: complex theories, abstract principles, advanced concepts
- Column B might contain: applications, implications, complex examples, theoretical outcomes
- Relationships should require deep understanding and may involve multiple layers of connection`
  };

  return instructions[difficulty];
}

function getMatchingTypeInstruction(matchingType?: MatchingQuestionConfig['matchingType']): string {
  const instructions = {
    'definition': `MATCHING TYPE: DEFINITION
- Column A: Terms, concepts, vocabulary words
- Column B: Definitions, explanations, descriptions
- Focus on terminology and conceptual understanding`,

    'concept': `MATCHING TYPE: CONCEPT
- Column A: Concepts, theories, principles
- Column B: Examples, applications, illustrations
- Focus on understanding how concepts apply in practice`,

    'cause-effect': `MATCHING TYPE: CAUSE-EFFECT
- Column A: Causes, triggers, conditions
- Column B: Effects, results, outcomes, consequences
- Focus on understanding causal relationships`,

    'process': `MATCHING TYPE: PROCESS
- Column A: Process steps, stages, phases
- Column B: Descriptions, outcomes, characteristics of each step
- Focus on understanding sequential relationships and processes`,

    'classification': `MATCHING TYPE: CLASSIFICATION
- Column A: Categories, groups, classifications
- Column B: Examples, members, characteristics
- Focus on understanding how items belong to different groups`,

    'general': `MATCHING TYPE: GENERAL
- Create varied relationships based on content analysis
- Mix different types of connections as appropriate
- Focus on the most important relationships in the content`
  };

  return instructions[matchingType || 'general'];
}

function getMatchingQualityInstructions(config: MatchingQuestionConfig): string {
  let instructions = `QUALITY STANDARDS:`;

  instructions += `
- Ensure all items in both columns are directly related to the provided content
- Create balanced difficulty across all matching pairs within each question
- Avoid ambiguous matches - each item should have one clear, correct match`;

  instructions += `
- Make Column A and Column B items roughly equal in length and complexity
- Ensure no item appears twice in the same column
- Create items that are parallel in structure and format`;

  instructions += `
- Test meaningful relationships that demonstrate understanding
- Avoid trivial or obvious connections that don't assess learning
- Focus on the most important concepts and relationships in the content`;

  instructions += `
- Write clear, unambiguous items that can't be misinterpreted
- Use consistent terminology throughout the matching question
- Ensure all matches are factually correct based on the provided content`;

  if (config.topic) {
    instructions += `
- Focus specifically on relationships related to: ${config.topic}
- Prioritize the most important aspects of this topic area`;
  }

  instructions += `
- Include 4-8 matching pairs per question (5-6 is optimal)
- Vary the order of items to prevent pattern matching
- Ensure the matching_answers array exactly corresponds to the matching_questions array
- For high difficulty questions, include explanations of the key relationships`;

  return instructions;
}

// Simplified version for basic matching question generation
export function buildSimpleMatchingPrompt(
  content: string,
  quantity: number = 2,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  const config: MatchingQuestionConfig = {
    language,
    difficulty,
    quantity,
    content
  };

  return buildMatchingQuestionPrompt(config);
}

// Export for backward compatibility with existing QuestionConfig
export function buildMatchingFromQuestionConfig(config: QuestionConfig): string {
  const matchingConfig: MatchingQuestionConfig = {
    language: config.language,
    difficulty: config.difficulty,
    quantity: config.quantity,
    content: config.content,
    topic: config.topic
  };

  return buildMatchingQuestionPrompt(matchingConfig);
}

// Specialized matching question types
export function buildDefinitionMatchingPrompt(
  content: string,
  quantity: number = 2,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  const config: MatchingQuestionConfig = {
    language,
    difficulty,
    quantity,
    content,
    matchingType: 'definition'
  };

  return buildMatchingQuestionPrompt(config);
}

export function buildCauseEffectMatchingPrompt(
  content: string,
  quantity: number = 2,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  const config: MatchingQuestionConfig = {
    language,
    difficulty,
    quantity,
    content,
    matchingType: 'cause-effect'
  };

  return buildMatchingQuestionPrompt(config);
}

export function buildConceptMatchingPrompt(
  content: string,
  quantity: number = 2,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  const config: MatchingQuestionConfig = {
    language,
    difficulty,
    quantity,
    content,
    matchingType: 'concept'
  };

  return buildMatchingQuestionPrompt(config);
}

// Validation functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateMatchingResponse(response: any): response is MatchingQuestionResponse {
  return (
    typeof response === 'object' &&
    typeof response.question === 'string' &&
    Array.isArray(response.matching_questions) &&
    Array.isArray(response.matching_answers) &&
    response.matching_questions.length === response.matching_answers.length &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.matching_questions.every((item: any) => 
      typeof item.A === 'string' && typeof item.B === 'string'
    ) &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.matching_answers.every((item: any) => 
      typeof item.A === 'string' && typeof item.B === 'string'
    )
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateMatchingResponses(responses: any[]): MatchingQuestionResponse[] {
  if (!Array.isArray(responses)) {
    throw new Error('Response must be an array of Matching questions');
  }

  const validResponses = responses.filter(validateMatchingResponse);
  
  if (validResponses.length !== responses.length) {
    throw new Error('Some Matching responses are invalid or malformed');
  }

  return validResponses;
}

// Utility function to check if matching answers correspond to questions
export function validateMatchingCorrespondence(response: MatchingQuestionResponse): boolean {
  const questionPairs = response.matching_questions;
  const answerPairs = response.matching_answers;

  if (questionPairs.length !== answerPairs.length) {
    return false;
  }

  // Check if all answer pairs exist in question pairs
  return answerPairs.every(answer => 
    questionPairs.some(question => 
      question.A === answer.A && question.B === answer.B
    )
  );
}