import { MCQConfig, Language, DifficultyLevel, BloomLevel, QuestionConfig, MCQResponse, Options } from "@/types/questions";

export function buildMCQPrompt(config: MCQConfig): string {
  const languageInstruction = getMCQLanguageInstruction(config.language);
  const difficultyInstruction = getMCQDifficultyInstruction(config.difficulty);
  const bloomInstruction = getBloomLevelInstruction(config.bloom_level);
  const optionsInstruction = getMCQOptionsInstruction(config.optionsCount || 4);
  const qualityInstructions = getMCQQualityInstructions(config);

  return `${languageInstruction}

TASK: Generate Multiple Choice Questions (MCQ)
${difficultyInstruction}
${bloomInstruction}
${optionsInstruction}

MCQ SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} multiple choice question(s)
2. Each question must have exactly ${config.optionsCount || 4} options labeled A, B, C, D${config.optionsCount === 5 ? ', E' : ''}
3. Each question must have EXACTLY 1 OR 2 correct answers (never 0, never 3 or more)
4. Base ALL questions strictly on the provided content below
5. Do not use external knowledge beyond the given content
6. Ensure all incorrect options (distractors) are plausible but clearly wrong
7. Make questions test understanding, not just memorization
8. Align questions with the specified Bloom's Taxonomy level: ${config.bloom_level.toUpperCase()}
9. When creating questions with 2 correct answers, ensure both answers are genuinely correct and not just "best" options

${qualityInstructions}

CONTENT TO ANALYZE:
"""
${config.content}
"""

OUTPUT FORMAT (JSON array only, no additional text):
[
  {
    "question": "Clear, specific question text here (use 'Select all that apply' or similar phrasing for multi-answer questions)",
    "options": {
      "A": "First option text",
      "B": "Second option text", 
      "C": "Third option text",
      "D": "Fourth option text"${config.optionsCount === 5 ? ',\n      "E": "Fifth option text"' : ''}
    },
    "correctAnswer": ["A"] or ["A", "B"],
    "explanation": "Brief explanation of why the correct answer(s) are right and others are wrong",
    "bloomLevel": "${config.bloom_level}",
    "contentReference": "Specific part of content this question relates to"
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
- Create distractors that are clearly incorrect to attentive readers
- For 2-answer questions, make both correct answers equally clear`,

    [DifficultyLevel.MEDIUM]: `DIFFICULTY: MEDIUM  
- Test understanding and application of concepts
- Require some analysis of the provided content
- Create plausible distractors that require careful consideration
- Focus on relationships between ideas in the content
- For 2-answer questions, ensure both require similar level of understanding`,

    [DifficultyLevel.HIGH]: `DIFFICULTY: HIGH
- Demand critical thinking and synthesis of multiple content parts
- Test deeper comprehension and inference abilities
- Create sophisticated distractors that challenge expert knowledge
- Require analysis, evaluation, or complex reasoning about the content
- For 2-answer questions, both should require deep analysis to identify`,

    [DifficultyLevel.MIXED]: `DIFFICULTY: MIXED
- Combine questions from all difficulty levels (Easy, Medium, High)
- Start with easier recall questions to build confidence
- Progress to medium-level conceptual understanding questions
- Include some challenging synthesis and analysis questions
- Ensure balanced coverage: ~40% Easy, ~40% Medium, ~20% High
- Create a natural learning progression from basic to advanced concepts
- Mix single and double-answer questions across all difficulty levels`
  };

  return instructions[difficulty];
}

function getBloomLevelInstruction(bloomLevel: BloomLevel): string {
  const instructions = {
    [BloomLevel.REMEMBER]: `BLOOM'S LEVEL: REMEMBER
- Focus on recall of facts, basic concepts, and terminology
- Use question stems like: "Which of the following are...", "Select all that define...", "What are the characteristics of..."
- Test memorization of key information directly from the content
- Assess recognition and recall of specific details, definitions, and facts
- For 2-answer questions, focus on recalling multiple related facts`,

    [BloomLevel.UNDERSTAND]: `BLOOM'S LEVEL: UNDERSTAND  
- Test comprehension and explanation of ideas or concepts
- Use question stems like: "Which statements explain...", "Select all that describe...", "What do these examples demonstrate..."
- Assess ability to interpret, summarize, and translate information
- Focus on understanding relationships and main ideas from the content
- For 2-answer questions, test understanding of multiple related concepts`,

    [BloomLevel.APPLY]: `BLOOM'S LEVEL: APPLY
- Test ability to use information in new situations
- Use question stems like: "Which approaches would work...", "Select all examples that demonstrate...", "What methods could be used..."
- Assess application of rules, methods, concepts, and theories
- Focus on solving problems using learned information
- For 2-answer questions, identify multiple valid applications`,

    [BloomLevel.ANALYZE]: `BLOOM'S LEVEL: ANALYZE
- Test ability to break down information into component parts
- Use question stems like: "Which factors contribute to...", "Select all evidence that supports...", "What are the components of..."
- Assess ability to identify relationships, patterns, and underlying structures
- Focus on examining and breaking apart information to understand connections
- For 2-answer questions, analyze multiple aspects or relationships`,

    [BloomLevel.EVALUATE]: `BLOOM'S LEVEL: EVALUATE
- Test ability to make judgments based on criteria and standards
- Use question stems like: "Which criteria are most important...", "Select all valid arguments...", "What are the strengths of..."
- Assess ability to critique, judge, and defend positions
- Focus on making informed decisions and supporting conclusions with evidence
- For 2-answer questions, evaluate multiple valid perspectives or criteria`,

    [BloomLevel.CREATE]: `BLOOM'S LEVEL: CREATE
- Test ability to put elements together to form coherent or functional whole
- Use question stems like: "Which elements would you include...", "Select all components needed...", "What would be required to design..."
- Assess ability to reorganize elements into new patterns or structures
- Focus on generating new ideas, products, or solutions based on the content
- For 2-answer questions, identify multiple essential creative components`,

    [BloomLevel.MIXED]: `BLOOM'S LEVEL: MIXED
- Combine questions from all Bloom's taxonomy levels
- Include questions targeting different cognitive processes
- Balance between single and multiple-answer questions across all levels`
  };

  return instructions[bloomLevel];
}

