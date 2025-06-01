import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Crown, Award } from 'lucide-react';
import GamificationDashboard from '../components/gamification/GamificationDashboard';

const GamificationPage: React.FC = () => {
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
            style={{ background: 'var(--accent-gradient)' }}
          >
            <Trophy className="h-10 w-10" style={{ color: 'white' }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Achievements & Progress
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Track your learning journey, earn achievements, and compete with others
          </p>
        </div>

        {/* Quick Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-6 text-center"
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: '#FFD70020', color: '#FFD700' }}
            >
              <Crown className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Level 12
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Current Level
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-6 text-center"
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: '#4F46E520', color: '#4F46E5' }}
            >
              <Star className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              2,450
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Total XP
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
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              18
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Achievements
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-6 text-center"
          >
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: '#EF444420', color: '#EF4444' }}
            >
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              #7
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Leaderboard Rank
            </p>
          </motion.div>
        </div>

        {/* Main Gamification Dashboard */}
        <GamificationDashboard />
      </motion.div>
    </div>
  );
};

export default GamificationPage;
