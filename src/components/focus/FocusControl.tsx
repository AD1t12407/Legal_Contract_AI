import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Clock, X, BrainCircuit, AlertTriangle, RotateCcw, Settings, Volume2 } from 'lucide-react';
import useFocusSession from '../../hooks/useFocusSession';
import LearningPrompt from '../learning/LearningPrompt';

const FocusControl: React.FC = () => {
  const { isActive, startFocusSession, stopFocusSession, activeFocusSession } = useFocusSession();
  const [elapsed, setElapsed] = useState(0);
  const [showLearningPrompt, setShowLearningPrompt] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25); // Default 25 minutes
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive) {
      timer = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 1;
          const targetSeconds = sessionDuration * 60;

          // Check if session is complete
          if (newElapsed >= targetSeconds) {
            handleSessionComplete();
            return targetSeconds;
          }

          return newElapsed;
        });
      }, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, sessionDuration]);

  const handleSessionComplete = () => {
    if (soundEnabled) {
      // Play completion sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Fallback if audio fails
        console.log('Session completed!');
      });
    }

    stopFocusSession();
    setShowLearningPrompt(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const targetSeconds = sessionDuration * 60;
    return Math.min((elapsed / targetSeconds) * 100, 100);
  };

  const getRemainingTime = () => {
    const targetSeconds = sessionDuration * 60;
    const remaining = Math.max(targetSeconds - elapsed, 0);
    return formatTime(remaining);
  };

  const handleStopSession = () => {
    stopFocusSession();
    setShowLearningPrompt(true);
  };

  const handleStartSession = () => {
    setElapsed(0);
    startFocusSession();
  };

  const handleResetSession = () => {
    setElapsed(0);
  };

  return (
    <>
      <motion.div
        className={`fixed bottom-0 left-0 right-0 border-t z-40 ${expanded ? 'h-64' : 'h-20'}`}
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border)'
        }}
        initial={false}
        animate={{ height: expanded ? '16rem' : '5rem' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {isActive ? (
            <>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="animate-pulse-slow h-3 w-3 rounded-full mr-3" style={{ background: 'var(--text-accent)' }}></div>
                  <div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Focus Session Active</span>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {sessionDuration} min session
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                      {getRemainingTime()}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      remaining
                    </div>
                  </div>

                  <div className="w-32 h-2 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${getProgress()}%`,
                        background: 'var(--accent-gradient)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {activeFocusSession?.interruptions.length > 0 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center text-sm px-3 py-2 rounded-lg transition-colors"
                    style={{
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {activeFocusSession.interruptions.length} Interruptions
                  </button>
                )}

                <button
                  onClick={handleResetSession}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'var(--surface)'
                  }}
                  title="Reset Timer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={handleStopSession}
                  className="px-4 py-2 rounded-lg flex items-center transition-colors"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444'
                  }}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  End Session
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Ready to focus?</span>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Start a {sessionDuration} minute session
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="px-3 py-1 rounded-lg text-sm border"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value={15}>15 min</option>
                    <option value={25}>25 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    background: showSettings ? 'var(--surface)' : 'transparent'
                  }}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: soundEnabled ? 'var(--text-accent)' : 'var(--text-secondary)',
                    background: 'var(--surface)'
                  }}
                  title={soundEnabled ? 'Sound On' : 'Sound Off'}
                >
                  <Volume2 className="h-4 w-4" />
                </button>

                <button
                  onClick={handleStartSession}
                  className="px-6 py-3 rounded-lg flex items-center transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'var(--primary-gradient)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Focus Session
                </button>
              </div>
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