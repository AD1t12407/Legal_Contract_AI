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
export interface Language {
  code: string;
  name: string;
  native_name: string;
  region: string;
  speakers: number;
  writing_system: string;
  supported_features: {
    text_to_speech: boolean;
    speech_to_text: boolean;
    translation: boolean;
    content_available: boolean;
  };
}

export interface TranslationResult {
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  confidence: number;
  cultural_notes?: string[];
  alternative_translations?: string[];
}

export interface VernacularContent {
  id: string;
  title: string;
  description: string;
  content: string;
  language: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content_type: 'lesson' | 'story' | 'exercise' | 'quiz';
  cultural_context: string[];
  local_examples: string[];
  audio_url?: string;
  video_url?: string;
  images: string[];
  created_by: 'ai' | 'community' | 'expert';
  rating: number;
  usage_count: number;
}

export interface CulturalAdaptation {
  concept: string;
  local_equivalent: string;
  cultural_explanation: string;
  examples: string[];
  region_specific: boolean;
}

// Language Management
export const getSupportedLanguages = async (): Promise<Language[]> => {
  try {
    const response = await apiClient.get('/vernacular/languages');
    return response.data;
  } catch (error) {
    console.error('Failed to get supported languages:', error);
    throw error;
  }
};

export const detectLanguage = async (text: string): Promise<{
  language: string;
  confidence: number;
  alternatives: Array<{ language: string; confidence: number }>;
}> => {
  try {
    const response = await apiClient.post('/vernacular/detect-language', {
      text
    });
    return response.data;
  } catch (error) {
    console.error('Failed to detect language:', error);
    throw error;
  }
};

// Translation Services
export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  includeContext: boolean = true
): Promise<TranslationResult> => {
  try {
    const response = await apiClient.post('/vernacular/translate', {
      text,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      include_context: includeContext
    });
    return response.data;
  } catch (error) {
    console.error('Failed to translate text:', error);
    throw error;
  }
};

export const translateLearningContent = async (
  contentId: string,
  targetLanguage: string,
  preserveCulturalContext: boolean = true
): Promise<VernacularContent> => {
  try {
    const response = await apiClient.post('/vernacular/translate-content', {
      content_id: contentId,
      target_language: targetLanguage,
      preserve_cultural_context: preserveCulturalContext
    });
    return response.data;
  } catch (error) {
    console.error('Failed to translate learning content:', error);
    throw error;
  }
};

