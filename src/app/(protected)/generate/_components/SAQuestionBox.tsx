import { getQuestionTypeLabel } from "@/lib/utils";
import { DifficultyLevel, Question, QuestionType } from "@/types/questions";

interface SAQuestionBoxProps {
    question: Question,
    idx: number
}

const SAQuestionBox = ({ question, idx }: SAQuestionBoxProps) => {
    const getDifficultyColor = (difficulty: DifficultyLevel) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                {idx + 1}
            </div>
            <span className="px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full w-fit">{getQuestionTypeLabel(question.type as QuestionType)}</span>
            <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    question.difficulty as DifficultyLevel
                )}`}
            >
                {question.difficulty}
            </span>
            {question.bloom_level ? <span className="px-3 py-1 rounded-full text-sm text-primary border border-primary font-medium">{question.bloom_level}</span> : null}
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {question.question}
        </h3>
    </div>
}

export default SAQuestionBox;