import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Filter, Search, Tag, Loader, Plus, Sparkles } from 'lucide-react';
import LearningCard from '../components/learning/LearningCard';
import LearningForm from '../components/learning/LearningForm';
import { useFocusSession } from '../contexts/FocusSessionContext';

const LearningPage: React.FC = () => {
  const { learnings, isLoading } = useFocusSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Debug: Log learnings data
  console.log('🔍 LearningPage - learnings:', learnings);
  console.log('🔍 LearningPage - isLoading:', isLoading);
  console.log('🔍 LearningPage - learnings.length:', learnings?.length);

  const filteredLearnings = learnings.filter(learning => {
    const matchesSearch = learning.content.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeFilter) {
      case 'recent':
        // Show learnings from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesSearch && new Date(learning.createdAt || '') > weekAgo;
      case 'resources':
        return matchesSearch && learning.resources && learning.resources.length > 0;
      case 'quiz':
        return matchesSearch && learning.quiz && learning.quiz.length > 0;
      default:
        return matchesSearch;
    }
  });

  const filters = [
    { id: 'all', label: 'All Cards', icon: Book },
    { id: 'recent', label: 'Recent', icon: Sparkles },
    { id: 'resources', label: 'With Resources', icon: Tag },
    { id: 'quiz', label: 'With Quiz', icon: Tag }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
          <div className="relative glass-card p-8 rounded-3xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 mb-6 md:mb-0">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  <Book className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Learning Cards
                  </h1>
                  <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                    Capture and organize your learning journey with AI-enhanced insights
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Search your learning cards..."
                    className="pl-12 pr-4 py-3 w-80 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)',
                      backdropFilter: 'blur(10px)'
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg"
                  style={{ background: 'var(--primary-gradient)', color: 'white' }}
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="h-5 w-5" />
                  <span>New Card</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6 mb-8 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-gradient)' }}>
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Filters</span>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {filteredLearnings.length} cards found
                </p>
              </div>
            </div>

            {activeFilter !== 'all' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveFilter('all')}
                className="text-sm px-3 py-1 rounded-lg"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
              >
                Clear filters
              </motion.button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map((filter, index) => {
              const IconComponent = filter.icon;
              const isActive = activeFilter === filter.id;

              return (
                <motion.button
                  key={filter.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter.id)}
                  className="px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: isActive ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'transparent' : 'rgba(255, 255, 255, 0.1)'}`
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0"
                      style={{ background: 'var(--primary-gradient)' }}
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <IconComponent className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{filter.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Debug Info */}
        <div className="mb-4 p-4 rounded-lg" style={{ background: 'rgba(255,255,0,0.1)', border: '1px solid rgba(255,255,0,0.3)' }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>🔍 Debug Info:</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Loading: {isLoading ? 'Yes' : 'No'} |
            Learnings Count: {learnings?.length || 0} |
            Filtered Count: {filteredLearnings?.length || 0}
          </p>
          {learnings?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                First learning: {learnings[0]?.content?.substring(0, 50)}...
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="card text-center py-16">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto"
              style={{ background: 'var(--primary-gradient)' }}
            >
              <Loader className="h-8 w-8 animate-spin" style={{ color: 'white' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Loading learning cards...
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Please wait while we fetch your learning content.
            </p>
          </div>
        ) : filteredLearnings.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {filteredLearnings.map((learning, index) => (
              <motion.div
                key={learning.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <LearningCard learning={learning} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="card text-center py-16">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"
              style={{ background: 'var(--surface)' }}
            >
              <Book className="h-10 w-10" style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchTerm || activeFilter !== 'all' ? 'No matching cards found' : 'No learning cards yet'}
            </h3>
            <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm || activeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start a focus session and capture what you\'ve learned, or create a new learning card manually.'
              }
            </p>
            {(!searchTerm && activeFilter === 'all') && (
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Create Your First Learning Card
              </button>
            )}
          </div>
        )}
      </motion.div>

      {showForm && (
        <LearningForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default LearningPage;