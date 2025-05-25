import React, { useState } from 'react';
import { Menu, Bell, X, User, LayoutDashboard, BookOpen, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useFocusSession from '../../hooks/useFocusSession';

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isActive } = useFocusSession();
  
  return (
    <header className={`bg-white border-b border-gray-200 ${isActive ? 'border-b-2 border-primary-500' : ''}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center md:hidden">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {isActive && (
          <div className="hidden md:flex items-center">
            <div className="animate-pulse-slow h-2.5 w-2.5 bg-primary-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-primary-600">Focus Session Active</span>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                3
              </span>
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">You completed a 30-minute focus session!</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                    <div className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">Your learning about React hooks was enriched</p>
                      <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                    </div>
                    <div className="p-3 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">New quiz generated for your TypeScript learning</p>
                      <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button className="w-full text-center text-xs text-primary-600 hover:text-primary-500 py-1">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-0 bg-primary-900 z-50 md:hidden"
          >
            <div className="p-4 flex justify-between items-center border-b border-primary-800">
              <h1 className="text-xl font-bold text-white">AutoPom</h1>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-4">
                <li>
                  <a href="/" className="text-white flex items-center py-2 px-4 rounded hover:bg-primary-800">
                    <LayoutDashboard className="h-5 w-5 mr-3" /> 
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/learning" className="text-white flex items-center py-2 px-4 rounded hover:bg-primary-800">
                    <BookOpen className="h-5 w-5 mr-3" /> 
                    Learning
                  </a>
                </li>
                <li>
                  <a href="/settings" className="text-white flex items-center py-2 px-4 rounded hover:bg-primary-800">
                    <Settings className="h-5 w-5 mr-3" /> 
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;