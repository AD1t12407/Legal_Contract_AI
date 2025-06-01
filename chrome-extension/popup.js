// AutoPom Learning Extension - Modern Multi-Page UI
// Professional learning platform with authentication, dashboard, and AI features

// Application State
let currentPage = 'landing';
let isAuthenticated = false;
let userProfile = null;
let startTime;
let timerInterval;
let sessionId;
let interruptions = [];
let userPreferences = {
    language: 'en',
    simpleMode: false,
    voiceEnabled: true
};
let isVoiceRecording = false;
let connectionStatus = 'online';

// Page Management
const pages = {
    landing: document.getElementById('landing-page'),
    signup: document.getElementById('signup-page'),
    signin: document.getElementById('signin-page'),
    dashboard: document.getElementById('dashboard-page')
};

// Navigation Elements
const getStartedBtn = document.getElementById('get-started-btn');
const signInBtn = document.getElementById('sign-in-btn');
const showSignupLink = document.getElementById('show-signup');
const showSigninLink = document.getElementById('show-signin');
const backToLandingBtns = [
    document.getElementById('back-to-landing'),
    document.getElementById('back-to-landing-signin')
];
const logoutBtn = document.getElementById('logout-btn');

// Form Elements
const signupForm = document.getElementById('signup-form');
const signinForm = document.getElementById('signin-form');

// Dashboard Elements
const startButton = document.getElementById('start-focus');
const stopButton = document.getElementById('stop-focus');
const sessionInfo = document.getElementById('session-info');
const timerDisplay = document.getElementById('timer-display');
const interruptionsCount = document.getElementById('interruptions-count');
const statusIndicator = document.getElementById('status-indicator');
const languageSelect = document.getElementById('language-select');
const voiceAssistantBtn = document.getElementById('voice-assistant-btn');
const voiceBtnText = document.getElementById('voice-btn-text');
const voiceVisualizer = document.getElementById('voice-visualizer');
const focusStatusDot = document.getElementById('focus-status-dot');
const focusStatusText = document.getElementById('focus-status-text');

// Feature Cards
const featureCards = {
    languageLearning: document.getElementById('language-learning-card'),
    quizGenerator: document.getElementById('quiz-generator-card'),
    offlineMode: document.getElementById('offline-mode-card'),
    accessibility: document.getElementById('accessibility-card')
};

// Quick Actions
const quickActions = {
    quiz: document.getElementById('quick-quiz'),
    voicePractice: document.getElementById('voice-practice'),
    simpleMode: document.getElementById('simple-mode'),
    syncData: document.getElementById('sync-data')
};

// Stats Elements
const statsElements = {
    todayFocus: document.getElementById('today-focus'),
    todayLessons: document.getElementById('today-lessons'),
    todayQuizzes: document.getElementById('today-quizzes'),
    learningStreak: document.getElementById('learning-streak')
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('AutoPom modern UI loaded');

  // Load user preferences and authentication state
  await loadUserPreferences();
  await checkAuthenticationState();

  // Set up navigation event listeners
  setupNavigationListeners();

  // Set up form event listeners
  setupFormListeners();

  // Set up dashboard event listeners
  setupDashboardListeners();

  // Set up feature event listeners
  setupFeatureListeners();

  // Initialize UI state
  await initializeUI();

  // Show appropriate page
  showPage(isAuthenticated ? 'dashboard' : 'landing');

  console.log('UI initialized:', {
    currentPage,
    isAuthenticated,
    userProfile
  });
});

// Page Navigation System
function showPage(pageName) {
  console.log('Navigating to page:', pageName);

  // Hide all pages
  Object.values(pages).forEach(page => {
    if (page) page.classList.remove('active');
  });

  // Show target page
  if (pages[pageName]) {
    pages[pageName].classList.add('active');
    currentPage = pageName;
  }

  // Update page-specific state
  if (pageName === 'dashboard') {
    initializeDashboard();
  }
}