// Content Discovery
export const getVernacularContent = async (
  language: string,
  subject?: string,
  difficulty?: string,
  contentType?: string
): Promise<VernacularContent[]> => {
  try {
    const response = await apiClient.get('/vernacular/content', {
      params: {
        language,
        subject,
        difficulty,
        content_type: contentType
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get vernacular content:', error);
    throw error;
  }
};

export const searchVernacularContent = async (
  query: string,
  language: string,
  filters?: {
    subject?: string;
    difficulty?: string;
    content_type?: string;
    region?: string;
  }
): Promise<VernacularContent[]> => {
  try {
    const response = await apiClient.post('/vernacular/search', {
      query,
      language,
      filters
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search vernacular content:', error);
    throw error;
  }
};

// Cultural Adaptation
export const getCulturalAdaptations = async (
  concept: string,
  language: string,
  region?: string
): Promise<CulturalAdaptation[]> => {
  try {
    const response = await apiClient.get('/vernacular/cultural-adaptations', {
      params: {
        concept,
        language,
        region
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get cultural adaptations:', error);
    throw error;
  }
};

export const adaptContentCulturally = async (
  content: string,
  targetLanguage: string,
  targetRegion: string
): Promise<{
  adapted_content: string;
  adaptations_made: CulturalAdaptation[];
  cultural_notes: string[];
}> => {
  try {
    const response = await apiClient.post('/vernacular/adapt-culturally', {
      content,
      target_language: targetLanguage,
      target_region: targetRegion
    });
    return response.data;
  } catch (error) {
    console.error('Failed to adapt content culturally:', error);
    throw error;
  }
};

// Voice Services
export const generateVernacularAudio = async (
  text: string,
  language: string,
  voice?: string,
  speed?: number
): Promise<{
  audio_url: string;
  duration: number;
  voice_used: string;
}> => {
  try {
    const response = await apiClient.post('/vernacular/generate-audio', {
      text,
      language,
      voice,
      speed
    });
    return response.data;
  } catch (error) {
    console.error('Failed to generate vernacular audio:', error);
    throw error;
  }
};

export const transcribeVernacularAudio = async (
  audioFile: File,
  language: string
): Promise<{
  text: string;
  confidence: number;
  language_detected: string;
  dialect?: string;
}> => {
  try {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    
    const response = await apiClient.post('/vernacular/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        language
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to transcribe vernacular audio:', error);
    throw error;
  }
};

// Community Content
export const submitCommunityContent = async (
  content: Omit<VernacularContent, 'id' | 'created_by' | 'rating' | 'usage_count'>,
  authorInfo: {
    name: string;
    region: string;
    expertise: string[];
  }
): Promise<{ content_id: string; status: 'pending' | 'approved' }> => {
  try {
    const response = await apiClient.post('/vernacular/community/submit', {
      content,
      author_info: authorInfo
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit community content:', error);
    throw error;
  }
};

export const rateCommunityContent = async (
  contentId: string,
  rating: number,
  feedback?: string
): Promise<{ new_average_rating: number }> => {
  try {
    const response = await apiClient.post('/vernacular/community/rate', {
      content_id: contentId,
      rating,
      feedback
    });
    return response.data;
  } catch (error) {
    console.error('Failed to rate community content:', error);
    throw error;
  }
};

// Learning Analytics
export const getVernacularLearningAnalytics = async (
  userId: string,
  language: string,
  days: number = 30
): Promise<{
  total_learning_time: number;
  content_consumed: number;
  language_proficiency_score: number;
  cultural_understanding_score: number;
  preferred_content_types: string[];
  learning_streak: number;
  achievements: Array<{
    title: string;
    description: string;
    earned_date: string;
  }>;
}> => {
  try {
    const response = await apiClient.get('/vernacular/analytics', {
      params: {
        user_id: userId,
        language,
        days
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get vernacular learning analytics:', error);
    throw error;
  }
};

// Personalized Learning Path
export const getPersonalizedVernacularPath = async (
  userId: string,
  language: string,
  currentLevel: string,
  interests: string[]
): Promise<Array<{
  step: number;
  title: string;
  description: string;
  content_ids: string[];
  estimated_time: string;
  cultural_focus: string[];
  prerequisites: string[];
}>> => {
  try {
    const response = await apiClient.post('/vernacular/learning-path', {
      user_id: userId,
      language,
      current_level: currentLevel,
      interests
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get personalized vernacular path:', error);
    throw error;
  }
};

// Offline Vernacular Support
export const downloadVernacularPack = async (
  language: string,
  packType: 'basic' | 'intermediate' | 'advanced' | 'complete'
): Promise<{
  download_id: string;
  pack_size_mb: number;
  estimated_time: number;
  included_content: string[];
}> => {
  try {
    const response = await apiClient.post('/vernacular/download-pack', {
      language,
      pack_type: packType
    });
    return response.data;
  } catch (error) {
    console.error('Failed to download vernacular pack:', error);
    throw error;
  }
};

export default {
  getSupportedLanguages,
  detectLanguage,
  translateText,
  translateLearningContent,
  getVernacularContent,
  searchVernacularContent,
  getCulturalAdaptations,
  adaptContentCulturally,
  generateVernacularAudio,
  transcribeVernacularAudio,
  submitCommunityContent,
  rateCommunityContent,
  getVernacularLearningAnalytics,
  getPersonalizedVernacularPath,
  downloadVernacularPack
};
