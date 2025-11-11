# Quick MongoDB Setup Script for Windows

Write-Host "🚀 EKYC MongoDB Setup Helper" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is installed
$mongoInstalled = $false
try {
    $mongoVersion = mongod --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $mongoInstalled = $true
        Write-Host "✅ MongoDB is already installed!" -ForegroundColor Green
        Write-Host $mongoVersion[0]
    }
} catch {
    Write-Host "❌ MongoDB is not installed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Choose an option:" -ForegroundColor Cyan
Write-Host "1. Install MongoDB using Chocolatey (Recommended)" -ForegroundColor White
Write-Host "2. Download MongoDB manually" -ForegroundColor White
Write-Host "3. Use MongoDB with Docker" -ForegroundColor White
Write-Host "4. Use MongoDB Atlas (Cloud - Free)" -ForegroundColor White
Write-Host "5. Skip and start server anyway" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Installing MongoDB using Chocolatey..." -ForegroundColor Cyan
        
        # Check if Chocolatey is installed
        if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
            Write-Host "Installing Chocolatey first..." -ForegroundColor Yellow
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        }
        
        Write-Host "Installing MongoDB Community..." -ForegroundColor Cyan
        choco install mongodb -y
        
        Write-Host ""
        Write-Host "✅ MongoDB installation complete!" -ForegroundColor Green
        Write-Host "Starting MongoDB service..." -ForegroundColor Cyan
        net start MongoDB
    }
    
    "2" {
        Write-Host ""
        Write-Host "📥 Opening MongoDB download page..." -ForegroundColor Cyan
        Start-Process "https://www.mongodb.com/try/download/community"
        Write-Host ""
        Write-Host "Instructions:" -ForegroundColor Yellow
        Write-Host "1. Download and install MongoDB Community Server" -ForegroundColor White
        Write-Host "2. During installation, select 'Install MongoDB as a Service'" -ForegroundColor White
        Write-Host "3. After installation, run: net start MongoDB" -ForegroundColor White
        Write-Host "4. Re-run this script" -ForegroundColor White
    }
    
    "3" {
        Write-Host ""
        Write-Host "🐳 Starting MongoDB with Docker..." -ForegroundColor Cyan
        
        # Check if Docker is installed
        if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
            Write-Host "❌ Docker is not installed!" -ForegroundColor Red
            Write-Host "Install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
            Start-Process "https://www.docker.com/products/docker-desktop"
        } else {
            Write-Host "Pulling MongoDB image..." -ForegroundColor Cyan
            docker pull mongo:latest
            
            Write-Host "Starting MongoDB container..." -ForegroundColor Cyan
            docker run -d --name ekyc-mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=ekyc_db mongo:latest
            
            Write-Host ""
            Write-Host "✅ MongoDB is running in Docker!" -ForegroundColor Green
            Write-Host "Connection string: mongodb://localhost:27017/ekyc_db" -ForegroundColor Cyan
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "☁️  Setting up MongoDB Atlas..." -ForegroundColor Cyan
        Start-Process "https://www.mongodb.com/cloud/atlas/register"
        Write-Host ""
        Write-Host "Instructions:" -ForegroundColor Yellow
        Write-Host "1. Create a free MongoDB Atlas account" -ForegroundColor White
        Write-Host "2. Create a free cluster (M0 Sandbox)" -ForegroundColor White
        Write-Host "3. Create a database user" -ForegroundColor White
        Write-Host "4. Whitelist your IP for development" -ForegroundColor White
        Write-Host "5. Get the connection string" -ForegroundColor White
        Write-Host "6. Update MONGODB_URI in backend/.env file" -ForegroundColor White
        Write-Host ""
        Write-Host "Example connection string:" -ForegroundColor Cyan
        Write-Host "mongodb+srv://username:password@cluster.mongodb.net/ekyc_db" -ForegroundColor White
    }
    
    "5" {
        Write-Host ""
        Write-Host "⚠️  Skipping MongoDB setup..." -ForegroundColor Yellow
        Write-Host "Note: The server will fail to start without MongoDB connection" -ForegroundColor Red
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "Starting EKYC Backend Server..." -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend and start server
Set-Location -Path $PSScriptRoot
if (Test-Path "src/server.js") {
    node src/server.js
} else {
    Set-Location -Path "backend"
    node src/server.js
}
