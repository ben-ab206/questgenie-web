import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';
import jsPDF from 'jspdf';
import { Options, Question, QuestionBank, QuestionType } from "@/types/questions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

export function truncateContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateProcessingTime(startTime: number): number {
  return Date.now() - startTime;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateRandomSelection(stringList: string[], maxNumber: number): string[] {
  const result: string[] = [];
  const numberOfRandom = stringList.length;
  
  for (let i = 0; i < numberOfRandom; i++) {
    const randomIndex = Math.floor(Math.random() * maxNumber);
    const selectedString = stringList[randomIndex % stringList.length];
    result.push(selectedString);
  }
  
  return result;
}


export const exportQuestionsToPDF = (questions: Question[], file_name: string) => {
  console.log(questions)
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Questions Export', margin, yPosition);
  yPosition += 20;
  
  questions.forEach((question, index) => {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. [${question.type.toUpperCase()}] - ${question.difficulty}`, margin, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    const questionLines = doc.splitTextToSize(question.question, 170);
    doc.text(questionLines, margin, yPosition);
    yPosition += questionLines.length * 6;
    
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        if (question.options) {
          const correctAnswers = question.mcq_answers || [];
          
          doc.text(`A) ${question.options.A}${correctAnswers.includes('A') ? ' ✓' : ''}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`B) ${question.options.B}${correctAnswers.includes('B') ? ' ✓' : ''}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`C) ${question.options.C}${correctAnswers.includes('C') ? ' ✓' : ''}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`D) ${question.options.D}${correctAnswers.includes('D') ? ' ✓' : ''}`, margin + 10, yPosition);
          yPosition += 6;
          if (question.options.E) {
            doc.text(`E) ${question.options.E}${correctAnswers.includes('E') ? ' ✓' : ''}`, margin + 10, yPosition);
            yPosition += 6;
          }
        }
        break;
        
      case QuestionType.MATCHING:
        if (question.matching_questions && question.matching_answers) {
          doc.text('Match the following:', margin + 10, yPosition);
          yPosition += 8;
          
          question.matching_questions.forEach((item, idx) => {
            doc.text(`${item.A} ↔ ${item.B}`, margin + 15, yPosition);
            yPosition += 6;
          });
        }
        break;
        
      case QuestionType.TRUE_FALSE:
        doc.text('□ True    □ False', margin + 10, yPosition);
        yPosition += 8;
        break;
        
      case QuestionType.FILL_IN_THE_BLANK:
      case QuestionType.SHORT_ANSWER:
      case QuestionType.LONG_ANSWER:
        doc.text('Answer: ________________________', margin + 10, yPosition);
        yPosition += 8;
        break;
    }
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    const answerLines = doc.splitTextToSize(`Answer: ${question.answer}`, 170);
    doc.text(answerLines, margin, yPosition);
    yPosition += answerLines.length * 5;
    
    if (question.explanation) {
      const explanationLines = doc.splitTextToSize(`Explanation: ${question.explanation}`, 170);
      doc.text(explanationLines, margin, yPosition);
      yPosition += explanationLines.length * 5;
    }
    
    doc.setFontSize(8);
    doc.text(`Bloom Level: ${question.bloom_level}`, margin, yPosition);
    yPosition += 15;
  });
  
  doc.save(`${file_name}-questions-export.pdf`);
};

export const exportQuestionsToCSV = (questions: Question[], filename = 'questions-export.csv') => {
  const headers = [
    'Type',
    'Difficulty',
    'Language',
    'Question',
    'Answer',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Option E',
    'MCQ Answers',
    'Explanation',
    'Bloom Level',
    'Matching Questions',
    'Matching Answers'
  ];

  const csvRows = [
    headers.join(','),
    ...questions.map(question => {
      const row = [
        question.type,
        question.difficulty,
        question.language,
        escapeCSVField(question.question),
        escapeCSVField(question.answer ?? ""),
        escapeCSVField(question.options?.A || ''),
        escapeCSVField(question.options?.B || ''),
        escapeCSVField(question.options?.C || ''),
        escapeCSVField(question.options?.D || ''),
        escapeCSVField(question.options?.E || ''),
        escapeCSVField(formatMCQAnswers(question.mcq_answers)),
        escapeCSVField(question.explanation || ''),
        question.bloom_level,
        escapeCSVField(formatMatchingQuestions(question.matching_questions)),
        escapeCSVField(formatMatchingAnswers(question.matching_answers))
      ];
      return row.join(',');
    })
  ];

  const csvContent = csvRows.join('\n');

  downloadCSV(csvContent, filename);
};

