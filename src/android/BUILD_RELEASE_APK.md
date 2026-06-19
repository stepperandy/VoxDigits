# Build Signed Release APK for VoxVPN

## Prerequisites
- Java JDK 17+ installed
- Android Studio or command-line build tools
- Keystore file (generate once, keep it SAFE)

## Step 1: Generate Release Keystore (ONE TIME ONLY)

Run this command and **save the keystore file securely** (never lose it):

```bash
keytool -genkey -v -keystore voxvpn-release.keystore -alias voxvpn -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for:
- Keystore password (remember this!)
- Your name, organization, etc.

**⚠️ CRITICAL:** Backup this keystore file! If you lose it, you cannot update the app on users' devices.

## Step 2: Set Environment Variables

Set these in your terminal or `.bashrc`/`.zshrc`:

```bash
export KEYSTORE_PASSWORD="your_keystore_password"
export KEY_PASSWORD="your_key_password"
```

Or create `android/local.properties`:
```properties
storePassword=your_keystore_password
keyPassword=your_key_password
```

## Step 3: Build Signed Release APK

From the `android` directory:

```bash
./gradlew clean assembleRelease
```

The signed APK will be at:
```
app/build/outputs/apk/release/app-release.apk
```

## Step 4: Verify APK Signature

```bash
apksigner verify --verbose app/build/outputs/apk/release/app-release.apk
```

You should see: `Verified using v1 scheme (JAR signing): true`

## Step 5: Upload to GitHub Releases

1. Go to: https://github.com/stepperandy/voxvpn/releases
2. Edit the V1.0 release or create a new one
3. Upload `app-release.apk` (NOT the debug APK)
4. Update the download URL in the dashboard

## Alternative: Build in Android Studio

1. Open `android` folder in Android Studio
2. Build → Generate Signed Bundle / APK
3. Select "APK" → Next
4. Create new keystore or use existing
5. Select "release" build variant
6. Click Finish
7. Locate APK in `app/build/outputs/apk/release/`

## Troubleshooting

**"App not installed" error:**
- Ensure you're building a **release** APK, not debug
- Uninstall any previous debug versions first
- Verify the APK is signed: `apksigner verify app-release.apk`

**Signature mismatch:**
- You must use the SAME keystore for all future updates
- Never change the keystore or users can't update

**Build fails:**
- Ensure Java 17 is installed: `java -version`
- Run: `./gradlew --stop` then retry
- Check `android/app/build.gradle` for syntax errors