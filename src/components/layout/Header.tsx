import React, { useState } from 'react';
import { Menu, Bell, X, User, LayoutDashboard, BookOpen, Settings, LogOut, PanelLeftClose } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useFocusSession from '../../hooks/useFocusSession';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from './Layout';

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isActive } = useFocusSession();
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  return (
    <header
      className={`border-b ${isActive ? 'border-b-2' : ''}`}
      style={{
        background: 'var(--bg-card)',
        borderColor: isActive ? 'var(--text-accent)' : 'var(--border)'
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Desktop Sidebar Toggle */}
          <div className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}
            >
              <PanelLeftClose className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Focus Session Indicator */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)' }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--text-accent)' }}></div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-accent)' }}>Focus Session Active</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg transition-colors relative"
              style={{
                color: 'var(--text-secondary)',
                background: showNotifications ? 'var(--surface)' : 'transparent'
              }}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-xs" style={{ background: '#ef4444', color: 'white' }}>
                3
              </span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 card"
                >
                  <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 border-b transition-colors" style={{ borderColor: 'var(--border)', background: 'transparent' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>You completed a 30-minute focus session!</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>2 hours ago</p>
                    </div>
                    <div className="p-3 border-b transition-colors" style={{ borderColor: 'var(--border)', background: 'transparent' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Your learning about React hooks was enriched</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Yesterday</p>
                    </div>
                    <div className="p-3 transition-colors" style={{ background: 'transparent' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>New quiz generated for your TypeScript learning</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>2 days ago</p>
                    </div>
                  </div>
                  <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button className="w-full text-center text-xs py-1 transition-colors" style={{ color: 'var(--text-accent)' }}>
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg transition-colors"
              style={{
                background: showUserMenu ? 'var(--surface)' : 'transparent'
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--primary-gradient)' }}
              >
                <User className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
              </div>
              <span className="text-sm font-medium hidden md:block" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </span>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 card"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                    <div className="py-1">
                      <button className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center space-x-2" style={{ color: 'var(--text-secondary)' }}>
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center space-x-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 glass-card border-r border-white/10 z-50 md:hidden"
              style={{ background: 'var(--bg-card)' }}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-gradient)' }}>
                      <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        AutoPom
                      </h1>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Learning Platform
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMobileMenu(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <div className="space-y-2">
                  {[
                    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
                    { href: '/learning', label: 'Learning', icon: BookOpen },
                    { href: '/settings', label: 'Settings', icon: Settings }
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200"
                        style={{ color: 'var(--text-secondary)' }}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </motion.a>
                    );
                  })}
                </div>
              </nav>

              {/* User Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                <div className="flex items-center space-x-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-gradient)' }}>
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;