export const exportQuestionsBankToPDF = (questions: QuestionBank[], file_name: string) => {
  console.log(questions)
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Questions Export', margin, yPosition);
  yPosition += 20;
  
  questions.forEach((question, index) => {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. [${question.type.toUpperCase()}] - ${question.difficulty}`, margin, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    const questionLines = doc.splitTextToSize(question.question_text, 170);
    doc.text(questionLines, margin, yPosition);
    yPosition += questionLines.length * 6;
    
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        if (question.options) {
          const correctAnswers = question.mcq_answers || [];
          
          doc.text(`A) ${question.options.A}${correctAnswers.includes('A') ? ' ✓' : ''}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`B) ${question.options.B}${correctAnswers.includes('B') ? ' ✓' : ''}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`C) ${question.options.C}${correctAnswers.includes('C') ? ' ✓' : ''}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`D) ${question.options.D}${correctAnswers.includes('D') ? ' ✓' : ''}`, margin + 10, yPosition);
          yPosition += 6;
          if (question.options.E) {
            doc.text(`E) ${question.options.E}${correctAnswers.includes('E') ? ' ✓' : ''}`, margin + 10, yPosition);
            yPosition += 6;
          }
        }
        break;
        
      case QuestionType.MATCHING:
        if (question.matching_questions && question.matching_answers) {
          doc.text('Match the following:', margin + 10, yPosition);
          yPosition += 8;
          
          question.matching_questions.forEach((item, idx) => {
            doc.text(`${item.A} ↔ ${item.B}`, margin + 15, yPosition);
            yPosition += 6;
          });
        }
        break;
        
      case QuestionType.TRUE_FALSE:
        doc.text('□ True    □ False', margin + 10, yPosition);
        yPosition += 8;
        break;
        
      case QuestionType.FILL_IN_THE_BLANK:
      case QuestionType.SHORT_ANSWER:
      case QuestionType.LONG_ANSWER:
        doc.text('Answer: ________________________', margin + 10, yPosition);
        yPosition += 8;
        break;
    }
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    const answerLines = doc.splitTextToSize(`Answer: ${question.answer_text}`, 170);
    doc.text(answerLines, margin, yPosition);
    yPosition += answerLines.length * 5;
    
    if (question.explanation) {
      const explanationLines = doc.splitTextToSize(`Explanation: ${question.explanation}`, 170);
      doc.text(explanationLines, margin, yPosition);
      yPosition += explanationLines.length * 5;
    }
    
    doc.setFontSize(8);
    doc.text(`Bloom Level: ${question.bloom_level}`, margin, yPosition);
    yPosition += 15;
  });
  
  doc.save(`${file_name}-questions-export.pdf`);
};

export const exportQuestionsBankToCSV = (questions: QuestionBank[], filename = 'questions-export.csv') => {
  const headers = [
    'Type',
    'Difficulty',
    'Language',
    'Question',
    'Answer',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Option E',
    'MCQ Answers',
    'Explanation',
    'Bloom Level',
    'Matching Questions',
    'Matching Answers'
  ];

  const csvRows = [
    headers.join(','),
    ...questions.map(question => {
      const row = [
        question.type,
        question.difficulty,
        question.language,
        escapeCSVField(question.question_text),
        escapeCSVField(question.answer_text),
        escapeCSVField(question.options?.A || ''),
        escapeCSVField(question.options?.B || ''),
        escapeCSVField(question.options?.C || ''),
        escapeCSVField(question.options?.D || ''),
        escapeCSVField(question.options?.E || ''),
        escapeCSVField(formatMCQAnswers(question.mcq_answers)),
        escapeCSVField(question.explanation || ''),
        question.bloom_level,
        escapeCSVField(formatMatchingQuestions(question.matching_questions)),
        escapeCSVField(formatMatchingAnswers(question.matching_answers))
      ];
      return row.join(',');
    })
  ];

  const csvContent = csvRows.join('\n');

  downloadCSV(csvContent, filename);
};

const escapeCSVField = (field: string): string => {
  if (!field) return '';
  
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

const formatMatchingQuestions = (matchingQuestions?: { [key: string]: string;  }[]): string => {
  if (!matchingQuestions) return '';
  return matchingQuestions.map(item => `${item.A} -> ${item.B}`).join('; ');
};

const formatMatchingAnswers = (matchingAnswers?: { [key: string]: string;  }[]): string => {
  if (!matchingAnswers) return '';
  return matchingAnswers.map(item => `${item.A} -> ${item.B}`).join('; ');
};

const formatMCQAnswers = (mcqAnswers?: (keyof Options)[]): string => {
  if (!mcqAnswers || mcqAnswers.length === 0) return '';
  return mcqAnswers.join(', ');
};

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const QuestionTypeLabels: Record<QuestionType, string> = {
  [QuestionType.SINGLE_CHOICE]: "Single Choice",
  [QuestionType.TRUE_FALSE]: "True / False",
  [QuestionType.FILL_IN_THE_BLANK]: "Fill in the Blank",
  [QuestionType.SHORT_ANSWER]: "Short Answer",
  [QuestionType.LONG_ANSWER]: "Long Answer",
  [QuestionType.MATCHING]: "Matching",
  [QuestionType.MULTIPLE_CHOICE]: "Multiple Choice",
  // [QuestionType.ORDERING]: "Ordering",
};

export function getQuestionTypeLabel(type: QuestionType): string {
  return QuestionTypeLabels[type] ?? type;
}