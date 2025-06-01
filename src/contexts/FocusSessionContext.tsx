import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebSocket } from './WebSocketContext';
import { fetchSessions, fetchLearnings, createLearning } from '../api/sessionsApi';
import {
  createLearningCard,
  getLearningCards,
  LearningCard as APILearningCard
} from '../api/learningApi';
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
  role?: string;
  processed?: boolean;
  resources?: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'book' | 'course' | 'pdf' | 'other';
    snippet?: string;
  }[];
  quiz?: {
    question: string;
    options?: string[];
    answer?: string;
    correct_answer?: string;
    explanation?: string;
  }[];
}

// Helper function to convert API learning card to our Learning interface
const convertAPILearningToLearning = (apiLearning: APILearningCard): Learning => {
  return {
    id: apiLearning.id,
    sessionId: apiLearning.session_id,
    content: apiLearning.content,
    createdAt: apiLearning.created_at,
    role: apiLearning.role,
    processed: apiLearning.processed,
    resources: apiLearning.resources?.map(resource => ({
      title: resource.title,
      url: resource.url,
      type: resource.type as 'article' | 'video' | 'book' | 'course' | 'pdf' | 'other',
      snippet: resource.snippet
    })),
    quiz: apiLearning.quiz?.map(quiz => ({
      question: quiz.question,
      options: quiz.options,
      answer: quiz.correct_answer,
      correct_answer: quiz.correct_answer,
      explanation: quiz.explanation
    }))
  };
};

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
        
        // Fetch learnings using new learning cards API
        let learningsData: Learning[] = [];
        try {
          console.log('🤖 Fetching learning cards from agent system...');
          const apiLearningCards = await getLearningCards();
          console.log('Fetched learning cards:', apiLearningCards);

          if (apiLearningCards && apiLearningCards.length > 0) {
            // Convert API learning cards to our Learning interface
            learningsData = apiLearningCards.map(convertAPILearningToLearning);
            console.log('✅ Converted learning cards:', learningsData);
            console.log('✅ Learning cards count:', learningsData.length);
          } else {
            console.log('No learning cards from API, using mock data');
            learningsData = mockLearnings;
          }
        } catch (error) {
          console.error('❌ Failed to fetch learning cards:', error);
          // Try fallback to old API
          try {
            const learningItems = await fetchLearnings();
            console.log('Fetched learnings from fallback API:', learningItems);

            if (learningItems && learningItems.length > 0) {
              learningsData = Array.from(
                new Map(learningItems.map(item => [item.id, item])).values()
              );
            } else {
              learningsData = mockLearnings;
            }
          } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError);
            learningsData = mockLearnings;
          }
        }
        
        // Set learnings
        console.log('🔄 Setting learnings data:', learningsData);
        setLearnings(learningsData);
        console.log('✅ Learnings state updated');
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

      console.log('🤖 Creating learning card with agent system...');
      console.log('Content:', content);

      // Use the new learning cards API with agent system
      const apiLearningCard = await createLearningCard({
        session_id: sessionId,
        content,
        role: 'student'
      });

      console.log('✅ Created learning card:', apiLearningCard);

      // Convert API response to our Learning interface
      const newLearning = convertAPILearningToLearning(apiLearningCard);

      // Add placeholder content while agent system processes
      const withPlaceholders = {
        ...newLearning,
        resources: newLearning.resources?.length ? newLearning.resources : [{
          title: '🤖 AI agents are finding educational resources...',
          url: '#',
          type: 'article' as const,
          snippet: 'Our AI agents are searching for the best educational resources related to your learning content.'
        }],
        quiz: newLearning.quiz?.length ? newLearning.quiz : [{
          question: '🧠 AI is generating quiz questions...',
          options: [
            'Quiz questions are being generated',
            'Please wait while AI processes your content',
            'This will be updated automatically',
            'Agent system is working'
          ],
          answer: 'This will be updated automatically',
          explanation: 'Our AI agents are analyzing your learning content to generate relevant quiz questions.'
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

      // Start polling for updates from agent system
      const pollForUpdates = async () => {
        let attempts = 0;
        const maxAttempts = 10; // Poll for up to 30 seconds (3s intervals)

        const poll = async () => {
          try {
            attempts++;
            console.log(`🔄 Polling for agent updates (attempt ${attempts}/${maxAttempts})...`);

            const updatedCards = await getLearningCards();
            const targetCard = updatedCards.find(card => card.id === apiLearningCard.id);

            if (targetCard && targetCard.processed) {
              console.log('✅ Agent processing complete! Updating learning card...');
              const updatedLearning = convertAPILearningToLearning(targetCard);

              setLearnings(prev =>
                prev.map(item =>
                  item.id === updatedLearning.id ? updatedLearning : item
                )
              );
              return; // Stop polling
            }

            if (attempts < maxAttempts) {
              setTimeout(poll, 3000); // Poll every 3 seconds
            } else {
              console.log('⏰ Polling timeout - agent may still be processing');
            }
          } catch (error) {
            console.error('Error polling for updates:', error);
          }
        };

        // Start polling after a short delay
        setTimeout(poll, 2000);
      };

      pollForUpdates();

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

      console.log('✅ Learning card created and agent processing started');
    } catch (error) {
      console.error('❌ Failed to create learning card:', error);
      throw error;
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