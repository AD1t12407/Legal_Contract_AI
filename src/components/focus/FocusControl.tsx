import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Clock, X, BrainCircuit, AlertTriangle } from 'lucide-react';
import useFocusSession from '../../hooks/useFocusSession';
import LearningPrompt from '../learning/LearningPrompt';

const FocusControl: React.FC = () => {
  const { isActive, startFocusSession, stopFocusSession, activeFocusSession } = useFocusSession();
  const [elapsed, setElapsed] = useState(0);
  const [showLearningPrompt, setShowLearningPrompt] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive) {
      timer = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStopSession = () => {
    stopFocusSession();
    setShowLearningPrompt(true);
  };
  
  return (
    <>
      <motion.div 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 ${expanded ? 'h-64' : 'h-16'}`}
        initial={false}
        animate={{ height: expanded ? '16rem' : '4rem' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {isActive ? (
            <>
              <div className="flex items-center">
                <div className="animate-pulse-slow h-3 w-3 bg-primary-500 rounded-full mr-2"></div>
                <span className="font-medium text-primary-600">Focus Session</span>
                <div className="ml-3 px-2 py-1 bg-gray-100 rounded text-gray-800 font-mono">
                  {formatTime(elapsed)}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {activeFocusSession?.interruptions.length > 0 && (
                  <button 
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center text-error-600 text-sm"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {activeFocusSession.interruptions.length} Interruptions
                  </button>
                )}
                
                <button
                  onClick={handleStopSession}
                  className="bg-error-100 text-error-700 hover:bg-error-200 px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  End Session
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-600">Ready to focus?</span>
              </div>
              
              <button
                onClick={startFocusSession}
                className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Focus Session
              </button>
            </>
          )}
        </div>
        
        {expanded && isActive && (
          <div className="h-48 px-4 py-3 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-800">Session Interruptions</h3>
              <button 
                onClick={() => setExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {activeFocusSession?.interruptions.map((interruption, index) => (
              <div key={index} className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    {interruption.type === 'tabSwitch' ? (
                      <div className="h-2 w-2 bg-warning-500 rounded-full mr-2"></div>
                    ) : (
                      <div className="h-2 w-2 bg-error-500 rounded-full mr-2"></div>
                    )}
                    <span className="text-sm font-medium">
                      {interruption.type === 'tabSwitch' ? 'Tab Switch' : 'Idle Period'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(interruption.time).toLocaleTimeString()}
                  </span>
                </div>
                {interruption.details && (
                  <p className="text-xs text-gray-600 ml-4 mt-1">{interruption.details}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {showLearningPrompt && (
          <LearningPrompt onClose={() => setShowLearningPrompt(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default FocusControl;