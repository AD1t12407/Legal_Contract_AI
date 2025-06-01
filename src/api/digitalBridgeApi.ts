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

// Enhanced Types for Comprehensive Digital Bridge
export interface UserProfile {
  user_id: string;
  name: string;
  grade: string;
  region: string;
  languages: string[];
  location?: { lat: number; lng: number };
  phone_number?: string;
  device_type: string;
  connectivity: string;
  learning_preferences: string[];
  mentorship_status: string;
}

export interface CommunityHub {
  hub_id: string;
  name: string;
  distance_km: number;
  location: { lat: number; lng: number };
  region: string;
  languages: string[];
  capacity: number;
  current_users: number;
  availability: string;
  connectivity_type: string;
  resources: string[];
  operating_hours: Record<string, string>;
  contact_info: Record<string, string>;
  status: string;
}

export interface MobileLearningUnit {
  unit_id: string;
  name: string;
  distance_km: number;
  current_location: { lat: number; lng: number };
  capacity: number;
  current_students: number;
  availability: string;
  subjects: string[];
  languages: string[];
  equipment: string[];
  status: string;
  schedule: Array<{ day: string; location: string; time: string }>;
  next_stops: Array<{ lat: number; lng: number }>;
}

export interface ContentPackage {
  package_id: string;
  title: string;
  subject: string;
  grade: string;
  language: string;
  region: string;
  content_type: string;
  size_mb: number;
  offline_capable: boolean;
  prerequisites: string[];
  learning_objectives: string[];
  estimated_duration: number;
  difficulty_level: string;
  created_by: string;
  version: string;
  download_count: number;
  rating: number;
}

export interface PeerInfo {
  user_id: string;
  name: string;
  grade: string;
  distance_km: number;
  shared_subjects: string[];
  mentorship_status: string;
  languages: string[];
  connectivity: string;
  last_active: string;
}

export interface EdgeNode {
  node_id: string;
  location: { lat: number; lng: number };
  region: string;
  capacity_gb: number;
  used_storage_gb: number;
  available_storage_gb: number;
  storage_utilization: number;
  bandwidth_mbps: number;
  connected_devices: number;
  max_devices: number;
  device_utilization: number;
  status: string;
  last_sync: string;
  cached_content: string[];
}

export interface SMSInteraction {
  interaction_id: string;
  message_type: string;
  content: string;
  language: string;
  timestamp: string;
  response_sent: boolean;
}

// Legacy types for backward compatibility
export interface OfflineContent {
  id: string;
  title: string;
  description: string;
  content_type: 'lesson' | 'video' | 'quiz' | 'resource';
  size_mb: number;
  language: string;
  subject: string;
  difficulty: string;
  download_url: string;
  thumbnail_url?: string;
  duration?: number;
  prerequisites: string[];
  tags: string[];
  offline_available: boolean;
  last_updated: string;
}

export interface SyncStatus {
  device_id: string;
  last_sync: string;
  pending_uploads: number;
  pending_downloads: number;
  storage_used_mb: number;
  storage_available_mb: number;
  sync_in_progress: boolean;
  connection_quality: 'excellent' | 'good' | 'poor' | 'offline';
}

export interface PeerDevice {
  device_id: string;
  device_name: string;
  distance_meters: number;
  connection_type: 'bluetooth' | 'wifi_direct' | 'hotspot';
  available_content: string[];
  last_seen: string;
  trust_level: number;
}