function getMCQOptionsInstruction(optionsCount: 4 | 5): string {
  return `OPTIONS STRUCTURE:
- Provide exactly ${optionsCount} options per question
- Label options as A, B, C, D${optionsCount === 5 ? ', E' : ''}
- Ensure options are roughly similar in length and structure
- Make all options grammatically consistent with the question stem
- For multi-answer questions, avoid interdependent options (where choosing one affects another)
- Ensure that when 2 answers are correct, they are genuinely independent correct statements`;
}

function getMCQQualityInstructions(config: MCQConfig): string {
  let instructions = `QUALITY STANDARDS:`;

  instructions += `
- Ensure questions have exactly 1 or 2 clearly correct answers (never 0, never 3+)
- For single-answer questions, only one option should be completely correct
- For two-answer questions, both options must be definitively correct, not just "best" choices
- Avoid trick questions or ambiguous wording
- Make question stems clear and specific
- Use "Select all that apply" or similar phrasing for potential multi-answer questions`;

  instructions += `
- Prioritize testing the most important information
- Focus on key concepts rather than trivial details
- Ensure questions assess meaningful understanding
- Balance between single-answer and two-answer questions (aim for roughly 60% single, 40% two-answer)`;

  instructions += `
- Write concise but complete question stems
- Create realistic and plausible incorrect options
- Avoid obvious clues in option wording
- Maintain consistent formatting and style
- Ensure all content is factually accurate based on provided material
- Align question complexity with both difficulty level and Bloom's taxonomy level
- For two-answer questions, ensure both correct answers are at the same cognitive level`;

  return instructions;
}

export function buildSimpleMCQPrompt(
  content: string, 
  quantity: number = 5, 
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
  bloomLevel: BloomLevel = BloomLevel.UNDERSTAND
): string {
  
  const config: MCQConfig = {
    language,
    difficulty, 
    bloom_level: bloomLevel,
    quantity,
    content,
    optionsCount: 4,
  };

  return buildMCQPrompt(config);
}

export function buildMCQFromQuestionConfig(config: QuestionConfig): string {
  const mcqConfig: MCQConfig = {
    language: config.language,
    difficulty: config.difficulty,
    bloom_level: config.bloom_level || BloomLevel.UNDERSTAND,
    topic: config.topic,
    quantity: config.quantity,
    content: config.content,
    optionsCount: 4,
  };

  return buildMCQPrompt(mcqConfig);
}

// Helper function to validate MCQ responses
export function validateMCQResponse(response: MCQResponse): boolean {
  // Check if correctAnswer has exactly 1 or 2 answers
  const correctCount = response.correctAnswer.length;
  if (correctCount < 1 || correctCount > 2) {
    return false;
  }
  
  // Check if all correct answers are valid option keys
  const validKeys = Object.keys(response.options) as (keyof Options)[];
  return response.correctAnswer.every(answer => validKeys.includes(answer));
}

// Helper function to format MCQ for display
export function formatMCQForDisplay(mcq: MCQResponse): string {
  const optionLetters = Object.keys(mcq.options) as (keyof Options)[];
  const optionsText = optionLetters.map(letter => 
    `${letter}) ${mcq.options[letter]}`
  ).join('\n');
  
  const correctAnswersText = mcq.correctAnswer.length > 1 
    ? `Correct Answers: ${mcq.correctAnswer.join(', ')}`
    : `Correct Answer: ${mcq.correctAnswer[0]}`;
  
  return `${mcq.question}

${optionsText}

${correctAnswersText}
${mcq.explanation ? `\nExplanation: ${mcq.explanation}` : ''}`;
}