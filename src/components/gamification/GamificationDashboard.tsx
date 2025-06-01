import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Crown,
  Medal,
  Users,
  TrendingUp,
  Calendar,
  Flame,
  Gift,
  ChevronRight,
  Lock,
  Unlock
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  type: string;
  earned_at?: string;
  progress?: number;
  total?: number;
}

interface UserProfile {
  user_id: string;
  level: number;
  xp: {
    total: number;
    current_level: number;
    next_level: number;
    progress_percentage: number;
  };
  achievements: Achievement[];
  streaks: {
    current_streak: number;
    longest_streak: number;
    last_session_date: string;
  };
  stats: any;
  next_achievements: Achievement[];
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  value: number;
  level?: number;
  category: string;
}

const GamificationDashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [leaderboardCategory, setLeaderboardCategory] = useState('xp');
  const [isLoading, setIsLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchUserProfile();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardCategory]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/gamification/profile/current_user');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/gamification/leaderboard?category=${leaderboardCategory}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const checkAchievements = async () => {
    try {
      const response = await fetch('/api/gamification/check-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'current_user' })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.new_achievements && data.new_achievements.length > 0) {
          setNewAchievements(data.new_achievements);
          // Refresh profile to show updated data
          fetchUserProfile();
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: Star },
    { id: 'achievements', name: 'Achievements', icon: Trophy },
    { id: 'leaderboard', name: 'Leaderboard', icon: Crown }
  ];

  const leaderboardCategories = [
    { id: 'xp', name: 'Experience Points', icon: Star },
    { id: 'streak', name: 'Streaks', icon: Flame },
    { id: 'sessions', name: 'Sessions', icon: Target }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
            style={{ background: 'var(--primary-gradient)' }}
          >
            <Trophy className="h-8 w-8 animate-pulse" style={{ color: 'white' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading gamification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Achievements & Progress
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track your learning journey and compete with others
          </p>
        </div>
        
        <button
          onClick={checkAchievements}
          className="btn btn-primary mt-4 md:mt-0"
        >
          <Award className="h-4 w-4 mr-2" />
          Check Achievements
        </button>
      </div>

      {/* New Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="card p-6 border-2"
            style={{ 
              borderColor: 'var(--text-accent)',
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(79, 70, 229, 0.1) 100%)'
            }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  🎉 Achievement Unlocked!
                </h3>
                <p className="font-semibold" style={{ color: 'var(--text-accent)' }}>
                  {achievement.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {achievement.description}
                </p>
                <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-accent)' }}>
                  +{achievement.xp_reward} XP
                </p>
              </div>
              <button
                onClick={() => setNewAchievements(prev => prev.filter(a => a.id !== achievement.id))}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200"
              style={{
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <IconComponent className="h-4 w-4" />
              <span className="font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && userProfile && (
        <div className="space-y-8">
          {/* Level and XP */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'var(--primary-gradient)', color: 'white' }}
                >
                  {userProfile.level}
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Level {userProfile.level}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {userProfile.xp.total.toLocaleString()} total XP
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Next Level
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {userProfile.xp.next_level - userProfile.xp.current_level} XP
                </p>
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                <span>Level {userProfile.level}</span>
                <span>Level {userProfile.level + 1}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${userProfile.xp.progress_percentage}%`,
                    background: 'var(--primary-gradient)'
                  }}
                />
              </div>
              <p className="text-center text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                {userProfile.xp.progress_percentage.toFixed(1)}% to next level
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                style={{ background: '#EF444420', color: '#EF4444' }}
              >
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {userProfile.streaks.current_streak}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Current Streak
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Best: {userProfile.streaks.longest_streak} days
              </p>
            </div>

            <div className="card p-6 text-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                style={{ background: '#10B98120', color: '#10B981' }}
              >
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {userProfile.stats.completed_sessions}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Sessions Completed
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {Math.round(userProfile.stats.completion_rate * 100)}% completion rate
              </p>
            </div>

            <div className="card p-6 text-center">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                style={{ background: '#8B5CF620', color: '#8B5CF6' }}
              >
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {userProfile.achievements.length}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Achievements
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {userProfile.next_achievements.length} available
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && userProfile && (
        <div className="space-y-8">
          {/* Earned Achievements */}
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Earned Achievements ({userProfile.achievements.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className="card p-4"
                >
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: 'var(--accent-gradient)' }}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-accent)' }}>
                          +{achievement.xp_reward} XP
                        </span>
                        {achievement.earned_at && (
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Available Achievements */}
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Available Achievements ({userProfile.next_achievements.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProfile.next_achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className="card p-4 opacity-75"
                >
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: 'var(--surface)', color: 'var(--text-tertiary)' }}
                    >
                      <Lock className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-accent)' }}>
                          +{achievement.xp_reward} XP
                        </span>
                        {achievement.progress !== undefined && achievement.total && (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div 
                                className="h-1 rounded-full"
                                style={{ 
                                  width: `${(achievement.progress / achievement.total) * 100}%`,
                                  background: 'var(--text-accent)'
                                }}
                              />
                            </div>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {achievement.progress}/{achievement.total}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Category Selector */}
          <div className="flex space-x-2">
            {leaderboardCategories.map(category => {
              const IconComponent = category.icon;
              const isActive = leaderboardCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setLeaderboardCategory(category.id)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--text-accent)' : 'var(--surface)',
                    color: isActive ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Leaderboard */}
          <div className="card">
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Top Performers
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {leaderboardCategories.find(c => c.id === leaderboardCategory)?.name} Leaderboard
              </p>
            </div>
            
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {leaderboard.map((entry, index) => (
                <div key={entry.user_id} className="p-4 flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {index < 3 ? (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ 
                          background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                        }}
                      >
                        {index === 0 ? <Crown className="h-4 w-4 text-white" /> : 
                         index === 1 ? <Medal className="h-4 w-4 text-white" /> :
                         <Award className="h-4 w-4 text-white" />}
                      </div>
                    ) : (
                      <span className="text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>
                        {entry.rank}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {entry.name}
                    </p>
                    {entry.level && (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Level {entry.level}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {entry.value.toLocaleString()}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {leaderboardCategory === 'xp' ? 'XP' : 
                       leaderboardCategory === 'streak' ? 'days' : 'sessions'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;
