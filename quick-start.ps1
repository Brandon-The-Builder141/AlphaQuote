# Quick Start Script for AlphaQuote + Smart Catalog
# Run from the AlphaQuote root directory

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  AlphaQuote + Smart Catalog - Quick Start" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Check current directory
if (!(Test-Path "Catalog") -or !(Test-Path "frontend")) {
    Write-Host "[ERROR] Please run this script from the AlphaQuote root directory" -ForegroundColor Red
    Write-Host "        Current location: $PWD" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/2] Starting Smart Catalog API..." -ForegroundColor Yellow
Write-Host "      Opening in new window..." -ForegroundColor Gray

# Start Catalog API in new window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PWD\Catalog'; Write-Host ''; Write-Host '======================================================================' -ForegroundColor Cyan; Write-Host '  Smart Catalog API' -ForegroundColor Cyan; Write-Host '======================================================================' -ForegroundColor Cyan; Write-Host ''; python main.py"
)

Write-Host "      Waiting for API to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Check Catalog API
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "      [OK] Catalog API is running!" -ForegroundColor Green
    Write-Host "      URL: http://localhost:8000" -ForegroundColor Gray
    Write-Host "      Docs: http://localhost:8000/docs" -ForegroundColor Gray
} catch {
    Write-Host "      [!] Warning: Could not verify Catalog API" -ForegroundColor Yellow
    Write-Host "          Check the Catalog API window for errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[2/2] Starting AlphaQuote Frontend..." -ForegroundColor Yellow
Write-Host "      This will take 20-30 seconds to compile" -ForegroundColor Gray
Write-Host "      Browser will open automatically when ready" -ForegroundColor Gray
Write-Host ""

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Starting Frontend..." -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Change to frontend directory and start
Set-Location -Path "frontend"

Write-Host "Compiling React application..." -ForegroundColor Yellow
Write-Host "Please wait 20-30 seconds..." -ForegroundColor Gray
Write-Host ""
Write-Host "Once compiled, browser will open to: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Test page will be at: http://localhost:3000/catalog-test" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend" -ForegroundColor Gray
Write-Host ""

# Start frontend (this will run in current window)
npm start

