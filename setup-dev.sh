#!/bin/bash

# AutoPom Learning Extension Development Setup Script

echo "Setting up AutoPom Learning Extension for development..."

# Check if .env file exists in fastapi-backend directory, if not create it
if [ ! -f fastapi-backend/.env ]; then
    echo "Creating .env file for the backend..."
    mkdir -p fastapi-backend
    echo "DATABASE_URL=postgresql://postgres:postgres@localhost/autopom
OPENAI_API_KEY=
TAVILY_API_KEY=
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,chrome-extension://*" > fastapi-backend/.env
    
    echo "Backend .env file created. Please add your API keys."
fi

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Build the Chrome extension
echo "Building the Chrome extension for development..."
npm run build:extension

echo "Starting the backend services..."
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 5

echo ""
echo "Development setup complete!"
echo ""
echo "Next steps:"
echo "1. Load the Chrome extension from chrome-extension/dist:"
echo "   - Open Chrome and go to chrome://extensions"
echo "   - Enable Developer mode (top-right corner)"
echo "   - Click Load unpacked and select the chrome-extension/dist folder"
echo ""
echo "2. Start the development server for the web application:"
echo "   npm run dev"
echo ""
echo "3. The FastAPI backend is running at http://localhost:8000"
echo "   API documentation available at http://localhost:8000/docs"
echo ""
echo "4. Add your API keys to fastapi-backend/.env for full functionality:"
echo "   - OPENAI_API_KEY for quiz generation"
echo "   - TAVILY_API_KEY for resource discovery" 