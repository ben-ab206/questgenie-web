import { QuestionType, DifficultyLevel, Language, Question, APIResponse } from '@/types/questions';

export class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async generateQuestions(params: {
    content: string;
    quantity?: number;
    difficulty?: DifficultyLevel;
    language?: Language;
    type?: QuestionType;
    topic?: string;
  }): Promise<APIResponse<{ questions: Question[]; count: number; saved: boolean }>> {
    const response = await fetch(`${this.baseUrl}/questions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getQuestionHistory(params: {
    page?: number;
    limit?: number;
    type?: QuestionType;
    difficulty?: DifficultyLevel;
    language?: Language;
  } = {}): Promise<APIResponse<{
    questions: Question[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/questions/history?${searchParams}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getQuestionById(id: string): Promise<APIResponse<Question>> {
    const response = await fetch(`${this.baseUrl}/questions/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteQuestion(id: string): Promise<APIResponse<{ deleted: boolean }>> {
    const response = await fetch(`${this.baseUrl}/questions/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getStats(): Promise<APIResponse<{
    total: number;
    recentActivity: number;
    distribution: {
      types: Record<string, number>;
      difficulties: Record<string, number>;
      languages: Record<string, number>;
    };
  }>> {
    const response = await fetch(`${this.baseUrl}/questions/stats`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async exportQuestions(params: {
    format?: 'json' | 'csv';
    type?: QuestionType;
    difficulty?: DifficultyLevel;
    language?: Language;
  } = {}): Promise<Response> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });

    const response = await fetch(`${this.baseUrl}/questions/export?${searchParams}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }
}

export const apiClient = new APIClient();