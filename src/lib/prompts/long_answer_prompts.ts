import { Language, DifficultyLevel, LongAnswerConfig, BloomLevel } from "@/types/questions";

export function buildLongAnswerPrompt(config: LongAnswerConfig): string {
  const languageInstruction = getLongAnswerLanguageInstruction(config.language);
  const difficultyInstruction = getLongAnswerDifficultyInstruction(config.difficulty);
  // const qualityInstructions = getLongAnswerQualityInstructions(config);
  const lengthInstruction = getLongAnswerLengthInstruction(config.answerLength);
  const bloomInstruction = getBloomLevelInstructionLongAnswer(config.bloom_level);

  return `${languageInstruction}

TASK: Generate Long Answer Questions
${difficultyInstruction}
${lengthInstruction}
${bloomInstruction}

LONG ANSWER SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} long answer question(s)
2. Each question must require comprehensive, detailed responses
3. Base ALL questions and answers strictly on the provided content below
4. Do not use external knowledge beyond the given content
5. Questions should test deep understanding, analysis, and synthesis
6. Require multi-paragraph responses with structured arguments
7. Include questions that need explanation of processes, relationships, or concepts
8. Ensure questions promote critical thinking and detailed elaboration

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
- Include questions like "Critically evaluate...", "Justify your position...", "Synthesize the evidence for..."`,

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

function getBloomLevelInstructionLongAnswer(bloomLevel: BloomLevel): string {
  const instructions = {
    [BloomLevel.REMEMBER]: `BLOOM'S LEVEL: REMEMBER (Long Answer)
- Ask learners to recall and write definitions, lists, or key facts
- Example stems: "Describe the main events of...", "List the characteristics of...", "What is the definition of..."
- Responses should show memorization of essential information`,

    [BloomLevel.UNDERSTAND]: `BLOOM'S LEVEL: UNDERSTAND (Long Answer)
- Require explanation, summary, or interpretation in the response
- Example stems: "Explain in your own words...", "Summarize the main idea of...", "What does this concept mean..."
- Assess comprehension of relationships, meanings, and context`,

    [BloomLevel.APPLY]: `BLOOM'S LEVEL: APPLY (Long Answer)
- Ask learners to demonstrate how knowledge can be used in practical or novel contexts
- Example stems: "How would you use this principle to solve...", "Apply this concept to explain...", "Give an example of how..."
- Responses should connect theory to practice`,

    [BloomLevel.ANALYZE]: `BLOOM'S LEVEL: ANALYZE (Long Answer)
- Require breaking information into parts and examining relationships
- Example stems: "Break down the factors that contribute to...", "Analyze the causes and effects of...", "What evidence supports..."
- Responses should identify structure, components, and patterns`,

    [BloomLevel.EVALUATE]: `BLOOM'S LEVEL: EVALUATE (Long Answer)
- Ask learners to make judgments, critiques, or justify positions
- Example stems: "Evaluate the effectiveness of...", "Which approach is best and why...", "Defend or refute the statement..."
- Responses should apply criteria, evidence, and reasoning`,

    [BloomLevel.CREATE]: `BLOOM'S LEVEL: CREATE (Long Answer)
- Require synthesis of ideas into new products, plans, or solutions
- Example stems: "Propose a plan to...", "Design a strategy for...", "What innovative solution would you suggest..."
- Responses should demonstrate originality, planning, or creative synthesis`,

    [BloomLevel.MIXED]: `BLOOM'S LEVEL: MIXED (Long Answer)
- Include prompts across multiple Bloom’s levels
- Balance between recall, explanation, application, analysis, evaluation, and creation
- Ensure variety in depth and complexity of written responses`
  };

  return instructions[bloomLevel];
}



function getLongAnswerLengthInstruction(answerLength?: LongAnswerConfig['answerLength']): string {
  const instructions = {
    'standard': 'ANSWER LENGTH: Expect answers to be 150-300 words with 2-3 well-developed paragraphs',
    'extended': 'ANSWER LENGTH: Expect answers to be 300-500 words with 3-4 comprehensive paragraphs',
    'comprehensive': 'ANSWER LENGTH: Expect answers to be 500-800 words with 4-6 detailed paragraphs including examples and analysis'
  };

  return instructions[answerLength || 'standard'];
}