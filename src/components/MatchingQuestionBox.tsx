import React from "react";
import { DifficultyLevel, QuestionBank } from "@/types/questions";

interface MatchingQuestionProps {
  question: QuestionBank;
  idx: number;
}

const MatchingQuestionBox: React.FC<MatchingQuestionProps> = ({ question, idx }) => {
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!question.matching_questions || !question.matching_answers) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-gray-500">No matching data available</p>
      </div>
    );
  }

  // Extract numeric (Column A) and letter (Column B) separately
  const columnA = question.matching_questions.map((item) => {
    const numberKey = Object.keys(item).find((k) => !isNaN(Number(k)))!;
    return { key: numberKey, text: item[numberKey] };
  });

  const columnB = question.matching_questions.map((item) => {
    const letterKey = Object.keys(item).find((k) => isNaN(Number(k)))!;
    return { key: letterKey, text: item[letterKey] };
  });

  // Correct matches from matching_answers
  const correctMatches = question.matching_answers.map((item) => {
    const numberKey = Object.keys(item).find((k) => !isNaN(Number(k)))!;
    const letterKey = Object.keys(item).find((k) => isNaN(Number(k)))!;
    return { number: numberKey, letter: letterKey };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
          {idx + 1}
        </div>
        <span className="text-purple-600 font-medium">{question.type}</span>
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
            question.difficulty as DifficultyLevel
          )}`}
        >
          {question.difficulty}
        </span>
        <span className="text-blue-500 font-medium">{question.language}</span>
      </div>

      {/* Question Text */}
      {question.question_text && (
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {question.question_text}
        </h3>
      )}

      {/* Matching Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column A */}
        <div className="space-y-4">
          {columnA.map((item, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <span className="text-gray-700">
                <strong>{item.key})</strong> {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Column B */}
        <div className="space-y-4">
          {columnB.map((item, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <span className="text-gray-700">
                <strong>{item.key})</strong> {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Correct Matches */}
      <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {correctMatches.map((match, idx) => (
            <div key={idx} className="text-center p-2 rounded bg-white">
              <span className="font-semibold text-gray-800">
                {match.number}) {match.letter}
              </span>
            </div>
          ))}
        </div>
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

export default MatchingQuestionBox;
