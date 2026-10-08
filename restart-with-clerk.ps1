# AlphaQuote Restart Script with Real Clerk Keys
Write-Host "🚀 Restarting AlphaQuote with real Clerk authentication..." -ForegroundColor Green

# Set environment variables for development
$env:REACT_APP_CLERK_PUBLISHABLE_KEY = "YOUR_CLERK_PUBLISHABLE_KEY"
$env:REACT_APP_API_URL = "http://localhost:3001"
if (-not $env:CLERK_SECRET_KEY) { throw "Set CLERK_SECRET_KEY before starting AlphaQuote." }
Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "REACT_APP_CLERK_PUBLISHABLE_KEY = $env:REACT_APP_CLERK_PUBLISHABLE_KEY"
Write-Host "REACT_APP_API_URL = $env:REACT_APP_API_URL"
Write-Host "CLERK_SECRET_KEY = [SET]"

# Start backend in background
Write-Host "`n🔧 Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; `$env:CLERK_SECRET_KEY = 'REMOVED_APPLICATION_SECRET'; cd backend; node server/api.js" -WindowStyle Minimized

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🌐 Starting frontend development server..." -ForegroundColor Cyan
cd frontend
npm start
