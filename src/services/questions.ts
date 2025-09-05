import { 
    DifficultyLevel, 
    Language, 
    Question, 
    QuestionType, 
    APIResponse, 
    QuestionBank
} from "@/types/questions";

type GenerateQuestionsParams = {
    title: string;
    description?: string;
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

type QuestionBanksResponse = APIResponse<QuestionBank[]>;

interface ApiErrorResponse {
    success: false;
    error: string;
    metadata?: {
        timestamp: string;
        processingTime: number;
    };
}

const handleApiError = async (response: Response): Promise<string> => {
    const errorData = await response.json().catch(() => null) as ApiErrorResponse | null;
    return errorData?.error || `HTTP ${response.status}: ${response.statusText}`;
};

const createApiRequest = (
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any
): RequestInit => ({
    method,
    headers: {
        "Content-Type": "application/json",
    },
    ...(body && { body: JSON.stringify(body) }),
});
const generateQuestions = async (
    params: GenerateQuestionsParams
): Promise<GenerateQuestionsResponse> => {
    try {
        if (!params.content?.trim()) {
            return {
                success: false,
                error: "Content is required to generate questions",
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: 0
                }
            } as GenerateQuestionsResponse;
        }

        const response = await fetch(
            `/api/questions/generate`, 
            createApiRequest('/api/questions/generate', 'POST', params)
        );

        if (!response.ok) {
            const errorMessage = await handleApiError(response);
            console.error("Generate questions API error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorMessage,
                params
            });

            return {
                success: false,
                error: errorMessage,
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: 0
                }
            } as GenerateQuestionsResponse;
        }

        const data = await response.json() as GenerateQuestionsResponse;
        return data;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Generate questions error:", error);

        return {
            success: false,
            error: errorMessage,
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime: 0
            }
        } as GenerateQuestionsResponse;
    }
};

const fetchQuestionBanksBySubject = async (subjectId: string): Promise<APIResponse<QuestionBank[]>> => {
    try {
        const response = await fetch(`/api/questions/question-banks/${subjectId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return {
                success: false,
                error: errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: 0
                }
            };
        }

        return await response.json();
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime: 0
            }
        };
    }
};

const fetchQuestionBankById = async (id: string): Promise<APIResponse<QuestionBank>> => {
    try {
        if (!id?.trim()) {
            return {
                success: false,
                error: "Question bank ID is required",
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: 0
                }
            };
        }

        const response = await fetch(
            `/api/questions/question-banks/${id}`,
            createApiRequest(`/api/questions/question-banks/${id}`, 'GET')
        );

        if (!response.ok) {
            const errorMessage = await handleApiError(response);
            console.error("Fetch question bank by ID API error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorMessage,
                id
            });

            return {
                success: false,
                error: errorMessage,
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: 0
                }
            };
        }

        const data = await response.json() as APIResponse<QuestionBank>;
        return data;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Fetch question bank by ID error:", error);

        return {
            success: false,
            error: errorMessage,
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime: 0
            }
        };
    }
};

const deleteQuestionBank = async (id: string): Promise<APIResponse<{ deleted: boolean }>> => {
    try {
        if (!id?.trim()) {
            return {
                success: false,
                error: "Question bank ID is required",
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: 0
                }
            };
        }

        const response = await fetch(
            `/api/questions/question-banks/${id}`,
            createApiRequest(`/api/questions/question-banks/${id}`, 'DELETE')
        );

        if (!response.ok) {
            const errorMessage = await handleApiError(response);
            console.error("Delete question bank API error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorMessage,
                id
            });

            return {
                success: false,
                error: errorMessage,
                metadata: {
                    timestamp: new Date().toISOString(),
                    processingTime: 0
                }
            };
        }

        const data = await response.json() as APIResponse<{ deleted: boolean }>;
        return data;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Delete question bank error:", error);

        return {
            success: false,
            error: errorMessage,
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime: 0
            }
        };
    }
};

export { 
    generateQuestions, 
    fetchQuestionBanksBySubject,
    fetchQuestionBankById,
    deleteQuestionBank,
    type GenerateQuestionsParams,
    type GenerateQuestionsResponse,
    type QuestionBanksResponse,
    type QuestionBank
};