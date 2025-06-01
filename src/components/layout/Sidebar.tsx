import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, Settings, Brain, Globe, Users, Wifi, BarChart3, Trophy, Menu, X } from 'lucide-react';
import { useSidebar } from './Layout';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/learning', label: 'Learning', icon: BookOpen },
    { path: '/ai-tutor', label: 'AI Tutor', icon: Brain },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/gamification', label: 'Achievements', icon: Trophy },
    { path: '/vernacular-learning', label: 'Vernacular Learning', icon: Globe },
    { path: '/digital-bridge', label: 'Digital Bridge', icon: Wifi },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex md:flex-col h-screen glass-card border-r border-white/10 relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-purple-600/5 to-teal-600/5"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>

      {/* Header with Toggle */}
      <div className="relative p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'var(--primary-gradient)' }}
                >
                  <Brain className="h-5 w-5" style={{ color: 'white' }} />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AutoPom
                  </h1>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Learning Platform
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative flex-1 py-6 px-3">
        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    active ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                  style={{
                    background: active
                      ? 'var(--primary-gradient)'
                      : 'transparent'
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'var(--primary-gradient)' }}
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Hover effect */}
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    active ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                  }`} style={{ background: 'rgba(255, 255, 255, 0.05)' }} />

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10"
                  >
                    <IconComponent className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                  </motion.div>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Glow effect for active item */}
                  {active && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm opacity-50" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Enhanced Footer Stats */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative p-4"
          >
            <motion.div
              className="glass-card p-4 rounded-xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Focus Stats
                </h3>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Today:</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>45 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>This week:</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>4.5 hrs</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Weekly Goal</span>
                  <span style={{ color: 'var(--text-primary)' }}>45%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    transition={{ duration: 1, delay: 1 }}
                    className="h-full rounded-full"
                    style={{ background: 'var(--accent-gradient)' }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-center space-x-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <span>Keep up the great work!</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed State Indicator */}
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative p-4 flex justify-center"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-gradient)' }}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar;