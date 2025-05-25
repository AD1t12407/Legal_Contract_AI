import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Event {
  type: 'start' | 'stop' | 'tabSwitch' | 'idle';
  time: string;
  details?: string;
  session_id?: string;
}

// Add emit method to our socket type
interface EnhancedWebSocket extends WebSocket {
  emit?: (event: string, data: any) => void;
}

interface WebSocketContextType {
  socket: EnhancedWebSocket | null;
  lastEvent: Event | null;
  connected: boolean;
  reconnect: () => void; // Add reconnect function to the context
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<EnhancedWebSocket | null>(null);
  const [lastEvent, setLastEvent] = useState<Event | null>(null);
  const [connected, setConnected] = useState(false);
  const [wsUrl, setWsUrl] = useState<string>('');
  const [mockInterruptionsEnabled, setMockInterruptionsEnabled] = useState(false);
  const [lastMockTime, setLastMockTime] = useState(0);

  // Create the emit function to be used throughout the component
  const createEmitFunction = (wsConnection: WebSocket) => {
    return (event: string, data: any) => {
      try {
        if (wsConnection.readyState === WebSocket.OPEN) {
          wsConnection.send(JSON.stringify({ type: event, data }));
        } else {
          console.log('WebSocket not connected, would have emitted:', event, data);
        }
      } catch (error) {
        console.error(`Error emitting WebSocket event "${event}":`, error);
      }
    };
  };

  // Function to set up WebSocket connection - moved outside useEffect for reconnect use
  const setupWebSocket = () => {
    try {
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      // Close existing connection if any
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
      
      // Create a new WebSocket connection
      const wsConnection = new WebSocket(wsUrl) as EnhancedWebSocket;
      
      // Add emit method to the WebSocket instance
      wsConnection.emit = createEmitFunction(wsConnection);
      
      wsConnection.onopen = () => {
        console.log('Connected to WebSocket server');
        setConnected(true);
        setSocket(wsConnection);
      };
      
      wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          if (data.type === 'event' && data.data) {
            setLastEvent(data.data);
          } else if (data.type === 'ping') {
            // Keep connection alive by responding to ping
            if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
              wsConnection.send(JSON.stringify({ type: 'pong' }));
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsConnection.onclose = (event) => {
        console.log('Disconnected from WebSocket server:', event.code, event.reason);
        setConnected(false);
        setSocket(null);
        
        // Auto reconnect after a delay if not closed intentionally
        if (!event.wasClean) {
          console.log('Connection lost. Attempting to reconnect in 5 seconds...');
          setTimeout(setupWebSocket, 5000);
        }
      };
      
      wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      useMockData();
    }
  };
  
  // Function to create a throttled mock event
  const createMockInterruption = (sessionId: string, forceCreate = false) => {
    const now = Date.now();
    const minInterval = 30000; // Minimum 30 seconds between interruptions
    
    // Only create a new interruption if enough time has passed or if forced
    if (forceCreate || now - lastMockTime > minInterval) {
      const eventType = Math.random() > 0.5 ? 'tabSwitch' : 'idle';
      const mockEvent: Event = {
        type: eventType,
        time: new Date().toISOString(),
        details: `Mock ${eventType} event`,
        session_id: sessionId
      };
      
      setLastEvent(mockEvent);
      setLastMockTime(now);
      console.log('Generated mock interruption:', mockEvent);
      return true;
    }
    
    return false;
  };
  
  // Function to use mock data as fallback
  const useMockData = () => {
    console.log('Using mock WebSocket data');
    setConnected(true);
    
    // Create a mock WebSocket object
    const mockWs = {} as EnhancedWebSocket;
    
    // Add a mock emit method
    mockWs.emit = (event: string, data: any) => {
      console.log('Mock socket emitting:', event, data);
      
      // If starting a session, enable mock interruptions
      if (event === 'startSession') {
        const sessionId = data.sessionId;
        setMockInterruptionsEnabled(true);
        
        // Generate just one mock tab switch after 10 seconds to demonstrate the feature
        setTimeout(() => {
          if (mockInterruptionsEnabled) {
            createMockInterruption(sessionId, true);
          }
        }, 10000);
      } else if (event === 'endSession') {
        // If ending a session, disable mock interruptions
        setMockInterruptionsEnabled(false);
      }
    };
    
    // Set the mock socket
    setSocket(mockWs);
    
    // Set up controlled periodic mock events
    // Maximum of 1 every 5 minutes instead of 1 per minute
    const interval = setInterval(() => {
      if (mockInterruptionsEnabled) {
        createMockInterruption('mock-session');
      }
    }, 300000); // 5 minutes
    
    return () => {
      clearInterval(interval);
      setMockInterruptionsEnabled(false);
    };
  };

  // Manual reconnect function that can be called from outside
  const reconnect = () => {
    console.log('Manual reconnection requested');
    setupWebSocket();
  };

  useEffect(() => {
    // Determine WebSocket URL: prefer environment variable, fallback to localhost with correct protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const defaultWsUrl = `${protocol}//${host}:8000/ws/events`;
    const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL || defaultWsUrl;
    
    console.log('Setting WebSocket URL to:', websocketUrl);
    setWsUrl(websocketUrl);
  }, []); // Only run once on component mount
  
  // Separate effect for establishing the WebSocket connection
  useEffect(() => {
    // Only setup WebSocket when wsUrl is set and not empty
    if (wsUrl) {
      console.log('Initializing WebSocket connection...');
      setupWebSocket();
    } else {
      console.warn('No WebSocket URL available, cannot connect');
      useMockData();
    }
    
    // Clean up function
    return () => {
      if (socket) {
        try {
          console.log('Closing WebSocket connection on cleanup');
          socket.close();
        } catch (e) {
          console.error('Error closing WebSocket:', e);
        }
      }
      setMockInterruptionsEnabled(false);
    };
  }, [wsUrl]); // Re-run if wsUrl changes

  // Create a value object with all the properties and methods for the context
  const contextValue: WebSocketContextType = {
    socket,
    lastEvent,
    connected,
    reconnect
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;