function setupNavigationListeners() {
  // Landing page navigation
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => showPage('signup'));
  }

  if (signInBtn) {
    signInBtn.addEventListener('click', () => showPage('signin'));
  }

  // Auth page navigation
  if (showSignupLink) {
    showSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      showPage('signup');
    });
  }

  if (showSigninLink) {
    showSigninLink.addEventListener('click', (e) => {
      e.preventDefault();
      showPage('signin');
    });
  }

  // Back to landing buttons
  backToLandingBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => showPage('landing'));
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

function setupFormListeners() {
  // Signup form
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // Signin form
  if (signinForm) {
    signinForm.addEventListener('submit', handleSignin);
  }

  // Demo credentials button
  const fillDemoBtn = document.getElementById('fill-demo-credentials');
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', fillDemoCredentials);
  }
}

function setupDashboardListeners() {
  // Focus session controls
  if (startButton) {
    startButton.addEventListener('click', startFocusSession);
  }

  if (stopButton) {
    stopButton.addEventListener('click', stopFocusSession);
  }

  // Language selector
  if (languageSelect) {
    languageSelect.addEventListener('change', handleLanguageChange);
  }

  // Voice assistant
  if (voiceAssistantBtn) {
    voiceAssistantBtn.addEventListener('click', toggleVoiceAssistant);
  }
}

function setupFeatureListeners() {
  // Feature cards
  Object.entries(featureCards).forEach(([key, card]) => {
    if (card) {
      card.addEventListener('click', () => handleFeatureClick(key));
    }
  });

  // Quick actions
  Object.entries(quickActions).forEach(([key, action]) => {
    if (action) {
      action.addEventListener('click', () => handleQuickAction(key));
    }
  });

  // Dashboard link integration
  const dashboardLinks = document.querySelectorAll('.dashboard-link');
  dashboardLinks.forEach(link => {
    if (link) {
      link.addEventListener('click', handleDashboardLinkClick);
    }
  });

  // Connection status monitoring
  window.addEventListener('online', () => updateConnectionStatus('online'));
  window.addEventListener('offline', () => updateConnectionStatus('offline'));
}

