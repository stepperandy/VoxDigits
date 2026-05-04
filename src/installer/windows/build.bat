@echo off
echo ================================================
echo   VoxVPN Windows Installer Builder
echo ================================================
echo.

:: Check for Inno Setup
set INNO="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not exist %INNO% (
    echo ERROR: Inno Setup 6 not found at %INNO%
    echo Download from: https://jrsoftware.org/isinfo.php
    pause
    exit /b 1
)

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Installing npm dependencies...
cd ..\..
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/4] Building Electron app...
call npx electron-builder --win --dir
if %errorlevel% neq 0 (
    echo ERROR: Electron build failed
    echo Make sure electron-builder is configured in package.json
    pause
    exit /b 1
)

echo.
echo [3/4] Copying built app to installer directory...
if not exist "installer\windows\dist" mkdir "installer\windows\dist"
xcopy /E /Y "dist\win-unpacked" "installer\windows\dist\win-unpacked\"

echo.
echo [4/4] Building installer with Inno Setup...
cd installer\windows
%INNO% VoxVPN.iss
if %errorlevel% neq 0 (
    echo ERROR: Inno Setup compilation failed
    pause
    exit /b 1
)

echo.
echo ================================================
echo   SUCCESS! Installer created in:
echo   installer\windows\output\
echo ================================================
pause