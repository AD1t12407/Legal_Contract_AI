import { config } from './config.js';

// Core system state
let activeSession = null;
let pendingEvents = [];
let userPreferences = {
    language: 'en',
    simpleMode: false,
    voiceEnabled: true,
    offlineMode: false
};
let agentSystem = null;

// API endpoints
const API_BASE_URL = config.API_BASE_URL;
const WS_BASE_URL = config.WS_BASE_URL;

// Agent system for multilingual learning
class AutoPomAgentSystem {
    constructor() {
        this.agents = {
            languageSelector: new LanguageSelectorAgent(),
            speech: new SpeechAgent(),
            quiz: new QuizAgent(),
            focus: new FocusAgent(),
            offlineSync: new OfflineSyncAgent()
        };
        this.isOnline = navigator.onLine;
        this.setupNetworkMonitoring();
    }

    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.agents.offlineSync.syncPendingData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    async executeTask(agentName, task) {
        try {
            const agent = this.agents[agentName];
            if (!agent) {
                throw new Error(`Agent ${agentName} not found`);
            }

            return await agent.execute(task);
        } catch (error) {
            console.error(`Agent ${agentName} error:`, error);
            return { success: false, error: error.message };
        }
    }
}

// Language Selector Agent
class LanguageSelectorAgent {
    constructor() {
        this.supportedLanguages = ['en', 'hi', 'te', 'ta', 'bn', 'kn'];
        this.translationCache = new Map();
    }

