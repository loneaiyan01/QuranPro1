@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo           Launching Nur Quran Player
echo ===================================================
echo.

:: Optional: pull latest updates from GitHub if connected
echo [1/3] Checking for latest updates...
git pull origin main 2>nul || echo Note: Continuing with local files.
echo.

:: Open default browser to local server
echo [2/3] Opening browser at http://localhost:3000...
start "" http://localhost:3000
echo.

:: Start Vite dev server
echo [3/3] Starting Vite development server...
echo Press Ctrl+C in this window anytime to stop the server.
echo.
npm run dev

pause
