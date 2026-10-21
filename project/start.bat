@echo off
title Ruger Photography - Dev Server
echo ================================================
echo   Ruger Photography - Development Server
echo ================================================
echo.

:: Check if node_modules exists, install if not
if not exist "node_modules\" (
    echo [1/2] node_modules not found. Installing dependencies...
    npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed! Make sure Node.js is installed.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo [1/2] Dependencies already installed. Skipping...
    echo.
)

echo [2/2] Starting development server...
echo.
echo  App will open at: http://localhost:5173
echo  Press Ctrl+C to stop the server.
echo.
npm run dev