// Authentication Functions
async function checkAuthenticationState() {
  try {
    const result = await chrome.storage.local.get(['userProfile', 'authToken']);

    if (result.userProfile && result.authToken) {
      isAuthenticated = true;
      userProfile = result.userProfile;
      console.log('User authenticated:', userProfile);
    } else {
      isAuthenticated = false;
      userProfile = null;
      console.log('User not authenticated');
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    isAuthenticated = false;
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const userData = {
    name: formData.get('signup-name') || document.getElementById('signup-name')?.value,
    email: formData.get('signup-email') || document.getElementById('signup-email')?.value,
    password: formData.get('signup-password') || document.getElementById('signup-password')?.value,
    language: formData.get('signup-language') || document.getElementById('signup-language')?.value
  };

  console.log('Signup attempt:', { ...userData, password: '[HIDDEN]' });

  try {
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Creating Account...</span>';
    submitBtn.disabled = true;

    // Simulate API call (replace with actual authentication)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create user profile
    userProfile = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      language: userData.language,
      createdAt: new Date().toISOString(),
      preferences: {
        language: userData.language,
        simpleMode: false,
        voiceEnabled: true
      }
    };

    // Save authentication state
    await chrome.storage.local.set({
      userProfile,
      authToken: 'demo_token_' + Date.now(),
      userPreferences: userProfile.preferences
    });

    isAuthenticated = true;
    userPreferences = userProfile.preferences;

    // Show success and navigate to dashboard
    showNotification('Account created successfully! Welcome to AutoPom!', 'success');
    showPage('dashboard');

    // Reset form
    event.target.reset();
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

  } catch (error) {
    console.error('Signup error:', error);
    showNotification('Failed to create account. Please try again.', 'error');

    // Reset button
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

async function handleSignin(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const credentials = {
    email: formData.get('signin-email') || document.getElementById('signin-email')?.value,
    password: formData.get('signin-password') || document.getElementById('signin-password')?.value
  };

  console.log('Signin attempt:', { ...credentials, password: '[HIDDEN]' });

  try {
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Signing In...</span>';
    submitBtn.disabled = true;

    // Simulate API call (replace with actual authentication)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check for demo user credentials
    if (credentials.email === 'demo@autopom.app' && credentials.password === 'demo123') {
      userProfile = {
        id: 'demo_user_001',
        name: 'Priya Sharma',
        email: 'demo@autopom.app',
        language: 'hi',
        createdAt: '2024-01-01T00:00:00.000Z',
        preferences: {
          language: 'hi',
          simpleMode: false,
          voiceEnabled: true
        }
      };
    } else {
      // Mock user profile (replace with actual API response)
      userProfile = {
        id: 'demo_user',
        name: 'Demo User',
        email: credentials.email,
        language: 'en',
        createdAt: new Date().toISOString(),
        preferences: {
          language: 'en',
          simpleMode: false,
          voiceEnabled: true
        }
      };
    }

    // Save authentication state
    await chrome.storage.local.set({
      userProfile,
      authToken: userProfile.id === 'demo_user_001' ? 'demo_token_secure_001' : 'demo_token_signin_' + Date.now(),
      userPreferences: userProfile.preferences
    });

    isAuthenticated = true;
    userPreferences = userProfile.preferences;

    // Show success and navigate to dashboard
    const welcomeMessage = userProfile.id === 'demo_user_001' ? 'Welcome back, Priya! 🎉' : 'Welcome back!';
    showNotification(welcomeMessage, 'success');
    showPage('dashboard');

    // Reset form
    event.target.reset();
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

  } catch (error) {
    console.error('Signin error:', error);
    showNotification('Invalid credentials. Please try again.', 'error');

    // Reset button
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

function fillDemoCredentials() {
  const emailInput = document.getElementById('signin-email');
  const passwordInput = document.getElementById('signin-password');

  if (emailInput && passwordInput) {
    emailInput.value = 'demo@autopom.app';
    passwordInput.value = 'demo123';

    // Add visual feedback
    emailInput.style.borderColor = 'var(--text-accent)';
    passwordInput.style.borderColor = 'var(--text-accent)';

    setTimeout(() => {
      emailInput.style.borderColor = '';
      passwordInput.style.borderColor = '';
    }, 1000);

    showNotification('Demo credentials filled!', 'success');
  }
}

async function handleLogout() {
  try {
    // Clear authentication data
    await chrome.storage.local.remove(['userProfile', 'authToken']);

    isAuthenticated = false;
    userProfile = null;

    // Stop any active sessions
    if (timerInterval) {
      stopFocusSession();
    }

    // Navigate to landing page
    showPage('landing');

    showNotification('Logged out successfully', 'success');

  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Error logging out', 'error');
  }
}

// Dashboard Functions
async function initializeDashboard() {
  console.log('Initializing dashboard...');

  // Update language selector
  if (languageSelect && userPreferences.language) {
    languageSelect.value = userPreferences.language;
  }

  // Check for active session
  await checkSessionStatus();

  // Load stats
  await loadDashboardStats();

  // Update connection status
  updateConnectionStatus();

  // Initialize voice visualizer
  initializeVoiceVisualizer();

  console.log('Dashboard initialized');
}

function initializeVoiceVisualizer() {
  if (!voiceVisualizer) return;

  const bars = voiceVisualizer.querySelectorAll('.voice-bar');
  bars.forEach((bar, index) => {
    bar.style.height = '10px';
    bar.style.animationDelay = `${index * 0.1}s`;
  });
}

function handleFeatureClick(featureName) {
  console.log('Feature clicked:', featureName);

  switch (featureName) {
    case 'languageLearning':
      openLanguageLearning();
      break;
    case 'quizGenerator':
      openQuizGenerator();
      break;
    case 'offlineMode':
      toggleOfflineMode();
      break;
    case 'accessibility':
      openAccessibilitySettings();
      break;
    default:
      console.log('Unknown feature:', featureName);
  }
}

function handleQuickAction(actionName) {
  console.log('Quick action:', actionName);

  switch (actionName) {
    case 'quiz':
      openQuickQuiz();
      break;
    case 'voicePractice':
      startVoicePractice();
      break;
    case 'simpleMode':
      toggleSimpleMode();
      break;
    case 'syncData':
      syncUserData();
      break;
    default:
      console.log('Unknown action:', actionName);
  }
}

async function handleDashboardLinkClick(event) {
  event.preventDefault();

  try {
    // Get current authentication state
    const authData = await chrome.storage.local.get(['userProfile', 'authToken']);

    if (authData.userProfile && authData.authToken) {
      // Create URL with authentication parameters
      const baseUrl = 'http://localhost:5173'; // React app URL
      const authParams = new URLSearchParams({
        from: 'extension',
        auth: authData.authToken,
        user: JSON.stringify(authData.userProfile)
      });

      const fullUrl = `${baseUrl}?${authParams.toString()}`;

      // Open React app in new tab
      await chrome.tabs.create({ url: fullUrl });

      showNotification('Opening full dashboard...', 'success');
    } else {
      showNotification('Please sign in first', 'warning');
    }
  } catch (error) {
    console.error('Error opening dashboard:', error);
    showNotification('Failed to open dashboard', 'error');
  }
}

async function openLanguageLearning() {
  try {
    // Open the vernacular learning page directly
    await handleDashboardLinkClick({ preventDefault: () => {} });

    // After a short delay, navigate to the specific page
    setTimeout(async () => {
      const authData = await chrome.storage.local.get(['userProfile', 'authToken']);
      if (authData.userProfile && authData.authToken) {
        const baseUrl = 'http://localhost:5173/vernacular-learning';
        const authParams = new URLSearchParams({
          from: 'extension',
          auth: authData.authToken,
          user: JSON.stringify(authData.userProfile)
        });

        const fullUrl = `${baseUrl}?${authParams.toString()}`;
        await chrome.tabs.create({ url: fullUrl });
      }
    }, 100);

    showNotification('Opening language learning module...', 'success');
  } catch (error) {
    console.error('Error opening language learning:', error);
    showNotification('Failed to open language learning', 'error');
  }
}

async function openQuizGenerator() {
  try {
    // Open the AI tutor page directly
    const authData = await chrome.storage.local.get(['userProfile', 'authToken']);
    if (authData.userProfile && authData.authToken) {
      const baseUrl = 'http://localhost:5173/ai-tutor';
      const authParams = new URLSearchParams({
        from: 'extension',
        auth: authData.authToken,
        user: JSON.stringify(authData.userProfile)
      });

      const fullUrl = `${baseUrl}?${authParams.toString()}`;
      await chrome.tabs.create({ url: fullUrl });

      showNotification('Opening AI tutor...', 'success');
    } else {
      showNotification('Please sign in first', 'warning');
    }
  } catch (error) {
    console.error('Error opening AI tutor:', error);
    showNotification('Failed to open AI tutor', 'error');
  }
}

async function toggleOfflineMode() {
  try {
    // Open the digital bridge page directly
    const authData = await chrome.storage.local.get(['userProfile', 'authToken']);
    if (authData.userProfile && authData.authToken) {
      const baseUrl = 'http://localhost:5173/digital-bridge';
      const authParams = new URLSearchParams({
        from: 'extension',
        auth: authData.authToken,
        user: JSON.stringify(authData.userProfile)
      });

      const fullUrl = `${baseUrl}?${authParams.toString()}`;
      await chrome.tabs.create({ url: fullUrl });

      showNotification('Opening digital bridge tools...', 'success');
    } else {
      showNotification('Please sign in first', 'warning');
    }
  } catch (error) {
    console.error('Error opening digital bridge:', error);
    showNotification('Failed to open digital bridge', 'error');
  }
}

function openAccessibilitySettings() {
  showNotification('Opening accessibility settings...', 'info');
  // Could show modal with accessibility options
}

async function startVoicePractice() {
  if (!userPreferences.voiceEnabled) {
    showNotification('Voice features are disabled', 'warning');
    return;
  }

  try {
    await toggleVoiceAssistant();
    showNotification('Voice practice started', 'success');
  } catch (error) {
    console.error('Error starting voice practice:', error);
    showNotification('Failed to start voice practice', 'error');
  }
}

async function syncUserData() {
  try {
    showNotification('Syncing data...', 'info');

    const response = await chrome.runtime.sendMessage({
      action: 'syncUserData',
      userId: userProfile?.id
    });

    if (response.success) {
      showNotification('Data synced successfully', 'success');
      await loadDashboardStats(); // Refresh stats
    } else {
      showNotification('Sync failed', 'error');
    }
  } catch (error) {
    console.error('Error syncing data:', error);
    showNotification('Sync failed', 'error');
  }
}

async function loadDashboardStats() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getUserStats',
      userId: userProfile?.id
    });

    if (response.success && response.stats) {
      updateStatsDisplay(response.stats);
    } else {
      // Use default stats
      updateStatsDisplay({
        todayFocus: 0,
        todayLessons: 0,
        todayQuizzes: 0,
        learningStreak: 0
      });
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    // Use default stats
    updateStatsDisplay({
      todayFocus: 0,
      todayLessons: 0,
      todayQuizzes: 0,
      learningStreak: 0
    });
  }
}

function updateStatsDisplay(stats) {
  if (statsElements.todayFocus) {
    statsElements.todayFocus.textContent = `${stats.todayFocus} min`;
  }
  if (statsElements.todayLessons) {
    statsElements.todayLessons.textContent = stats.todayLessons.toString();
  }
  if (statsElements.todayQuizzes) {
    statsElements.todayQuizzes.textContent = stats.todayQuizzes.toString();
  }
  if (statsElements.learningStreak) {
    statsElements.learningStreak.textContent = `${stats.learningStreak} days`;
  }
}

// Focus Session Management
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
  if (!startButton || !stopButton) return;

  if (isActive) {
    startButton.classList.add('hidden');
    stopButton.classList.remove('hidden');

    // Update focus status indicators
    if (focusStatusDot) {
      focusStatusDot.classList.remove('offline');
      focusStatusDot.classList.add('focus');
    }
    if (focusStatusText) {
      focusStatusText.textContent = 'Active';
    }

    // Update main status indicator
    const statusDot = statusIndicator?.querySelector('.status-dot');
    const statusText = statusIndicator?.querySelector('.status-text');
    if (statusDot) statusDot.classList.add('focus');
    if (statusText) statusText.textContent = 'Focus Session Active';

    updateInterruptionsCount();
  } else {
    startButton.classList.remove('hidden');
    stopButton.classList.add('hidden');

    // Update focus status indicators
    if (focusStatusDot) {
      focusStatusDot.classList.remove('focus');
      focusStatusDot.classList.add('offline');
    }
    if (focusStatusText) {
      focusStatusText.textContent = 'Ready';
    }

    // Update main status indicator
    const statusDot = statusIndicator?.querySelector('.status-dot');
    const statusText = statusIndicator?.querySelector('.status-text');
    if (statusDot) statusDot.classList.remove('focus');
    if (statusText) statusText.textContent = 'Ready';
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

// Language handling functions
function handleLanguageChange(event) {
  const selectedLanguage = event.target.value;
  console.log('Language changed to:', selectedLanguage);

  // Save language preference
  chrome.storage.local.set({ selectedLanguage });

  // Update UI text based on language
  updateUILanguage(selectedLanguage);
}

function loadSavedLanguage() {
  try {
    chrome.storage.local.get(['selectedLanguage'], (result) => {
      const savedLanguage = result.selectedLanguage || 'en';
      console.log('Loaded saved language:', savedLanguage);
      if (languageSelect) {
        languageSelect.value = savedLanguage;
        updateUILanguage(savedLanguage);
      }
    });
  } catch (error) {
    console.error('Error loading saved language:', error);
  }
}

function updateUILanguage(language) {
  // Language-specific text updates
  const translations = {
    'en': {
      startFocus: 'Start Focus Session',
      stopFocus: 'End Focus Session',
      ready: 'Ready',
      active: 'Focus Session Active'
    },
    'hi': {
      startFocus: 'फोकस सेशन शुरू करें',
      stopFocus: 'फोकस सेशन समाप्त करें',
      ready: 'तैयार',
      active: 'फोकस सेशन सक्रिय'
    },
    'te': {
      startFocus: 'ఫోకస్ సెషన్ ప్రారంభించండి',
      stopFocus: 'ఫోకస్ సెషన్ ముగించండి',
      ready: 'సిద్ధం',
      active: 'ఫోకస్ సెషన్ చురుకుగా ఉంది'
    },
    'ta': {
      startFocus: 'கவன அமர்வைத் தொடங்கவும்',
      stopFocus: 'கவன அமர்வை முடிக்கவும்',
      ready: 'தயார்',
      active: 'கவன அமர்வு செயலில் உள்ளது'
    },
    'bn': {
      startFocus: 'ফোকাস সেশন শুরু করুন',
      stopFocus: 'ফোকাস সেশন শেষ করুন',
      ready: 'প্রস্তুত',
      active: 'ফোকাস সেশন সক্রিয়'
    },
    'kn': {
      startFocus: 'ಫೋಕಸ್ ಸೆಷನ್ ಪ್ರಾರಂಭಿಸಿ',
      stopFocus: 'ಫೋಕಸ್ ಸೆಷನ್ ಕೊನೆಗೊಳಿಸಿ',
      ready: 'ಸಿದ್ಧ',
      active: 'ಫೋಕಸ್ ಸೆಷನ್ ಸಕ್ರಿಯ'
    }
  };

  const text = translations[language] || translations['en'];

  // Update button text
  if (startButton) {
    const span = startButton.querySelector('span');
    if (span) span.textContent = text.startFocus;
  }
  if (stopButton) {
    const span = stopButton.querySelector('span');
    if (span) span.textContent = text.stopFocus;
  }

  // Update status text if not in active session
  if (statusText && !statusText.textContent.includes('Active')) {
    statusText.textContent = text.ready;
  }

  // Update language display
  if (languageDisplay) {
    const languageNames = {
      'en': 'English',
      'hi': 'हिन्दी',
      'te': 'తెలుగు',
      'ta': 'தமிழ்',
      'bn': 'বাংলা',
      'kn': 'ಕನ್ನಡ'
    };
    languageDisplay.textContent = languageNames[language] || 'English';
  }
}

// Load user preferences
async function loadUserPreferences() {
  try {
    const result = await chrome.storage.local.get(['userPreferences', 'selectedLanguage']);

    if (result.userPreferences) {
      userPreferences = { ...userPreferences, ...result.userPreferences };
    }

    // Handle legacy selectedLanguage
    if (result.selectedLanguage) {
      userPreferences.language = result.selectedLanguage;
    }

    console.log('Loaded user preferences:', userPreferences);
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
}

// Initialize UI state
async function initializeUI() {
  // Set language selector
  if (languageSelect) {
    languageSelect.value = userPreferences.language;
    updateUILanguage(userPreferences.language);
  }

  // Set simple mode
  if (userPreferences.simpleMode) {
    enableSimpleMode();
  }

  // Update voice button state
  updateVoiceButtonState();

  // Update simple mode toggle
  updateSimpleModeToggle();
}

// Voice assistant functions
async function toggleVoiceAssistant() {
  if (isVoiceRecording) {
    await stopVoiceRecording();
  } else {
    await startVoiceRecording();
  }
}

async function startVoiceRecording() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'startVoiceRecording' });

    if (response.success) {
      isVoiceRecording = true;
      updateVoiceButtonState();
      startVoiceVisualization();
      showNotification(getLocalizedText('listening', userPreferences.language), 'info');
    } else {
      showNotification('Voice recording failed to start', 'error');
    }
  } catch (error) {
    console.error('Error starting voice recording:', error);
    showNotification('Voice recording failed to start', 'error');
  }
}

