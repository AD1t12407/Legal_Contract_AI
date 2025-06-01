import React, { useState, useEffect } from 'react';
import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  Zap,
  Brain,
  Globe,
  Users,
  Target,
  TrendingUp,
  Mic,
  BookOpen,
  Award,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import FocusSessionCard from '../components/dashboard/FocusSessionCard';
import FocusHeatmap from '../components/dashboard/FocusHeatmap';
import StatsPanel from '../components/dashboard/StatsPanel';
import { useFocusSession } from '../contexts/FocusSessionContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { focusSessions, stats } = useFocusSession();
  const { lastEvent } = useWebSocket();
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isExtensionUser, setIsExtensionUser] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Safe date formatting function
  const safeFormatDate = (dateString: string, formatPattern: string = 'MM/dd') => {
    try {
      if (!dateString || typeof dateString !== 'string') {
        console.warn('Invalid date string provided:', dateString);
        return 'Invalid';
      }

      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after conversion:', dateString);
        return 'Invalid';
      }

      return format(date, formatPattern);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid';
    }
  };

  useEffect(() => {
    if (focusSessions.length > 0) {
      // Transform focus sessions into chart data with validation
      const data = focusSessions.map(session => {
        // Safely format the date with validation
        const formattedDate = safeFormatDate(session.startTime);

        // Calculate duration safely
        const safeDuration = typeof session.duration === 'number' ?
          session.duration / 60 : 0; // Convert to minutes when valid

        // Get interruptions count safely
        const interruptionsCount = session.interruptions?.length || 0;

        return {
          date: formattedDate,
          duration: safeDuration,
          interruptions: interruptionsCount,
        };
      });
      setChartData(data);
    }
  }, [focusSessions]);

  useEffect(() => {
    // Check if user came from extension
    const urlParams = new URLSearchParams(window.location.search);
    const fromExtension = urlParams.get('from') === 'extension';

    if (fromExtension) {
      setIsExtensionUser(true);
      console.log('Welcome from AutoPom Extension!');
    }

    // Check if this is a first-time user (no focus sessions)
    const hasCompletedOnboarding = localStorage.getItem('autopom-onboarding-completed');
    if (!hasCompletedOnboarding && focusSessions.length === 0) {
      setShowOnboarding(true);
    }
  }, [focusSessions]);

  // User-focused helper functions
  const isNewUser = focusSessions.length === 0;
  const hasRecentActivity = focusSessions.some(session => {
    const sessionDate = new Date(session.startTime);
    const daysSince = (Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });

  const getPersonalizedRecommendation = () => {
    if (isNewUser) {
      return {
        title: "🚀 Start Your First Focus Session",
        description: "Begin with a 25-minute focused learning session to experience the power of distraction-free learning.",
        action: "Start Focus Session",
        route: "/",
        priority: "high"
      };
    }

    if (!hasRecentActivity) {
      return {
        title: "📚 Continue Your Learning Journey",
        description: "It's been a while! Resume your learning with a quick session to get back on track.",
        action: "Resume Learning",
        route: "/learning",
        priority: "medium"
      };
    }

    const avgInterruptions = focusSessions.reduce((acc, session) =>
      acc + (session.interruptions?.length || 0), 0) / focusSessions.length;

    if (avgInterruptions > 3) {
      return {
        title: "🎯 Improve Your Focus",
        description: "Try our AI-powered focus techniques to reduce interruptions and boost productivity.",
        action: "Get Focus Tips",
        route: "/ai-tutor",
        priority: "high"
      };
    }

    return {
      title: "⭐ Explore Advanced Features",
      description: "You're doing great! Discover vernacular learning and AI tutoring to enhance your experience.",
      action: "Explore Features",
      route: "/vernacular-learning",
      priority: "low"
    };
  };

  const recommendation = getPersonalizedRecommendation();

  const educationalFeatures = [
    {
      title: 'Start Learning Now',
      subtitle: 'Quick Focus Session',
      description: 'Begin a 25-minute focused learning session with AI-powered insights and distraction blocking.',
      icon: <Target className="w-8 h-8" />,
      gradient: 'var(--primary-gradient)',
      route: '/',
      progress: isNewUser ? 0 : 75,
      status: isNewUser ? 'Ready to Start' : 'Active',
      isRecommended: recommendation.priority === 'high' && recommendation.route === '/',
      userBenefit: 'Boost focus by 300%'
    },
    {
      title: 'AI Learning Assistant',
      subtitle: 'Personalized Tutoring',
      description: 'Get instant help with voice-enabled AI tutor that understands your learning style and pace.',
      icon: <Brain className="w-8 h-8" />,
      gradient: 'var(--secondary-gradient)',
      route: '/ai-tutor',
      progress: 60,
      status: 'Active',
      isRecommended: recommendation.route === '/ai-tutor',
      userBenefit: 'Learn 2x faster'
    },
    {
      title: 'Smart Learning Cards',
      subtitle: 'Capture Knowledge',
      description: 'Automatically organize your learning with AI-enhanced notes and spaced repetition.',
      icon: <BookOpen className="w-8 h-8" />,
      gradient: 'var(--accent-gradient)',
      route: '/learning',
      progress: 85,
      status: 'Active',
      isRecommended: recommendation.route === '/learning',
      userBenefit: 'Remember 90% more'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* User-Focused Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--primary-gradient)' }}
                >
                  <span className="text-xl">
                    {isNewUser ? '🌟' : hasRecentActivity ? '🔥' : '📚'}
                  </span>
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {isNewUser
                      ? `Welcome, ${user?.name || 'Learner'}!`
                      : hasRecentActivity
                        ? `Keep it up, ${user?.name || 'Learner'}!`
                        : `Welcome back, ${user?.name || 'Learner'}!`
                    }
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {isNewUser
                      ? 'Ready to start your focused learning journey?'
                      : hasRecentActivity
                        ? 'You\'re on a great learning streak!'
                        : 'Let\'s get back to learning together'
                    }
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>
                    {focusSessions.length}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Sessions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>
                    {Math.round(focusSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60)}h
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Focused
                  </div>
                </div>
              </div>
            </div>

            {/* Extension Sync Notification */}
            {isExtensionUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-4 p-3 rounded-xl"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <p className="text-white text-sm font-medium">
                  ✨ Extension data synced! Your focus sessions are now tracked across all devices.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Smart Recommendation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div
            className={`glass-card p-6 rounded-2xl border-2 ${
              recommendation.priority === 'high' ? 'border-yellow-400/50' : 'border-blue-400/30'
            }`}
            style={{
              background: recommendation.priority === 'high'
                ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))'
                : 'rgba(59, 130, 246, 0.05)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {recommendation.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {recommendation.description}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(recommendation.route)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  recommendation.priority === 'high'
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {recommendation.action}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* User-Focused Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {isNewUser ? 'Choose Your Learning Path' : 'Continue Your Journey'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isNewUser
                ? 'Pick the perfect way to start your focused learning experience'
                : 'Select your next learning activity based on your goals'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {educationalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`glass-card cursor-pointer group relative overflow-hidden ${
                  feature.isRecommended ? 'ring-2 ring-yellow-400/50' : ''
                }`}
                onClick={() => navigate(feature.route)}
              >
                {/* Recommended Badge */}
                {feature.isRecommended && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                      RECOMMENDED
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Icon and Benefit */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: feature.gradient }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        style={{ color: 'white' }}
                      >
                        {feature.icon}
                      </motion.div>
                    </motion.div>
                    <div className="text-right">
                      <div className="text-xs font-medium" style={{ color: 'var(--text-accent)' }}>
                        {feature.userBenefit}
                      </div>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>

                  {/* Status and Progress */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        feature.status === 'Ready to Start' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {feature.status}
                      </span>
                    </div>
                    {feature.progress > 0 && (
                      <span className="text-xs" style={{ color: 'var(--text-accent)' }}>
                        {feature.progress}% Complete
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {feature.progress > 0 && (
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${feature.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                        className="h-1.5 rounded-full"
                        style={{ background: feature.gradient }}
                      />
                    </div>
                  )}

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      feature.isRecommended
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {isNewUser && index === 0 ? 'Start Now' :
                     feature.isRecommended ? 'Try This' : 'Continue'}
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Progressive Disclosure: Show data sections only when user has data */}
        {!isNewUser && (
          <>
            <StatsPanel stats={stats} />

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
            >
              <div className="card">
                <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Clock className="h-6 w-6 mr-3" style={{ color: 'var(--text-accent)' }} />
                  Your Focus Progress
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey="date"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <YAxis
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ color: 'var(--text-secondary)' }}
                      />
                      <Bar
                        dataKey="duration"
                        name="Duration (min)"
                        fill="url(#durationGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="interruptions"
                        name="Interruptions"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#667eea" />
                          <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Zap className="h-6 w-6 mr-3" style={{ color: 'var(--text-accent)' }} />
                  Focus Heatmap
                </h2>
                <FocusHeatmap />
              </div>
            </motion.div>

            {/* Recent Learning Section - Only show if user has learning data */}
            {focusSessions.some(session => session.learnings && session.learnings.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Brain className="h-6 w-6 mr-3" style={{ color: 'var(--text-accent)' }} />
                  Your Recent Learning
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {focusSessions.slice(0, 3).map(session => (
                    session.learnings && session.learnings.length > 0 ? (
                      <div key={session.id} className="card">
                        <div className="flex items-center mb-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                            style={{ background: 'var(--accent-gradient)' }}
                          >
                            <BookOpen className="h-4 w-4" style={{ color: 'white' }} />
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {safeFormatDate(session.startTime, 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {session.learnings.slice(0, 2).map((learning, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-1.5 h-1.5 rounded-full mt-2 mr-3" style={{ background: 'var(--text-accent)' }}></div>
                              <span className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                {learning.content}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {session.learnings.length > 2 && (
                          <p className="text-sm mt-3 font-medium" style={{ color: 'var(--text-accent)' }}>
                            +{session.learnings.length - 2} more insights
                          </p>
                        )}
                      </div>
                    ) : null
                  ))}
                </div>
              </motion.div>
            )}

            {/* Interruption Insights Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h2 className="text-2xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <AlertCircle className="h-6 w-6 mr-3" style={{ color: '#ef4444' }} />
                Focus Insights
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {focusSessions.slice(0, 5).map(session => (
                  <FocusSessionCard key={session.id} session={session} />
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* New User Onboarding Hint */}
        {isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center py-12"
          >
            <div className="glass-card p-8 rounded-2xl max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary-gradient)' }}>
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Ready to Transform Your Learning?
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Start your first focus session to unlock personalized insights, progress tracking, and AI-powered learning recommendations.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all"
              >
                Start Your First Session
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;