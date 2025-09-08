import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

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