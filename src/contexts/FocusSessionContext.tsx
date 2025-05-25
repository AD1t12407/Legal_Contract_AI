import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebSocket } from './WebSocketContext';
import { fetchSessions, fetchLearnings, createLearning } from '../api/sessionsApi';
import { parseISO, isValid } from 'date-fns';

export interface Interruption {
  id: string;
  time: string;
  type: 'tabSwitch' | 'idle' | 'external';
  details?: string;
}

export interface Learning {
  id: string;
  sessionId: string;
  content: string;
  createdAt: string;
  resources?: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'book' | 'other';
  }[];
  quiz?: {
    question: string;
    options?: string[];
    answer?: string;
    explanation?: string;
  }[];
}

export interface FocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  interruptions: Interruption[];
  learnings?: Learning[];
}

interface Stats {
  totalSessions: number;
  totalFocusTime: number; // in minutes
  avgSessionLength: number; // in minutes
  avgInterruptions: number;
}

interface FocusSessionContextType {
  focusSessions: FocusSession[];
  learnings: Learning[];
  stats: Stats;
  activeFocusSession: FocusSession | null;
  startFocusSession: () => void;
  stopFocusSession: () => void;
  addLearning: (content: string) => Promise<void>;
  isActive: boolean;
  isLoading: boolean;
}

const FocusSessionContext = createContext<FocusSessionContextType | undefined>(undefined);

// Utility function to validate dates
const validateDateTime = (dateTimeStr: string): boolean => {
  if (!dateTimeStr) return false;
  try {
    const date = parseISO(dateTimeStr);
    return isValid(date);
  } catch (e) {
    console.error('Invalid date format:', dateTimeStr);
    return false;
  }
};

// Utility function to safely calculate duration
const calculateDuration = (startTime: string, endTime: string): number => {
  try {
    if (!validateDateTime(startTime) || !validateDateTime(endTime)) {
      return 0;
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end.getTime() - start.getTime()) / 1000;
  } catch (e) {
    console.error('Error calculating duration:', e);
    return 0;
  }
};

