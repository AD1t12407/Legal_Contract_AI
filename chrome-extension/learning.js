import { config } from './config.js';

let sessionId = null;
let selectedLanguage = 'en';

// Voice recording variables
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingStartTime = null;

// DOM elements
const submitButton = document.getElementById('submit-button');
const skipButton = document.getElementById('skip-button');
const textareas = document.querySelectorAll('textarea');
const roleSelect = document.getElementById('role-select');
const voiceRecordBtn = document.getElementById('voice-record-btn');
const voiceBtnText = document.getElementById('voice-btn-text');
const voiceStatus = document.getElementById('voice-status');
const recordingTime = document.getElementById('recording-time');

// Get session ID from URL
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  sessionId = urlParams.get('sessionId');

  console.log('Learning page opened for session:', sessionId);

  // Load language preference
  loadLanguagePreference();

  // Set up event listeners
  submitButton.addEventListener('click', submitLearnings);
  skipButton.addEventListener('click', closeWindow);

  // Voice recording
  if (voiceRecordBtn) {
    voiceRecordBtn.addEventListener('click', toggleRecording);
  }

  // Auto-resize textareas as user types
  textareas.forEach(textarea => {
    textarea.addEventListener('input', autoResize);
    // Initial resize
    setTimeout(() => autoResize.call(textarea), 10);
  });
});

// Submit learning items to the background script
async function submitLearnings() {
  // Collect non-empty learning items
  const learnings = [];
  textareas.forEach(textarea => {
    const text = textarea.value.trim();
    if (text) {
      learnings.push(text);
    }
  });

  if (learnings.length === 0) {
    alert('Please enter at least one learning item before submitting.');
    return;
  }

  try {
    // Get selected role
    const role = roleSelect ? roleSelect.value : 'student';

    // Show loading state
    submitButton.innerHTML = '<span class="loading-spinner"></span> Submitting...';
    submitButton.disabled = true;

    // Send all learning items to the background script
    await chrome.runtime.sendMessage({
      action: 'submitLearning',
      learning: learnings,
      sessionId,
      role
    });

    // Show success message
    submitButton.innerHTML = '✓ Submitted!';

    // Close the window after a short delay
    setTimeout(closeWindow, 1500);
  } catch (error) {
    console.error('Failed to submit learnings:', error);
    submitButton.innerHTML = 'Submit Learnings';
    submitButton.disabled = false;
    alert('There was an error submitting your learnings. Please try again.');
  }
}

// Close the window
function closeWindow() {
  window.close();
}

// Auto-resize textarea based on content
function autoResize() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
}

// Load language preference from storage
function loadLanguagePreference() {
  chrome.storage.local.get(['selectedLanguage'], (result) => {
    selectedLanguage = result.selectedLanguage || 'en';
    updatePlaceholders();
  });
}

// Toggle voice recording
async function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

// Start voice recording
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      processRecordedAudio();
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    isRecording = true;
    recordingStartTime = Date.now();

    updateRecordingUI(true);
    startRecordingTimer();

    console.log('Recording started');

  } catch (error) {
    console.error('Error starting recording:', error);
    showNotification('Microphone access denied. Please use text input instead.', 'error');
  }
}

// Stop voice recording
function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    updateRecordingUI(false);
    stopRecordingTimer();
    console.log('Recording stopped');
  }
}

// Process recorded audio
async function processRecordedAudio() {
  try {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

    // Show processing message
    showNotification('Voice recording captured! Processing...', 'info');

    // Simulate processing and fill first empty textarea
    setTimeout(() => {
      const firstEmptyTextarea = Array.from(textareas).find(textarea => !textarea.value.trim());
      if (firstEmptyTextarea) {
        const placeholderText = getVoicePlaceholderText(selectedLanguage);
        firstEmptyTextarea.value = placeholderText;
        firstEmptyTextarea.focus();
        autoResize.call(firstEmptyTextarea);
      }
    }, 1000);

  } catch (error) {
    console.error('Error processing audio:', error);
    showNotification('Failed to process voice recording. Please try again.', 'error');
  }
}

// Update recording UI
function updateRecordingUI(recording) {
  if (recording) {
    voiceRecordBtn.classList.add('recording');
    if (voiceBtnText) voiceBtnText.textContent = getRecordingText(selectedLanguage);
    if (voiceStatus) voiceStatus.classList.remove('hidden');
  } else {
    voiceRecordBtn.classList.remove('recording');
    if (voiceBtnText) voiceBtnText.textContent = getVoiceButtonText(selectedLanguage);
    if (voiceStatus) voiceStatus.classList.add('hidden');
  }
}

