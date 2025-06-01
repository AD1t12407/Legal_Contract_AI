import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API client
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface TutorResponse {
  response: string;
  subject: string;
  language: string;
  student_level: string;
  resources: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  follow_up_questions: string[];
  confidence: number;
}

export interface ConceptExplanation {
  concept: string;
  explanation: string;
  subject: string;
  difficulty: string;
  language: string;
  related_concepts: string[];
  examples: Array<{
    title: string;
    description: string;
    code?: string;
  }>;
}

export interface PracticeQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  hints: string[];
  difficulty: string;
  topic: string;
}

// AI Tutor API Functions
export const askAITutor = async (
  question: string,
  subject: string = 'general',
  language: string = 'en',
  studentLevel: string = 'intermediate',
  userId: string = 'default'
): Promise<TutorResponse> => {
  try {
    const response = await apiClient.post('/ai-tutor/ask', null, {
      params: {
        question,
        subject,
        language,
        student_level: studentLevel,
        user_id: userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to ask AI tutor:', error);
    throw error;
  }
};

export const explainConcept = async (
  concept: string,
  subject: string = 'general',
  language: string = 'en',
  difficulty: string = 'beginner'
): Promise<ConceptExplanation> => {
  try {
    const response = await apiClient.post('/ai-tutor/explain', null, {
      params: {
        concept,
        subject,
        language,
        difficulty
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to explain concept:', error);
    throw error;
  }
};

export const generatePracticeQuestions = async (
  topic: string,
  subject: string = 'general',
  difficulty: string = 'intermediate',
  count: number = 5
): Promise<{ questions: PracticeQuestion[] }> => {
  try {
    const response = await apiClient.post('/ai-tutor/practice-questions', null, {
      params: {
        topic,
        subject,
        difficulty,
        count
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to generate practice questions:', error);
    throw error;
  }
};

// Voice Learning API
export const transcribeAudio = async (
  audioFile: File,
  language: string = 'en'
): Promise<{ text: string; confidence: number; language: string }> => {
  try {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    
    const response = await apiClient.post('/speech/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        language
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to transcribe audio:', error);
    throw error;
  }
};

export const synthesizeSpeech = async (
  text: string,
  language: string = 'en',
  voice: string = 'default'
): Promise<{ audio_url: string; duration: number }> => {
  try {
    const response = await apiClient.post('/speech/synthesize', null, {
      params: {
        text,
        language,
        voice
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to synthesize speech:', error);
    throw error;
  }
};

// Conversation History
export const getTutorHistory = async (
  userId: string,
  limit: number = 10
): Promise<Array<{
  question: string;
  response: string;
  timestamp: string;
  subject: string;
}>> => {
  try {
    const response = await apiClient.get('/ai-tutor/history', {
      params: {
        user_id: userId,
        limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get tutor history:', error);
    throw error;
  }
};

// Subject-specific tutoring
export const getSubjectTopics = async (
  subject: string,
  language: string = 'en'
): Promise<Array<{
  topic: string;
  description: string;
  difficulty: string;
  prerequisites: string[];
}>> => {
  try {
    const response = await apiClient.get('/ai-tutor/topics', {
      params: {
        subject,
        language
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get subject topics:', error);
    throw error;
  }
};

// Learning path recommendations
export const getPersonalizedLearningPath = async (
  userId: string,
  subject: string,
  currentLevel: string = 'beginner'
): Promise<Array<{
  step: number;
  topic: string;
  description: string;
  estimated_time: string;
  resources: Array<{
    type: string;
    title: string;
    url: string;
  }>;
}>> => {
  try {
    const response = await apiClient.get('/ai-tutor/learning-path', {
      params: {
        user_id: userId,
        subject,
        current_level: currentLevel
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get learning path:', error);
    throw error;
  }
};

// Real-time chat with AI tutor
export const startTutorChat = async (
  userId: string,
  subject: string = 'general'
): Promise<{ chat_id: string; welcome_message: string }> => {
  try {
    const response = await apiClient.post('/ai-tutor/chat/start', {
      user_id: userId,
      subject
    });
    return response.data;
  } catch (error) {
    console.error('Failed to start tutor chat:', error);
    throw error;
  }
};

export const sendChatMessage = async (
  chatId: string,
  message: string,
  messageType: 'text' | 'voice' = 'text'
): Promise<{
  response: string;
  suggestions: string[];
  resources?: Array<{
    title: string;
    url: string;
  }>;
}> => {
  try {
    const response = await apiClient.post('/ai-tutor/chat/message', {
      chat_id: chatId,
      message,
      message_type: messageType
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send chat message:', error);
    throw error;
  }
};

export default {
  askAITutor,
  explainConcept,
  generatePracticeQuestions,
  transcribeAudio,
  synthesizeSpeech,
  getTutorHistory,
  getSubjectTopics,
  getPersonalizedLearningPath,
  startTutorChat,
  sendChatMessage
};