export const FocusSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [activeFocusSession, setActiveFocusSession] = useState<FocusSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, lastEvent } = useWebSocket();

  const stats: Stats = {
    totalSessions: focusSessions.length,
    totalFocusTime: Math.round(focusSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60),
    avgSessionLength: focusSessions.length > 0 
      ? Math.round(focusSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / focusSessions.length / 60) 
      : 0,
    avgInterruptions: focusSessions.length > 0
      ? Math.round(focusSessions.reduce((acc, session) => acc + (session.interruptions?.length || 0), 0) / focusSessions.length)
      : 0,
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching initial data from API...');
        
        // Fetch sessions
        let sessionsData: FocusSession[] = [];
        try {
          const sessions = await fetchSessions();
          console.log('Fetched sessions:', sessions);
          
          if (sessions && sessions.length > 0) {
            // Validate sessions data
            sessionsData = sessions.map(session => ({
              ...session,
              interruptions: session.interruptions || []
            }));
          } else {
            console.log('No sessions from API, using mock data');
            sessionsData = mockSessions;
          }
        } catch (error) {
          console.error('Failed to fetch sessions:', error);
          sessionsData = mockSessions;
        }
        
        // Set sessions
        setFocusSessions(sessionsData);
        
        // Fetch learnings
        let learningsData: Learning[] = [];
        try {
          const learningItems = await fetchLearnings();
          console.log('Fetched learnings:', learningItems);
          
          if (learningItems && learningItems.length > 0) {
            // Filter out duplicates by ID
            learningsData = Array.from(
              new Map(learningItems.map(item => [item.id, item])).values()
            );
          } else {
            console.log('No learnings from API, using mock data');
            learningsData = mockLearnings;
          }
        } catch (error) {
          console.error('Failed to fetch learnings:', error);
          learningsData = mockLearnings;
        }
        
        // Set learnings
        setLearnings(learningsData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        
        // Use mock data for development
        setFocusSessions(mockSessions);
        setLearnings(mockLearnings);
      } finally {
        setIsLoading(false);
      }
    };

    // Use the existing mock data
    const mockSessions = [
      {
        id: '1',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
        duration: 60 * 60, // 1 hour
        interruptions: [
          { id: '1', time: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString(), type: 'tabSwitch', details: 'Switched to Twitter' },
          { id: '2', time: new Date(Date.now() - 1000 * 60 * 60 * 23.2).toISOString(), type: 'idle', details: 'Idle for 5 minutes' }
        ] as Interruption[],
      },
      {
        id: '2',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
        duration: 60 * 60, // 1 hour
        interruptions: [
          { id: '3', time: new Date(Date.now() - 1000 * 60 * 60 * 47.5).toISOString(), type: 'external', details: 'Phone notification' }
        ] as Interruption[]
      },
      {
        id: '3',
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString(),
        duration: 60 * 60, // 1 hour
        interruptions: []
      }
    ] as FocusSession[];

    const mockLearnings = [
      {
        id: '1',
        sessionId: '2',
        content: 'React useEffect hook dependencies need careful management to prevent infinite loops',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
        resources: [
          { title: 'React useEffect Explained', url: 'https://reactjs.org/docs/hooks-effect.html', type: 'article' as const }
        ],
        quiz: [
          { question: 'What happens if you omit dependencies in useEffect?', options: ['Nothing', 'It runs only once', 'It runs on every render', 'It throws an error'], answer: 'It runs on every render' }
        ]
      },
      {
        id: '2',
        sessionId: '3',
        content: 'TypeScript generics provide type safety for components that work with various data types',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString(),
        resources: [
          { title: 'TypeScript Generics Guide', url: 'https://www.typescriptlang.org/docs/handbook/generics.html', type: 'article' as const }
        ]
      },
      {
        id: '3',
        sessionId: '1',
        content: 'WebSockets enable real-time bidirectional communication between client and server',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
        resources: [
          { title: 'WebSockets API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', type: 'article' as const },
          { title: 'Build Real-time Apps with WebSockets', url: 'https://www.youtube.com/watch?v=ZwFA3YMfkoc', type: 'video' as const }
        ],
        quiz: [
          { question: 'What protocol do WebSockets use?', options: ['HTTP', 'HTTPS', 'WSS', 'TCP'], answer: 'WSS' }
        ]
      }
    ] as Learning[];

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!lastEvent) return;

    // Add throttling for interruptions
    const handleInterruption = () => {
      if (isActive && activeFocusSession) {
        // Handle tab switch interruption
        if (lastEvent.type === 'tabSwitch') {
          setActiveFocusSession(prev => {
            if (!prev) return prev;
            
            // Check if we already have too many interruptions (to prevent UI overload)
            if (prev.interruptions.length >= 50) {
              console.warn('Too many interruptions, limiting to 50');
              return prev;
            }
            
            // Check if this is a duplicate event (similar timing)
            const lastInterruption = prev.interruptions[prev.interruptions.length - 1];
            if (lastInterruption) {
              const lastTime = new Date(lastInterruption.time).getTime();
              const currentTime = new Date(lastEvent.time).getTime();
              
              // If less than 5 seconds between events of the same type, ignore
              if (
                lastInterruption.type === 'tabSwitch' && 
                (currentTime - lastTime) < 5000
              ) {
                console.log('Ignoring duplicate tab switch event');
                return prev;
              }
            }
            
            return {
              ...prev,
              interruptions: [
                ...prev.interruptions,
                { 
                  id: Date.now().toString(), 
                  time: new Date().toISOString(), 
                  type: 'tabSwitch',
                  details: lastEvent.details || 'Tab switched' 
                }
              ]
            };
          });
        } 
        // Handle idle interruption
        else if (lastEvent.type === 'idle') {
          setActiveFocusSession(prev => {
            if (!prev) return prev;
            
            // Check if we already have too many interruptions 
            if (prev.interruptions.length >= 50) {
              console.warn('Too many interruptions, limiting to 50');
              return prev;
            }
            
            // Check if this is a duplicate event (similar timing)
            const lastInterruption = prev.interruptions[prev.interruptions.length - 1];
            if (lastInterruption) {
              const lastTime = new Date(lastInterruption.time).getTime();
              const currentTime = new Date(lastEvent.time).getTime();
              
              // If less than 10 seconds between events of the same type, ignore
              if (
                lastInterruption.type === 'idle' && 
                (currentTime - lastTime) < 10000
              ) {
                console.log('Ignoring duplicate idle event');
                return prev;
              }
            }
            
            return {
              ...prev,
              interruptions: [
                ...prev.interruptions,
                { 
                  id: Date.now().toString(), 
                  time: new Date().toISOString(), 
                  type: 'idle',
                  details: lastEvent.details || 'Idle detected' 
                }
              ]
            };
          });
        }
      }
    };

    // Execute with throttling
    handleInterruption();
  }, [lastEvent, isActive, activeFocusSession]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) {
      console.log('No WebSocket connection available for FocusSessionContext');
      return;
    }
    
    console.log('Setting up WebSocket message handler in FocusSessionContext');
    
    const handleMessage = (event: MessageEvent) => {
      try {
        // Safe JSON parsing with error handling
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (parseError) {
          console.error('Failed to parse WebSocket message:', parseError, event.data);
          return;
        }
        
        console.log('Received WebSocket message in FocusSessionContext:', data);
        
        if (data.type === 'learning-update' && data.data) {
          const updatedLearning = data.data;
          
          setLearnings(prevLearnings => {
            if (!prevLearnings) return [updatedLearning];
            
            // Check if this learning already exists
            const exists = prevLearnings.some(item => item.id === updatedLearning.id);
            
            if (exists) {
              // Replace existing item
              return prevLearnings.map(item => 
                item.id === updatedLearning.id ? updatedLearning : item
              );
            } else {
              // Add new item
              return [...prevLearnings, updatedLearning];
            }
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };
    
    // Set the message handler
    socket.onmessage = handleMessage;
    
    // Also try using addEventListener as a fallback for better compatibility
    try {
      socket.addEventListener('message', handleMessage);
    } catch (e) {
      console.warn('Could not add event listener to WebSocket, using onmessage only');
    }
    
    // Cleanup
    return () => {
      if (socket) {
        console.log('Cleaning up WebSocket handlers in FocusSessionContext');
        socket.onmessage = null;
        try {
          socket.removeEventListener('message', handleMessage);
        } catch (e) {
          console.warn('Error removing event listener:', e);
        }
      }
    };
  }, [socket]);

  const startFocusSession = () => {
    const newSession: FocusSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      interruptions: [],
    };
    
    setActiveFocusSession(newSession);
    setIsActive(true);
    
    // Safely emit the WebSocket event
    if (socket && typeof socket.emit === 'function') {
      try {
        socket.emit('startSession', {
          sessionId: newSession.id,
          startTime: newSession.startTime
        });
      } catch (error) {
        console.error('Error emitting startSession event:', error);
      }
    }
  };

  const stopFocusSession = () => {
    if (!activeFocusSession) return;
    
    const endTime = new Date().toISOString();
    const duration = calculateDuration(activeFocusSession.startTime, endTime);
    
    const completedSession = {
      ...activeFocusSession,
      endTime,
      duration,
    };
    
    setFocusSessions(prev => [completedSession, ...prev]);
    setActiveFocusSession(null);
    setIsActive(false);
    
    // Safely emit the WebSocket event
    if (socket && typeof socket.emit === 'function') {
      try {
        socket.emit('endSession', { 
          sessionId: completedSession.id, 
          endTime, 
          duration,
          interruptions: completedSession.interruptions 
        });
      } catch (error) {
        console.error('Error emitting endSession event:', error);
      }
    }
  };

  const addLearning = async (content: string) => {
    try {
      // Get active session ID or use test session if none is active
      const sessionId = activeFocusSession?.id || 'test-session-123';
      
      // Prepare learning data for the API
      const learningData = {
        session_id: sessionId,  // Use session_id to match the backend model
        content,
        role: 'student'
      };
      
      console.log('Submitting learning:', learningData);
      
      // Send to API and get the response
      const newLearning = await createLearning(learningData);
      console.log('Created learning:', newLearning);
      
      // Always ensure we have resources and quiz data
      const withPlaceholders = {
        ...newLearning,
        resources: newLearning.resources || [{ 
          title: 'Resources are being generated...', 
          url: '#', 
          type: 'article' as const 
        }],
        quiz: newLearning.quiz || [{
          question: 'What is a key concept in your learning?',
          options: [
            'Understanding core principles',
            'Exploring new ideas',
            'Building practical knowledge',
            'Developing learning strategies'
          ],
          answer: 'Exploring new ideas',
          explanation: 'Learning involves exploring new ideas to expand knowledge.'
        }]
      };

      // Add to local state avoiding duplicates
      setLearnings(prev => {
        // Check if this learning already exists
        const exists = prev.some(item => item.id === newLearning.id);
        if (exists) {
          // Replace existing item
          return prev.map(item => 
            item.id === newLearning.id ? withPlaceholders : item
          );
        } else {
          // Add new item
          return [withPlaceholders, ...prev];
        }
      });

      // Safely emit the WebSocket event
      if (socket && typeof socket.emit === 'function') {
        try {
          socket.emit('addLearning', {
            sessionId,
            content,
          });
        } catch (error) {
          console.error('Error emitting addLearning event:', error);
        }
      }
    } catch (error) {
      console.error('Failed to add learning:', error);
    }
  };

  return (
    <FocusSessionContext.Provider value={{
      focusSessions,
      learnings,
      stats,
      activeFocusSession,
      startFocusSession,
      stopFocusSession,
      addLearning,
      isActive,
      isLoading
    }}>
      {children}
    </FocusSessionContext.Provider>
  );
};

export const useFocusSession = () => {
  const context = useContext(FocusSessionContext);
  if (context === undefined) {
    throw new Error('useFocusSession must be used within a FocusSessionProvider');
  }
  return context;
};

export default FocusSessionContext;