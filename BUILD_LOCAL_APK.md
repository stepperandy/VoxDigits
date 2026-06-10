# Build APK from Local Android Studio Project

Quick guide to build your VoxVPN APK from the local Android Studio project at `C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN`

## 🚀 Quick Start (Windows)

### Option 1: Using the Batch Script (Recommended)

```bash
# From the voxvpn repository root:
scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN" debug
```

Or simply:
```bash
scripts\build-local-apk.bat
```

### Option 2: Manual Build

```bash
# Navigate to the Android project
cd C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN

# Build web assets (if not already built)
npm install
npm run build

# Sync to Capacitor Android
npx cap sync android

# Build Debug APK
cd android
gradlew assembleDebug
```

## 📋 Prerequisites

Ensure you have:

- ✅ **Java 11** - Check: `java -version`
- ✅ **Node.js** - Check: `node -v`
- ✅ **Android SDK** - Set `ANDROID_SDK_ROOT` environment variable
- ✅ **Git** (for cloning if needed)

### Set Android SDK Path (Windows)

If you haven't set `ANDROID_SDK_ROOT`, do it now:

1. Open **Environment Variables** (System Properties)
2. Click **New** under User Variables
3. Variable name: `ANDROID_SDK_ROOT`
4. Variable value: `C:\Users\user\AppData\Local\Android\Sdk` (or your SDK location)
5. Click OK and restart Command Prompt

## 🏗️ Build Types

### Debug APK (for testing)
```bash
scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN" debug
```

- Faster build
- Installable on any device
- Not optimized
- Perfect for development

### Release APK (for distribution)
```bash
REM Set keystore environment variables first
set KEYSTORE_FILE=android/app/release.keystore
set KEYSTORE_PASSWORD=your_password
set KEY_ALIAS=voxvpn
set KEY_PASSWORD=your_key_password

scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN" release
```

- Optimized and obfuscated
- Smaller file size
- Required for Play Store
- Requires signing keystore

## 📦 Output Locations

After building, find your APK at:

**Debug:**
```
C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\debug\app-debug.apk
```

**Release:**
```
C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\release\app-release.apk
```

## 📱 Install on Device

### Prerequisites
- Android device connected via USB
- USB debugging enabled on device
- ADB installed

### Install via ADB
```bash
# Debug APK
adb install -r "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\debug\app-debug.apk"

# Release APK
adb install -r "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\release\app-release.apk"
```

### Verify Installation
```bash
adb shell pm list packages | findstr voxvpn
```

### View Logs
```bash
adb logcat | findstr VoxVPN
```

## 🔧 Troubleshooting

### "Java not found"
```bash
# Set JAVA_HOME to JDK 11 location
set JAVA_HOME=C:\Program Files\Java\jdk-11
```

### "Android SDK not found"
```bash
# Set ANDROID_SDK_ROOT
set ANDROID_SDK_ROOT=C:\Users\user\AppData\Local\Android\Sdk
```

### "gradlew.bat not found"
Make sure you're in the correct Android directory:
```bash
cd C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android
```

### Build fails with "Insufficient permissions"
```bash
# Delete build cache and try again
cd C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android
gradlew clean
gradlew assembleDebug
```

### APK installation fails on device
```bash
# Uninstall first if older version exists
adb uninstall com.voxvpn.app

# Then install
adb install -r "path\to\app-debug.apk"
```

## 🛠️ Advanced Options

### Custom Gradle Properties
Edit `android/gradle.properties` to adjust:
- JVM heap size
- Build parallelism
- Cache settings

### ProGuard Configuration
Edit `android/app/proguard-rules.pro` to:
- Protect specific classes
- Configure code obfuscation
- Optimize bytecode

### Manifest Configuration
Edit `android/app/src/AndroidManifest.xml` to:
- Add/modify permissions
- Configure VPN service
- Set app metadata

## 📊 Build Performance

### Speed Tips
1. **First run**: ~3-5 minutes (downloads dependencies)
2. **Subsequent runs**: ~30-60 seconds (incremental)
3. **Clean build**: `gradlew clean assembleDebug` (~2-3 minutes)

### Optimize Build
```bash
# Enable parallel compilation and daemon
set ORG_GRADLE_PROJECT_parallelBuild=true

# Increase JVM heap size (for faster builds)
set ORG_GRADLE_PROJECT_jvmArgs=-Xmx4096m

# Use offline gradle
gradlew --offline assembleDebug
```

## 🔐 Signing Configuration

### Generate Signing Key
```bash
scripts\keygen.sh
```

This creates `android/app/release.keystore` with:
- 2048-bit RSA encryption
- 27+ year validity
- Password-protected access

### Use Existing Keystore
```bash
set KEYSTORE_FILE=path\to\your\keystore.jks
set KEYSTORE_PASSWORD=your_password
set KEY_ALIAS=your_alias
set KEY_PASSWORD=your_key_password

scripts\build-local-apk.bat . release
```

## 📝 Build Script Usage

### Syntax
```bash
scripts\build-local-apk.bat [project_path] [build_type]
```

### Examples
```bash
# Current directory, debug
scripts\build-local-apk.bat

# Specific path, debug
scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN"

# Specific path, release
scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN" release
```

## 🎯 Next Steps

1. ✅ Ensure prerequisites installed
2. ✅ Generate signing key: `scripts\keygen.sh`
3. ✅ Build debug APK: `scripts\build-local-apk.bat`
4. ✅ Install on device: `adb install -r app-debug.apk`
5. ✅ Test and iterate
6. ✅ Build release for distribution

## 📚 Additional Resources

- [Android Developer Docs](https://developer.android.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs/android)
- [Gradle User Guide](https://docs.gradle.org/current/userguide/)
- [ADB Reference](https://developer.android.com/studio/command-line/adb)

## 💡 Pro Tips

**Faster Iteration:**
1. Keep emulator/device connected
2. Use `adb install -r` for reinstalls (faster)
3. Use Android Studio for live debugging

**Reduce File Size:**
- Enable ProGuard in `build.gradle`
- Remove unused dependencies
- Compress assets

**Monitor Performance:**
```bash
# Check APK contents
adb shell dumpsys package com.voxvpn.app

# View app size
adb shell pm path com.voxvpn.app
```
