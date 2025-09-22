import { getQuestionTypeLabel } from "@/lib/utils";
import { DifficultyLevel, QuestionBank, QuestionType } from "@/types/questions";

interface TFQuestionBoxFormProps {
  question: QuestionBank,
  index: number
  onAnswerChange: (questionIndex: number, selectedAnswer: string) => void;
  selectedAnswer: string;
}

const TFQuestionBoxForm: React.FC<TFQuestionBoxFormProps> = ({ question, index, onAnswerChange, selectedAnswer }) => {
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isCorrectAnswer = (option: string) => {
    return option.toLowerCase().trim() === question.answer_text.toLowerCase().trim();
  };

  const handleOptionChange = (optionKey: string) => {
    onAnswerChange(question.id, optionKey);
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

      {/* True/False Options */}
      <div className="flex gap-4">
        {['True', 'False'].map((option) => {
          const isCorrect = isCorrectAnswer(option);
          const isSelected = selectedAnswer === option;

          return (
            <div
              key={option}
              className={`flex-1 border rounded-lg p-4 transition-colors border-gray-200 bg-gray-50`}
            >
              <div className="flex items-center justify-between">

                 <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`tf_question_${index}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleOptionChange(option)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-gray-700 font-medium">{option}</span>
                </label>
   
              </div>
            </div>
          );
        })}
      </div>

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

export default TFQuestionBoxForm;