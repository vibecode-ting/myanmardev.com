@echo off
setlocal EnableDelayedExpansion
title MyanmarDev.com - Local Server

echo.
echo ========================================
echo   MyanmarDev.com - Local Server
echo   http://localhost:80
echo ========================================
echo.

:: Check for admin privileges (port 80 requires it)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Port 80 requires Administrator privileges.
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)
echo [OK] Running as Administrator

:: Check for Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js %NODE_VER%

:: Check for pnpm
where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARN] pnpm not found. Installing...
    call npm install -g pnpm
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to install pnpm
        pause
        exit /b 1
    )
)
echo [OK] pnpm available

:: Navigate to script directory
cd /d "%~dp0"
echo [OK] Working directory: %CD%

:: Check for .env file
if not exist ".env" (
    echo.
    echo [WARN] No .env file found.
    if exist ".env.example" (
        echo Copying .env.example to .env...
        copy ".env.example" ".env" >nul
        echo [ACTION] Edit .env with your Firebase config, then re-run this script.
        pause
        exit /b 1
    ) else (
        echo [ERROR] No .env or .env.example found.
        echo Create .env with your Firebase configuration.
        pause
        exit /b 1
    )
)
echo [OK] .env file found

:: Install dependencies
echo.
echo [1/3] Installing dependencies...
call pnpm install --frozen-lockfile 2>nul
if %errorLevel% neq 0 (
    echo [WARN] Frozen lockfile failed, trying regular install...
    call pnpm install
    if %errorLevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)
echo [OK] Dependencies installed

:: Build for production
echo.
echo [2/3] Building for production...
call pnpm build
if %errorLevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo [OK] Build complete

:: Stop any existing server on port 80
echo.
echo [3/3] Starting server on port 80...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :80 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Start the server
echo.
echo ========================================
echo   SERVER RUNNING
echo   http://localhost:80
echo   Press Ctrl+C to stop
echo ========================================
echo.

:: Use npx serve to host the dist folder
call npx serve dist -l 80 --no-clipboard

:: If serve exits, pause so user can see errors
echo.
echo Server stopped.
pause
