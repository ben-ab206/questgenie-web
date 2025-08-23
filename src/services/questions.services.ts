
import { apiClient } from "@/app/api/client";
import { DifficultyLevel, Language, QuestionType } from "@/types/questions";

const generateQuestions = async ({
    content, quantity, difficulty, language, type, topic
}: {
    content: string;
    quantity?: number;
    difficulty?: DifficultyLevel;
    language?: Language;
    type?: QuestionType;
    topic?: string;
}) => {
    try {
        const response = await apiClient.generateQuestions({
            content,
            difficulty,
            language,
            quantity,
            topic,
            type
        })

        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to generate questions');
        }

        const newQuestions = response.data.questions;

        return newQuestions;
    } catch (error) {
        console.error(error)
        return error
    }
}

export { generateQuestions }