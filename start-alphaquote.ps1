# AlphaQuote Startup Script with Environment Variables
Write-Host "🚀 Starting AlphaQuote..." -ForegroundColor Green

# Set environment variables for development
if (-not $env:REACT_APP_CLERK_PUBLISHABLE_KEY) { throw "Set REACT_APP_CLERK_PUBLISHABLE_KEY before starting AlphaQuote." }
$env:REACT_APP_API_URL = "http://localhost:3001"
$env:REACT_APP_STRIPE_PUBLISHABLE_KEY = "pk_test_placeholder_stripe_key"
if (-not $env:CLERK_SECRET_KEY) { throw "Set CLERK_SECRET_KEY before starting AlphaQuote." }
Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "REACT_APP_CLERK_PUBLISHABLE_KEY = $env:REACT_APP_CLERK_PUBLISHABLE_KEY"
Write-Host "REACT_APP_API_URL = $env:REACT_APP_API_URL"

Write-Host "`n📡 Starting backend API server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; node server/api.js" -WindowStyle Normal

Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🎨 Starting frontend development server..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start" -WindowStyle Normal

Write-Host "`n🎉 AlphaQuote is starting up!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`nPress any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
