import { config } from './config.js';

let sessionId = null;

// DOM elements
const submitButton = document.getElementById('submit-button');
const skipButton = document.getElementById('skip-button');
const textareas = document.querySelectorAll('textarea');
const roleSelect = document.getElementById('role-select');

// Get session ID from URL
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  sessionId = urlParams.get('sessionId');
  
  console.log('Learning page opened for session:', sessionId);
  
  // Set up event listeners
  submitButton.addEventListener('click', submitLearnings);
  skipButton.addEventListener('click', closeWindow);
  
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