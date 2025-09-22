import React from 'react';

interface QuestionTextWithBlankProps {
  questionText: string;
  selectedAnswer: string;
  onAnswerChange: (value: string) => void;
}

const QuestionTextWithBlank: React.FC<QuestionTextWithBlankProps> = ({
  questionText,
  selectedAnswer,
  onAnswerChange
}) => {
  const underscorePattern = /_{2,}/;

    const parts = questionText.split(underscorePattern);

    return (
      <div className="flex flex-wrap items-baseline gap-1 text-lg font-semibold text-gray-900">
        {parts[0] && <span>{parts[0]}</span>}
        <input
          type="text"
          value={selectedAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="inline-block min-w-24 max-w-40 px-1 py-0 border-0 border-b-2 border-gray-400 bg-transparent text-center text-lg font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-blue-50 rounded-none"
          placeholder=""
          style={{ lineHeight: 'inherit' }}
        />
        {parts[1] && <span>{parts[1]}</span>}
      </div>
    );

 
};

export default QuestionTextWithBlank;