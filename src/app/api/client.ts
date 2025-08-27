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
    source?: string;
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
      console.error(errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async generateQuestionsFromFile(params: {
    file: File;
    quantity?: number;
    difficulty?: DifficultyLevel;
    language?: Language;
    type?: QuestionType;
    topic?: string;
    source?: string
  }): Promise<APIResponse<{
    questions: Question[];
    count: number;
    saved: boolean;
    subject_id?: string;
    contentLength?: number;
    processingMethod?: string;
  }>> {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const allowedExtensions = ['.txt', '.pdf', '.docx'];
    const fileName = params.file.name.toLowerCase();
    const maxSize = 10 * 1024 * 1024; // 10MB

    const isValidType = allowedTypes.includes(params.file.type) ||
      allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      throw new Error('Invalid file type. Only TXT, PDF, and DOCX files are supported.');
    }

    if (params.file.size > maxSize) {
      throw new Error('File size too large. Maximum allowed size is 10MB.');
    }

    if (params.file.size === 0) {
      throw new Error('File is empty.');
    }

    const formData = new FormData();
    formData.append('file', params.file);

    if (params.quantity !== undefined) {
      formData.append('quantity', params.quantity.toString());
    }
    if (params.difficulty) {
      formData.append('difficulty', params.difficulty);
    }
    if (params.language) {
      formData.append('language', params.language);
    }
    if (params.type) {
      formData.append('type', params.type);
    }
    if (params.topic) {
      formData.append('topic', params.topic);
    }

    if (params.source) {
      formData.append('source', params.source);
    }

    try {
      const response = await fetch(`${this.baseUrl}/questions/generate-qa-from-file`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);

        if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid request data');
        } else if (response.status === 401) {
          throw new Error('Authentication required');
        } else if (response.status === 413) {
          throw new Error('File too large');
        } else if (response.status === 415) {
          throw new Error('Unsupported file type');
        } else {
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate questions from file');
    }
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
      console.error(errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getQuestionById(id: string): Promise<APIResponse<Question>> {
    const response = await fetch(`${this.baseUrl}/questions/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(errorData);
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
      console.error(errorData);
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
      console.error(errorData);
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
      console.error(errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }
}

export const apiClient = new APIClient();