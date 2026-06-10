# VoxVPN APK Build Guide

Complete guide to build a working APK installer for your VoxVPN app.

## Prerequisites

### Software Requirements
- Node.js (v16+) and npm
- Java Development Kit (JDK 11+)
- Android SDK (API 34)
- Gradle 8.1+
- Git

### Installation

#### macOS
```bash
# Install JDK
brew install openjdk@11

# Install Android SDK
brew install --cask android-sdk

# Set ANDROID_SDK_ROOT
export ANDROID_SDK_ROOT=/Users/$USER/Library/Android/sdk
```

#### Linux (Ubuntu/Debian)
```bash
# Install JDK
sudo apt-get install openjdk-11-jdk

# Install Android SDK
wget https://dl.google.com/android/repository/commandlinetools-linux-*.zip
unzip commandlinetools-linux-*.zip -d ~/android-sdk
~/android-sdk/cmdline-tools/bin/sdkmanager "platforms;android-34" "build-tools;34.0.0"

# Set ANDROID_SDK_ROOT
export ANDROID_SDK_ROOT=~/android-sdk
```

#### Windows
1. Download and install JDK 11: https://adoptopenjdk.net
2. Download Android SDK: https://developer.android.com/studio
3. Set environment variables:
   - `JAVA_HOME`: Path to JDK installation
   - `ANDROID_SDK_ROOT`: Path to Android SDK

## Step 1: Generate Keystore (for Release APK)

Release APKs must be signed with a keystore. Generate one:

```bash
bash scripts/keygen.sh
```

This creates `android/app/release.keystore` and prompts for passwords.

**Store these passwords securely!** You'll need them for future builds.

## Step 2: Build Debug APK (Testing)

For development and testing:

```bash
bash scripts/build-apk.sh debug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

This builds quickly and doesn't require signing.

## Step 3: Build Release APK (Production)

For distribution:

```bash
# Set environment variables (or add to .env)
export KEYSTORE_FILE=android/app/release.keystore
export KEYSTORE_PASSWORD=your_keystore_password
export KEY_ALIAS=voxvpn
export KEY_PASSWORD=your_key_password

bash scripts/build-apk.sh release
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## Step 4: Install on Device

### Via ADB (Android Debug Bridge)

```bash
# Connect device via USB with USB debugging enabled

# Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Or install release APK
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Manual Installation

1. Transfer APK to device
2. Open Files app
3. Navigate to Downloads
4. Tap APK file → "Install"

## Project Structure

```
voxvpn/
├── android/                    # Capacitor Android project
│   ├── app/
│   │   ├── build.gradle       # App-level build config
│   │   ├── proguard-rules.pro # Code obfuscation rules
│   │   ├── release.keystore   # Release signing key
│   │   └── src/
│   │       └── AndroidManifest.xml
│   ├── build.gradle           # Root build config
│   └── gradle.properties      # Gradle settings
├── src/                        # React source code
├── dist/                       # Built web assets
├── capacitor.config.json      # Capacitor configuration
├── vite.config.js            # Vite build config
└── package.json              # Node dependencies
```

## Build Configuration Files

### `capacitor.config.json`
Configures Capacitor for Android:
- App ID: `com.voxvpn.app`
- Output directory: `dist` (web assets)
- Web server: HTTPS by default

### `android/build.gradle`
Root-level Gradle configuration:
- Android Gradle plugin: 8.1.1
- Repositories: Google, Maven Central

### `android/app/build.gradle`
App-level configuration:
- SDK versions: Min 24, Target 34, Compile 34
- Build types: Debug, Release
- Signing configuration for release builds

### `android/gradle.properties`
Performance optimizations:
- JVM heap size: 2GB
- Parallel builds enabled
- Daemon mode enabled

### `android/app/AndroidManifest.xml`
Android permissions:
- `INTERNET`: Network access
- `BIND_VPN_SERVICE`: VPN functionality
- `CHANGE_NETWORK_STATE`: Network management
- Optional: Location, storage access

## Troubleshooting

### "SDK location not found"
```bash
# Set ANDROID_SDK_ROOT
export ANDROID_SDK_ROOT=/path/to/android/sdk

# Add to ~/.bashrc or ~/.zshrc to make permanent
```

### "Java not found"
```bash
# Set JAVA_HOME
export JAVA_HOME=/path/to/jdk

# Or on macOS:
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
```

### Build fails with "insufficient permissions"
```bash
# Fix keystore file permissions
chmod 600 android/app/release.keystore
```

### APK is too large (>100MB)
The APK might include unnecessary files. Check:
1. Ensure `dist/` only contains production build
2. ProGuard rules in `proguard-rules.pro` are applied
3. Remove unused dependencies: `npm prune --production`

### App crashes on launch
Check logcat:
```bash
adb logcat | grep VoxVPN
```

### Capacitor not initializing
```bash
# Reinitialize Capacitor
npx cap init
npx cap add android
npx cap sync android
```

## Development Workflow

### Quick Testing
```bash
# 1. Make code changes
# 2. Rebuild web assets
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Build debug APK
bash scripts/build-apk.sh debug

# 5. Install on device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Continuous Integration

For CI/CD pipelines, automate APK builds:

```yaml
# .github/workflows/apk-build.yml
name: Build APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '11'
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - run: npx cap sync android
      - run: cd android && ./gradlew assembleDebug
      - uses: actions/upload-artifact@v3
        with:
          name: voxvpn-debug.apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

## Distribution Options

### 1. GitHub Releases
Upload APK to GitHub Releases for users to download manually.

### 2. Google Play Store
Submit app to Play Store:
1. Create Google Play developer account ($25 one-time)
2. Create app listing
3. Upload signed APK
4. Set pricing and distribution

### 3. Firebase App Distribution
```bash
npm install -g firebase-tools
firebase login
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
  --app=YOUR_APP_ID \
  --release-notes="Beta v1.0" \
  --testers="test@example.com"
```

## Performance Optimization

### Reduce APK Size
1. Enable ProGuard: Already configured in `build.gradle`
2. Remove unused code: `npm prune --production`
3. Compress assets: Optimize images in `public/`

### Build Speed
- Use `--daemon` for Gradle: Already enabled in `gradle.properties`
- Parallel compilation: Already enabled
- Incremental builds: Enabled by default

## Security Best Practices

✅ **Do:**
- Keep keystore password secure
- Use strong passwords (min 8 characters)
- Store keystore in secure location
- Never commit `release.keystore` to git
- Rotate keys annually

❌ **Don't:**
- Commit keystore to repository
- Share keystore password via unencrypted channels
- Use default/simple passwords
- Store passwords in code
- Use same keystore for multiple apps

## Next Steps

1. ✅ Follow Steps 1-4 above
2. ✅ Test on Android device
3. ✅ Iterate and improve app
4. ✅ Generate final release APK
5. ✅ Distribute via Play Store or GitHub

## Additional Resources

- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/docs)
- [Gradle Build System](https://gradle.org)
- [ProGuard Configuration](https://www.guardsquare.com/proguard)

## Support

For issues or questions:
1. Check `adb logcat` for errors
2. Review build output carefully
3. Verify all prerequisites installed
4. Check GitHub issues for similar problems
