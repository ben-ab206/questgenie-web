import { Language, DifficultyLevel, BloomLevel, SCQConfig, ShortAnswerConfig, TrueFalseConfig, FillInBlankConfig, LongAnswerConfig, MatchingQuestionConfig, QuestionType, MCQConfig } from "@/types/questions";
import { buildSCQPrompt } from "./scq_prompts";
import { buildShortAnswerPrompt } from "./short_answer_prompts";
import { buildTrueFalsePrompt } from "./tf_prompts";
import { buildFillInBlankPrompt } from "./fill_in_blanks_prompts";
import { buildLongAnswerPrompt } from "./long_answer_prompts";
import { buildMatchingQuestionPrompt } from "./matching_prompts";
import { buildMCQPrompt } from "./mcq_prompts";

interface RandomQuestionConfig {
  questionTypes: QuestionType[];
  totalQuantity: number;
  content: string;
  language?: Language;
  difficulty?: DifficultyLevel;
  bloomLevel?: BloomLevel;
}

interface GeneratedQuestionPrompts {
  type: QuestionType;
  prompt: string;
  quantity: number;
}

function generateRandomQuestionPromptMix(config: RandomQuestionConfig): GeneratedQuestionPrompts[] {
  const {
    questionTypes,
    totalQuantity,
    content,
    language = Language.ENGLISH,
    difficulty = DifficultyLevel.MEDIUM,
    bloomLevel = BloomLevel.UNDERSTAND
  } = config;

  const result: GeneratedQuestionPrompts[] = [];
  
  const quantities = generateRandomDistribution(totalQuantity, questionTypes.length);
  
  for (let i = 0; i < questionTypes.length; i++) {
    const questionType = questionTypes[i];
    const quantity = quantities[i];
    
    if (quantity > 0) {
      const prompt = buildPromptForType(questionType, {
        content,
        quantity,
        language,
        difficulty,
        bloomLevel
      });
      
      result.push({
        type: questionType,
        prompt,
        quantity
      });
    }
  }
  
  return result;
}

function generateRandomDistribution(total: number, numTypes: number): number[] {
  const result: number[] = [];
  let remaining = total;
  
  for (let i = 0; i < numTypes - 1; i++) {
    const max = Math.max(1, remaining - (numTypes - i - 1));
    const min = 1;
    const randomAmount = Math.floor(Math.random() * (max - min + 1)) + min;
    
    result.push(randomAmount);
    remaining -= randomAmount;
  }
  
  result.push(remaining);
  
  return result;
}

function buildPromptForType(
  questionType: QuestionType,
  params: {
    content: string;
    quantity: number;
    language: Language;
    difficulty: DifficultyLevel;
    bloomLevel: BloomLevel;
  }
): string {
  const { content, quantity, language, difficulty, bloomLevel } = params;

//    MULTIPLE_CHOICE = 'multiple_choice',
//   TRUE_FALSE = 'true_false',
//   FILL_IN_THE_BLANK = 'fill_in_the_blank',
//   SHORT_ANSWER = 'short_answer',
//   LONG_ANSWER = 'long_answer',
//   MATCHING = 'matching',

  switch (questionType) {
    case 'single_choice':
      const scqConfig: SCQConfig = {
        language,
        difficulty,
        bloom_level: bloomLevel,
        quantity,
        content,
        optionsCount: 4
      };
      return buildSCQPrompt(scqConfig);

    case 'multiple_choice':
      const mcqConfig: MCQConfig = {
        language,
        difficulty,
        bloom_level: bloomLevel,
        quantity,
        content,
        optionsCount: 4
      };
      return buildMCQPrompt(mcqConfig);

    case 'short_answer':
      const saConfig: ShortAnswerConfig = {
        language,
        difficulty,
        quantity,
        content,
        answerLength: 'moderate'
      };
      return buildShortAnswerPrompt(saConfig);

    case 'true_false':
      const tfConfig: TrueFalseConfig = {
        language,
        difficulty,
        quantity,
        content,
        includeExplanation: true,
        avoidAmbiguity: true,
        focusOnKeyPoints: true,
        balanceAnswers: true,
        requireJustification: false
      };
      return buildTrueFalsePrompt(tfConfig);

    case 'fill_in_the_blank':
      const fibConfig: FillInBlankConfig = {
        language,
        difficulty,
        quantity,
        content,
        blankType: 'mixed',
        includeExplanation: false,
        avoidAmbiguity: true,
        focusOnKeyPoints: true,
        provideChoices: false
      };
      return buildFillInBlankPrompt(fibConfig);

    case 'long_answer':
      const laConfig: LongAnswerConfig = {
        language,
        difficulty,
        quantity,
        content,
        answerLength: 'standard'
      };
      return buildLongAnswerPrompt(laConfig);

    case 'matching':
      const matchingConfig: MatchingQuestionConfig = {
        language,
        difficulty,
        quantity,
        content
      };
      return buildMatchingQuestionPrompt(matchingConfig);

    default:
      throw new Error(`Unsupported question type: ${questionType}`);
  }
}

export { generateRandomQuestionPromptMix };