async function stopVoiceRecording() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'stopVoiceRecording' });

    isVoiceRecording = false;
    updateVoiceButtonState();
    stopVoiceVisualization();

    if (response.success && response.audioData) {
      // Process voice input
      const processResponse = await chrome.runtime.sendMessage({
        action: 'processVoiceInput',
        audioData: response.audioData,
        sessionId: sessionId
      });

      if (processResponse.success) {
        showNotification('Voice processed successfully', 'success');
      }
    }
  } catch (error) {
    console.error('Error stopping voice recording:', error);
    isVoiceRecording = false;
    updateVoiceButtonState();
    stopVoiceVisualization();
  }
}

function startVoiceVisualization() {
  if (!voiceVisualizer) return;

  const bars = voiceVisualizer.querySelectorAll('.voice-bar');
  bars.forEach(bar => {
    bar.classList.add('active');
  });
}

function stopVoiceVisualization() {
  if (!voiceVisualizer) return;

  const bars = voiceVisualizer.querySelectorAll('.voice-bar');
  bars.forEach(bar => {
    bar.classList.remove('active');
  });
}

function updateVoiceButtonState() {
  if (!voiceAssistantBtn || !voiceBtnText) return;

  if (isVoiceRecording) {
    voiceAssistantBtn.classList.add('recording');
    voiceBtnText.textContent = getLocalizedText('stopRecording', userPreferences.language);
  } else {
    voiceAssistantBtn.classList.remove('recording');
    voiceBtnText.textContent = getLocalizedText('voiceAssistant', userPreferences.language);
  }
}

