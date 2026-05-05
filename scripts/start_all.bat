@echo off
echo ==========================================
echo Starting LearnIQ Engine: Neural Architect
echo ==========================================

:: Start Python Backend in a new window
echo [System] Launching Python AI Engine...
start "LearnIQ Backend" cmd /k "cd /d %~dp0..\backend && python server.py"

:: Wait for a second
timeout /t 2 >nul

:: Start Vite Frontend
echo [System] Launching React Frontend...
cd /d %~dp0..\frontend
npm run dev

echo ==========================================
echo System Initialized.
echo ==========================================
