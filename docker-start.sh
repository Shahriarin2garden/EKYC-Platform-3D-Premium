#!/bin/bash
# Quick Start Script for EKYC Platform Docker Setup (Linux/Mac)

echo "🐳 EKYC Platform - Docker Quick Start"
echo "====================================="
echo ""

# Check if Docker is installed
echo "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
echo "✅ Docker installed: $DOCKER_VERSION"

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not available"
    exit 1
fi

COMPOSE_VERSION=$(docker compose version)
echo "✅ Docker Compose installed: $COMPOSE_VERSION"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "💡 You can edit .env file to customize configuration"
else
    echo "✅ .env file already exists"
fi

echo ""

# Ask user which mode to run
echo "Choose mode:"
echo "  1) Production (default)"
echo "  2) Development (with hot-reload)"
echo ""
read -p "Enter your choice (1 or 2): " mode

echo ""

if [ "$mode" == "2" ]; then
    echo "🚀 Starting in DEVELOPMENT mode..."
    echo "This will enable hot-reload for both frontend and backend"
    echo ""
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
else
    echo "🚀 Starting in PRODUCTION mode..."
    echo ""
    docker compose up --build -d
fi

echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to start (this may take a minute)..."
sleep 10

echo ""

# Check service status
echo "📊 Service Status:"
docker compose ps

echo ""

# Show access URLs
echo "✅ EKYC Platform is starting!"
echo ""
echo "🌐 Access URLs:"
echo "  Frontend:          http://localhost:3000"
echo "  Backend API:       http://localhost:5000/api/health"
echo "  RabbitMQ Console:  http://localhost:15672 (admin/admin123)"
echo "  MongoDB:           mongodb://localhost:27017"
echo ""

echo "📝 Useful Commands:"
echo "  View logs:         docker compose logs -f"
echo "  Stop services:     docker compose down"
echo "  Restart:           docker compose restart"
echo "  Full cleanup:      docker compose down -v"
echo ""

echo "📚 For detailed documentation, see DOCKER_GUIDE.md"
echo ""

# Ask if user wants to view logs
read -p "Would you like to view the logs now? (y/n): " view_logs
if [ "$view_logs" == "y" ] || [ "$view_logs" == "Y" ]; then
    docker compose logs -f
fi
