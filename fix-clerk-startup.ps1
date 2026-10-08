# AlphaQuote Clerk Fix Startup Script
Write-Host "🔧 AlphaQuote Clerk Authentication Fix" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Kill any existing processes
Write-Host "`n1. Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Set environment variables
Write-Host "`n2. Setting environment variables..." -ForegroundColor Yellow
if (-not $env:REACT_APP_CLERK_PUBLISHABLE_KEY) { throw "Set REACT_APP_CLERK_PUBLISHABLE_KEY before starting AlphaQuote." }
$env:REACT_APP_API_URL = "http://localhost:3001"
if (-not $env:CLERK_SECRET_KEY) { throw "Set CLERK_SECRET_KEY before starting AlphaQuote." }
Write-Host "✅ REACT_APP_CLERK_PUBLISHABLE_KEY: $env:REACT_APP_CLERK_PUBLISHABLE_KEY"
Write-Host "✅ REACT_APP_API_URL: $env:REACT_APP_API_URL"
Write-Host "✅ CLERK_SECRET_KEY: [SET]"

# Start backend
Write-Host "`n3. Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; cd backend; node server/api.js" -WindowStyle Minimized

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Start frontend with environment variables
Write-Host "`n4. Starting frontend with Clerk authentication..." -ForegroundColor Yellow
cd frontend
if (-not $env:REACT_APP_CLERK_PUBLISHABLE_KEY) { throw "Set REACT_APP_CLERK_PUBLISHABLE_KEY before starting AlphaQuote." }
$env:REACT_APP_API_URL = "http://localhost:3001"
npm start

Write-Host "`n🎉 AlphaQuote should now be running with proper Clerk authentication!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
