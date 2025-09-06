import { DifficultyLevel, Question } from "@/types/questions";

interface MCQQuestionBoxProps {
  question: Question;
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

  const getCorrectOptionKey = () => {
    if (!question.options) return null;
    
    const optionEntries = Object.entries(question.options);
    const correctEntry = optionEntries.find(([key, value]) => 
      value.toLowerCase().trim() === question.answer.toLowerCase().trim()
    );
    
    return correctEntry ? correctEntry[0] : null;
  };

  const correctOptionKey = getCorrectOptionKey();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
          {index + 1}
        </div>
        <span className="text-blue-600 font-medium">{question.type}</span>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty}
        </span>
        <span className="text-blue-500 font-medium">{question.language}</span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {question.question}
      </h3>

      {/* Options */}
      {question.options && (
        <div className="space-y-3">
          {Object.entries(question.options).map(([key, value]) => {
            if (!value) return null; // Skip empty options (like optional E)
            
            const isCorrect = key === correctOptionKey;
            
            return (
              <div
                key={key}
                className={`border rounded-lg p-4 transition-colors ${
                  isCorrect 
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