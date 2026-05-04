@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   VoxVPN Windows Setup Builder
echo ================================================
echo.

:: ── Check prerequisites ───────────────────────────────────────────────────────

set INNO="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not exist %INNO% (
    echo ERROR: Inno Setup 6 not found.
    echo Download: https://jrsoftware.org/isinfo.php
    pause & exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found.
    echo Download: https://nodejs.org
    pause & exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm not found. Re-install Node.js.
    pause & exit /b 1
)

:: ── Check required assets ─────────────────────────────────────────────────────

if not exist "assets\icon.ico" (
    echo ERROR: Missing assets\icon.ico
    echo Place a 256x256 .ico file at installer\windows\assets\icon.ico
    pause & exit /b 1
)

if not exist "assets\openvpn-installer.exe" (
    echo ERROR: Missing assets\openvpn-installer.exe
    echo Download from: https://openvpn.net/community-downloads/
    pause & exit /b 1
)

:: ── Step 1: Install npm dependencies ─────────────────────────────────────────

echo [1/4] Installing npm dependencies...
cd ..\..
call npm install
if %errorlevel% neq 0 ( echo ERROR: npm install failed & pause & exit /b 1 )

:: ── Step 2: Build React (Vite) ────────────────────────────────────────────────

echo.
echo [2/4] Building React app (Vite)...
call npm run build
if %errorlevel% neq 0 ( echo ERROR: Vite build failed & pause & exit /b 1 )

:: ── Step 3: Package Electron app ─────────────────────────────────────────────

echo.
echo [3/4] Packaging Electron app (win-unpacked)...
call npx electron-builder --win --dir
if %errorlevel% neq 0 ( echo ERROR: electron-builder failed & pause & exit /b 1 )

:: Copy unpacked app into installer directory
if not exist "installer\windows\dist" mkdir "installer\windows\dist"
xcopy /E /Y /I "dist\win-unpacked" "installer\windows\dist\win-unpacked\" >nul

:: ── Step 4: Build Inno Setup installer ───────────────────────────────────────

echo.
echo [4/4] Compiling Inno Setup installer...
cd installer\windows
%INNO% VoxVPN.iss
if %errorlevel% neq 0 ( echo ERROR: Inno Setup compilation failed & pause & exit /b 1 )

:: ── Done ─────────────────────────────────────────────────────────────────────

echo.
echo ================================================
echo   SUCCESS!
echo   Installer: installer\windows\output\VoxVPN-Setup-1.0.0.exe
echo ================================================
pause