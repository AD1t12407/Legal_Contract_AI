// Content script for AutoPom Learning Assistant
// Handles page interaction, focus tracking, and learning capture

let isTracking = false;
let sessionStartTime = null;
let pageInteractions = [];
let learningContent = [];
let currentLanguage = 'en';

// Initialize content script
(function() {
    console.log('AutoPom content script loaded');
    
    // Load user preferences
    loadUserPreferences();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Track page interactions
    setupPageTracking();
    
    // Create floating assistant button
    createFloatingAssistant();
})();

// Load user preferences from storage
function loadUserPreferences() {
    chrome.storage.local.get(['selectedLanguage', 'simpleMode', 'voiceEnabled'], (result) => {
        currentLanguage = result.selectedLanguage || 'en';
        
        if (result.simpleMode) {
            enableSimpleMode();
        }
        
        console.log('Loaded preferences:', result);
    });
}

// Handle messages from background script
function handleMessage(message, sender, sendResponse) {
    console.log('Content script received message:', message);
    
    switch (message.action) {
        case 'startTracking':
            startTracking(message.sessionId);
            sendResponse({ success: true });
            break;
            
        case 'stopTracking':
            stopTracking();
            sendResponse({ success: true, learningContent });
            break;
            
        case 'captureContent':
            capturePageContent();
            sendResponse({ success: true });
            break;
            
        case 'showLearningPrompt':
            showLearningPrompt(message.sessionId);
            sendResponse({ success: true });
            break;
            
        case 'updateLanguage':
            currentLanguage = message.language;
            updateUILanguage();
            sendResponse({ success: true });
            break;
    }
    
    return true;
}

// Start tracking user interactions
function startTracking(sessionId) {
    isTracking = true;
    sessionStartTime = Date.now();
    pageInteractions = [];
    learningContent = [];
    
    console.log('Started tracking session:', sessionId);
    
    // Show tracking indicator
    showTrackingIndicator();
    
    // Start capturing interactions
    document.addEventListener('scroll', trackScroll);
    document.addEventListener('click', trackClick);
    document.addEventListener('keydown', trackKeyboard);
    
    // Capture initial page content
    capturePageContent();
}

// Stop tracking
function stopTracking() {
    isTracking = false;
    
    console.log('Stopped tracking. Captured interactions:', pageInteractions.length);
    
    // Remove event listeners
    document.removeEventListener('scroll', trackScroll);
    document.removeEventListener('click', trackClick);
    document.removeEventListener('keydown', trackKeyboard);
    
    // Hide tracking indicator
    hideTrackingIndicator();
    
    // Process and extract learning content
    processLearningContent();
}

// Track scroll behavior
function trackScroll() {
    if (!isTracking) return;
    
    const scrollData = {
        type: 'scroll',
        timestamp: Date.now(),
        scrollY: window.scrollY,
        scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
    };
    
    pageInteractions.push(scrollData);
}

// Track clicks
function trackClick(event) {
    if (!isTracking) return;
    
    const clickData = {
        type: 'click',
        timestamp: Date.now(),
        element: event.target.tagName,
        text: event.target.textContent?.substring(0, 100) || '',
        url: event.target.href || window.location.href
    };
    
    pageInteractions.push(clickData);
}

// Track keyboard interactions
function trackKeyboard(event) {
    if (!isTracking) return;
    
    // Only track meaningful keys, not every keystroke for privacy
    if (['Enter', 'Tab', 'Escape'].includes(event.key)) {
        const keyData = {
            type: 'keyboard',
            timestamp: Date.now(),
            key: event.key,
            element: event.target.tagName
        };
        
        pageInteractions.push(keyData);
    }
}

// Capture page content for learning
function capturePageContent() {
    const content = {
        url: window.location.href,
        title: document.title,
        timestamp: Date.now(),
        text: extractMainContent(),
        images: extractImages(),
        videos: extractVideos()
    };
    
    learningContent.push(content);
    console.log('Captured page content:', content.title);
}

// Extract main text content from page
function extractMainContent() {
    // Remove script and style elements
    const clonedDoc = document.cloneNode(true);
    const scripts = clonedDoc.querySelectorAll('script, style, nav, header, footer, aside');
    scripts.forEach(el => el.remove());
    
    // Get main content areas
    const mainSelectors = ['main', 'article', '.content', '.post', '.entry'];
    let mainContent = '';
    
    for (const selector of mainSelectors) {
        const element = clonedDoc.querySelector(selector);
        if (element) {
            mainContent = element.textContent || '';
            break;
        }
    }
    
    // Fallback to body content
    if (!mainContent) {
        mainContent = clonedDoc.body?.textContent || '';
    }
    
    // Clean and limit content
    return mainContent
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit to 5000 characters
}

