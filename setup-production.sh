#!/bin/bash

# AutoPom Learning Extension Production Setup Script

echo "Setting up AutoPom Learning Extension for production..."

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    echo "# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
POSTGRES_DB=autopom

# Redis
REDIS_PASSWORD=changeme

# API Keys
OPENAI_API_KEY=
TAVILY_API_KEY=

# CORS
ALLOWED_ORIGINS=https://app.autopom.app,chrome-extension://*/" > .env
    
    echo ".env file created. Please edit it with your actual values."
fi

# Create necessary directories
echo "Creating required directories..."
mkdir -p nginx/ssl
mkdir -p nginx/www

# Check if SSL certificates exist
if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
    echo "SSL certificates not found in nginx/ssl/"
    echo "For production, please add your SSL certificates:"
    echo "  - nginx/ssl/cert.pem: Your SSL certificate"
    echo "  - nginx/ssl/key.pem: Your SSL private key"
    echo ""
    echo "For development/testing, you can generate self-signed certificates:"
    echo "openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes"
fi

# Build the frontend and extension
echo "Building frontend and extension for production..."
npm install
npm run build:production

# Deploy with Docker Compose
echo "Deploying services with Docker Compose..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "Setup complete! Your application should be running at:"
echo "  - API: https://api.autopom.app"
echo ""
echo "Next steps:"
echo "1. Configure your DNS to point to your server"
echo "2. Load the Chrome extension from chrome-extension/dist or publish to Chrome Web Store"
echo "3. Deploy the web application from the dist directory to your hosting provider" 