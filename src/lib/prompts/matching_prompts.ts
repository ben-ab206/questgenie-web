/* eslint-disable @typescript-eslint/no-explicit-any */
import { Language, DifficultyLevel, MatchingQuestionConfig, BloomLevel } from "@/types/questions";

export function buildMatchingQuestionPrompt(config: MatchingQuestionConfig): string {
  const languageInstruction = getLanguageInstruction(config.language);
  const difficultyInstruction = getDifficultyInstruction(config.difficulty);
  const typeInstruction = getTypeInstruction(config.matchingType);
  const bloomInstruction = getBloomLevelInstructionMatching(config.bloom_level);

  return `${languageInstruction}

Generate ${config.quantity} matching question(s) based on the content below.

${difficultyInstruction}
${typeInstruction}
${bloomInstruction}

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

function getBloomLevelInstructionMatching(bloomLevel: BloomLevel): string {
  const instructions = {
    [BloomLevel.REMEMBER]: `BLOOM'S LEVEL: REMEMBER (Matching)
- Match basic terms with their definitions, facts, or symbols
- Example: "Match the country to its capital", "Match the scientist to their discovery"
- Focus on straightforward recall and recognition`,

    [BloomLevel.UNDERSTAND]: `BLOOM'S LEVEL: UNDERSTAND (Matching)
- Match concepts with their explanations, summaries, or examples
- Example: "Match each process with its description", "Match the vocabulary word to a sentence that demonstrates its meaning"
- Assess comprehension of relationships and meanings`,

    [BloomLevel.APPLY]: `BLOOM'S LEVEL: APPLY (Matching)
- Match problems to solutions, scenarios to methods, or situations to principles
- Example: "Match each math problem to the correct formula", "Match real-world situations with the scientific law that applies"
- Focus on practical application of learned knowledge`,

    [BloomLevel.ANALYZE]: `BLOOM'S LEVEL: ANALYZE (Matching)
- Match causes to effects, components to structures, or evidence to arguments
- Example: "Match each symptom to its possible cause", "Match the part of an essay to its function"
- Assess ability to identify parts, relationships, and patterns`,

    [BloomLevel.EVALUATE]: `BLOOM'S LEVEL: EVALUATE (Matching)
- Match arguments with supporting evidence, criteria with judgments, or claims with validity levels
- Example: "Match each conclusion with the strength of its supporting evidence", "Match decision-making criteria with appropriate outcomes"
- Assess ability to judge quality and validity`,

    [BloomLevel.CREATE]: `BLOOM'S LEVEL: CREATE (Matching)
- Match components that can be combined to design a new whole
- Example: "Match research methods to questions to design a valid study", "Match materials with purposes to create a functional invention"
- Focus on synthesis and generating new ideas`,

    [BloomLevel.MIXED]: `BLOOM'S LEVEL: MIXED (Matching)
- Combine recall, comprehension, application, analysis, evaluation, and creation
- Include a variety of matches that span multiple Bloom’s levels
- Ensure balance between simple recognition and higher-order thinking`
  };

  return instructions[bloomLevel];
}