// Extract images from page
function extractImages() {
    const images = Array.from(document.querySelectorAll('img'))
        .filter(img => img.src && img.width > 100 && img.height > 100)
        .slice(0, 5) // Limit to 5 images
        .map(img => ({
            src: img.src,
            alt: img.alt || '',
            title: img.title || ''
        }));
    
    return images;
}

// Extract videos from page
function extractVideos() {
    const videos = Array.from(document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]'))
        .slice(0, 3) // Limit to 3 videos
        .map(video => ({
            src: video.src || video.querySelector('source')?.src || '',
            title: video.title || video.alt || ''
        }));
    
    return videos;
}

// Process learning content and extract key insights
function processLearningContent() {
    // Analyze interaction patterns
    const totalTime = Date.now() - sessionStartTime;
    const scrollEvents = pageInteractions.filter(i => i.type === 'scroll').length;
    const clickEvents = pageInteractions.filter(i => i.type === 'click').length;
    
    // Create learning summary
    const learningSummary = {
        sessionDuration: totalTime,
        pagesVisited: learningContent.length,
        interactionCount: pageInteractions.length,
        scrollActivity: scrollEvents,
        clickActivity: clickEvents,
        focusScore: calculateFocusScore(),
        mainTopics: extractMainTopics(),
        timestamp: Date.now()
    };
    
    // Send to background script
    chrome.runtime.sendMessage({
        action: 'learningDataProcessed',
        data: {
            summary: learningSummary,
            content: learningContent,
            interactions: pageInteractions
        }
    });
    
    console.log('Learning data processed:', learningSummary);
}

// Calculate focus score based on interactions
function calculateFocusScore() {
    if (pageInteractions.length === 0) return 0;
    
    const sessionDuration = Date.now() - sessionStartTime;
    const avgTimePerInteraction = sessionDuration / pageInteractions.length;
    
    // Higher score for longer, more focused interactions
    let score = Math.min(100, Math.max(0, (avgTimePerInteraction / 1000) * 10));
    
    // Penalize excessive tab switching or rapid clicking
    const rapidClicks = pageInteractions.filter((interaction, index) => {
        if (index === 0) return false;
        const prevInteraction = pageInteractions[index - 1];
        return interaction.timestamp - prevInteraction.timestamp < 500;
    }).length;
    
    score = Math.max(0, score - (rapidClicks * 5));
    
    return Math.round(score);
}

// Extract main topics from content
function extractMainTopics() {
    const allText = learningContent.map(c => c.text).join(' ');
    const words = allText.toLowerCase().match(/\b\w{4,}\b/g) || [];
    
    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Get top 10 most frequent words
    const topWords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);
    
    return topWords;
}

