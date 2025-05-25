# Learning Extension

A Chrome extension and web application that helps you track focus sessions and learn more effectively.

## Features

- **Focus Sessions Tracking**: Start and stop focus sessions directly from the Chrome extension
- **Interruption Detection**: Automatically detect tab switches, idle time, and other distractions
- **Learning Capture**: Record what you learned during each focus session
- **AI-Enhanced Learning**: Get relevant resources and auto-generated quizzes for your learning items
- **Analytics Dashboard**: View detailed analytics about your focus sessions and learning patterns

## Project Structure

- **chrome-extension/**: Chrome extension source code
- **fastapi-backend/**: FastAPI backend server
- **src/**: React web application
- **nginx/**: Nginx configuration for production deployment

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Python 3.9+
- Docker and Docker Compose (for running the backend)

### Development Setup

#### Chrome Extension

1. Build the extension:
   ```bash
   npm install
   npm run build:extension
   ```

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `chrome-extension/dist` folder

#### Backend API

1. Set up your API keys in `fastapi-backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@postgres/autopom"
   OPENAI_API_KEY="your-openai-api-key"
   TAVILY_API_KEY="your-tavily-api-key"
   REDIS_URL="redis://redis:6379"
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```
   This will start PostgreSQL, Redis, and the FastAPI backend.

#### Web Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the web application at http://localhost:5173

### Production Deployment

#### Environment Setup

1. Create a `.env` file in the project root with the following variables:
   ```
   # Database
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=secure_password_here
   POSTGRES_DB=autopom
   
   # Redis
   REDIS_PASSWORD=secure_redis_password_here
   
   # API Keys
   OPENAI_API_KEY=your_openai_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   
   # CORS
   ALLOWED_ORIGINS=https://app.autopom.app,chrome-extension://*/
   ```

2. Set up SSL certificates:
   - Place your SSL certificates in `nginx/ssl/`:
     - `cert.pem`: Your SSL certificate
     - `key.pem`: Your SSL private key

#### Backend Deployment

Deploy the backend using Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Chrome Extension

Build the extension for production:
```bash
npm run build:production
```

The production-ready extension will be in `chrome-extension/dist`. You can:
1. Publish it to the Chrome Web Store
2. Package it as a CRX file for enterprise distribution

#### Web Application

1. Build the web application for production:
   ```bash
   npm run build:production
   ```

2. Deploy the generated files in the `dist` directory to your web server or hosting service (Netlify, Vercel, etc.)

## API Documentation

When the backend is running, you can access the API documentation at:
- Swagger UI: https://api.autopom.app/docs
- ReDoc: https://api.autopom.app/redoc

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts, Framer Motion
- **Backend**: FastAPI, WebSockets, LangChain, Tavily, OpenAI GPT-4o
- **Chrome Extension**: Manifest V3, JavaScript
- **Database**: PostgreSQL with SQLAlchemy
- **Caching/PubSub**: Redis
- **Deployment**: Docker, Nginx, SSL

