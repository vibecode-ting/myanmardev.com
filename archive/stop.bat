@echo off
setlocal
title MyanmarDev.com - Stop Server

echo.
echo ========================================
echo   MyanmarDev.com - Stopping Server
echo ========================================
echo.

:: Kill processes on port 80
set FOUND=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :80 ^| findstr LISTENING') do (
    echo Stopping process PID: %%a
    taskkill /F /PID %%a >nul 2>&1
    set FOUND=1
)

if %FOUND%==1 (
    echo.
    echo [OK] Server stopped.
) else (
    echo.
    echo [OK] No server running on port 80.
)

echo.
timeout /t 3
