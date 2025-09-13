import { getQuestionTypeLabel } from "@/lib/utils";
import { DifficultyLevel, QuestionBank, QuestionType } from "@/types/questions";

interface MCQQuestionBoxProps {
  question: QuestionBank;
  index: number;
}

const MCQQuestionBox: React.FC<MCQQuestionBoxProps> = ({ question, index }) => {
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCorrectOptionKeys = () => {
    if (!question.options || !question.mcq_answers) return [];

    return question.mcq_answers.filter(key => question.options![key]);
  };

  const correctOptionKeys = getCorrectOptionKeys();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
          {index + 1}
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
        {question.question_text}
      </h3>

      {/* Multiple Correct Answers Indicator */}
      {correctOptionKeys.length > 1 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm font-medium">
            ⚠️ Multiple Choice Question: Select {correctOptionKeys.length} correct answers
          </p>
        </div>
      )}

      {/* Options */}
      {question.options && (
        <div className="space-y-3">
          {Object.entries(question.options).map(([key, value]) => {
            if (!value) return null; // Skip empty options (like optional E)

            const isCorrect = correctOptionKeys.includes(key as keyof typeof question.options);

            return (
              <div
                key={key}
                className={`border rounded-lg p-4 transition-colors ${isCorrect
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    <strong>{key})</strong> {value}
                  </span>
                  {isCorrect && (
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Correct
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Correct Answers Summary */}
      {correctOptionKeys.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-1">
            Correct Answer{correctOptionKeys.length > 1 ? 's' : ''}:
          </h4>
          <p className="text-green-800 text-sm">
            {correctOptionKeys.join(', ')}
          </p>
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
          <p className="text-blue-800">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default MCQQuestionBox;