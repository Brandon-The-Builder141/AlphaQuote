@echo off
echo Starting AlphaQuote with proper environment variables...

REM Set environment variables for development
if not defined REACT_APP_CLERK_PUBLISHABLE_KEY (
  echo Set REACT_APP_CLERK_PUBLISHABLE_KEY before starting AlphaQuote.
  exit /b 1
)
set REACT_APP_API_URL=http://localhost:3001
set REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder_stripe_key
if not defined CLERK_SECRET_KEY (
  echo Set CLERK_SECRET_KEY before starting AlphaQuote.
  exit /b 1
)
echo Environment variables set:
echo REACT_APP_CLERK_PUBLISHABLE_KEY=%REACT_APP_CLERK_PUBLISHABLE_KEY%
echo REACT_APP_API_URL=%REACT_APP_API_URL%

echo.
echo Starting backend API server...
start "AlphaQuote Backend" cmd /k "cd backend && node server/api.js"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend development server...
start "AlphaQuote Frontend" cmd /k "cd frontend && npm start"

echo.
echo AlphaQuote is starting up!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