// Quick quiz function
async function openQuickQuiz() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'generateQuiz',
      content: 'General knowledge quiz',
      difficulty: 'medium'
    });

    if (response.success) {
      // Open quiz in new tab
      chrome.tabs.create({
        url: chrome.runtime.getURL('quiz.html') + `?quizId=${Date.now()}`
      });
    } else {
      showNotification(getLocalizedText('quizError', userPreferences.language), 'error');
    }
  } catch (error) {
    console.error('Error opening quick quiz:', error);
    showNotification(getLocalizedText('quizError', userPreferences.language), 'error');
  }
}

// Simple mode functions
async function toggleSimpleMode() {
  userPreferences.simpleMode = !userPreferences.simpleMode;

  // Save preferences
  await chrome.storage.local.set({ userPreferences });

  // Update UI
  if (userPreferences.simpleMode) {
    enableSimpleMode();
  } else {
    disableSimpleMode();
  }

  // Notify background script
  chrome.runtime.sendMessage({
    action: 'toggleSimpleMode',
    enabled: userPreferences.simpleMode
  });

  updateSimpleModeToggle();
}

function enableSimpleMode() {
  document.body.classList.add('simple-mode');
  if (accessibilityNotice) {
    accessibilityNotice.style.display = 'block';
  }
}