// Offline Content Management
export const getOfflineContent = async (
  subject?: string,
  language?: string,
  difficulty?: string
): Promise<OfflineContent[]> => {
  try {
    const response = await apiClient.get('/digital-bridge/content', {
      params: {
        subject,
        language,
        difficulty
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get offline content:', error);
    throw error;
  }
};

export const downloadContent = async (
  contentId: string,
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<{ download_id: string; estimated_time: number }> => {
  try {
    const response = await apiClient.post('/digital-bridge/download', {
      content_id: contentId,
      priority
    });
    return response.data;
  } catch (error) {
    console.error('Failed to start content download:', error);
    throw error;
  }
};

export const getDownloadProgress = async (
  downloadId: string
): Promise<{
  progress: number;
  status: 'downloading' | 'completed' | 'failed' | 'paused';
  bytes_downloaded: number;
  total_bytes: number;
  estimated_time_remaining: number;
}> => {
  try {
    const response = await apiClient.get(`/digital-bridge/download/${downloadId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Failed to get download progress:', error);
    throw error;
  }
};

// Sync Management
export const getSyncStatus = async (deviceId: string): Promise<SyncStatus> => {
  try {
    const response = await apiClient.get('/digital-bridge/sync/status', {
      params: { device_id: deviceId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get sync status:', error);
    throw error;
  }
};

export const startSync = async (
  deviceId: string,
  syncType: 'full' | 'incremental' = 'incremental'
): Promise<{ sync_id: string; estimated_time: number }> => {
  try {
    const response = await apiClient.post('/digital-bridge/sync/start', {
      device_id: deviceId,
      sync_type: syncType
    });
    return response.data;
  } catch (error) {
    console.error('Failed to start sync:', error);
    throw error;
  }
};

// Peer-to-Peer Sharing
export const discoverPeers = async (
  deviceId: string,
  radius: number = 100
): Promise<PeerDevice[]> => {
  try {
    const response = await apiClient.get('/digital-bridge/peers/discover', {
      params: {
        device_id: deviceId,
        radius
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to discover peers:', error);
    throw error;
  }
};

export const requestContentFromPeer = async (
  peerDeviceId: string,
  contentId: string,
  deviceId: string
): Promise<{ transfer_id: string; estimated_time: number }> => {
  try {
    const response = await apiClient.post('/digital-bridge/peers/request', {
      peer_device_id: peerDeviceId,
      content_id: contentId,
      device_id: deviceId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to request content from peer:', error);
    throw error;
  }
};

export const shareContentWithPeer = async (
  peerDeviceId: string,
  contentIds: string[],
  deviceId: string
): Promise<{ transfer_ids: string[] }> => {
  try {
    const response = await apiClient.post('/digital-bridge/peers/share', {
      peer_device_id: peerDeviceId,
      content_ids: contentIds,
      device_id: deviceId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to share content with peer:', error);
    throw error;
  }
};

// Community Hubs
export const findNearbyHubs = async (
  latitude: number,
  longitude: number,
  radius: number = 50
): Promise<CommunityHub[]> => {
  try {
    const response = await apiClient.get('/digital-bridge/hubs/nearby', {
      params: {
        latitude,
        longitude,
        radius
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to find nearby hubs:', error);
    throw error;
  }
};

export const connectToHub = async (
  hubId: string,
  deviceId: string
): Promise<{
  connection_id: string;
  available_content: string[];
  mentor_info?: {
    name: string;
    subjects: string[];
    available_hours: string;
  };
}> => {
  try {
    const response = await apiClient.post('/digital-bridge/hubs/connect', {
      hub_id: hubId,
      device_id: deviceId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to connect to hub:', error);
    throw error;
  }
};

// SMS Learning
export const sendSMSLesson = async (
  phoneNumber: string,
  lessonId: string,
  language: string = 'en'
): Promise<{ message_id: string; estimated_delivery: string }> => {
  try {
    const response = await apiClient.post('/digital-bridge/sms/lesson', {
      phone_number: phoneNumber,
      lesson_id: lessonId,
      language
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send SMS lesson:', error);
    throw error;
  }
};

export const getSMSProgress = async (
  phoneNumber: string
): Promise<{
  lessons_completed: number;
  current_lesson: string;
  next_lesson_time: string;
  streak_days: number;
  total_score: number;
}> => {
  try {
    const response = await apiClient.get('/digital-bridge/sms/progress', {
      params: { phone_number: phoneNumber }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get SMS progress:', error);
    throw error;
  }
};

// Voice Learning
export const startVoiceLesson = async (
  phoneNumber: string,
  lessonId: string,
  language: string = 'en'
): Promise<{ call_id: string; estimated_duration: number }> => {
  try {
    const response = await apiClient.post('/digital-bridge/voice/lesson', {
      phone_number: phoneNumber,
      lesson_id: lessonId,
      language
    });
    return response.data;
  } catch (error) {
    console.error('Failed to start voice lesson:', error);
    throw error;
  }
};

// Offline Analytics
export const getOfflineAnalytics = async (
  deviceId: string,
  days: number = 7
): Promise<{
  offline_time_percentage: number;
  content_accessed_offline: number;
  peer_sharing_sessions: number;
  data_saved_mb: number;
  learning_continuity_score: number;
}> => {
  try {
    const response = await apiClient.get('/digital-bridge/analytics', {
      params: {
        device_id: deviceId,
        days
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get offline analytics:', error);
    throw error;
  }
};

// Storage Management
export const optimizeStorage = async (
  deviceId: string
): Promise<{
  space_freed_mb: number;
  recommendations: Array<{
    action: string;
    description: string;
    space_impact_mb: number;
  }>;
}> => {
  try {
    const response = await apiClient.post('/digital-bridge/storage/optimize', {
      device_id: deviceId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to optimize storage:', error);
    throw error;
  }
};

// NEW COMPREHENSIVE DIGITAL BRIDGE API FUNCTIONS

// User Management API
export const registerUser = async (userData: Partial<UserProfile>): Promise<{ status: string; user_id: string; message: string; nearest_hub?: any }> => {
  const response = await apiClient.post('/digital-bridge/users/register', userData);
  return response.data;
};

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await apiClient.get(`/digital-bridge/users/${userId}`);
  return response.data;
};

// Enhanced Peer Discovery API
export const discoverPeersEnhanced = async (
  userId: string,
  radiusKm: number = 50,
  grade?: string,
  subject?: string
): Promise<{ user_location: any; search_radius_km: number; peers_found: number; peers: PeerInfo[] }> => {
  const params: any = { user_id: userId, radius_km: radiusKm };
  if (grade) params.grade = grade;
  if (subject) params.subject = subject;

  const response = await apiClient.get('/digital-bridge/peers/discover', { params });
  return response.data;
};

export const connectWithPeer = async (connectionData: {
  user1_id: string;
  user2_id: string;
  connection_type?: string;
}): Promise<{ status: string; connection_id: string; message: string }> => {
  const response = await apiClient.post('/digital-bridge/peers/connect', connectionData);
  return response.data;
};

// Enhanced Community Hubs API
export const findNearbyHubsEnhanced = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  language?: string
): Promise<{ search_location: any; search_radius_km: number; hubs_found: number; hubs: CommunityHub[] }> => {
  const params: any = { latitude, longitude, radius_km: radiusKm };
  if (language) params.language = language;

  const response = await apiClient.get('/digital-bridge/hubs/nearby', { params });
  return response.data;
};

export const checkinToHub = async (hubId: string, userData: { user_id: string }): Promise<{ status: string; hub_name: string; message: string }> => {
  const response = await apiClient.post(`/digital-bridge/hubs/${hubId}/checkin`, userData);
  return response.data;
};

// Mobile Learning Units API
export const findNearbyMobileUnits = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 100
): Promise<{ search_location: any; search_radius_km: number; units_found: number; mobile_units: MobileLearningUnit[] }> => {
  const response = await apiClient.get('/digital-bridge/mobile-units/nearby', {
    params: { latitude, longitude, radius_km: radiusKm }
  });
  return response.data;
};

export const getMobileUnitSchedule = async (unitId: string): Promise<MobileLearningUnit> => {
  const response = await apiClient.get(`/digital-bridge/mobile-units/${unitId}/schedule`);
  return response.data;
};

// Enhanced Content Packages API
export const getContentPackages = async (filters: {
  grade?: string;
  subject?: string;
  language?: string;
  region?: string;
  offline_only?: boolean;
}): Promise<{ filters_applied: any; packages_found: number; packages: ContentPackage[] }> => {
  const response = await apiClient.get('/digital-bridge/content/packages', { params: filters });
  return response.data;
};

export const downloadContentPackage = async (downloadData: {
  package_id: string;
  user_id: string;
}): Promise<{ download_id: string; package_title: string; size_mb: number; estimated_time_minutes: number }> => {
  const response = await apiClient.post('/digital-bridge/content/download', downloadData);
  return response.data;
};

// Enhanced SMS Communication API
export const sendSMSMessage = async (smsData: {
  phone_number: string;
  message: string;
  language?: string;
}): Promise<{ status: string; interaction_id: string; message: string }> => {
  const response = await apiClient.post('/digital-bridge/sms/send', smsData);
  return response.data;
};

export const receiveSMSMessage = async (smsData: {
  phone_number: string;
  message: string;
  language?: string;
}): Promise<{ status: string; response: string; auto_reply: boolean }> => {
  const response = await apiClient.post('/digital-bridge/sms/receive', smsData);
  return response.data;
};

export const getSMSHistory = async (phoneNumber: string, limit: number = 50): Promise<{
  phone_number: string;
  total_interactions: number;
  history: SMSInteraction[];
}> => {
  const response = await apiClient.get(`/digital-bridge/sms/history/${phoneNumber}`, { params: { limit } });
  return response.data;
};

// Edge Computing API
export const getEdgeNodes = async (region?: string): Promise<{
  region_filter?: string;
  nodes_found: number;
  edge_nodes: EdgeNode[];
}> => {
  const params = region ? { region } : {};
  const response = await apiClient.get('/digital-bridge/edge/nodes', { params });
  return response.data;
};

// Health Check
export const getDigitalBridgeHealth = async (): Promise<{
  status: string;
  digital_bridge: {
    users_registered: number;
    community_hubs: number;
    mobile_units: number;
    peer_connections: number;
    content_packages: number;
    edge_nodes: number;
    sms_interactions: number;
  };
}> => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default {
  // Legacy functions
  getOfflineContent,
  downloadContent,
  getDownloadProgress,
  getSyncStatus,
  startSync,
  discoverPeers,
  requestContentFromPeer,
  shareContentWithPeer,
  findNearbyHubs,
  connectToHub,
  sendSMSLesson,
  getSMSProgress,
  startVoiceLesson,
  getOfflineAnalytics,
  optimizeStorage,

  // New comprehensive functions
  registerUser,
  getUserProfile,
  discoverPeersEnhanced,
  connectWithPeer,
  findNearbyHubsEnhanced,
  checkinToHub,
  findNearbyMobileUnits,
  getMobileUnitSchedule,
  getContentPackages,
  downloadContentPackage,
  sendSMSMessage,
  receiveSMSMessage,
  getSMSHistory,
  getEdgeNodes,
  getDigitalBridgeHealth
};
