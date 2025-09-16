/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuestionConfig, Language, DifficultyLevel, SCQConfig, BloomLevel } from "@/types/questions";

export function buildSCQPrompt(config: SCQConfig): string {
  const languageInstruction = getSCQLanguageInstruction(config.language);
  const difficultyInstruction = getSCQDifficultyInstruction(config.difficulty);
  const bloomInstruction = getBloomLevelInstruction(config.bloom_level);
  const optionsInstruction = getSCQOptionsInstruction(config.optionsCount || 4);
  const qualityInstructions = getSCQQualityInstructions(config);

  return `${languageInstruction}

TASK: Generate Single Choice Questions (SCQ)
${difficultyInstruction}
${bloomInstruction}
${optionsInstruction}

SCQ SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} single choice question(s)
2. Each question must have exactly ${config.optionsCount || 4} options labeled A, B, C, D${config.optionsCount === 5 ? ', E' : ''}
3. Only ONE option should be correct per question
4. Base ALL questions strictly on the provided content below
5. Do not use external knowledge beyond the given content
6. Ensure all incorrect options (distractors) are plausible but clearly wrong
7. Make questions test understanding, not just memorization
8. Align questions with the specified Bloom's Taxonomy level: ${config.bloom_level.toUpperCase()}

${qualityInstructions}

CRITICAL OUTPUT FORMAT REQUIREMENTS:
- The "correctAnswer" field must ONLY contain the option letter (A, B, C, D${config.optionsCount === 5 ? ', or E' : ''})
- DO NOT include the answer text in the "correctAnswer" field
- Example of CORRECT format: "correctAnswer": "B"
- Example of INCORRECT format: "correctAnswer": "The process of photosynthesis"
- ALWAYS use ONLY the letter designation for correctAnswer

CONTENT TO ANALYZE:
"""
${config.content}
"""

OUTPUT FORMAT (JSON array only, no additional text or explanations outside the JSON):
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
    "explanation": "Brief explanation of why this answer is correct and others are wrong",
    "bloomLevel": "${config.bloom_level}",
    "contentReference": "Specific part of content this question relates to"
  }
]

REMEMBER: The correctAnswer value must be ONLY the letter (A, B, C, D${config.optionsCount === 5 ? ', or E' : ''}), nothing else!`;
}

function getSCQLanguageInstruction(language: Language): string {
  const instructions = {
    [Language.BURMESE]: 'Generate all SCQ questions, options, and explanations in Burmese (Myanmar) language using proper Burmese script and grammar.',
    [Language.ENGLISH]: 'Generate all SCQ questions, options, and explanations in clear, proper English.',
  };

  return instructions[language] || instructions[Language.ENGLISH];
}

function getSCQDifficultyInstruction(difficulty: DifficultyLevel): string {
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
- Require analysis, evaluation, or complex reasoning about the content`,

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

function getBloomLevelInstruction(bloomLevel: BloomLevel): string {
  const instructions = {
    [BloomLevel.REMEMBER]: `BLOOM'S LEVEL: REMEMBER
- Focus on recall of facts, basic concepts, and terminology
- Use question stems like: "What is...", "Who was...", "When did...", "Which of the following..."
- Test memorization of key information directly from the content
- Assess recognition and recall of specific details, definitions, and facts`,

    [BloomLevel.UNDERSTAND]: `BLOOM'S LEVEL: UNDERSTAND  
- Test comprehension and explanation of ideas or concepts
- Use question stems like: "What does this mean...", "Why is...", "How would you explain..."
- Assess ability to interpret, summarize, and translate information
- Focus on understanding relationships and main ideas from the content`,

    [BloomLevel.APPLY]: `BLOOM'S LEVEL: APPLY
- Test ability to use information in new situations
- Use question stems like: "How would you use...", "What would happen if...", "Which example demonstrates..."
- Assess application of rules, methods, concepts, and theories
- Focus on solving problems using learned information`,

    [BloomLevel.ANALYZE]: `BLOOM'S LEVEL: ANALYZE
- Test ability to break down information into component parts
- Use question stems like: "What are the parts of...", "What evidence supports...", "How does X relate to Y..."
- Assess ability to identify relationships, patterns, and underlying structures
- Focus on examining and breaking apart information to understand connections`,

    [BloomLevel.EVALUATE]: `BLOOM'S LEVEL: EVALUATE
- Test ability to make judgments based on criteria and standards
- Use question stems like: "Which is most important...", "What is the best...", "How would you assess..."
- Assess ability to critique, judge, and defend positions
- Focus on making informed decisions and supporting conclusions with evidence`,

    [BloomLevel.CREATE]: `BLOOM'S LEVEL: CREATE
- Test ability to put elements together to form coherent or functional whole
- Use question stems like: "What would you design...", "How could you combine...", "What new approach..."
- Assess ability to reorganize elements into new patterns or structures
- Focus on generating new ideas, products, or solutions based on the content`,

    [BloomLevel.MIXED] : `BLOOM'S LEVEL: MIXED
- Include questions from multiple Bloom's taxonomy levels
- Distribute questions across different cognitive levels
- Ensure variety in thinking skills required`
  };

  return instructions[bloomLevel];
}

function getSCQOptionsInstruction(optionsCount: 4 | 5): string {
  return `OPTIONS STRUCTURE:
- Provide exactly ${optionsCount} options per question
- Label options as A, B, C, D${optionsCount === 5 ? ', E' : ''}
- Ensure options are roughly similar in length and structure
- Make all options grammatically consistent with the question stem
- Avoid "All of the above" or "None of the above" unless specifically needed`;
}

function getSCQQualityInstructions(config: SCQConfig): string {
  let instructions = `QUALITY STANDARDS:`;

  instructions += `
- Ensure questions have only one clearly correct answer
- Avoid trick questions or ambiguous wording
- Make question stems clear and specific`;

  instructions += `
- Prioritize testing the most important information
- Focus on key concepts rather than trivial details
- Ensure questions assess meaningful understanding`;

  instructions += `
- Write concise but complete question stems
- Create realistic and plausible incorrect options
- Avoid obvious clues in option wording
- Maintain consistent formatting and style
- Ensure all content is factually accurate based on provided material
- Align question complexity with both difficulty level and Bloom's taxonomy level

ANSWER FORMAT REMINDER:
- The correctAnswer field must contain ONLY the option letter
- Valid examples: "A", "B", "C", "D"${config.optionsCount === 5 ? ', "E"' : ''}
- Invalid examples: "Option A", "The correct answer is B", full answer text`;

  return instructions;
}