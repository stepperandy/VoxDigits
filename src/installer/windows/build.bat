@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   VoxVPN Windows Builder
echo ================================================
echo.

:: ── Check prerequisites ───────────────────────────────────────────────────────
set INNO="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not exist %INNO% (
    echo [ERROR] Inno Setup 6 not found at %INNO%
    echo Download: https://jrsoftware.org/isinfo.php
    pause & exit /b 1
)

where node >nul 2>nul || (
    echo [ERROR] Node.js not found. Download: https://nodejs.org
    pause & exit /b 1
)

:: ── Check required assets ─────────────────────────────────────────────────────
if not exist "assets\icon.ico" (
    echo [ERROR] Missing assets\icon.ico
    echo Place a 256x256 .ico file at installer\windows\assets\icon.ico
    pause & exit /b 1
)

if not exist "assets\openvpn-installer.exe" (
    echo [ERROR] Missing assets\openvpn-installer.exe
    echo Download OpenVPN Community from: https://openvpn.net/community-downloads/
    pause & exit /b 1
)

echo [1/4] Installing npm dependencies...
cd ..\..
call npm install
if %errorlevel% neq 0 ( echo [ERROR] npm install failed & pause & exit /b 1 )

echo.
echo [2/4] Building React app (Vite)...
call npm run build
if %errorlevel% neq 0 ( echo [ERROR] Vite build failed & pause & exit /b 1 )

echo.
echo [3/4] Packaging Electron app...
call npx electron-builder --win --dir
if %errorlevel% neq 0 ( echo [ERROR] electron-builder failed & pause & exit /b 1 )

:: Copy unpacked Electron app into installer folder
if not exist "installer\windows\dist" mkdir "installer\windows\dist"
xcopy /E /Y /I "dist\win-unpacked" "installer\windows\dist\win-unpacked\" >nul

echo.
echo [4/4] Compiling Inno Setup installer...
cd installer\windows
%INNO% VoxVPN.iss
if %errorlevel% neq 0 ( echo [ERROR] Inno Setup failed & pause & exit /b 1 )

echo.
echo ================================================
echo   SUCCESS!
echo   Output: installer\windows\output\VoxVPN-Setup-1.0.0.exe
echo ================================================
pause