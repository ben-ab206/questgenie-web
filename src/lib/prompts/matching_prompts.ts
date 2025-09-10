/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuestionConfig, Language, DifficultyLevel, MatchingQuestionConfig, MatchingQuestionResponse } from "@/types/questions";

export function buildMatchingQuestionPrompt(config: MatchingQuestionConfig): string {
  const languageInstruction = getLanguageInstruction(config.language);
  const difficultyInstruction = getDifficultyInstruction(config.difficulty);
  const typeInstruction = getTypeInstruction(config.matchingType);

  return `${languageInstruction}

Generate ${config.quantity} matching question(s) based on the content below.

${difficultyInstruction}
${typeInstruction}

Requirements:
- Create 4-6 matching pairs per question
- Base answers strictly on provided content
- Ensure clear, logical relationships
- No ambiguous matches

Content:
"""
${config.content}
"""

Output JSON array only:
[
  {
    "question": "Match items in Column A with Column B",
    "matching_questions": [
      {"1": "Column A item 1", "A": "Column B item (shuffled)"},
      {"2": "Column A item 2", "B": "Column B item (shuffled)"},
      {"3": "Column A item 3", "C": "Column B item (shuffled)"}
    ],
    "matching_answers": [
      {"1": "Column A item 1", "C": "Correct Column B item"},
      {"2": "Column A item 2", "A": "Correct Column B item"},  
      {"3": "Column A item 3", "B": "Correct Column B item"}
    ]${config.difficulty === DifficultyLevel.HIGH ? ',\n    "explanation": "Brief explanation"' : ''}
  }
]

IMPORTANT: 
- matching_questions: Show Column A items with Column B items in RANDOM order (shuffled)
- matching_answers: Show the CORRECT pairings between Column A and Column B
- Column B items in matching_questions should be shuffled/randomized
- Column B keys in matching_answers should match the correct Column B items from matching_questions`;
}

function getLanguageInstruction(language: Language): string {
  return language === Language.BURMESE 
    ? 'Generate in Burmese language using proper Myanmar script.'
    : 'Generate in clear English.';
}

function getDifficultyInstruction(difficulty: DifficultyLevel): string {
  const instructions = {
    [DifficultyLevel.EASY]: 'EASY: Direct definitions and basic facts',
    [DifficultyLevel.MEDIUM]: 'MEDIUM: Conceptual relationships and applications', 
    [DifficultyLevel.HIGH]: 'HIGH: Complex analysis requiring deep understanding',
    [DifficultyLevel.MIXED]: 'MIXED: Combine easy (40%), medium (40%), hard (20%)'
  };
  return instructions[difficulty];
}

function getTypeInstruction(matchingType?: MatchingQuestionConfig['matchingType']): string {
  const instructions = {
    'definition': 'Match terms with definitions',
    'concept': 'Match concepts with examples/applications',
    'cause-effect': 'Match causes with effects/outcomes',
    'process': 'Match process steps with descriptions',
    'classification': 'Match categories with examples',
    'general': 'Create varied meaningful relationships'
  };
  return instructions[matchingType || 'general'];
}

// Simplified builders
export function buildSimpleMatchingPrompt(
  content: string,
  quantity: number = 2,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  return buildMatchingQuestionPrompt({ language, difficulty, quantity, content });
}

export function buildDefinitionMatchingPrompt(
  content: string,
  quantity: number = 2,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  return buildMatchingQuestionPrompt({ 
    language, difficulty, quantity, content, matchingType: 'definition' 
  });
}

export function buildCauseEffectMatchingPrompt(
  content: string,
  quantity: number = 2,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  return buildMatchingQuestionPrompt({ 
    language, difficulty, quantity, content, matchingType: 'cause-effect' 
  });
}

export function buildConceptMatchingPrompt(
  content: string,
  quantity: number = 2,
  language: Language = Language.ENGLISH,
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
): string {
  return buildMatchingQuestionPrompt({ 
    language, difficulty, quantity, content, matchingType: 'concept' 
  });
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
    response.matching_questions.every((item: any) => typeof item === 'object') &&
    response.matching_answers.every((item: any) => typeof item === 'object')
  );
}

export function validateMatchingResponses(responses: any[]): MatchingQuestionResponse[] {
  if (!Array.isArray(responses)) {
    throw new Error('Response must be an array of matching questions');
  }

  const validResponses = responses.filter(validateMatchingResponse);
  
  if (validResponses.length !== responses.length) {
    throw new Error('Some matching responses are invalid');
  }

  return validResponses;
}

export function validateMatchingCorrespondence(response: MatchingQuestionResponse): boolean {
  const questionPairs = response.matching_questions;
  const answerPairs = response.matching_answers;

  if (questionPairs.length !== answerPairs.length) {
    return false;
  }

  return answerPairs.every(answer =>
    questionPairs.some(question => {
      const qEntries = Object.entries(question);
      const aEntries = Object.entries(answer);
      return qEntries.length === 2 && aEntries.length === 2 &&
             qEntries[0][0] === aEntries[0][0] && qEntries[0][1] === aEntries[0][1] &&
             qEntries[1][0] === aEntries[1][0] && qEntries[1][1] === aEntries[1][1];
    })
  );
}