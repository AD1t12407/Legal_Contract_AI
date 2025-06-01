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
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'focus' | 'social' | 'milestone' | 'special';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    target: number;
    current?: number;
  }[];
  unlocked: boolean;
  unlocked_date?: string;
  progress_percentage: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  color: string;
  earned_date: string;
  category: string;
  level: number;
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  category: 'points' | 'focus_time' | 'lessons_completed' | 'streak';
  entries: Array<{
    rank: number;
    user_id: string;
    username: string;
    avatar_url?: string;
    score: number;
    change_from_last: number;
    badges: string[];
  }>;
  user_rank?: number;
  total_participants: number;
}

export interface UserStats {
  user_id: string;
  level: number;
  total_points: number;
  points_to_next_level: number;
  current_streak: number;
  longest_streak: number;
  total_focus_time: number;
  lessons_completed: number;
  achievements_unlocked: number;
  badges_earned: number;
  rank_global: number;
  rank_local: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'special' | 'community';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  objectives: Array<{
    id: string;
    description: string;
    type: string;
    target: number;
    current: number;
    completed: boolean;
  }>;
  rewards: {
    points: number;
    badges?: string[];
    special_items?: string[];
  };
  deadline?: string;
  progress_percentage: number;
  status: 'available' | 'in_progress' | 'completed' | 'expired';
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'points' | 'badge' | 'avatar' | 'theme' | 'feature_unlock';
  cost: number;
  category: string;
  rarity: string;
  available: boolean;
  owned: boolean;
  preview_url?: string;
}

// User Stats and Progress
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const response = await apiClient.get(`/gamification/stats/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get user stats:', error);
    throw error;
  }
};

export const updateUserProgress = async (
  userId: string,
  activity: {
    type: 'focus_session' | 'lesson_completed' | 'quiz_passed' | 'streak_maintained';
    value: number;
    metadata?: Record<string, any>;
  }
): Promise<{
  points_earned: number;
  level_up: boolean;
  new_achievements: Achievement[];
  new_badges: Badge[];
}> => {
  try {
    const response = await apiClient.post('/gamification/progress', {
      user_id: userId,
      activity
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update user progress:', error);
    throw error;
  }
};

// Achievements
export const getUserAchievements = async (
  userId: string,
  category?: string
): Promise<Achievement[]> => {
  try {
    const response = await apiClient.get(`/gamification/achievements/${userId}`, {
      params: { category }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get user achievements:', error);
    throw error;
  }
};

export const unlockAchievement = async (
  userId: string,
  achievementId: string
): Promise<{
  success: boolean;
  achievement: Achievement;
  points_earned: number;
}> => {
  try {
    const response = await apiClient.post('/gamification/achievements/unlock', {
      user_id: userId,
      achievement_id: achievementId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to unlock achievement:', error);
    throw error;
  }
};

// Badges
export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const response = await apiClient.get(`/gamification/badges/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get user badges:', error);
    throw error;
  }
};

