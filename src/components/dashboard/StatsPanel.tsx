import React from 'react';
import { Clock, AlertCircle, Brain, Target } from 'lucide-react';

interface StatsPanelProps {
  stats: {
    totalSessions: number;
    totalFocusTime: number; // in minutes
    avgSessionLength: number; // in minutes
    avgInterruptions: number;
  };
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-primary-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalSessions}</p>
          </div>
          <div className="p-3 bg-primary-100 rounded-lg">
            <Target className="h-5 w-5 text-primary-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-secondary-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Focus Time</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalFocusTime} min</p>
          </div>
          <div className="p-3 bg-secondary-100 rounded-lg">
            <Clock className="h-5 w-5 text-secondary-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-accent-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Avg. Session Length</p>
            <p className="text-2xl font-bold text-gray-800">{stats.avgSessionLength} min</p>
          </div>
          <div className="p-3 bg-accent-100 rounded-lg">
            <Brain className="h-5 w-5 text-accent-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-error-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Avg. Interruptions</p>
            <p className="text-2xl font-bold text-gray-800">{stats.avgInterruptions}</p>
          </div>
          <div className="p-3 bg-error-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-error-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;