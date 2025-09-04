import { QuestionConfig, QuestionType, DifficultyLevel, Language } from '@/types/questions';

export function buildPrompt(config: QuestionConfig): string {
  const languageInstruction = getLanguageInstruction(config.language);
  const typeInstruction = getTypeInstruction(config.type);
  const difficultyInstruction = getDifficultyInstruction(config.difficulty);
  const topicInstruction = getTopicInstruction(config.topic);

  return `${languageInstruction}
${topicInstruction}
${typeInstruction}
${difficultyInstruction}

CRITICAL REQUIREMENTS:
1. Generate questions ONLY based on the content provided below
2. Do not use external knowledge or information not in the content
3. All questions must be answerable using only the provided content
4. Generate exactly ${config.quantity} question(s)
5. Ensure JSON format is valid and parseable

CONTENT TO ANALYZE:
"""
${config.content}
"""

Response format (JSON array only, no additional text):
[
  {
    "question": "Question text here",
    "answer": "Answer based only on provided content",
    ${config.type === QuestionType.MULTIPLE_CHOICE ? `
    "options": ["option1", "option2", "option3", "option4"],
    "correctOptionIndex": 0,` : ''}
    "contentReference": "Brief reference to content section"
  }
]`;
}

function getLanguageInstruction(language: Language): string {
  switch (language) {
    case Language.BURMESE:
      return 'Generate all questions and answers in Burmese (Myanmar) language using Burmese script.';
    case Language.ENGLISH:
      return 'Generate all questions and answers in English language.';
    default:
      return 'Generate questions and answers in English language.';
  }
}

function getTypeInstruction(type: QuestionType): string {
  const instructions = {
    [QuestionType.MULTIPLE_CHOICE]: 'Create multiple choice questions with exactly 4 options. Mark the correct answer index (0-3).',
    [QuestionType.TRUE_FALSE]: 'Create true/false questions based on factual statements from the content.',
    [QuestionType.FILL_IN_THE_BLANK]: 'Create fill-in-the-blank questions using key information. Use _____ for blanks.',
    [QuestionType.SHORT_ANSWER]: 'Create questions requiring 1-2 sentence answers based on the content.',
    [QuestionType.LONG_ANSWER]: 'Create questions requiring 3-5 sentence answers based on the content.',
    [QuestionType.MATCHING]: 'Create matching questions with terms and definitions from the content.',
    // [QuestionType.ORDERING]: 'Create sequencing questions based on processes or events in the content.'
  };

  return instructions[type] || instructions[QuestionType.SHORT_ANSWER];
}

function getDifficultyInstruction(difficulty: DifficultyLevel): string {
  const instructions = {
    [DifficultyLevel.EASY]: 'Focus on basic recall and simple facts from the content.',
    [DifficultyLevel.MEDIUM]: 'Test comprehension and application of concepts.',
    [DifficultyLevel.HIGH]: 'Demand critical thinking and complex reasoning about the content.',
  };

  return `Difficulty level: ${difficulty}. ${instructions[difficulty]}`;
}

function getTopicInstruction(topic?: string): string {
  return topic 
    ? `Focus on the topic: "${topic}".`
    : 'Identify and focus on the main topics present in the content.';
}