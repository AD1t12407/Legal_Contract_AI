import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Settings, Brain } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/learning', label: 'Learning', icon: BookOpen },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <div className="hidden md:flex md:flex-col w-64 bg-primary-900 text-white">
      <div className="p-4 flex items-center">
        <Brain className="h-8 w-8 text-white mr-2" />
        <h1 className="text-xl font-bold">AutoPom</h1>
      </div>
      
      <div className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 text-sm
                    ${isActive(item.path) 
                      ? 'bg-primary-800 text-white font-medium border-l-4 border-accent-400' 
                      : 'text-gray-300 hover:bg-primary-800 hover:text-white'}
                  `}
                >
                  <IconComponent className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="p-4">
        <div className="bg-primary-800 rounded-lg p-3">
          <h3 className="text-sm font-medium mb-2">Focus Stats</h3>
          <div className="text-xs text-gray-300">
            <p className="flex justify-between mb-1">
              <span>Today:</span>
              <span>45 min</span>
            </p>
            <p className="flex justify-between">
              <span>This week:</span>
              <span>4.5 hrs</span>
            </p>
          </div>
          <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-accent-400 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;