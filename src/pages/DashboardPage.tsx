import React, { useState, useEffect } from 'react';
import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Clock, AlertCircle, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import FocusSessionCard from '../components/dashboard/FocusSessionCard';
import FocusHeatmap from '../components/dashboard/FocusHeatmap';
import StatsPanel from '../components/dashboard/StatsPanel';
import { useFocusSession } from '../contexts/FocusSessionContext';
import { useWebSocket } from '../contexts/WebSocketContext';

const DashboardPage: React.FC = () => {
  const { focusSessions, stats } = useFocusSession();
  const { lastEvent } = useWebSocket();
  const [chartData, setChartData] = useState<any[]>([]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <StatsPanel stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              Focus Sessions
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="duration" name="Duration (min)" fill="#4f46e5" />
                  <Bar dataKey="interruptions" name="Interruptions" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-warning-500" />
              Focus Heatmap
            </h2>
            <FocusHeatmap />
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-accent-600" />
            Recent Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {focusSessions.slice(0, 3).map(session => (
              session.learnings && session.learnings.length > 0 ? (
                <div key={session.id} className="bg-white rounded-lg shadow-md p-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {safeFormatDate(session.startTime, 'MMM dd, yyyy')}
                  </p>
                  <ul className="list-disc pl-5">
                    {session.learnings.slice(0, 2).map((learning, index) => (
                      <li key={index} className="text-gray-700 mb-1">{learning.content}</li>
                    ))}
                  </ul>
                  {session.learnings.length > 2 && (
                    <p className="text-primary-600 text-sm mt-2">+{session.learnings.length - 2} more</p>
                  )}
                </div>
              ) : null
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-error-500" />
            Interruption Insights
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {focusSessions.slice(0, 5).map(session => (
              <FocusSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;