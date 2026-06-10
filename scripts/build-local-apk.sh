#!/bin/bash

# VoxVPN Local APK Build Script
# Builds APK from a local Android Studio project directory

set -e

# Configuration
LOCAL_PROJECT_PATH="${1:-.}"
BUILD_TYPE="${2:-debug}"
OUTPUT_DIR="$LOCAL_PROJECT_PATH/android/app/build/outputs/apk"

echo "🔨 VoxVPN Local APK Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Project Path: $LOCAL_PROJECT_PATH"
echo "🎯 Build Type: $BUILD_TYPE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verify project exists
if [ ! -d "$LOCAL_PROJECT_PATH" ]; then
    echo "❌ Error: Project directory not found: $LOCAL_PROJECT_PATH"
    exit 1
fi

# Navigate to Android directory
if [ ! -d "$LOCAL_PROJECT_PATH/android" ]; then
    echo "❌ Error: Android directory not found. Make sure Capacitor is initialized."
    exit 1
fi

cd "$LOCAL_PROJECT_PATH"

# Step 1: Verify web assets are built
if [ ! -d "dist" ]; then
    echo "📦 Building web assets..."
    npm install
    npm run build
else
    echo "✅ Web assets already built"
fi

# Step 2: Sync to Capacitor Android
echo "🔄 Syncing to Capacitor Android..."
npx cap sync android

# Step 3: Build APK
echo "🔨 Building APK (${BUILD_TYPE})..."
cd android

# Make gradlew executable
chmod +x gradlew

if [ "$BUILD_TYPE" = "release" ]; then
    if [ -z "$KEYSTORE_FILE" ]; then
        echo "⚠️  KEYSTORE_FILE not set. Building debug instead..."
        ./gradlew assembleDebug
        BUILD_TYPE="debug"
    else
        ./gradlew assembleRelease
    fi
else
    ./gradlew assembleDebug
fi

cd ..

# Step 4: Report results
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$BUILD_TYPE" = "release" ]; then
    APK_PATH="$OUTPUT_DIR/release/app-release.apk"
else
    APK_PATH="$OUTPUT_DIR/debug/app-debug.apk"
fi

if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "✅ Build successful!"
    echo "📦 APK: $APK_PATH"
    echo "📊 Size: $APK_SIZE"
    echo ""
    echo "🚀 To install on connected device:"
    echo "   adb install -r \"$APK_PATH\""
else
    echo "❌ Build failed - APK not found at expected location"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
