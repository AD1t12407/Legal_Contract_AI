import { config } from './config.js';

let activeSession = null;
let pendingEvents = [];

// API endpoint - get from config
const API_BASE_URL = config.API_BASE_URL;

// Configure idle detection (in seconds)
const IDLE_TIMEOUT = 60; // 1 minute
chrome.idle.setDetectionInterval(IDLE_TIMEOUT);

// Initialize when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('AutoPom Learning Extension installed');
  loadPendingEvents();
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  
  if (message.action === 'startFocus') {
    startFocusSession();
    sendResponse({ success: true, sessionId: activeSession?.id });
  } else if (message.action === 'stopFocus') {
    stopFocusSession();
    sendResponse({ success: true });
  } else if (message.action === 'getSessionStatus') {
    sendResponse({ 
      isActive: !!activeSession,
      sessionId: activeSession?.id,
      startTime: activeSession?.startTime,
      interruptions: activeSession?.interruptions || []
    });
  } else if (message.action === 'submitLearning') {
    submitLearning(message.learning, message.sessionId, message.role || 'student');
    sendResponse({ success: true });
  }
  
  return true; // Required for async sendResponse
});

// Monitor tab switches
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!activeSession) return;
  
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    recordInterruption('tabSwitch', `Switched to: ${tab.title}`);
  } catch (error) {
    console.error('Error getting tab info:', error);
  }
});

// Monitor navigation within tabs
chrome.webNavigation.onCompleted.addListener((details) => {
  if (!activeSession || details.frameId !== 0) return;
  
  chrome.tabs.get(details.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    
    recordInterruption('navigation', `Navigated to: ${tab.title}`);
  });
});

// Monitor idle state changes
chrome.idle.onStateChanged.addListener((state) => {
  if (!activeSession) return;
  
  if (state === 'idle' || state === 'locked') {
    recordInterruption('idle', `State changed to: ${state}`);
  } else if (state === 'active' && activeSession.wasIdle) {
    // User returned from idle state
    recordEvent('active', activeSession.id, new Date().toISOString(), 'Returned to active state');
    activeSession.wasIdle = false;
  }
});

// Start a focus session
function startFocusSession() {
  const sessionId = Date.now().toString();
  const startTime = new Date().toISOString();
  
  activeSession = {
    id: sessionId,
    startTime,
    interruptions: [],
    wasIdle: false
  };
  
  recordEvent('start', sessionId, startTime);
  
  // Update badge to show active session
  chrome.action.setBadgeText({ text: '🔴' });
  chrome.action.setBadgeBackgroundColor({ color: '#4f46e5' });
  
  console.log('Focus session started:', activeSession);
}

// Stop a focus session
function stopFocusSession() {
  if (!activeSession) return;
  
  const endTime = new Date().toISOString();
  const sessionId = activeSession.id;
  
  recordEvent('stop', sessionId, endTime);
  
  // Clear badge
  chrome.action.setBadgeText({ text: '' });
  
  // Open learning prompt
  chrome.tabs.create({
    url: chrome.runtime.getURL('learning.html') + `?sessionId=${sessionId}`
  });
  
  console.log('Focus session stopped:', {
    id: sessionId,
    startTime: activeSession.startTime,
    endTime,
    interruptions: activeSession.interruptions
  });
  
  activeSession = null;
}

// Record an interruption during the focus session
function recordInterruption(type, details) {
  if (!activeSession) return;
  
  const time = new Date().toISOString();
  
  activeSession.interruptions.push({
    type,
    time,
    details
  });
  
  recordEvent(type, activeSession.id, time, details);
  
  if (type === 'idle') {
    activeSession.wasIdle = true;
  }
  
  console.log('Interruption recorded:', {
    type,
    time,
    details
  });
}

// Record an event and batch for sending to the server
function recordEvent(type, sessionId, time, details = '') {
  const event = {
    type,
    sessionId,
    time,
    details
  };
  
  pendingEvents.push(event);
  savePendingEvents();
  
  // Send events in batch
  if (pendingEvents.length >= 5) {
    sendEvents();
  }
}

// Submit learning items to the server
async function submitLearning(learning, sessionId, role = 'student') {
  try {
    const payload = {
      sessionId,
      content: learning.join('\n'),
      role
    };
    
    const response = await fetch(`${API_BASE_URL}/learning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Learning submitted:', result);
    
    return result;
  } catch (error) {
    console.error('Failed to submit learning:', error);
    
    // Store locally if submission fails
    chrome.storage.local.get(['pendingLearnings'], (result) => {
      const pendingLearnings = result.pendingLearnings || [];
      pendingLearnings.push({
        sessionId,
        content: learning.join('\n'),
        role,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ pendingLearnings });
    });
  }
}

// Send batched events to the server
async function sendEvents() {
  if (pendingEvents.length === 0) return;
  
  try {
    const events = [...pendingEvents];
    
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(events)
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    console.log('Events sent:', events);
    
    // Clear sent events
    pendingEvents = pendingEvents.filter(
      event => !events.some(sentEvent => 
        sentEvent.time === event.time && 
        sentEvent.type === event.type
      )
    );
    
    savePendingEvents();
  } catch (error) {
    console.error('Failed to send events:', error);
    // Keep events in pendingEvents to retry later
  }
}

// Save pending events to storage
function savePendingEvents() {
  chrome.storage.local.set({ pendingEvents });
}

// Load pending events from storage
function loadPendingEvents() {
  chrome.storage.local.get(['pendingEvents'], (result) => {
    pendingEvents = result.pendingEvents || [];
    console.log('Loaded pending events:', pendingEvents);
    
    // Try to send any pending events on startup
    if (pendingEvents.length > 0) {
      sendEvents();
    }
  });
}

// Send events periodically
setInterval(sendEvents, 60000); // Every minute

// Also retry sending any stored learnings that failed to send
setInterval(() => {
  chrome.storage.local.get(['pendingLearnings'], async (result) => {
    const pendingLearnings = result.pendingLearnings || [];
    if (pendingLearnings.length === 0) return;
    
    const successfulIndices = [];
    
    for (let i = 0; i < pendingLearnings.length; i++) {
      const learning = pendingLearnings[i];
      try {
        await submitLearning([learning.content], learning.sessionId, learning.role);
        successfulIndices.push(i);
      } catch (error) {
        console.error('Failed to resubmit learning:', error);
      }
    }
    
    // Remove successfully sent learnings
    const newPendingLearnings = pendingLearnings.filter((_, i) => !successfulIndices.includes(i));
    chrome.storage.local.set({ pendingLearnings: newPendingLearnings });
  });
}, 300000); // Every 5 minutes