function disableSimpleMode() {
  document.body.classList.remove('simple-mode');
  if (accessibilityNotice) {
    accessibilityNotice.style.display = 'none';
  }
}

function updateSimpleModeToggle() {
  if (!simpleModeToggle) return;

  const span = simpleModeToggle.querySelector('span');
  if (span) {
    span.textContent = userPreferences.simpleMode
      ? getLocalizedText('normalMode', userPreferences.language)
      : getLocalizedText('simpleMode', userPreferences.language);
  }

  if (userPreferences.simpleMode) {
    simpleModeToggle.classList.add('active');
  } else {
    simpleModeToggle.classList.remove('active');
  }
}

// Connection status functions
function updateConnectionStatus(status = null) {
  connectionStatus = status || (navigator.onLine ? 'online' : 'offline');

  if (connectionIndicator) {
    connectionIndicator.className = `connection-indicator ${connectionStatus}`;
  }

  if (connectionText) {
    connectionText.textContent = connectionStatus === 'online'
      ? getLocalizedText('online', userPreferences.language)
      : getLocalizedText('offline', userPreferences.language);
  }

  // Check for pending sync items
  if (connectionStatus === 'online') {
    checkPendingSync();
  }
}

async function checkPendingSync() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'storeOfflineData',
      data: { type: 'getPendingCount' }
    });

    if (response.success && response.count > 0) {
      if (syncStatus) syncStatus.style.display = 'block';
      if (pendingCount) pendingCount.textContent = response.count;
    } else {
      if (syncStatus) syncStatus.style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking pending sync:', error);
  }
}

