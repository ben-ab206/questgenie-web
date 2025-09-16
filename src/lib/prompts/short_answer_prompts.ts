import { QuestionConfig, Language, DifficultyLevel, ShortAnswerConfig, ShortAnswerResponse, BloomLevel } from "@/types/questions";

export function buildShortAnswerPrompt(config: ShortAnswerConfig): string {
  const languageInstruction = getShortAnswerLanguageInstruction(config.language);
  const difficultyInstruction = getShortAnswerDifficultyInstruction(config.difficulty);
  const qualityInstructions = getShortAnswerQualityInstructions(config);
  const lengthInstruction = getShortAnswerLengthInstruction(config.answerLength);
  const bloomInstruction = getBloomLevelInstructionShortAnswer(config.bloom_level);

  return `${languageInstruction}

TASK: Generate Short Answer Questions
${difficultyInstruction}
${lengthInstruction}
${bloomInstruction}

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

function getBloomLevelInstructionShortAnswer(bloomLevel: BloomLevel): string {
  const instructions = {
    [BloomLevel.REMEMBER]: `BLOOM'S LEVEL: REMEMBER (Short Answer)
- Ask for recall of key facts, terms, or basic concepts in 1–2 sentences
- Example stems: "What is the definition of...?", "Name the three states of matter.", "Who discovered penicillin?"
- Focus on direct retrieval of information`,

    [BloomLevel.UNDERSTAND]: `BLOOM'S LEVEL: UNDERSTAND (Short Answer)
- Require short explanations or summaries to show comprehension
- Example stems: "What does this concept mean?", "Summarize why plants need sunlight.", "Explain in one sentence the purpose of DNA."
- Assess ability to interpret and explain ideas briefly`,

    [BloomLevel.APPLY]: `BLOOM'S LEVEL: APPLY (Short Answer)
- Ask learners to use knowledge in a practical or new situation
- Example stems: "How would you calculate the area of a rectangle with length 5 and width 3?", "Give an example of Newton’s third law in daily life."
- Focus on demonstrating correct use of concepts`,

    [BloomLevel.ANALYZE]: `BLOOM'S LEVEL: ANALYZE (Short Answer)
- Require breaking down or identifying parts and relationships concisely
- Example stems: "What is one factor that contributed to the outcome of...?", "Identify the independent variable in this experiment."
- Focus on recognizing patterns, roles, or causes`,

    [BloomLevel.EVALUATE]: `BLOOM'S LEVEL: EVALUATE (Short Answer)
- Ask for brief judgments, critiques, or choices supported by reasoning
- Example stems: "Which method is more reliable and why?", "What is the strongest piece of evidence for this argument?"
- Assess ability to justify decisions briefly`,

    [BloomLevel.CREATE]: `BLOOM'S LEVEL: CREATE (Short Answer)
- Require generating new ideas or proposing original solutions in a concise form
- Example stems: "Suggest one way to reduce plastic waste.", "What variable would you add to improve this experiment?"
- Focus on short, creative responses that show synthesis`,

    [BloomLevel.MIXED]: `BLOOM'S LEVEL: MIXED (Short Answer)
- Combine recall, explanation, application, analysis, evaluation, and creation
- Include a variety of short-answer prompts across Bloom’s levels
- Ensure balance between factual recall and higher-order thinking in concise responses`
  };

  return instructions[bloomLevel];
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