// Start recording timer
function startRecordingTimer() {
  recordingTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    if (recordingTime) {
      recordingTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

// Stop recording timer
function stopRecordingTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
}

// Update placeholders based on language
function updatePlaceholders() {
  const placeholders = getPlaceholders(selectedLanguage);

  textareas.forEach((textarea, index) => {
    if (placeholders[index]) {
      textarea.placeholder = placeholders[index];
    }
  });

  if (voiceBtnText) {
    voiceBtnText.textContent = getVoiceButtonText(selectedLanguage);
  }
}

// Language-specific text functions
function getPlaceholders(language) {
  const placeholders = {
    'en': ['I learned that...', 'I discovered that...', 'I realized that...', 'I understood that...', 'I found out that...'],
    'hi': ['मैंने सीखा कि...', 'मैंने खोजा कि...', 'मुझे एहसास हुआ कि...', 'मैंने समझा कि...', 'मुझे पता चला कि...'],
    'te': ['నేను నేర్చుకున్నాను...', 'నేను కనుగొన్నాను...', 'నేను గ్రహించాను...', 'నేను అర్థం చేసుకున్నాను...', 'నేను తెలుసుకున్నాను...'],
    'ta': ['நான் கற்றுக்கொண்டேன்...', 'நான் கண்டுபிடித்தேன்...', 'நான் உணர்ந்தேன்...', 'நான் புரிந்துகொண்டேன்...', 'நான் கண்டறிந்தேன்...'],
    'bn': ['আমি শিখেছি যে...', 'আমি আবিষ্কার করেছি যে...', 'আমি বুঝতে পেরেছি যে...', 'আমি বুঝেছি যে...', 'আমি জানতে পেরেছি যে...'],
    'kn': ['ನಾನು ಕಲಿತಿದ್ದೇನೆ...', 'ನಾನು ಕಂಡುಕೊಂಡಿದ್ದೇನೆ...', 'ನಾನು ಅರಿತುಕೊಂಡಿದ್ದೇನೆ...', 'ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ...', 'ನಾನು ತಿಳಿದುಕೊಂಡಿದ್ದೇನೆ...']
  };
  return placeholders[language] || placeholders['en'];
}

function getVoiceButtonText(language) {
  const texts = {
    'en': 'Speak your learning',
    'hi': 'अपनी सीख बोलें',
    'te': 'మీ అభ్యాసాన్ని మాట్లాడండి',
    'ta': 'உங்கள் கற்றலைப் பேசுங்கள்',
    'bn': 'আপনার শেখা বলুন',
    'kn': 'ನಿಮ್ಮ ಕಲಿಕೆಯನ್ನು ಮಾತನಾಡಿ'
  };
  return texts[language] || texts['en'];
}

function getRecordingText(language) {
  const texts = {
    'en': 'Recording... Tap to stop',
    'hi': 'रिकॉर्डिंग... रोकने के लिए टैप करें',
    'te': 'రికార్డింగ్... ఆపడానికి ట్యాప్ చేయండి',
    'ta': 'பதிவு செய்கிறது... நிறுத்த தட்டவும்',
    'bn': 'রেকর্ডিং... বন্ধ করতে ট্যাপ করুন',
    'kn': 'ರೆಕಾರ್ಡಿಂಗ್... ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ'
  };
  return texts[language] || texts['en'];
}

function getVoicePlaceholderText(language) {
  const texts = {
    'en': '[Voice recording processed] I learned something important from this session...',
    'hi': '[आवाज़ रिकॉर्डिंग प्रोसेस की गई] मैंने इस सेशन से कुछ महत्वपूर्ण सीखा...',
    'te': '[వాయిస్ రికార్డింగ్ ప్రాసెస్ చేయబడింది] నేను ఈ సెషన్ నుండి ముఖ్యమైన విషయం నేర్చుకున్నాను...',
    'ta': '[குரல் பதிவு செயலாக்கப்பட்டது] இந்த அமர்விலிருந்து நான் முக்கியமான ஒன்றைக் கற்றுக்கொண்டேன்...',
    'bn': '[ভয়েস রেকর্ডিং প্রক্রিয়াজাত] আমি এই সেশন থেকে গুরুত্বপূর্ণ কিছু শিখেছি...',
    'kn': '[ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ] ನಾನು ಈ ಸೆಷನ್‌ನಿಂದ ಮುಖ್ಯವಾದ ಏನನ್ನಾದರೂ ಕಲಿತಿದ್ದೇನೆ...'
  };
  return texts[language] || texts['en'];
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  const colors = {
    'error': '#ef4444',
    'success': '#10b981',
    'info': '#3b82f6'
  };

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors['info']};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 300px;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, type === 'error' ? 5000 : 3000);
}