# VoxVPN APK Installer Distribution Guide

Complete guide to where your APK installers are located and how to distribute them.

## 📦 APK Installer Locations

### Local Build Output

After running `build.bat`, your APK installers are located at:

#### **Debug APK** (for testing)
```
C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\debug\app-debug.apk
```

#### **Release APK** (for distribution)
```
C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\release\app-release.apk
```

---

## 📊 APK File Information

| Type | Location | Size | Use Case |
|------|----------|------|----------|
| **Debug** | `debug/app-debug.apk` | ~45-50 MB | Testing, development |
| **Release** | `release/app-release.apk` | ~35-40 MB | Production, Play Store |

---

## 🚀 Distribution Methods

### 1️⃣ **GitHub Releases** (Recommended for Open Source)

Best for: Public sharing, version control

**Steps:**
1. Go to your repository: https://github.com/stepperandy/voxvpn
2. Click **Releases** → **Draft a new release**
3. Create tag: `v1.0.0`
4. Upload APK file(s)
5. Publish release

Users download from: `https://github.com/stepperandy/voxvpn/releases/download/v1.0.0/app-release.apk`

---

### 2️⃣ **Google Play Store** (Professional Distribution)

Best for: Maximum reach, monetization

**Requirements:**
- Google Play Developer Account ($25 one-time)
- Signed release APK
- App listing details
- Privacy policy URL

**Process:**
1. Create Play Store account
2. Create app listing
3. Upload signed APK
4. Fill app details
5. Submit for review (24-72 hours)

---

### 3️⃣ **Firebase App Distribution** (Beta Testing)

Best for: Internal testing, beta users

**Setup:**
```bash
npm install -g firebase-tools
firebase login
firebase appdistribution:distribute app-release.apk \
  --app=YOUR_APP_ID \
  --release-notes="v1.0.0 Beta" \
  --testers="user@example.com,tester@example.com"
```

Users receive email link to download and install.

---

### 4️⃣ **Direct Download Link** (Website/Blog)

Best for: Personal distribution, closed groups

**Example:**
```html
<a href="https://example.com/downloads/voxvpn-v1.0.apk">
  Download VoxVPN APK
</a>
```

**Important:** Enable installation from unknown sources on Android:
- Settings → Security → Unknown Sources → ON

---

### 5️⃣ **QR Code Distribution** (Easy Sharing)

Generate QR code pointing to APK download link:

```
https://github.com/stepperandy/voxvpn/releases/download/v1.0.0/app-release.apk
```

Users scan QR → Direct download

Tools:
- https://qr-code-generator.com
- https://www.qr-code-generator.com

---

## 📋 Release Checklist

Before distributing your APK:

### Code Quality
- ✅ Test on multiple Android devices
- ✅ Test VPN connection functionality
- ✅ Check permissions requests
- ✅ Verify app performance
- ✅ Test on Android 12-14 (latest)

### Build Configuration
- ✅ ProGuard enabled (code protection)
- ✅ Signing key configured
- ✅ Version code incremented
- ✅ Release notes prepared
- ✅ Privacy policy ready

### Documentation
- ✅ README with installation instructions
- ✅ Changelog for version
- ✅ System requirements listed
- ✅ Known issues documented

### Security
- ✅ No hardcoded credentials
- ✅ Permissions minimized
- ✅ Code obfuscated (ProGuard)
- ✅ Signing certificate secure

---

## 🔐 Signing Your Release APK

### Generate Keystore (First Time)
```bash
bash scripts/keygen.sh
```

### Build Signed Release
```bash
set KEYSTORE_FILE=android/app/release.keystore
set KEYSTORE_PASSWORD=your_password
set KEY_ALIAS=voxvpn
set KEY_PASSWORD=your_key_password

scripts\build-local-apk.bat "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN" release
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📤 Copy to Distribution Location

### Create Distribution Folder
```bash
mkdir voxvpn-releases
mkdir voxvpn-releases\v1.0.0

