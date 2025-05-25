// Extension Configuration
const CONFIG = {
  development: {
    API_BASE_URL: "http://localhost:8000",
    WS_BASE_URL: "ws://localhost:8000"
  },
  production: {
    API_BASE_URL: "https://api.autopom.app",
    WS_BASE_URL: "wss://api.autopom.app"
  }
};

// Determine environment based on URL
// For development, we'll use the localhost URLs
// In production, the extension would be loaded from the Chrome Web Store
const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';

// For debugging
console.log('Extension environment:', ENV);
console.log('API URL:', CONFIG[ENV].API_BASE_URL);

// Export the config for the current environment
export const config = CONFIG[ENV]; 