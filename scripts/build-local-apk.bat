@echo off
REM VoxVPN Local APK Build Script for Windows
REM Builds APK from a local Android Studio project directory

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_PATH=%1
if "!PROJECT_PATH!"=="" set PROJECT_PATH=.
set BUILD_TYPE=%2
if "!BUILD_TYPE!"=="" set BUILD_TYPE=debug

REM Normalize paths
cd /d "!PROJECT_PATH!" || (
    echo ❌ Error: Project directory not found: !PROJECT_PATH!
    exit /b 1
)

set PROJECT_PATH=!cd!
set ANDROID_DIR=!PROJECT_PATH!\android
set OUTPUT_DIR=!ANDROID_DIR!\app\build\outputs\apk

echo.
echo 🔨 VoxVPN Local APK Build
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📁 Project Path: !PROJECT_PATH!
echo 🎯 Build Type: !BUILD_TYPE!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Verify Android directory exists
if not exist "!ANDROID_DIR!" (
    echo ❌ Error: Android directory not found at !ANDROID_DIR!
    echo Make sure Capacitor is initialized.
    exit /b 1
)

REM Step 1: Verify web assets are built
if not exist "dist" (
    echo 📦 Building web assets...
    call npm install
    if errorlevel 1 (
        echo ❌ npm install failed
        exit /b 1
    )
    call npm run build
    if errorlevel 1 (
        echo ❌ npm run build failed
        exit /b 1
    )
) else (
    echo ✅ Web assets already built
)

REM Step 2: Sync to Capacitor Android
echo 🔄 Syncing to Capacitor Android...
call npx cap sync android
if errorlevel 1 (
    echo ⚠️  Capacitor sync had issues but continuing...
)

REM Step 3: Build APK
echo 🔨 Building APK (!BUILD_TYPE!)...
cd /d "!ANDROID_DIR!"

REM Check if gradlew exists
if not exist "gradlew.bat" (
    echo ⚠️  gradlew.bat not found. Using gradle directly...
    set GRADLE_CMD=gradle
) else (
    set GRADLE_CMD=gradlew
)

if "!BUILD_TYPE!"=="release" (
    if "!KEYSTORE_FILE!"=="" (
        echo ⚠️  KEYSTORE_FILE not set. Building debug instead...
        call !GRADLE_CMD! assembleDebug
        set BUILD_TYPE=debug
    ) else (
        call !GRADLE_CMD! assembleRelease
    )
) else (
    call !GRADLE_CMD! assembleDebug
)

if errorlevel 1 (
    echo ❌ Gradle build failed
    cd /d "!PROJECT_PATH!"
    exit /b 1
)

cd /d "!PROJECT_PATH!"

REM Step 4: Report results
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if "!BUILD_TYPE!"=="release" (
    set APK_PATH=!OUTPUT_DIR!\release\app-release.apk
) else (
    set APK_PATH=!OUTPUT_DIR!\debug\app-debug.apk
)

if exist "!APK_PATH!" (
    for %%A in ("!APK_PATH!") do set APK_SIZE=%%~zA
    REM Convert bytes to MB
    set /a APK_SIZE_MB=!APK_SIZE!/1048576
    
    echo ✅ Build successful!
    echo 📦 APK: !APK_PATH!
    echo 📊 Size: !APK_SIZE_MB! MB
    echo.
    echo 🚀 To install on connected device:
    echo    adb install -r "!APK_PATH!"
    echo.
) else (
    echo ❌ Build failed - APK not found at expected location
    echo Expected: !APK_PATH!
    exit /b 1
)

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
endlocal
