# VoxVPN Android — Real OpenVPN Integration Guide

## Architecture

```
React UI (ServerList.jsx)
    ↓  calls
lib/vpnNativePlugin.js  (registerPlugin 'VoxVpnPlugin')
    ↓  bridges to
VoxVpnPlugin.kt         (Capacitor plugin)
    ↓  calls
ICS-OpenVPN core        (de.blinkt.openvpn — OpenVPNService)
    ↓  runs
Real OpenVPN tunnel     (TUN device, routes all traffic)
```

---

## Step 1 — Add ICS-OpenVPN as a Submodule

```bash
cd android
git submodule add https://github.com/schwabe/ics-openvpn.git ics-openvpn
git submodule update --init --recursive
```

## Step 2 — Configure settings.gradle

Edit `android/settings.gradle`:

```groovy
include ':app'
include ':ics-openvpn:main'
project(':ics-openvpn:main').projectDir = new File('ics-openvpn/main')
```

## Step 3 — Update app/build.gradle dependency

In `android/app/build.gradle`, replace the AAR line with:

```groovy
implementation project(':ics-openvpn:main')
```

## Step 4 — Place .ovpn configs

Copy all 20 .ovpn files to:
```
android/app/src/main/assets/configs/
```

Required files (matching SERVER_CONFIG_MAP in lib/vpnNativePlugin.js):
- us-ny.ovpn        → New York, USA
- us-la.ovpn        → Los Angeles, USA
- chicago.ovpn      → Chicago, USA
- gb-lon.ovpn       → London, UK
- de-fra.ovpn       → Frankfurt, Germany
- fr-par.ovpn       → Paris, France
- nl-ams.ovpn       → Amsterdam, Netherlands
- ch-zur.ovpn       → Zurich, Switzerland
- se-sto.ovpn       → Stockholm, Sweden
- no-osl.ovpn       → Oslo, Norway
- jp-tyo.ovpn       → Tokyo, Japan
- sg-sgp.ovpn       → Singapore
- hk-hkg.ovpn       → Hong Kong
- au-syd.ovpn       → Sydney, Australia
- ca-tor.ovpn       → Toronto, Canada
- br-sao.ovpn       → São Paulo, Brazil
- za-jnb.ovpn       → Johannesburg, South Africa
- in-mum.ovpn       → Mumbai, India
- mx-mex.ovpn       → Mexico City, Mexico
- ae-dxb.ovpn       → Dubai, UAE

Your .ovpn files already exist at: assets/configs/ — just copy them to the Android assets folder.

## Step 5 — Build Debug APK

```bash
# Build web assets first
npm run build

# Sync Capacitor
npx cap sync android

# Build debug APK
cd android
./gradlew assembleDebug

# APK output: android/app/build/outputs/apk/debug/app-debug.apk
```

## Step 6 — Build Release AAB (Google Play)

```bash
# Set up keystore (one time)
keytool -genkey -v -keystore voxvpn.keystore \
  -alias voxvpn -keyalg RSA -keysize 2048 -validity 10000

# Build release AAB
cd android
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=../voxvpn.keystore \
  -Pandroid.injected.signing.store.password=YOUR_STORE_PASS \
  -Pandroid.injected.signing.key.alias=voxvpn \
  -Pandroid.injected.signing.key.password=YOUR_KEY_PASS

# AAB output: android/app/build/outputs/bundle/release/app-release.aab
```

Or add to `android/app/build.gradle`:
```groovy
android {
    signingConfigs {
        release {
            storeFile file('../voxvpn.keystore')
            storePassword System.getenv('KEYSTORE_PASS')
            keyAlias 'voxvpn'
            keyPassword System.getenv('KEY_PASS')
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## How the Real VPN Works

1. **User taps Connect** → React calls `VoxVpnNative.connect({ config: 'us-ny' })`
2. **VoxVpnPlugin.kt** → opens `assets/configs/us-ny.ovpn` → parses with `ConfigParser`
3. **Profile saved** → `ProfileManager.addProfile(profile)` 
4. **OpenVPNService started** → ICS-OpenVPN creates TUN device, connects to server
5. **All device traffic** → routed through TUN → VPN tunnel → OpenVPN server
6. **Status callbacks** → `VpnStatus.StateListener.updateState()` → `notifyListeners('vpnStatus')` → React UI updates
7. **Disconnect** → `OpenVPNService.DISCONNECT_VPN` → TUN torn down → traffic resumes normally

## DNS

ICS-OpenVPN automatically applies the `dhcp-option DNS` directives from the .ovpn file.
Ensure your .ovpn configs include:
```
dhcp-option DNS 1.1.1.1
dhcp-option DNS 8.8.8.8
```

## Troubleshooting

- **"No such file" error**: Confirm .ovpn filenames match exactly (case-sensitive)
- **Auth failed**: Check if .ovpn needs `auth-user-pass` — add credentials to profile: `profile.mUsername` / `profile.mPassword`
- **No internet through VPN**: Check `redirect-gateway def1` is in .ovpn config
- **Build fails**: Run `./gradlew :ics-openvpn:main:assembleRelease` first to build the library