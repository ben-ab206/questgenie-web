import { Language, DifficultyLevel, FillInBlankConfig, BloomLevel } from "@/types/questions";

export function buildFillInBlankPrompt(config: FillInBlankConfig): string {
  const languageInstruction = getFillInBlankLanguageInstruction(config.language);
  const difficultyInstruction = getFillInBlankDifficultyInstruction(config.difficulty);
  const qualityInstructions = getFillInBlankQualityInstructions(config);
  const bloomInstruction = getBloomLevelInstructionFillBlank(config.bloom_level);

  return `${languageInstruction}

TASK: Generate Fill-in-the-Blank Questions
${difficultyInstruction}
${bloomInstruction}

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

function getBloomLevelInstructionFillBlank(bloomLevel: BloomLevel): string {
  const instructions = {
    [BloomLevel.REMEMBER]: `BLOOM'S LEVEL: REMEMBER (Fill-in-the-Blank)
- Focus on recall of key terms, definitions, and facts
- Use blanks for critical terminology or basic concepts directly from the content
- Example stems: "The capital of France is ____.", "Water freezes at ____ degrees Celsius."
- Test straightforward memorization of specific details`,

    [BloomLevel.UNDERSTAND]: `BLOOM'S LEVEL: UNDERSTAND (Fill-in-the-Blank)
- Assess comprehension by requiring paraphrasing or explanation in blank form
- Example stems: "The process by which plants make food is called ____.", "Photosynthesis occurs in the ____ of plant cells."
- Use blanks to test understanding of relationships, main ideas, or processes`,

    [BloomLevel.APPLY]: `BLOOM'S LEVEL: APPLY (Fill-in-the-Blank)
- Require learners to use knowledge in practical contexts
- Example stems: "The formula for the area of a circle is ____.", "To convert Celsius to Fahrenheit, multiply by ____ and add 32."
- Test the ability to apply concepts, rules, and procedures`,

    [BloomLevel.ANALYZE]: `BLOOM'S LEVEL: ANALYZE (Fill-in-the-Blank)
- Assess ability to break down or identify components in a structure
- Example stems: "In a persuasive essay, the ____ provides evidence supporting the claim.", "The independent variable in this experiment is ____."
- Use blanks to test recognition of parts, relationships, or structures`,

    [BloomLevel.EVALUATE]: `BLOOM'S LEVEL: EVALUATE (Fill-in-the-Blank)
- Require learners to fill in key evaluative criteria or judgments
- Example stems: "A valid scientific argument must be supported by ____.", "The most reliable source of evidence in this case is ____."
- Use blanks to test knowledge of standards, criteria, or evaluative reasoning`,

    [BloomLevel.CREATE]: `BLOOM'S LEVEL: CREATE (Fill-in-the-Blank)
- Focus on generating new ideas or combining knowledge creatively
- Example stems: "A possible innovation to reduce plastic waste is ____.", "To design an experiment testing memory, one variable to manipulate could be ____."
- Use blanks for essential components of new ideas, designs, or plans`,

    [BloomLevel.MIXED]: `BLOOM'S LEVEL: MIXED (Fill-in-the-Blank)
- Include blanks targeting multiple Bloom’s levels
- Mix between recall, comprehension, application, analysis, evaluation, and creation
- Ensure variety in cognitive demand while still suitable for fill-in-the-blank format`
  };

  return instructions[bloomLevel];
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
- Challenge understanding of nuanced relationships and implications`,
  

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