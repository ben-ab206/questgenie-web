import { DifficultyLevel, Language, Question, QuestionType, APIResponse } from "@/types/questions";

type GenerateQuestionsParams = {
  content: string;
  quantity?: number;
  difficulty?: DifficultyLevel;
  language?: Language;
  type?: QuestionType;
  topic?: string;
  source?: string;
};

type GenerateQuestionsResponse = APIResponse<{
  questions: Question[];
  count: number;
  saved: boolean;
}>;

const generateQuestions = async (
  params: GenerateQuestionsParams
): Promise<GenerateQuestionsResponse> => {
  try {
    const response = await fetch(`/api/questions/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      return {
        success: false,
        error: errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
      } as GenerateQuestionsResponse;
    }

    const data = (await response.json()) as GenerateQuestionsResponse;
    return data;
  } catch (err) {
    console.error("generateQuestions error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    } as GenerateQuestionsResponse;
  }
};

export { generateQuestions };
