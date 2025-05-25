let startTime;
let timerInterval;
let sessionId;
let interruptions = [];

// DOM elements
const startButton = document.getElementById('start-focus');
const stopButton = document.getElementById('stop-focus');
const sessionInfo = document.getElementById('session-info');
const timerDisplay = document.getElementById('timer-display');
const interruptionsCount = document.getElementById('interruptions-count');
const statusIndicator = document.getElementById('status-indicator');
const statusDot = statusIndicator.querySelector('.status-dot');
const statusText = statusIndicator.querySelector('.status-text');

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  startButton.addEventListener('click', startFocusSession);
  stopButton.addEventListener('click', stopFocusSession);
  
  // Check if a session is already active
  checkSessionStatus();
});

// Check if a focus session is already active
async function checkSessionStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSessionStatus' });
    console.log('Session status:', response);
    
    if (response.isActive) {
      // Session is active, update UI
      sessionId = response.sessionId;
      startTime = new Date(response.startTime);
      interruptions = response.interruptions || [];
      
      updateSessionUI(true);
      startTimer();
    }
  } catch (error) {
    console.error('Failed to check session status:', error);
  }
}

// Start a new focus session
async function startFocusSession() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'startFocus' });
    console.log('Start focus response:', response);
    
    if (response.success) {
      sessionId = response.sessionId;
      startTime = new Date();
      interruptions = [];
      
      updateSessionUI(true);
      startTimer();
    }
  } catch (error) {
    console.error('Failed to start focus session:', error);
  }
}

// Stop the current focus session
async function stopFocusSession() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'stopFocus' });
    console.log('Stop focus response:', response);
    
    if (response.success) {
      updateSessionUI(false);
      stopTimer();
    }
  } catch (error) {
    console.error('Failed to stop focus session:', error);
  }
}

// Update UI based on session state
function updateSessionUI(isActive) {
  if (isActive) {
    startButton.style.display = 'none';
    stopButton.style.display = 'flex';
    sessionInfo.style.display = 'block';
    
    statusDot.classList.add('active');
    statusText.textContent = 'Focus Session Active';
    
    updateInterruptionsCount();
  } else {
    startButton.style.display = 'flex';
    stopButton.style.display = 'none';
    sessionInfo.style.display = 'none';
    
    statusDot.classList.remove('active');
    statusText.textContent = 'Ready';
  }
}

// Start the timer
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    updateTimerDisplay(elapsed);
  }, 1000);
  
  // Initial update
  const now = new Date();
  const elapsed = Math.floor((now - startTime) / 1000);
  updateTimerDisplay(elapsed);
}

// Stop the timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Update the timer display
function updateTimerDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  timerDisplay.textContent = `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

// Update the interruptions count
function updateInterruptionsCount() {
  interruptionsCount.textContent = interruptions.length;
}

// Helper function to pad numbers with leading zeros
function padZero(num) {
  return num.toString().padStart(2, '0');
}