// Show tracking indicator
function showTrackingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'autopom-tracking-indicator';
    indicator.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4f46e5;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 8px;
        ">
            <div style="
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
            "></div>
            ${getLocalizedText('tracking', currentLanguage)}
        </div>
        <style>
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
    `;
    
    document.body.appendChild(indicator);
}

// Hide tracking indicator
function hideTrackingIndicator() {
    const indicator = document.getElementById('autopom-tracking-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Create floating assistant button
function createFloatingAssistant() {
    const assistant = document.createElement('div');
    assistant.id = 'autopom-floating-assistant';
    assistant.innerHTML = `
        <button style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
            z-index: 9999;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="window.autopomAssistant.toggle()">
            🧠
        </button>
    `;
    
    document.body.appendChild(assistant);
    
    // Add assistant functionality
    window.autopomAssistant = {
        toggle: () => {
            chrome.runtime.sendMessage({ action: 'toggleAssistant' });
        }
    };
}

// Show learning prompt overlay
function showLearningPrompt(sessionId) {
    const overlay = document.createElement('div');
    overlay.id = 'autopom-learning-overlay';
    overlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h2 style="color: #4f46e5; margin-bottom: 20px;">
                    ${getLocalizedText('sessionComplete', currentLanguage)}
                </h2>
                <p style="color: #666; margin-bottom: 30px;">
                    ${getLocalizedText('capturePrompt', currentLanguage)}
                </p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="window.autopomLearning.openLearningPage('${sessionId}')" style="
                        background: #4f46e5;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                    ">
                        ${getLocalizedText('captureLearning', currentLanguage)}
                    </button>
                    <button onclick="window.autopomLearning.skip()" style="
                        background: #e5e7eb;
                        color: #374151;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                    ">
                        ${getLocalizedText('skipForNow', currentLanguage)}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add learning functionality
    window.autopomLearning = {
        openLearningPage: (sessionId) => {
            chrome.runtime.sendMessage({ 
                action: 'openLearningPage', 
                sessionId: sessionId 
            });
            overlay.remove();
        },
        skip: () => {
            overlay.remove();
        }
    };
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (document.getElementById('autopom-learning-overlay')) {
            overlay.remove();
        }
    }, 10000);
}

// Enable simple mode for low digital literacy users
function enableSimpleMode() {
    const style = document.createElement('style');
    style.textContent = `
        #autopom-floating-assistant button {
            width: 80px !important;
            height: 80px !important;
            font-size: 32px !important;
        }
        
        #autopom-tracking-indicator {
            font-size: 16px !important;
            padding: 12px 20px !important;
        }
        
        #autopom-learning-overlay h2 {
            font-size: 28px !important;
        }
        
        #autopom-learning-overlay p {
            font-size: 18px !important;
        }
        
        #autopom-learning-overlay button {
            font-size: 18px !important;
            padding: 16px 32px !important;
        }
    `;
    
    document.head.appendChild(style);
}

// Update UI language
function updateUILanguage() {
    // Update tracking indicator
    const indicator = document.getElementById('autopom-tracking-indicator');
    if (indicator) {
        const textElement = indicator.querySelector('div');
        if (textElement) {
            textElement.lastChild.textContent = getLocalizedText('tracking', currentLanguage);
        }
    }
}

// Get localized text
function getLocalizedText(key, language) {
    const translations = {
        'tracking': {
            'en': 'Focus Session Active',
            'hi': 'फोकस सेशन सक्रिय',
            'te': 'ఫోకస్ సెషన్ చురుకుగా ఉంది',
            'ta': 'கவன அமர்வு செயலில் உள்ளது',
            'bn': 'ফোকাস সেশন সক্রিয়',
            'kn': 'ಫೋಕಸ್ ಸೆಷನ್ ಸಕ್ರಿಯ'
        },
        'sessionComplete': {
            'en': 'Focus Session Complete!',
            'hi': 'फोकस सेशन पूरा!',
            'te': 'ఫోకస్ సెషన్ పూర్తయింది!',
            'ta': 'கவன அமர்வு முடிந்தது!',
            'bn': 'ফোকাস সেশন সম্পূর্ণ!',
            'kn': 'ಫೋಕಸ್ ಸೆಷನ್ ಪೂರ್ಣಗೊಂಡಿದೆ!'
        },
        'capturePrompt': {
            'en': 'Take a moment to capture what you learned during this session.',
            'hi': 'इस सेशन में आपने जो सीखा है उसे कैप्चर करने के लिए एक पल लें।',
            'te': 'ఈ సెషన్‌లో మీరు నేర్చుకున్న వాటిని క్యాప్చర్ చేయడానికి కొంత సమయం తీసుకోండి।',
            'ta': 'இந்த அமர்வில் நீங்கள் கற்றுக்கொண்டதைப் பதிவுசெய்ய சிறிது நேரம் எடுத்துக்கொள்ளுங்கள்।',
            'bn': 'এই সেশনে আপনি যা শিখেছেন তা ক্যাপচার করতে একটু সময় নিন।',
            'kn': 'ಈ ಸೆಷನ್‌ನಲ್ಲಿ ನೀವು ಕಲಿತದ್ದನ್ನು ಸೆರೆಹಿಡಿಯಲು ಸ್ವಲ್ಪ ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಿ।'
        },
        'captureLearning': {
            'en': 'Capture Learning',
            'hi': 'सीख कैप्चर करें',
            'te': 'అభ్యాసాన్ని సంగ్రహించండి',
            'ta': 'கற்றலைப் பதிவுசெய்யுங்கள்',
            'bn': 'শেখা ক্যাপচার করুন',
            'kn': 'ಕಲಿಕೆಯನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ'
        },
        'skipForNow': {
            'en': 'Skip for Now',
            'hi': 'अभी के लिए छोड़ें',
            'te': 'ఇప్పుడు దాటవేయండి',
            'ta': 'இப்போதைக்கு தவிர்க்கவும்',
            'bn': 'এখনকার জন্য এড়িয়ে যান',
            'kn': 'ಈಗ ಬಿಟ್ಟುಬಿಡಿ'
        }
    };
    
    return translations[key]?.[language] || translations[key]?.['en'] || key;
}
