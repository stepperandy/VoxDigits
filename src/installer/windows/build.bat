@echo off
setlocal enabledelayedexpansion
title VoxVPN Installer Builder

echo.
echo  ██╗   ██╗ ██████╗ ██╗  ██╗██╗   ██╗██████╗ ███╗   ██╗
echo  ██║   ██║██╔═══██╗╚██╗██╔╝██║   ██║██╔══██╗████╗  ██║
echo  ██║   ██║██║   ██║ ╚███╔╝ ██║   ██║██████╔╝██╔██╗ ██║
echo  ╚██╗ ██╔╝██║   ██║ ██╔██╗ ╚██╗ ██╔╝██╔═══╝ ██║╚██╗██║
echo   ╚████╔╝ ╚██████╔╝██╔╝ ██╗ ╚████╔╝ ██║     ██║ ╚████║
echo    ╚═══╝   ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚═╝     ╚═╝  ╚═══╝
echo.
echo  Windows Installer Builder v2.0
echo  ===============================================
echo.

:: ── Paths ──────────────────────────────────────────────────────────────────────
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%..\..\"
set "INNO=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
set "OUTPUT_DIR=%SCRIPT_DIR%output"

:: ── Check Node.js ──────────────────────────────────────────────────────────────
echo [CHECK] Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Node.js not found!
    echo  Download and install from: https://nodejs.org
    echo  Recommended: v20 LTS
    echo.
    pause & exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo         Found Node.js %NODE_VER%

:: ── Check Inno Setup ──────────────────────────────────────────────────────────
echo [CHECK] Inno Setup 6...
if not exist "%INNO%" (
    echo.
    echo  [ERROR] Inno Setup 6 not found at:
    echo          %INNO%
    echo.
    echo  Download and install from: https://jrsoftware.org/isinfo.php
    echo.
    pause & exit /b 1
)
echo         Found Inno Setup 6

:: ── Check required assets ──────────────────────────────────────────────────────
echo [CHECK] Required assets...

if not exist "%SCRIPT_DIR%assets\icon.ico" (
    echo.
    echo  [ERROR] Missing icon file: installer\windows\assets\icon.ico
    echo  Place a 256x256 .ico file there and re-run.
    echo.
    pause & exit /b 1
)
echo         icon.ico OK

if not exist "%SCRIPT_DIR%assets\openvpn-installer.exe" (
    echo.
    echo  [ERROR] Missing: installer\windows\assets\openvpn-installer.exe
    echo  Download OpenVPN Community installer from:
    echo    https://openvpn.net/community-downloads/
    echo  Rename to openvpn-installer.exe and place in installer\windows\assets\
    echo.
    pause & exit /b 1
)
echo         openvpn-installer.exe OK

:: ── Step 1: npm install ────────────────────────────────────────────────────────
echo.
echo [1/4] Installing dependencies...
echo       (this may take a minute on first run)
pushd "%ROOT_DIR%"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] npm install failed. Check your internet connection and try again.
    pause & exit /b 1
)
echo       Done.

:: ── Step 2: Vite build ────────────────────────────────────────────────────────
echo.
echo [2/4] Building React app (Vite)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Vite build failed. Check the error above for details.
    pause & exit /b 1
)
echo       Done.

:: ── Step 3: Electron builder ──────────────────────────────────────────────────
echo.
echo [3/4] Packaging Electron app...
call npx electron-builder --win --dir
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] electron-builder failed. Check the error above for details.
    pause & exit /b 1
)
echo       Done.

:: Copy unpacked Electron output into the installer source folder
if not exist "%SCRIPT_DIR%dist\win-unpacked" mkdir "%SCRIPT_DIR%dist\win-unpacked"
xcopy /E /Y /I "%ROOT_DIR%installer\windows\output\win-unpacked" "%SCRIPT_DIR%dist\win-unpacked\" >nul 2>nul
:: Fallback: look in the default electron-builder output location
if not exist "%SCRIPT_DIR%dist\win-unpacked\VoxVPN Shield Agent.exe" (
    xcopy /E /Y /I "%ROOT_DIR%dist\win-unpacked" "%SCRIPT_DIR%dist\win-unpacked\" >nul 2>nul
)

:: ── Step 4: Inno Setup ────────────────────────────────────────────────────────
echo.
echo [4/4] Compiling Inno Setup installer...
popd
pushd "%SCRIPT_DIR%"
"%INNO%" VoxVPN.iss
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Inno Setup compilation failed. Check the .iss script for errors.
    pause & exit /b 1
)
popd

:: ── Success ────────────────────────────────────────────────────────────────────
echo.
echo  ===============================================
echo   SUCCESS! Installer built.
echo.
echo   Output: installer\windows\output\VoxVPN-Shield-Setup-3.0.0.exe
echo.
echo   Next steps:
echo   1. Test the installer on a clean Windows 10/11 VM
echo   2. Upload to your hosting / GitHub release
echo   3. Update the download URL via the Admin panel
echo  ===============================================
echo.
pause