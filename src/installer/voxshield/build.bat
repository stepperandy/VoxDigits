@echo off
setlocal enabledelayedexpansion

:: ============================================================
::  VoxShield Business Security — Windows Build Script
::  Builds the Electron app and compiles the Inno Setup installer
:: ============================================================

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%..\..\..\"
cd /d "%ROOT_DIR%"

echo.
echo ================================================
echo   VoxShield Business Security v1.0.0 — Build
echo ================================================
echo.

:: Step 1: Install dependencies
echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed.
    exit /b 1
)

:: Step 2: Build Electron app (unpacked)
echo.
echo [2/3] Building Electron app...
call npm run build:win
if errorlevel 1 (
    echo ERROR: Electron build failed.
    exit /b 1
)

:: Step 3: Compile Inno Setup installer
echo.
echo [3/3] Compiling Inno Setup installer...
set "ISS_FILE=%SCRIPT_DIR%VoxShield.iss"
set "OUTPUT_DIR=%SCRIPT_DIR%output"

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

:: Try to find Inno Setup
set "ISCC="
for %%P in (
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
    "C:\Program Files\Inno Setup 6\ISCC.exe"
) do (
    if exist %%P set "ISCC=%%~P"
)

if not defined ISCC (
    where iscc >nul 2>nul && set "ISCC=iscc"
)

if not defined ISCC (
    echo ERROR: Inno Setup 6 (ISCC.exe) not found.
    echo Install from: https://jrsoftware.org/isinfo.php
    exit /b 1
)

"%ISCC%" /O+"%OUTPUT_DIR%" "%ISS_FILE%"
if errorlevel 1 (
    echo ERROR: Inno Setup compilation failed.
    exit /b 1
)

echo.
echo ================================================
echo   Build complete!
echo   Output: %OUTPUT_DIR%\VoxShield-Setup-1.0.0.exe
echo ================================================