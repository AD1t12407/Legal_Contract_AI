import axios from 'axios';
import { FocusSession, Learning } from '../contexts/FocusSessionContext';

// Base API URL - from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
console.log('API URL:', API_URL); // Debug log

// API client with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchSessions = async (): Promise<FocusSession[]> => {
  try {
    // Make real API call
    const response = await apiClient.get('/sessions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    throw error;
  }
};

export const fetchLearnings = async (): Promise<Learning[]> => {
  try {
    // Make real API call
    const response = await apiClient.get('/learnings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch learnings:', error);
    throw error;
  }
};

export const createSession = async (sessionData: Partial<FocusSession>): Promise<FocusSession> => {
  try {
    // Make real API call
    const response = await apiClient.post('/sessions', sessionData);
    return response.data;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
};

export const createLearning = async (learningData: Partial<Learning>): Promise<Learning> => {
  try {
    // Make real API call
    const response = await apiClient.post('/learning', learningData);
    return response.data;
  } catch (error) {
    console.error('Failed to create learning:', error);
    throw error;
  }
};

export const recordEvent = async (eventData: {
  type: 'start' | 'stop' | 'tabSwitch' | 'idle';
  sessionId: string;
  time: string;
  details?: string;
}): Promise<void> => {
  try {
    // Make real API call
    await apiClient.post('/events', [eventData]);
  } catch (error) {
    console.error('Failed to record event:', error);
    throw error;
  }
};

// Add analytics API call
export const fetchAnalytics = async (days: number = 7): Promise<any> => {
  try {
    const response = await apiClient.get(`/analytics?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
};