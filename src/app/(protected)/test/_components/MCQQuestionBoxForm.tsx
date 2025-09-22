import { getQuestionTypeLabel } from "@/lib/utils";
import { DifficultyLevel, QuestionBank, QuestionType } from "@/types/questions";

interface MCQQuestionBoxFormProps {
  question: QuestionBank;
  index: number;
  onAnswerChange: (questionId: number, selectedOption: string[]) => void;
  selectedAnswer: string[];
}

const MCQQuestionBoxForm: React.FC<MCQQuestionBoxFormProps> = ({ question, index, onAnswerChange, selectedAnswer }) => {
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

  const handleOptionChange = (optionKey: string) => {
    let updatedSelection: string[];

    if(selectedAnswer.includes(optionKey)) {
        updatedSelection = selectedAnswer.filter(key => key !== optionKey)
    } else {
        updatedSelection = [...selectedAnswer, optionKey]
    }

    onAnswerChange(question.id, updatedSelection)
  }
 

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
            const isSelected = selectedAnswer.includes(key);


            return (
              <div
                key={key}
                className={`border rounded-lg p-4 transition-colors border-gray-200 bg-gray-50`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name={`question_${question.id}`}
                      value={key}
                      checked={isSelected}
                      onChange={() => handleOptionChange(key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2">
                      <strong className="mr-1">{key})</strong> {value}
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

     
    </div>
  );
};

export default MCQQuestionBoxForm;