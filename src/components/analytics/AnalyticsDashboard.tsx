import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Brain,
  Target,
  Zap,
  Calendar,
  Award,
  Users,
  BookOpen,
  Activity,
  Eye
} from 'lucide-react';

interface AnalyticsData {
  focusAnalytics: any;
  learningAnalytics: any;
  engagementAnalytics: any;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  description 
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className="card p-6"
  >
    <div className="flex items-start justify-between mb-4">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ background: `${color}20`, color }}
      >
        {icon}
      </div>
      {change !== undefined && (
        <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      )}
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </h3>
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      {description && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {description}
        </p>
      )}
    </div>
  </motion.div>
);

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('7'); // days
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [focusResponse, learningResponse, engagementResponse] = await Promise.all([
        fetch(`/api/analytics/focus?days=${timeRange}`),
        fetch(`/api/analytics/learning?days=${timeRange}`),
        fetch(`/api/analytics/engagement?days=${timeRange}`)
      ]);

      const focusData = await focusResponse.json();
      const learningData = await learningResponse.json();
      const engagementData = await engagementResponse.json();

      setAnalyticsData({
        focusAnalytics: focusData,
        learningAnalytics: learningData,
        engagementAnalytics: engagementData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'focus', name: 'Focus', icon: Target },
    { id: 'learning', name: 'Learning', icon: Brain },
    { id: 'engagement', name: 'Engagement', icon: Zap }
  ];

  const timeRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
            style={{ background: 'var(--primary-gradient)' }}
          >
            <Activity className="h-8 w-8 animate-pulse" style={{ color: 'white' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--text-secondary)' }}>No analytics data available</p>
      </div>
    );
  }

  const { focusAnalytics, learningAnalytics, engagementAnalytics } = analyticsData;

  // Prepare chart data
  const focusChartData = focusAnalytics?.productivity_trends?.daily_productivity 
    ? Object.entries(focusAnalytics.productivity_trends.daily_productivity).map(([date, data]: [string, any]) => ({
        date: new Date(date).toLocaleDateString(),
        sessions: data.sessions,
        focusTime: Math.round(data.total_time / 60), // Convert to minutes
        completionRate: Math.round((data.completed_sessions / data.sessions) * 100)
      }))
    : [];

  const learningProgressData = learningAnalytics?.learning_velocity 
    ? Object.entries(learningAnalytics.learning_velocity).map(([date, count]: [string, any]) => ({
        date: new Date(date).toLocaleDateString(),
        learnings: count
      }))
    : [];

  const subjectDistribution = learningAnalytics?.topic_analysis 
    ? Object.entries(learningAnalytics.topic_analysis).map(([subject, count]: [string, any]) => ({
        name: subject,
        value: count,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Analytics Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Comprehensive insights into your learning and productivity
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Focus Time"
              value={`${Math.round(focusAnalytics?.basic_metrics?.total_focus_time_minutes || 0)}m`}
              change={12}
              icon={<Clock className="h-6 w-6" />}
              color="var(--text-accent)"
              description="This week"
            />
            
            <MetricCard
              title="Learning Cards"
              value={learningAnalytics?.basic_metrics?.total_learnings || 0}
              change={8}
              icon={<Brain className="h-6 w-6" />}
              color="#10B981"
              description="Created this week"
            />
            
            <MetricCard
              title="Completion Rate"
              value={`${Math.round((focusAnalytics?.basic_metrics?.completion_rate || 0) * 100)}%`}
              change={-3}
              icon={<Target className="h-6 w-6" />}
              color="#F59E0B"
              description="Session completion"
            />
            
            <MetricCard
              title="Streak"
              value={`${engagementAnalytics?.streak_info?.current_streak || 0} days`}
              icon={<Zap className="h-6 w-6" />}
              color="#EF4444"
              description="Current streak"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Focus Trend */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Focus Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={focusChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="focusTime" 
                      stroke="var(--text-accent)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--text-accent)', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Learning Progress
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={learningProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="learnings" 
                      fill="url(#learningGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="learningGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Focus Tab */}
      {activeTab === 'focus' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Focus Patterns */}
            <div className="lg:col-span-2 card p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Daily Focus Sessions
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={focusChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fill: 'var(--text-secondary)' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" name="Sessions" fill="var(--text-accent)" />
                    <Bar dataKey="focusTime" name="Focus Time (min)" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Focus Stats */}
            <div className="space-y-6">
              <div className="card p-6">
                <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Focus Statistics
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ color: 'var(--text-secondary)' }}>Avg Session</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {Math.round(focusAnalytics?.basic_metrics?.avg_session_length_minutes || 0)}m
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${Math.min((focusAnalytics?.basic_metrics?.avg_session_length_minutes || 0) / 60 * 100, 100)}%`,
                          background: 'var(--text-accent)'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ color: 'var(--text-secondary)' }}>Completion Rate</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {Math.round((focusAnalytics?.basic_metrics?.completion_rate || 0) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${(focusAnalytics?.basic_metrics?.completion_rate || 0) * 100}%`,
                          background: '#10B981'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Peak Hours
                </h4>
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    <Clock className="h-8 w-8" style={{ color: 'white' }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {focusAnalytics?.focus_patterns?.peak_focus_hour || 'N/A'}:00
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Most productive hour
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Tab */}
      {activeTab === 'learning' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subject Distribution */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Subject Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {subjectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Learning Velocity */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Learning Velocity
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={learningProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fill: 'var(--text-secondary)' }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="learnings" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Current Streak"
              value={`${engagementAnalytics?.streak_info?.current_streak || 0} days`}
              icon={<Zap className="h-6 w-6" />}
              color="#EF4444"
            />
            
            <MetricCard
              title="Longest Streak"
              value={`${engagementAnalytics?.streak_info?.longest_streak || 0} days`}
              icon={<Award className="h-6 w-6" />}
              color="#F59E0B"
            />
            
            <MetricCard
              title="Engagement Score"
              value={`${Math.round(engagementAnalytics?.engagement_score || 0)}/100`}
              icon={<Activity className="h-6 w-6" />}
              color="#8B5CF6"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
