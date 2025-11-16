# RabbitMQ Post-Installation Setup Script
# Run this after RabbitMQ installation completes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RabbitMQ Post-Installation Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if RabbitMQ is installed
$rabbitmqPath = "C:\Program Files\RabbitMQ Server"
if (-not (Test-Path $rabbitmqPath)) {
    Write-Host "ERROR: RabbitMQ is not installed at $rabbitmqPath" -ForegroundColor Red
    Write-Host "Please complete the installation first." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✓ RabbitMQ installation found" -ForegroundColor Green

# Check RabbitMQ service
Write-Host "`nChecking RabbitMQ service..." -ForegroundColor Yellow
$service = Get-Service -Name "RabbitMQ" -ErrorAction SilentlyContinue

if (-not $service) {
    Write-Host "⚠ RabbitMQ service not found" -ForegroundColor Yellow
    Write-Host "Attempting to install service..." -ForegroundColor Yellow
    
    # Find rabbitmq-service.bat
    $serviceBat = Get-ChildItem -Path $rabbitmqPath -Recurse -Filter "rabbitmq-service.bat" | Select-Object -First 1
    
    if ($serviceBat) {
        Write-Host "Installing RabbitMQ service..." -ForegroundColor Yellow
        & $serviceBat.FullName install
        & $serviceBat.FullName start
    }
} else {
    Write-Host "✓ RabbitMQ service found: $($service.Status)" -ForegroundColor Green
    
    if ($service.Status -ne "Running") {
        Write-Host "Starting RabbitMQ service..." -ForegroundColor Yellow
        Start-Service -Name "RabbitMQ"
        Start-Sleep -Seconds 3
        $service = Get-Service -Name "RabbitMQ"
        Write-Host "✓ RabbitMQ service status: $($service.Status)" -ForegroundColor Green
    }
}

# Enable Management Plugin
Write-Host "`nEnabling Management Plugin..." -ForegroundColor Yellow
$pluginScript = Get-ChildItem -Path $rabbitmqPath -Recurse -Filter "rabbitmq-plugins.bat" | Select-Object -First 1

if ($pluginScript) {
    & $pluginScript.FullName enable rabbitmq_management
    Write-Host "✓ Management plugin enabled" -ForegroundColor Green
} else {
    Write-Host "⚠ rabbitmq-plugins.bat not found" -ForegroundColor Yellow
}

# Test connection
Write-Host "`nTesting RabbitMQ connection..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:15672" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ RabbitMQ Management UI is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Management UI not yet accessible (may need more time)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "RabbitMQ Management UI: http://localhost:15672" -ForegroundColor Cyan
Write-Host "Default credentials: guest / guest" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify .env has: RABBITMQ_URL=amqp://localhost:5672" -ForegroundColor White
Write-Host "2. Restart backend server: npm start" -ForegroundColor White
Write-Host "3. Look for: 'PDF Worker started successfully'" -ForegroundColor White
Write-Host ""

pause
