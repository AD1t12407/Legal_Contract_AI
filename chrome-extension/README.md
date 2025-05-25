# AutoPom Chrome Extension

Chrome extension for tracking focus sessions and capturing learning moments.

## Features

- Start and stop focus sessions with a single click
- Track tab switches, navigation events, and idle time
- Prompt you to capture what you've learned after each session
- Send events to the AutoPom backend for analytics and enrichment

## Development

The extension is built using vanilla JavaScript and follows the Chrome Extension Manifest V3 format.

## Building the Extension

From the root directory of the project:

```bash
npm install
npm run build:extension
```

This will create the distribution files in `chrome-extension/dist/`.

## Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked" and select the `chrome-extension/dist` directory

## Manual Loading

If you prefer to load the extension directly without building:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked" and select the `chrome-extension` directory
4. Note: This approach may miss some optimizations from the build process

## Configuration

The extension communicates with the API endpoint specified in `background.js`. To change the API URL, modify:

```javascript
// In background.js
const API_BASE_URL = "https://api.autopom.app";
``` 