    async execute(task) {
        switch (task.type) {
            case 'translate':
                return await this.translateText(task.text, task.targetLanguage, task.sourceLanguage);
            case 'detectLanguage':
                return await this.detectLanguage(task.text);
            case 'localizeContent':
                return await this.localizeContent(task.content, task.targetLanguage);
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    async translateText(text, targetLang, sourceLang = 'en') {
        const cacheKey = `${sourceLang}-${targetLang}-${text.substring(0, 50)}`;

        if (this.translationCache.has(cacheKey)) {
            return { success: true, translatedText: this.translationCache.get(cacheKey) };
        }

        try {
            // Try online translation first
            if (navigator.onLine) {
                const response = await fetch(`${API_BASE_URL}/translate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text,
                        source_language: sourceLang,
                        target_language: targetLang
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    this.translationCache.set(cacheKey, result.translated_text);
                    return { success: true, translatedText: result.translated_text };
                }
            }

            // Fallback to basic translation
            const fallbackTranslation = await this.basicTranslation(text, targetLang);
            return { success: true, translatedText: fallbackTranslation };

        } catch (error) {
            console.error('Translation error:', error);
            return { success: false, error: error.message };
        }
    }

    async basicTranslation(text, targetLang) {
        // Basic translation for common phrases
        const basicTranslations = {
            'hi': {
                'Start Focus Session': 'फोकस सेशन शुरू करें',
                'End Focus Session': 'फोकस सेशन समाप्त करें',
                'What did you learn?': 'आपने क्या सीखा?',
                'Speak your learning': 'अपनी सीख बोलें'
            },
            'te': {
                'Start Focus Session': 'ఫోకస్ సెషన్ ప్రారంభించండి',
                'End Focus Session': 'ఫోకస్ సెషన్ ముగించండి',
                'What did you learn?': 'మీరు ఏమి నేర్చుకున్నారు?',
                'Speak your learning': 'మీ అభ్యాసాన్ని మాట్లాడండి'
            },
            'ta': {
                'Start Focus Session': 'கவன அமர்வைத் தொடங்கவும்',
                'End Focus Session': 'கவன அமர்வை முடிக்கவும்',
                'What did you learn?': 'நீங்கள் என்ன கற்றுக்கொண்டீர்கள்?',
                'Speak your learning': 'உங்கள் கற்றலைப் பேசுங்கள்'
            },
            'bn': {
                'Start Focus Session': 'ফোকাস সেশন শুরু করুন',
                'End Focus Session': 'ফোকাস সেশন শেষ করুন',
                'What did you learn?': 'আপনি কি শিখেছেন?',
                'Speak your learning': 'আপনার শেখা বলুন'
            },
            'kn': {
                'Start Focus Session': 'ಫೋಕಸ್ ಸೆಷನ್ ಪ್ರಾರಂಭಿಸಿ',
                'End Focus Session': 'ಫೋಕಸ್ ಸೆಷನ್ ಕೊನೆಗೊಳಿಸಿ',
                'What did you learn?': 'ನೀವು ಏನು ಕಲಿತಿದ್ದೀರಿ?',
                'Speak your learning': 'ನಿಮ್ಮ ಕಲಿಕೆಯನ್ನು ಮಾತನಾಡಿ'
            }
        };

        return basicTranslations[targetLang]?.[text] || text;
    }

    async detectLanguage(text) {
        // Simple language detection based on script
        const scripts = {
            'hi': /[\u0900-\u097F]/,
            'te': /[\u0C00-\u0C7F]/,
            'ta': /[\u0B80-\u0BFF]/,
            'bn': /[\u0980-\u09FF]/,
            'kn': /[\u0C80-\u0CFF]/
        };

        for (const [lang, regex] of Object.entries(scripts)) {
            if (regex.test(text)) {
                return { success: true, language: lang };
            }
        }

        return { success: true, language: 'en' };
    }

    async localizeContent(content, targetLang) {
        const localizedContent = {
            ...content,
            language: targetLang
        };

        if (content.title) {
            const titleResult = await this.translateText(content.title, targetLang);
            if (titleResult.success) {
                localizedContent.title = titleResult.translatedText;
            }
        }

        if (content.description) {
            const descResult = await this.translateText(content.description, targetLang);
            if (descResult.success) {
                localizedContent.description = descResult.translatedText;
            }
        }

        return { success: true, localizedContent };
    }
}

// Speech Agent for voice I/O
class SpeechAgent {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.speechSynthesis = window.speechSynthesis;
    }

    async execute(task) {
        switch (task.type) {
            case 'startRecording':
                return await this.startRecording();
            case 'stopRecording':
                return await this.stopRecording();
            case 'speechToText':
                return await this.speechToText(task.audioData, task.language);
            case 'textToSpeech':
                return await this.textToSpeech(task.text, task.language);
            case 'voiceInteractionFlow':
                return await this.voiceInteractionFlow(task);
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.audioChunks = [];
            this.isRecording = true;

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();

            return { success: true, message: 'Recording started' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            return { success: false, error: 'No active recording' };
        }

        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.isRecording = false;

                // Clean up
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());

                resolve({
                    success: true,
                    audioBlob: audioBlob,
                    audioData: this.audioChunks
                });
            };

            this.mediaRecorder.stop();
        });
    }

    async speechToText(audioData, language = 'en') {
        try {
            if (navigator.onLine) {
                // Use online Whisper API
                const formData = new FormData();
                const audioBlob = new Blob(audioData, { type: 'audio/webm' });
                formData.append('audio', audioBlob);
                formData.append('language', language);

                const response = await fetch(`${API_BASE_URL}/speech/transcribe`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    return { success: true, text: result.text };
                }
            }

            // Fallback to Web Speech API
            return await this.webSpeechRecognition(language);

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async webSpeechRecognition(language) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return { success: false, error: 'Speech recognition not supported' };
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = this.getWebSpeechLanguageCode(language);
        recognition.continuous = false;
        recognition.interimResults = false;

        return new Promise((resolve) => {
            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                resolve({ success: true, text });
            };

            recognition.onerror = (event) => {
                resolve({ success: false, error: event.error });
            };

            recognition.start();
        });
    }

    getWebSpeechLanguageCode(language) {
        const languageCodes = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'te': 'te-IN',
            'ta': 'ta-IN',
            'bn': 'bn-IN',
            'kn': 'kn-IN'
        };

        return languageCodes[language] || 'en-US';
    }

    async textToSpeech(text, language = 'en') {
        try {
            if (navigator.onLine) {
                // Use online TTS API
                const response = await fetch(`${API_BASE_URL}/speech/synthesize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, language })
                });

                if (response.ok) {
                    const audioBlob = await response.blob();
                    const audioUrl = URL.createObjectURL(audioBlob);

                    const audio = new Audio(audioUrl);
                    await audio.play();

                    return { success: true, audioUrl };
                }
            }

            // Fallback to Web Speech API
            return await this.webSpeechSynthesis(text, language);

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async webSpeechSynthesis(text, language) {
        if (!this.speechSynthesis) {
            return { success: false, error: 'Speech synthesis not supported' };
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getWebSpeechLanguageCode(language);
        utterance.rate = 0.8;
        utterance.pitch = 1;

        return new Promise((resolve) => {
            utterance.onend = () => {
                resolve({ success: true });
            };

            utterance.onerror = (event) => {
                resolve({ success: false, error: event.error });
            };

            this.speechSynthesis.speak(utterance);
        });
    }

    async voiceInteractionFlow(task) {
        const { audioData, language, sessionId } = task;
        const results = {
            stages: {},
            success: false
        };

        try {
            // Stage 1: Speech to Text
            const sttResult = await this.speechToText(audioData, language);
            results.stages.speechToText = sttResult;

            if (!sttResult.success) {
                return results;
            }

            // Stage 2: Process with AI (translate if needed)
            const processResult = await this.processVoiceInput(sttResult.text, language);
            results.stages.processing = processResult;

            if (!processResult.success) {
                return results;
            }

            // Stage 3: Generate response
            const responseResult = await this.generateVoiceResponse(processResult.processedText, language);
            results.stages.response = responseResult;

            if (!responseResult.success) {
                return results;
            }

            // Stage 4: Text to Speech
            const ttsResult = await this.textToSpeech(responseResult.responseText, language);
            results.stages.textToSpeech = ttsResult;

            results.success = true;
            results.finalText = responseResult.responseText;

            return results;

        } catch (error) {
            results.error = error.message;
            return results;
        }
    }

    async processVoiceInput(text, language) {
        try {
            // If not English, translate to English for processing
            if (language !== 'en') {
                const translateResult = await agentSystem.executeTask('languageSelector', {
                    type: 'translate',
                    text: text,
                    targetLanguage: 'en',
                    sourceLanguage: language
                });

                if (translateResult.success) {
                    return { success: true, processedText: translateResult.translatedText, originalText: text };
                }
            }

            return { success: true, processedText: text, originalText: text };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async generateVoiceResponse(text, language) {
        try {
            // Generate AI response
            const response = await fetch(`${API_BASE_URL}/ai/generate-response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: text,
                    language: language,
                    context: 'voice_learning'
                })
            });

            if (response.ok) {
                const result = await response.json();
                return { success: true, responseText: result.response };
            }

            // Fallback response
            const fallbackResponse = await this.generateFallbackResponse(text, language);
            return { success: true, responseText: fallbackResponse };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async generateFallbackResponse(text, language) {
        const responses = {
            'en': `Thank you for sharing: "${text}". That's a valuable learning insight!`,
            'hi': `साझा करने के लिए धन्यवाद: "${text}"। यह एक मूल्यवान सीख है!`,
            'te': `పంచుకున్నందుకు ధన్యవादాలు: "${text}"। ఇది విలువైన అభ్యాస అంతర్దృష్టి!`,
            'ta': `பகிர்ந்ததற்கு நன்றி: "${text}"। இது ஒரு மதிப்புமிக்க கற்றல் நுண்ணறிவு!`,
            'bn': `শেয়ার করার জন্য ধন্যবাদ: "${text}"। এটি একটি মূল্যবান শেখার অন্তর্দৃষ্টি!`,
            'kn': `ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು: "${text}"। ಇದು ಅಮೂಲ್ಯವಾದ ಕಲಿಕೆಯ ಒಳನೋಟವಾಗಿದೆ!`
        };

        return responses[language] || responses['en'];
    }
}

// Configure idle detection (in seconds)
const IDLE_TIMEOUT = 60; // 1 minute
chrome.idle.setDetectionInterval(IDLE_TIMEOUT);

// Quiz Agent for personalized quizzes
class QuizAgent {
    constructor() {
        this.quizCache = new Map();
    }

    async execute(task) {
        switch (task.type) {
            case 'generateQuiz':
                return await this.generateQuiz(task.content, task.language, task.difficulty);
            case 'evaluateAnswer':
                return await this.evaluateAnswer(task.question, task.answer, task.language);
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    async generateQuiz(content, language = 'en', difficulty = 'medium') {
        const cacheKey = `${content.substring(0, 50)}-${language}-${difficulty}`;

        if (this.quizCache.has(cacheKey)) {
            return { success: true, quiz: this.quizCache.get(cacheKey) };
        }

        try {
            if (navigator.onLine) {
                const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, language, difficulty })
                });

                if (response.ok) {
                    const quiz = await response.json();
                    this.quizCache.set(cacheKey, quiz);
                    return { success: true, quiz };
                }
            }

            // Fallback to basic quiz generation
            const fallbackQuiz = await this.generateBasicQuiz(content, language);
            return { success: true, quiz: fallbackQuiz };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async generateBasicQuiz(content, language) {
        const questions = [
            {
                type: 'multiple_choice',
                question: this.getLocalizedText('whatDidYouLearn', language),
                options: [
                    this.getLocalizedText('option1', language),
                    this.getLocalizedText('option2', language),
                    this.getLocalizedText('option3', language),
                    this.getLocalizedText('option4', language)
                ],
                correct: 0
            }
        ];

        return { questions, language, difficulty: 'basic' };
    }

    getLocalizedText(key, language) {
        const texts = {
            'whatDidYouLearn': {
                'en': 'What was the main topic you learned about?',
                'hi': 'आपने मुख्य रूप से किस विषय के बारे में सीखा?',
                'te': 'మీరు ప్రధానంగా ఏ విषయం గురించి నేర్చుకున్నారు?',
                'ta': 'நீங்கள் முக்கியமாக எந்த தலைப்பைப் பற்றி கற்றுக்கொண்டீர்கள்?',
                'bn': 'আপনি প্রধানত কোন বিষয় সম্পর্কে শিখেছেন?',
                'kn': 'ನೀವು ಮುಖ್ಯವಾಗಿ ಯಾವ ವಿಷಯದ ಬಗ್ಗೆ ಕಲಿತಿದ್ದೀರಿ?'
            }
        };

        return texts[key]?.[language] || texts[key]?.['en'] || key;
    }
}

// Focus Agent for personalized focus insights
class FocusAgent {
    constructor() {
        this.focusPatterns = new Map();
    }

    async execute(task) {
        switch (task.type) {
            case 'analyzeFocus':
                return await this.analyzeFocusSession(task.sessionData);
            case 'generateAdvice':
                return await this.generateFocusAdvice(task.userId, task.language);
            case 'trackDistraction':
                return await this.trackDistraction(task.distractionData);
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    async analyzeFocusSession(sessionData) {
        const analysis = {
            focusScore: this.calculateFocusScore(sessionData),
            distractions: this.analyzeDistractions(sessionData.interruptions),
            recommendations: this.generateRecommendations(sessionData),
            patterns: this.identifyPatterns(sessionData)
        };

        return { success: true, analysis };
    }

    calculateFocusScore(sessionData) {
        const duration = sessionData.endTime - sessionData.startTime;
        const interruptions = sessionData.interruptions?.length || 0;

        let score = 100;
        score -= Math.min(50, interruptions * 5); // Penalize interruptions
        score = Math.max(10, score); // Minimum score of 10

        return Math.round(score);
    }

    analyzeDistractions(interruptions = []) {
        const distractionTypes = {};

        interruptions.forEach(interruption => {
            const type = interruption.type || 'unknown';
            distractionTypes[type] = (distractionTypes[type] || 0) + 1;
        });

        return distractionTypes;
    }

    generateRecommendations(sessionData) {
        const recommendations = [];
        const interruptions = sessionData.interruptions?.length || 0;

        if (interruptions > 5) {
            recommendations.push('Consider using website blockers during focus sessions');
        }

        if (sessionData.duration < 15 * 60 * 1000) { // Less than 15 minutes
            recommendations.push('Try to extend your focus sessions gradually');
        }

        return recommendations;
    }

    identifyPatterns(sessionData) {
        // Store session data for pattern analysis
        const userId = sessionData.userId || 'default';
        if (!this.focusPatterns.has(userId)) {
            this.focusPatterns.set(userId, []);
        }

        this.focusPatterns.get(userId).push(sessionData);

        // Keep only last 10 sessions
        const userSessions = this.focusPatterns.get(userId);
        if (userSessions.length > 10) {
            userSessions.splice(0, userSessions.length - 10);
        }

        return this.analyzeUserPatterns(userSessions);
    }

    analyzeUserPatterns(sessions) {
        if (sessions.length < 3) {
            return { message: 'Need more sessions for pattern analysis' };
        }

        const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
        const avgInterruptions = sessions.reduce((sum, s) => sum + (s.interruptions?.length || 0), 0) / sessions.length;

        return {
            averageDuration: Math.round(avgDuration / 60000), // Convert to minutes
            averageInterruptions: Math.round(avgInterruptions),
            trend: this.calculateTrend(sessions)
        };
    }

    calculateTrend(sessions) {
        if (sessions.length < 2) return 'stable';

        const recent = sessions.slice(-3);
        const older = sessions.slice(0, -3);

        const recentAvg = recent.reduce((sum, s) => sum + (s.focusScore || 50), 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + (s.focusScore || 50), 0) / older.length;

        if (recentAvg > olderAvg + 5) return 'improving';
        if (recentAvg < olderAvg - 5) return 'declining';
        return 'stable';
    }
}

// Offline Sync Agent
class OfflineSyncAgent {
    constructor() {
        this.pendingData = [];
        this.syncInProgress = false;
    }

    async execute(task) {
        switch (task.type) {
            case 'storeOffline':
                return await this.storeOfflineData(task.data);
            case 'syncPending':
                return await this.syncPendingData();
            case 'getPendingCount':
                return { success: true, count: this.pendingData.length };
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    async storeOfflineData(data) {
        try {
            this.pendingData.push({
                ...data,
                timestamp: Date.now(),
                id: this.generateId()
            });

            // Store in chrome storage as backup
            await chrome.storage.local.set({
                pendingOfflineData: this.pendingData
            });

            return { success: true, stored: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async syncPendingData() {
        if (this.syncInProgress || !navigator.onLine) {
            return { success: false, reason: 'Sync already in progress or offline' };
        }

        this.syncInProgress = true;
        let syncedCount = 0;

        try {
            const dataToSync = [...this.pendingData];

            for (const item of dataToSync) {
                try {
                    const response = await fetch(`${API_BASE_URL}/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    });

                    if (response.ok) {
                        // Remove synced item
                        this.pendingData = this.pendingData.filter(d => d.id !== item.id);
                        syncedCount++;
                    }
                } catch (error) {
                    console.error('Failed to sync item:', error);
                }
            }

            // Update storage
            await chrome.storage.local.set({
                pendingOfflineData: this.pendingData
            });

            return { success: true, syncedCount, remainingCount: this.pendingData.length };

        } finally {
            this.syncInProgress = false;
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async loadPendingData() {
        try {
            const result = await chrome.storage.local.get(['pendingOfflineData']);
            this.pendingData = result.pendingOfflineData || [];
            return { success: true, count: this.pendingData.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Initialize when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
    console.log('AutoPom Learning Extension installed');

    // Initialize agent system
    agentSystem = new AutoPomAgentSystem();

    // Load user preferences
    await loadUserPreferences();

    // Load pending events and offline data
    loadPendingEvents();
    await agentSystem.executeTask('offlineSync', { type: 'getPendingCount' });

    // Set up periodic sync
    setupPeriodicSync();
});

// Load user preferences
async function loadUserPreferences() {
    try {
        const result = await chrome.storage.local.get(['userPreferences']);
        if (result.userPreferences) {
            userPreferences = { ...userPreferences, ...result.userPreferences };
        }
        console.log('Loaded user preferences:', userPreferences);
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
}

// Set up periodic sync
function setupPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(async () => {
        if (navigator.onLine && agentSystem) {
            await agentSystem.executeTask('offlineSync', { type: 'syncPending' });
        }
    }, 5 * 60 * 1000);
}

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message);

    // Handle async operations
    handleMessage(message, sender, sendResponse);
    return true; // Required for async sendResponse
});

async function handleMessage(message, sender, sendResponse) {
    try {
        switch (message.action) {
            case 'startFocus':
                await startFocusSession();
                sendResponse({ success: true, sessionId: activeSession?.id });
                break;

            case 'stopFocus':
                await stopFocusSession();
                sendResponse({ success: true });
                break;

            case 'getSessionStatus':
                sendResponse({
                    isActive: !!activeSession,
                    sessionId: activeSession?.id,
                    startTime: activeSession?.startTime,
                    interruptions: activeSession?.interruptions || []
                });
                break;

            case 'submitLearning':
                await submitLearning(message.learning, message.sessionId, message.role || 'student');
                sendResponse({ success: true });
                break;

            case 'updateLanguage':
                await updateUserLanguage(message.language);
                sendResponse({ success: true });
                break;

            case 'toggleSimpleMode':
                await toggleSimpleMode(message.enabled);
                sendResponse({ success: true });
                break;

            case 'startVoiceRecording':
                const recordResult = await agentSystem.executeTask('speech', { type: 'startRecording' });
                sendResponse(recordResult);
                break;

            case 'stopVoiceRecording':
                const stopResult = await agentSystem.executeTask('speech', { type: 'stopRecording' });
                sendResponse(stopResult);
                break;

            case 'processVoiceInput':
                const voiceResult = await agentSystem.executeTask('speech', {
                    type: 'voiceInteractionFlow',
                    audioData: message.audioData,
                    language: userPreferences.language,
                    sessionId: message.sessionId
                });
                sendResponse(voiceResult);
                break;

            case 'translateText':
                const translateResult = await agentSystem.executeTask('languageSelector', {
                    type: 'translate',
                    text: message.text,
                    targetLanguage: message.targetLanguage,
                    sourceLanguage: message.sourceLanguage
                });
                sendResponse(translateResult);
                break;

            case 'generateQuiz':
                const quizResult = await agentSystem.executeTask('quiz', {
                    type: 'generateQuiz',
                    content: message.content,
                    language: userPreferences.language,
                    difficulty: message.difficulty
                });
                sendResponse(quizResult);
                break;

            case 'analyzeFocus':
                const focusResult = await agentSystem.executeTask('focus', {
                    type: 'analyzeFocus',
                    sessionData: message.sessionData
                });
                sendResponse(focusResult);
                break;

            case 'toggleAssistant':
                await toggleFloatingAssistant();
                sendResponse({ success: true });
                break;

            case 'openLearningPage':
                await openLearningPage(message.sessionId);
                sendResponse({ success: true });
                break;

            case 'learningDataProcessed':
                await processLearningData(message.data);
                sendResponse({ success: true });
                break;

            case 'storeOfflineData':
                const storeResult = await agentSystem.executeTask('offlineSync', {
                    type: 'storeOffline',
                    data: message.data
                });
                sendResponse(storeResult);
                break;

            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Utility functions for new features
async function updateUserLanguage(language) {
    userPreferences.language = language;
    await chrome.storage.local.set({ userPreferences });

    // Notify all tabs about language change
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'updateLanguage',
                language: language
            });
        } catch (error) {
            // Tab might not have content script
        }
    }
}

async function toggleSimpleMode(enabled) {
    userPreferences.simpleMode = enabled;
    await chrome.storage.local.set({ userPreferences });

    // Notify all tabs about simple mode change
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'toggleSimpleMode',
                enabled: enabled
            });
        } catch (error) {
            // Tab might not have content script
        }
    }
}

async function toggleFloatingAssistant() {
    // Toggle floating assistant visibility
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
        try {
            await chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleFloatingAssistant'
            });
        } catch (error) {
            console.error('Error toggling floating assistant:', error);
        }
    }
}

async function openLearningPage(sessionId) {
    const url = chrome.runtime.getURL('learning.html') + `?sessionId=${sessionId}`;
    await chrome.tabs.create({ url });
}

async function processLearningData(data) {
    try {
        // Analyze focus session
        const focusAnalysis = await agentSystem.executeTask('focus', {
            type: 'analyzeFocus',
            sessionData: {
                ...data.summary,
                interruptions: data.interactions.filter(i => i.type !== 'scroll')
            }
        });

        // Generate quiz if content is available
        if (data.content.length > 0) {
            const mainContent = data.content[0].text;
            if (mainContent && mainContent.length > 100) {
                const quizResult = await agentSystem.executeTask('quiz', {
                    type: 'generateQuiz',
                    content: mainContent,
                    language: userPreferences.language,
                    difficulty: 'medium'
                });

                if (quizResult.success) {
                    // Store quiz for later use
                    await chrome.storage.local.set({
                        [`quiz_${data.summary.timestamp}`]: quizResult.quiz
                    });
                }
            }
        }

        // Store offline if needed
        if (!navigator.onLine) {
            await agentSystem.executeTask('offlineSync', {
                type: 'storeOffline',
                data: {
                    type: 'learning_session',
                    sessionData: data,
                    focusAnalysis: focusAnalysis.success ? focusAnalysis.analysis : null
                }
            });
        }

        console.log('Learning data processed successfully');

    } catch (error) {
        console.error('Error processing learning data:', error);
    }
}

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
async function startFocusSession() {
    const sessionId = Date.now().toString();
    const startTime = new Date().toISOString();

    activeSession = {
        id: sessionId,
        startTime,
        interruptions: [],
        wasIdle: false,
        userId: 'default', // In a real app, this would be the actual user ID
        language: userPreferences.language
    };

    recordEvent('start', sessionId, startTime);

    // Update badge to show active session
    chrome.action.setBadgeText({ text: '🔴' });
    chrome.action.setBadgeBackgroundColor({ color: '#4f46e5' });

    // Notify all tabs to start tracking
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'startTracking',
                sessionId: sessionId
            });
        } catch (error) {
            // Tab might not have content script
        }
    }

    console.log('Focus session started:', activeSession);
}

// Stop a focus session
async function stopFocusSession() {
    if (!activeSession) return;

    const endTime = new Date().toISOString();
    const sessionId = activeSession.id;
    const sessionData = {
        ...activeSession,
        endTime,
        duration: new Date(endTime).getTime() - new Date(activeSession.startTime).getTime()
    };

    recordEvent('stop', sessionId, endTime);

    // Clear badge
    chrome.action.setBadgeText({ text: '' });

    // Notify all tabs to stop tracking
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'stopTracking'
            });
        } catch (error) {
            // Tab might not have content script
        }
    }

    // Analyze the session with Focus Agent
    if (agentSystem) {
        try {
            const focusAnalysis = await agentSystem.executeTask('focus', {
                type: 'analyzeFocus',
                sessionData: sessionData
            });

            if (focusAnalysis.success) {
                console.log('Focus analysis:', focusAnalysis.analysis);
            }
        } catch (error) {
            console.error('Error analyzing focus session:', error);
        }
    }

    // Show learning prompt overlay on active tab
    const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTabs[0]) {
        try {
            await chrome.tabs.sendMessage(activeTabs[0].id, {
                action: 'showLearningPrompt',
                sessionId: sessionId
            });
        } catch (error) {
            // Fallback: open learning page directly
            await openLearningPage(sessionId);
        }
    } else {
        // Fallback: open learning page directly
        await openLearningPage(sessionId);
    }

    console.log('Focus session stopped:', {
        id: sessionId,
        startTime: activeSession.startTime,
        endTime,
        duration: sessionData.duration,
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