// Stats functions
async function loadStats() {
  try {
    // Load today's stats
    const today = new Date().toDateString();
    const result = await chrome.storage.local.get([`stats_${today}`, 'weeklyStats', 'focusHistory']);

    const todayStats = result[`stats_${today}`] || { totalTime: 0, sessions: 0 };
    const weeklyStats = result.weeklyStats || { totalTime: 0 };
    const focusHistory = result.focusHistory || [];

    // Update display
    if (todayFocus) {
      todayFocus.textContent = formatTime(todayStats.totalTime);
    }

    if (weekFocus) {
      weekFocus.textContent = formatTime(weeklyStats.totalTime);
    }

    if (avgFocus && focusHistory.length > 0) {
      const avgScore = focusHistory.reduce((sum, score) => sum + score, 0) / focusHistory.length;
      avgFocus.textContent = Math.round(avgScore) + '%';
    }

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Utility functions
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
}

function getLocalizedText(key, language) {
  const translations = {
    'voiceAssistant': {
      'en': 'Voice Assistant',
      'hi': 'आवाज़ सहायक',
      'te': 'వాయిస్ అసిస్టెంట్',
      'ta': 'குரல் உதவியாளர்',
      'bn': 'ভয়েস অ্যাসিস্ট্যান্ট',
      'kn': 'ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್'
    },
    'listening': {
      'en': 'Listening...',
      'hi': 'सुन रहा है...',
      'te': 'వింటోంది...',
      'ta': 'கேட்கிறது...',
      'bn': 'শুনছে...',
      'kn': 'ಕೇಳುತ್ತಿದೆ...'
    },
    'stopRecording': {
      'en': 'Stop Recording',
      'hi': 'रिकॉर्डिंग बंद करें',
      'te': 'రికార్డింగ్ ఆపండి',
      'ta': 'பதிவை நிறுத்தவும்',
      'bn': 'রেকর্ডিং বন্ধ করুন',
      'kn': 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ'
    },
    'simpleMode': {
      'en': 'Simple Mode',
      'hi': 'सरल मोड',
      'te': 'సింపుల్ మోడ్',
      'ta': 'எளிய முறை',
      'bn': 'সহজ মোড',
      'kn': 'ಸರಳ ಮೋಡ್'
    },
    'normalMode': {
      'en': 'Normal Mode',
      'hi': 'सामान्य मोड',
      'te': 'సాధారణ మోడ్',
      'ta': 'சாதாரண முறை',
      'bn': 'সাধারণ মোড',
      'kn': 'ಸಾಮಾನ್ಯ ಮೋಡ್'
    },
    'online': {
      'en': 'Online',
      'hi': 'ऑनलाइन',
      'te': 'ఆన్‌లైన్',
      'ta': 'ஆன்லைன்',
      'bn': 'অনলাইন',
      'kn': 'ಆನ್‌ಲೈನ್'
    },
    'offline': {
      'en': 'Offline',
      'hi': 'ऑफलाइन',
      'te': 'ఆఫ్‌లైన్',
      'ta': 'ஆஃப்லைன்',
      'bn': 'অফলাইন',
      'kn': 'ಆಫ್‌ಲೈನ್'
    }
  };

  return translations[key]?.[language] || translations[key]?.['en'] || key;
}

function showNotification(message, type = 'info') {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 10000;
    max-width: 200px;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}