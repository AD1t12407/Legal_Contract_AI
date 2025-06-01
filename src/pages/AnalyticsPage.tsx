import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--primary-gradient)' }}
          >
            <Activity className="h-10 w-10" style={{ color: 'white' }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Analytics Dashboard
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive insights into your learning journey and productivity patterns
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-6 text-center"
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: '#4F46E520', color: '#4F46E5' }}
            >
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              85%
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Productivity Score
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-6 text-center"
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: '#10B98120', color: '#10B981' }}
            >
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              127
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Focus Sessions
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-6 text-center"
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: '#F59E0B20', color: '#F59E0B' }}
            >
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              42h
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Total Focus Time
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-6 text-center"
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: '#8B5CF620', color: '#8B5CF6' }}
            >
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              15
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Day Streak
            </p>
          </motion.div>
        </div>

        {/* Main Analytics Dashboard */}
        <AnalyticsDashboard />
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