export const awardBadge = async (
  userId: string,
  badgeId: string,
  reason?: string
): Promise<{
  success: boolean;
  badge: Badge;
  points_earned: number;
}> => {
  try {
    const response = await apiClient.post('/gamification/badges/award', {
      user_id: userId,
      badge_id: badgeId,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Failed to award badge:', error);
    throw error;
  }
};

// Leaderboards
export const getLeaderboard = async (
  period: 'daily' | 'weekly' | 'monthly' | 'all_time',
  category: 'points' | 'focus_time' | 'lessons_completed' | 'streak',
  limit: number = 50
): Promise<Leaderboard> => {
  try {
    const response = await apiClient.get('/gamification/leaderboard', {
      params: {
        period,
        category,
        limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    throw error;
  }
};

export const getUserRank = async (
  userId: string,
  category: string = 'points'
): Promise<{
  global_rank: number;
  local_rank: number;
  percentile: number;
  score: number;
}> => {
  try {
    const response = await apiClient.get(`/gamification/rank/${userId}`, {
      params: { category }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get user rank:', error);
    throw error;
  }
};

// Quests and Challenges
export const getAvailableQuests = async (
  userId: string,
  category?: string
): Promise<Quest[]> => {
  try {
    const response = await apiClient.get('/gamification/quests', {
      params: {
        user_id: userId,
        category
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get available quests:', error);
    throw error;
  }
};

export const startQuest = async (
  userId: string,
  questId: string
): Promise<{
  success: boolean;
  quest: Quest;
  message: string;
}> => {
  try {
    const response = await apiClient.post('/gamification/quests/start', {
      user_id: userId,
      quest_id: questId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to start quest:', error);
    throw error;
  }
};

export const completeQuestObjective = async (
  userId: string,
  questId: string,
  objectiveId: string,
  value: number
): Promise<{
  objective_completed: boolean;
  quest_completed: boolean;
  rewards_earned?: any;
}> => {
  try {
    const response = await apiClient.post('/gamification/quests/objective', {
      user_id: userId,
      quest_id: questId,
      objective_id: objectiveId,
      value
    });
    return response.data;
  } catch (error) {
    console.error('Failed to complete quest objective:', error);
    throw error;
  }
};

// Rewards Store
export const getRewardsStore = async (
  category?: string,
  affordable_only: boolean = false,
  user_id?: string
): Promise<Reward[]> => {
  try {
    const response = await apiClient.get('/gamification/rewards', {
      params: {
        category,
        affordable_only,
        user_id
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get rewards store:', error);
    throw error;
  }
};

export const purchaseReward = async (
  userId: string,
  rewardId: string
): Promise<{
  success: boolean;
  reward: Reward;
  remaining_points: number;
  message: string;
}> => {
  try {
    const response = await apiClient.post('/gamification/rewards/purchase', {
      user_id: userId,
      reward_id: rewardId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to purchase reward:', error);
    throw error;
  }
};

// Social Features
export const followUser = async (
  userId: string,
  targetUserId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/gamification/social/follow', {
      user_id: userId,
      target_user_id: targetUserId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to follow user:', error);
    throw error;
  }
};

export const getFriends = async (userId: string): Promise<Array<{
  user_id: string;
  username: string;
  avatar_url?: string;
  level: number;
  status: 'online' | 'offline' | 'learning';
  current_streak: number;
}>> => {
  try {
    const response = await apiClient.get(`/gamification/social/friends/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get friends:', error);
    throw error;
  }
};

export const sendChallenge = async (
  userId: string,
  targetUserId: string,
  challengeType: string,
  parameters: Record<string, any>
): Promise<{
  challenge_id: string;
  message: string;
}> => {
  try {
    const response = await apiClient.post('/gamification/social/challenge', {
      user_id: userId,
      target_user_id: targetUserId,
      challenge_type: challengeType,
      parameters
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send challenge:', error);
    throw error;
  }
};

// Analytics
export const getGamificationAnalytics = async (
  userId: string,
  days: number = 30
): Promise<{
  engagement_score: number;
  motivation_trend: 'increasing' | 'stable' | 'decreasing';
  preferred_activities: string[];
  achievement_velocity: number;
  social_interaction_score: number;
  recommendations: string[];
}> => {
  try {
    const response = await apiClient.get('/gamification/analytics', {
      params: {
        user_id: userId,
        days
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get gamification analytics:', error);
    throw error;
  }
};

export default {
  getUserStats,
  updateUserProgress,
  getUserAchievements,
  unlockAchievement,
  getUserBadges,
  awardBadge,
  getLeaderboard,
  getUserRank,
  getAvailableQuests,
  startQuest,
  completeQuestObjective,
  getRewardsStore,
  purchaseReward,
  followUser,
  getFriends,
  sendChallenge,
  getGamificationAnalytics
};
