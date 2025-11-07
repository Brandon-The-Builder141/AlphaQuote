# PowerShell script to start both Catalog API and AlphaQuote
# Run from the AlphaQuote root directory

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Starting AlphaQuote + Smart Catalog" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (!(Test-Path "Catalog")) {
    Write-Host "[ERROR] Catalog directory not found!" -ForegroundColor Red
    Write-Host "        Run this script from the AlphaQuote root directory" -ForegroundColor Red
    exit 1
}

# Start Catalog API in new window
Write-Host "[1/2] Starting Smart Catalog API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\Catalog'; Write-Host 'Starting Catalog API...' -ForegroundColor Cyan; python main.py"

# Wait a moment for API to start
Write-Host "      Waiting for API to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Check if Catalog API is responding
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "      [OK] Catalog API is running!" -ForegroundColor Green
    Write-Host "      URL: http://localhost:8000" -ForegroundColor Gray
    Write-Host "      Docs: http://localhost:8000/docs" -ForegroundColor Gray
} catch {
    Write-Host "      [!] Warning: Could not verify Catalog API status" -ForegroundColor Yellow
    Write-Host "          Check the Catalog API window for errors" -ForegroundColor Yellow
}

Write-Host ""

# Start AlphaQuote frontend
Write-Host "[2/2] Starting AlphaQuote Frontend..." -ForegroundColor Yellow
Write-Host "      This will run in the current window" -ForegroundColor Gray
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Both services starting!" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor White
Write-Host "  - AlphaQuote:  http://localhost:3000" -ForegroundColor Green
Write-Host "  - Catalog API: http://localhost:8000" -ForegroundColor Green
Write-Host "  - API Docs:    http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Test Integration:" -ForegroundColor White
Write-Host "  Visit: http://localhost:3000/catalog-test" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop: Press Ctrl+C in both windows" -ForegroundColor Gray
Write-Host ""

npm run dev

