import { Language, DifficultyLevel, TrueFalseConfig, BloomLevel } from "@/types/questions";

export function buildTrueFalsePrompt(config: TrueFalseConfig): string {
  const languageInstruction = getTrueFalseLanguageInstruction(config.language);
  const difficultyInstruction = getTrueFalseDifficultyInstruction(config.difficulty);
  const topicInstruction = getTrueFalseTopicInstruction(config.topic);
  const qualityInstructions = getTrueFalseQualityInstructions(config);
  const balanceInstruction = getTrueFalseBalanceInstruction(config.balanceAnswers);
  const bloomInstruction = getBloomLevelInstructionTrueFalse(config.bloom_level);

  return `${languageInstruction}

TASK: Generate True/False Questions
${topicInstruction}
${difficultyInstruction}
${balanceInstruction}
${bloomInstruction}

TRUE/FALSE SPECIFIC REQUIREMENTS:
1. Create exactly ${config.quantity} true/false question(s)
2. Each question must be definitively either TRUE or FALSE based on the content
3. Base ALL questions strictly on the provided content below
4. Do not use external knowledge beyond the given content
5. Ensure questions are clear, unambiguous, and testable
6. Make questions substantive - test understanding, not trivial details
7. Avoid questions that could be interpreted as partially true or contextually dependent
${config.includeExplanation ? '8. Provide brief explanations for all answers' : ''}
${config.requireJustification ? '9. For FALSE questions, provide the correct information' : ''}

${qualityInstructions}

CONTENT TO ANALYZE:
"""
${config.content}
"""

OUTPUT FORMAT (JSON array only, no additional text):
[
  {
    "question": "Clear, specific question to be evaluated as true or false",
    "answer": true,
    "contentReference": "Brief reference to content section used"${config.includeExplanation ? ',\n    "explanation": "Brief explanation of why this question is true/false"' : ''}${config.requireJustification ? ',\n    "correction": "For false questions: the correct information from the content"' : ''}
  }
]`;
}

function getTrueFalseLanguageInstruction(language: Language): string {
  const instructions = {
    [Language.BURMESE]: 'Generate all True/False questions, explanations, and corrections in Burmese (Myanmar) language using proper Burmese script and grammar.',
    [Language.ENGLISH]: 'Generate all True/False questions, explanations, and corrections in clear, proper English.',
  };

  return instructions[language] || instructions[Language.ENGLISH];
}

function getTrueFalseDifficultyInstruction(difficulty: DifficultyLevel): string {
  const instructions = {
    [DifficultyLevel.EASY]: `DIFFICULTY: EASY
- Focus on direct facts and explicit information from the content
- Create questions that are obviously true or false to careful readers
- Use straightforward, literal interpretations of the content
- Avoid complex relationships or nuanced interpretations`,

    [DifficultyLevel.MEDIUM]: `DIFFICULTY: MEDIUM  
- Test understanding of concepts and relationships in the content
- Create questions requiring careful reading and comprehension
- Include questions about cause-and-effect relationships
- Test understanding of implications and connections between ideas`,

    [DifficultyLevel.HIGH]: `DIFFICULTY: HIGH
- Require synthesis of multiple parts of the content
- Test deep comprehension and inference abilities
- Create questions about complex relationships and implications
- Challenge understanding of subtle distinctions and nuanced concepts
- Require critical analysis of the content's meaning and implications`,

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

function getTrueFalseTopicInstruction(topic?: string): string {
  return topic 
    ? `TOPIC FOCUS: Concentrate specifically on "${topic}" within the provided content.`
    : 'TOPIC FOCUS: Identify and focus on the most important concepts and factual information in the content.';
}


function getBloomLevelInstructionTrueFalse(bloomLevel: BloomLevel): string {
  const instructions = {
    [BloomLevel.REMEMBER]: `BLOOM'S LEVEL: REMEMBER (True/False)
- Focus on recall of basic facts, definitions, or simple statements
- Example: "The Earth revolves around the Sun. (T/F)", "Water freezes at 0°C. (T/F)"
- Test recognition of factual accuracy`,

    [BloomLevel.UNDERSTAND]: `BLOOM'S LEVEL: UNDERSTAND (True/False)
- Use statements that test comprehension of meaning, relationships, or summaries
- Example: "Photosynthesis is the process by which plants produce glucose. (T/F)", "The main purpose of the heart is to circulate blood. (T/F)"
- Assess whether learners grasp the idea, not just recall it`,

    [BloomLevel.APPLY]: `BLOOM'S LEVEL: APPLY (True/False)
- Present real-life scenarios or problems that require applying knowledge
- Example: "A recipe requiring baking soda can be substituted with baking powder without changing results. (T/F)", "Using Ohm’s Law, if voltage doubles and resistance stays the same, current doubles. (T/F)"
- Test the ability to apply rules or concepts correctly`,

    [BloomLevel.ANALYZE]: `BLOOM'S LEVEL: ANALYZE (True/False)
- Use statements that require identifying relationships, patterns, or structures
- Example: "In a controlled experiment, the independent variable is the one that changes. (T/F)", "Correlation always proves causation. (T/F)"
- Assess ability to distinguish between correct and incorrect connections`,

    [BloomLevel.EVALUATE]: `BLOOM'S LEVEL: EVALUATE (True/False)
- Use statements requiring judgment of validity, quality, or logic
- Example: "Peer-reviewed journals are always free from bias. (T/F)", "A stronger argument always relies on emotional appeal. (T/F)"
- Assess ability to critique or judge accuracy`,

    [BloomLevel.CREATE]: `BLOOM'S LEVEL: CREATE (True/False)
- Present statements about innovative ideas, plans, or designs for learners to validate
- Example: "A new renewable energy system must include both storage and generation components. (T/F)", "Combining plastic and organic waste in compost improves decomposition. (T/F)"
- Focus on testing reasoning about novel or creative proposals`,

    [BloomLevel.MIXED]: `BLOOM'S LEVEL: MIXED (True/False)
- Combine factual recall, comprehension, application, analysis, evaluation, and creation
- Provide a balanced set of True/False questions across Bloom’s levels
- Ensure variety between simple recognition and higher-order reasoning`
  };

  return instructions[bloomLevel];
}


function getTrueFalseBalanceInstruction(balanceAnswers?: boolean): string {
  if (balanceAnswers === false) {
    return 'ANSWER DISTRIBUTION: Create questions naturally based on content - no need to balance true/false answers.';
  }
  
  return `ANSWER DISTRIBUTION: Try to create a roughly balanced mix of TRUE and FALSE questions when possible, but prioritize content accuracy over forced balance.`;
}

function getTrueFalseQualityInstructions(config: TrueFalseConfig): string {
  let instructions = `QUALITY STANDARDS:`;

  if (config.avoidAmbiguity !== false) {
    instructions += `
- Ensure questions are unambiguous - clearly true or false
- Avoid questions that could be "sometimes true" or contextually dependent
- Make questions specific and testable against the content`;
  }

  if (config.focusOnKeyPoints !== false) {
    instructions += `
- Prioritize testing the most important information and concepts
- Focus on significant facts rather than trivial details
- Ensure questions assess meaningful understanding of the content`;
  }

  instructions += `
- Write complete, grammatically correct questions
- Ensure questions stand alone without requiring additional context
- Avoid double negatives or complex sentence structures
- Make FALSE questions believable but clearly incorrect based on content
- Ensure TRUE questions are definitively supported by the provided material
- Maintain consistent tone and style across all questions`;

  return instructions;
}