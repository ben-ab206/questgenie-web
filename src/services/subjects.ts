import { Subjects } from "@/types/subjects";

interface FetchSubjectsParams {
    search?: string;
    type?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'created_at' | 'title' | 'type';
    sortOrder?: 'asc' | 'desc';
}

interface SubjectsResponse {
    success: boolean;
    data: Subjects[];
    metadata: {
        timestamp: string;
        processingTime: string;
        count: number;
        totalCount?: number;
        filters: {
            search?: string;
            type?: string;
            sortBy: string;
            sortOrder: string;
        };
        pagination?: {
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    };
}

const fetchSubjects = async (params?: FetchSubjectsParams): Promise<SubjectsResponse> => {
    try {
        const searchParams = new URLSearchParams();
        
        if (params?.search) {
            searchParams.append('search', params.search);
        }
        
        if (params?.type && params.type !== 'all') {
            searchParams.append('type', params.type);
        }
        
        if (params?.limit) {
            searchParams.append('limit', params.limit.toString());
        }
        
        if (params?.offset) {
            searchParams.append('offset', params.offset.toString());
        }
        
        if (params?.sortBy) {
            searchParams.append('sortBy', params.sortBy);
        }
        
        if (params?.sortOrder) {
            searchParams.append('sortOrder', params.sortOrder);
        }

        const url = `/api/subjects${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.error || 'Failed to fetch subjects');
        }
    } catch (err) {
        throw err;
    }
};

const fetchSubjectTypes = async (): Promise<string[]> => {
    try {
        const response = await fetchSubjects();
        const types = [...new Set(response.data.map(subject => subject.type))];
        return types.filter(type => type && type.trim() !== '');
    } catch (error) {
        console.error('Failed to fetch subject types:', error);
        return [];
    }
};


const fetchSubjectDetail = async (id: number): Promise<Subjects> => {
    try {
        const url = `/api/subjects/${id}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok) {
            return data.data as Subjects;
        } else {
            throw new Error(data.error || 'Failed to fetch subjects detail');
        }
    } catch (err) {
        throw err;
    }
};

export { fetchSubjects, fetchSubjectTypes, fetchSubjectDetail };
export type { FetchSubjectsParams, SubjectsResponse };