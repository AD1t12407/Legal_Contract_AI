import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

// API client
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LearningCard {
  id: string;
  session_id: string;
  content: string;
  created_at: string;
  role: string;
  resources: LearningResource[];
  quiz: QuizQuestion[];
  processed: boolean;
}

export interface LearningResource {
  title: string;
  url: string;
  type: string;
  snippet?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface CreateLearningRequest {
  session_id: string;
  content: string;
  role?: string;
}

// Learning Cards API Functions
export const createLearningCard = async (data: CreateLearningRequest): Promise<LearningCard> => {
  try {
    const response = await apiClient.post('/learning', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create learning card:', error);
    throw error;
  }
};

export const getLearningCards = async (sessionId?: string, limit: number = 50): Promise<LearningCard[]> => {
  try {
    const params: any = { limit };
    if (sessionId) {
      params.session_id = sessionId;
    }

    const response = await apiClient.get('/learning', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to get learning cards:', error);
    throw error;
  }
};

export const getLearningCard = async (learningId: string): Promise<LearningCard> => {
  try {
    const response = await apiClient.get(`/learning/${learningId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get learning card:', error);
    throw error;
  }
};

export const deleteLearningCard = async (learningId: string): Promise<void> => {
  try {
    await apiClient.delete(`/learning/${learningId}`);
  } catch (error) {
    console.error('Failed to delete learning card:', error);
    throw error;
  }
};

export const regenerateLearningContent = async (learningId: string): Promise<void> => {
  try {
    await apiClient.post(`/learning/${learningId}/regenerate`);
  } catch (error) {
    console.error('Failed to regenerate learning content:', error);
    throw error;
  }
};
