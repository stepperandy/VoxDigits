# VoxVPN APK Build - Quick Start Guide

Your complete APK build system is ready! Follow these steps to build and install your APK.

## ✅ Prerequisites Check

Run these commands to verify everything is installed:

```bash
# Check Java
java -version
# Expected: Java 11 or higher

# Check Node.js
node -v
npm -v
# Expected: Node 16+, npm 8+

# Check Android SDK
echo %ANDROID_SDK_ROOT%
# Expected: Path to Android SDK (e.g., C:\Users\user\AppData\Local\Android\Sdk)

# Check ADB
adb version
# Expected: Android Debug Bridge version 30+
```

**If any check fails**, see troubleshooting section below.

---

## 🔑 Step 1: Generate Signing Key (First-Time Only)

```bash
# From repository root
bash scripts/keygen.sh
```

**Follow the prompts:**
1. Enter keystore password (min 6 characters) - **Remember this!**
2. Confirm password
3. Enter key password (can be same as keystore)

**Output:**
```
✅ Keystore generated successfully!
📄 Location: android/app/release.keystore
```

**Store these passwords securely!** You'll need them for release builds.

---

## 🔨 Step 2: Build APK

### Option A: Debug APK (Recommended for Testing)

```bash
# Quick build for testing
scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN"
```

**Time:** ~1-2 minutes (first run: 3-5 minutes)

**Output:**
```
✅ Build successful!
📦 APK: C:\...\app-debug.apk
📊 Size: 45 MB
```

### Option B: Release APK (for Distribution)

```bash
# Set environment variables
set KEYSTORE_FILE=android/app/release.keystore
set KEYSTORE_PASSWORD=your_password
set KEY_ALIAS=voxvpn
set KEY_PASSWORD=your_key_password

# Build
scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN" release
```

---

## 📱 Step 3: Install on Android Device

### Prerequisites
- Android device connected via USB
- USB Debugging enabled on device
- ADB installed and working

### Enable USB Debugging (First-Time on Device)

1. Open **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Plug into computer via USB

### Install APK

```bash
# Connect device and install
adb install -r "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\debug\app-debug.apk"
```

**Success Output:**
```
Success
```

### Verify Installation

```bash
adb shell pm list packages | findstr voxvpn
# Output: package:com.voxvpn.app
```

---

## 📊 View Build Details

### Check APK Size
```bash
dir "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\debug\app-debug.apk"
```

### View App Logs
```bash
adb logcat | findstr VoxVPN
```

### List Connected Devices
```bash
adb devices
```

---

## 🐛 Troubleshooting

### "Java not found"
```bash
# Find Java installation
where java

# If not found, set JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-11

# Verify
java -version
```

### "Android SDK not found"
```bash
# Android SDK location is typically:
set ANDROID_SDK_ROOT=C:\Users\user\AppData\Local\Android\Sdk

# Add to permanent environment variables:
# 1. Win+X → System
# 2. Advanced → Environment Variables
# 3. New User Variable
# 4. Variable name: ANDROID_SDK_ROOT
# 5. Variable value: C:\Users\user\AppData\Local\Android\Sdk
```

### "Node not found"
- Download and install from https://nodejs.org
- Restart Command Prompt
- Verify: `node -v`

### Build fails: "gradlew.bat not found"
```bash
# Make sure you're in the Android directory
cd "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android"
```

### Build fails: "Insufficient permissions"
```bash
# Clear build cache
cd android
gradlew clean
gradlew assembleDebug
cd ..
```

### ADB not found
```bash
# Ensure Android SDK platform-tools in PATH
# Or use full path:
C:\Users\user\AppData\Local\Android\Sdk\platform-tools\adb.exe install -r app-debug.apk

# Add to PATH permanently (Optional):
# 1. Win+X → System
# 2. Advanced → Environment Variables
# 3. Edit PATH
# 4. Add: C:\Users\user\AppData\Local\Android\Sdk\platform-tools
```

### Device not recognized
```bash
# Check connection
adb devices

# If empty, try:
adb kill-server
adb start-server
adb devices

# Update ADB
adb version
```

### APK installation fails
```bash
# Uninstall old version first
adb uninstall com.voxvpn.app

# Then install
adb install -r app-debug.apk
```

---

## 📂 File Locations

### Build Outputs
```
C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\
├── android\app\build\outputs\apk\
│   ├── debug\app-debug.apk
│   └── release\app-release.apk
├── dist\                              (Web assets)
└── android\app\release.keystore       (Signing key)
```

### Configuration Files
```
voxvpn\
├── android\app\build.gradle           (App config)
├── android\gradle.properties          (Build settings)
├── android\app\proguard-rules.pro     (Code protection)
├── capacitor.config.json              (Mobile bridge)
└── scripts\
    ├── build-local-apk.bat            (Windows script)
    ├── build-local-apk.sh             (Bash script)
    └── keygen.sh                       (Key generation)
```

---

## 🚀 Common Workflows

### Quick Development Iteration
```bash
# 1. Make code changes
# 2. Build APK
scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN"

# 3. Install on device
adb install -r "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\debug\app-debug.apk"

# 4. View logs
adb logcat | findstr VoxVPN
```

### Production Release Build
```bash
# 1. Generate/use keystore
bash scripts/keygen.sh

# 2. Build release APK
set KEYSTORE_FILE=android/app/release.keystore
set KEYSTORE_PASSWORD=your_password
set KEY_ALIAS=voxvpn
set KEY_PASSWORD=your_key_password

scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN" release

# 3. Sign APK (automatic with script)

# 4. Ready for distribution!
```

### Clean Build (Fix Build Issues)
```bash
cd "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android"
gradlew clean
cd ..
scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN"
```

---

## 📚 Additional Commands

### Uninstall App from Device
```bash
adb uninstall com.voxvpn.app
```

### Clear App Data
```bash
adb shell pm clear com.voxvpn.app
```

### Start App Manually
```bash
adb shell am start -n com.voxvpn.app/.MainActivity
```

### View Device Info
```bash
adb shell getprop ro.build.version.release
adb shell getprop ro.product.model
```

### Record Screen (30 seconds)
```bash
adb shell screenrecord /sdcard/recording.mp4
```

---

## ✨ Next Steps

1. ✅ Verify prerequisites
2. ✅ Generate keystore: `bash scripts/keygen.sh`
3. ✅ Build APK: `scripts\build-local-apk.bat`
4. ✅ Install: `adb install -r app-debug.apk`
5. ✅ Test on device
6. ✅ Build release for distribution

## 📞 Need Help?

Check these guides:
- **Local builds**: `BUILD_LOCAL_APK.md`
- **Full reference**: `APK_BUILD_GUIDE.md`
- **Android docs**: https://developer.android.com/docs
- **Capacitor**: https://capacitorjs.com/docs/android

---

**Ready to build?** 🚀 Run this command:
```bash
bash scripts/keygen.sh && scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN"
```