# Copy release APK
copy "C:\Users\user\AndroidStudioProjects\VoxVPNOpenVPN\android\app\build\outputs\apk\release\app-release.apk" ^
     "voxvpn-releases\v1.0.0\VoxVPN-v1.0.0.apk"
```

### Version Naming Convention
```
VoxVPN-v1.0.0.apk          (Release)
VoxVPN-v1.0.0-debug.apk    (Debug testing)
VoxVPN-v1.0.0-beta.apk     (Beta release)
```

---

## 📝 Release Notes Template

```markdown
# VoxVPN v1.0.0 Release

## ✨ Features
- Secure VPN connection
- Multiple server locations
- High-speed encryption
- Battery optimization

## 🐛 Bug Fixes
- Fixed connection stability
- Improved app performance
- Fixed memory leaks

## �� System Requirements
- Android 12+
- 50 MB storage space
- Internet connection

## 📥 Installation
1. Download VoxVPN-v1.0.0.apk
2. Open file to install
3. Grant requested permissions
4. Open VoxVPN and connect

## ⚙️ Settings
- VPN Protocol: OpenVPN
- Encryption: AES-256
- Kill Switch: Enabled

## 🔗 Links
- GitHub: https://github.com/stepperandy/voxvpn
- Report Issues: https://github.com/stepperandy/voxvpn/issues

---
Signed and released by @stepperandy
```

---

## 🌍 Publishing to Google Play Store

### Step 1: Prepare App Listing
```
App Name: VoxVPN
Short Description: Secure VPN connection for Android
Full Description: 
  VoxVPN provides fast and secure VPN connection with:
  - Multiple server locations
  - 256-bit encryption
  - No logs policy
  - Battery-efficient design
```

### Step 2: Upload APK
- Go to Play Console
- Select app
- Production → Create release
- Upload signed APK
- Upload screenshots (minimum 2)

### Step 3: Content Rating
- Complete content rating questionnaire
- Usually takes 1 hour

### Step 4: Review & Publish
- Submit for review
- Google reviews (24-72 hours)
- Published to Play Store

---

## 📊 Distribution Statistics

Track your releases:

```bash
# Get APK file size
dir app-release.apk

# Get checksum for verification
certutil -hashfile app-release.apk SHA256
```

Example output:
```
Filename: app-release.apk
Size: 38 MB
SHA256: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Version: 1.0.0
Build Date: 2026-06-10
```

---

## 🔄 Update Process

### For New Versions

1. **Update Version Code**
   - Edit `android/app/build.gradle`
   - Increment `versionCode` and `versionName`

2. **Build Release**
   ```bash
   scripts\build-local-apk.bat . release
   ```

3. **Create Release**
   - GitHub: Draft new release with tag
   - Play Store: Create new release (auto-updates)
   - Firebase: Upload new build

4. **Announce Update**
   - Release notes
   - Changelog
   - Social media

---

## 🎯 Installation Instructions for Users

### Manual APK Installation

```
1. Download VoxVPN-v1.0.0.apk
2. Open Settings → Security
3. Enable "Unknown Sources"
4. Open file manager
5. Locate downloaded .apk file
6. Tap to install
7. Tap "Install"
8. App appears on home screen
```

### Via Play Store (After Publishing)

```
1. Open Google Play Store
2. Search "VoxVPN"
3. Tap "Install"
4. App downloads and installs automatically
```

---

## 📚 References

- [Android App Release Guide](https://developer.android.com/studio/publish)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Firebase App Distribution](https://firebase.google.com/docs/app-distribution)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

## 💡 Pro Tips

✅ **Always keep your keystore secure** - Back it up in safe location
✅ **Test before release** - Install on multiple devices
✅ **Version incrementally** - Makes tracking easier
✅ **Keep changelog** - Users appreciate transparency
✅ **Monitor crashes** - Use Firebase Crashlytics
✅ **Respond to reviews** - Engage with users

---

**Your APK is ready to share with the world!** 🚀
