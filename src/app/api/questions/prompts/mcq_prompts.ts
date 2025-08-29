import { QuestionConfig, Language, DifficultyLevel, MCQConfig } from "@/types/questions";

export function buildMCQPrompt(config: MCQConfig): string {
  const languageInstruction = getMCQLanguageInstruction(config.language);
  const difficultyInstruction = getMCQDifficultyInstruction(config.difficulty);
  const optionsInstruction = getMCQOptionsInstruction(config.optionsCount || 4);
  const qualityInstructions = getMCQQualityInstructions(config);

  return `${languageInstruction}

TASK: Generate Multiple Choice Questions (MCQ)
${difficultyInstruction}
${optionsInstruction}

MCQ SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} multiple choice question(s)
2. Each question must have exactly ${config.optionsCount || 4} options labeled A, B, C, D${config.optionsCount === 5 ? ', E' : ''}
3. Only ONE option should be correct per question
4. Base ALL questions strictly on the provided content below
5. Do not use external knowledge beyond the given content
6. Ensure all incorrect options (distractors) are plausible but clearly wrong
7. Make questions test understanding, not just memorization
${config.includeExplanation ? '8. Provide brief explanations for correct answers' : ''}

${qualityInstructions}

CONTENT TO ANALYZE:
"""
${config.content}
"""

OUTPUT FORMAT (JSON array only, no additional text):
[
  {
    "question": "Clear, specific question text here",
    "options": {
      "A": "First option text",
      "B": "Second option text", 
      "C": "Third option text",
      "D": "Fourth option text"${config.optionsCount === 5 ? ',\n      "E": "Fifth option text"' : ''}
    },
    "correctAnswer": "A",
    "contentReference": "Brief reference to content section used"${config.includeExplanation ? ',\n    "explanation": "Brief explanation of why this answer is correct"' : ''}
  }
]`;
}

function getMCQLanguageInstruction(language: Language): string {
  const instructions = {
    [Language.BURMESE]: 'Generate all MCQ questions, options, and explanations in Burmese (Myanmar) language using proper Burmese script and grammar.',
    [Language.ENGLISH]: 'Generate all MCQ questions, options, and explanations in clear, proper English.',
  };

  return instructions[language] || instructions[Language.ENGLISH];
}

function getMCQDifficultyInstruction(difficulty: DifficultyLevel): string {
  const instructions = {
    [DifficultyLevel.EASY]: `DIFFICULTY: EASY
- Focus on direct facts and basic information recall
- Use straightforward question stems
- Make correct answers obvious from content reading
- Create distractors that are clearly incorrect to attentive readers`,

    [DifficultyLevel.MEDIUM]: `DIFFICULTY: MEDIUM  
- Test understanding and application of concepts
- Require some analysis of the provided content
- Create plausible distractors that require careful consideration
- Focus on relationships between ideas in the content`,

    [DifficultyLevel.HIGH]: `DIFFICULTY: HIGH
- Demand critical thinking and synthesis of multiple content parts
- Test deeper comprehension and inference abilities
- Create sophisticated distractors that challenge expert knowledge
- Require analysis, evaluation, or complex reasoning about the content`
  };

  return instructions[difficulty];
}

function getMCQOptionsInstruction(optionsCount: 4 | 5): string {
  return `OPTIONS STRUCTURE:
- Provide exactly ${optionsCount} options per question
- Label options as A, B, C, D${optionsCount === 5 ? ', E' : ''}
- Ensure options are roughly similar in length and structure
- Make all options grammatically consistent with the question stem
- Avoid "All of the above" or "None of the above" unless specifically needed`;
}

function getMCQQualityInstructions(config: MCQConfig): string {
  let instructions = `QUALITY STANDARDS:`;

  if (config.avoidAmbiguity !== false) {
    instructions += `
- Ensure questions have only one clearly correct answer
- Avoid trick questions or ambiguous wording
- Make question stems clear and specific`;
  }

  if (config.focusOnKeyPoints !== false) {
    instructions += `
- Prioritize testing the most important information
- Focus on key concepts rather than trivial details
- Ensure questions assess meaningful understanding`;
  }

  instructions += `
- Write concise but complete question stems
- Create realistic and plausible incorrect options
- Avoid obvious clues in option wording
- Maintain consistent formatting and style
- Ensure all content is factually accurate based on provided material`;

  return instructions;
}

// Alternative simplified version for basic MCQ generation
export function buildSimpleMCQPrompt(
  content: string, 
  quantity: number = 5, 
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  
  const config: MCQConfig = {
    language,
    difficulty, 
    quantity,
    content,
    optionsCount: 4,
    includeExplanation: false,
    avoidAmbiguity: true,
    focusOnKeyPoints: true
  };

  return buildMCQPrompt(config);
}

// Export for backward compatibility with existing QuestionConfig
export function buildMCQFromQuestionConfig(config: QuestionConfig): string {
  const mcqConfig: MCQConfig = {
    language: config.language,
    difficulty: config.difficulty,
    topic: config.topic,
    quantity: config.quantity,
    content: config.content,
    optionsCount: 4,
    includeExplanation: false,
    avoidAmbiguity: true,
    focusOnKeyPoints: true
  };

  return buildMCQPrompt(mcqConfig);
}