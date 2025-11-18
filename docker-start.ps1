# Quick Start Script for EKYC Platform Docker Setup
# This script helps you get started quickly with Docker

Write-Host "🐳 EKYC Platform - Docker Quick Start" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose installed: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "💡 You can edit .env file to customize configuration" -ForegroundColor Cyan
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""

# Ask user which mode to run
Write-Host "Choose mode:" -ForegroundColor Yellow
Write-Host "  1) Production (default)"
Write-Host "  2) Development (with hot-reload)"
Write-Host ""
$mode = Read-Host "Enter your choice (1 or 2)"

Write-Host ""

if ($mode -eq "2") {
    Write-Host "🚀 Starting in DEVELOPMENT mode..." -ForegroundColor Cyan
    Write-Host "This will enable hot-reload for both frontend and backend" -ForegroundColor Yellow
    Write-Host ""
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
} else {
    Write-Host "🚀 Starting in PRODUCTION mode..." -ForegroundColor Cyan
    Write-Host ""
    docker compose up --build -d
}

Write-Host ""

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start (this may take a minute)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""

# Check service status
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker compose ps

Write-Host ""

# Show access URLs
Write-Host "✅ EKYC Platform is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:          http://localhost:3000" -ForegroundColor White
Write-Host "  Backend API:       http://localhost:5000/api/health" -ForegroundColor White
Write-Host "  RabbitMQ Console:  http://localhost:15672 (admin/admin123)" -ForegroundColor White
Write-Host "  MongoDB:           mongodb://localhost:27017" -ForegroundColor White
Write-Host ""

Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:         docker compose logs -f" -ForegroundColor White
Write-Host "  Stop services:     docker compose down" -ForegroundColor White
Write-Host "  Restart:           docker compose restart" -ForegroundColor White
Write-Host "  Full cleanup:      docker compose down -v" -ForegroundColor White
Write-Host ""

Write-Host "📚 For detailed documentation, see DOCKER_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to view logs
$viewLogs = Read-Host "Would you like to view the logs now? (y/n)"
if ($viewLogs -eq "y" -or $viewLogs -eq "Y") {
    docker compose logs -f
}
