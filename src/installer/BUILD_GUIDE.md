# VoxVPN Desktop Installer — Complete Build Guide

## What Gets Built

Running this build produces a single `.exe` installer file that:
- Installs the VoxVPN Electron app to `C:\Program Files\VoxVPN\`
- Silently installs OpenVPN + TAP network adapter (required for tunneling)
- Copies all server `.ovpn` config files to the OpenVPN config directory
- Creates Start Menu + optional Desktop shortcuts
- Creates a full uninstaller (Add/Remove Programs)

When the user launches the app, they log in with their **voxvpn.net credentials** (same email + password) — no separate account needed.

---

## Prerequisites

Install these tools on your **Windows build machine** before starting:

| Tool | Download | Notes |
|------|----------|-------|
| **Node.js 20 LTS** | https://nodejs.org | Required for Vite + Electron builds |
| **Inno Setup 6** | https://jrsoftware.org/isinfo.php | Compiles the `.exe` installer |
| **Git** | https://git-scm.com | To clone the repo |

---

## Step-by-Step Build Instructions

### 1. Clone the repository

```bat
git clone https://github.com/YOUR_ORG/voxvpn.git
cd voxvpn
```

### 2. Place required asset files

You need two files in `installer/windows/assets/`:

**A) App icon — `icon.ico`**
- Must be a 256×256 `.ico` file
- Export from your logo using https://icoconvert.com or Photoshop
- Place at: `installer/windows/assets/icon.ico`

**B) OpenVPN installer — `openvpn-installer.exe`**
- Download the latest **OpenVPN Community** installer from:
  https://openvpn.net/community-downloads/
- Download the **Windows Installer (.msi or .exe)** — 64-bit version
- Rename it to `openvpn-installer.exe`
- Place at: `installer/windows/assets/openvpn-installer.exe`

Your assets folder should look like:
```
installer/windows/assets/
├── icon.ico                  ← VoxVPN app icon
└── openvpn-installer.exe     ← Downloaded from openvpn.net
```

### 3. Run the build

Double-click `installer/windows/build.bat`

Or from the command line:
```bat
cd installer\windows
build.bat
```

The script will automatically:
1. Check all prerequisites
2. Run `npm install`
3. Build the React app with Vite
4. Package the Electron app with electron-builder
5. Compile the Inno Setup installer

**Total build time: ~3–5 minutes** on a modern machine.

### 4. Find your installer

The finished installer is at:
```
installer/windows/output/VoxVPN-Setup-2.0.0.exe
```

---

## After Building

### Testing
1. Copy `VoxVPN-Setup-2.0.0.exe` to a **clean Windows 10/11 VM** (or a second PC)
2. Run the installer — it should request admin permissions (needed for OpenVPN TAP driver)
3. After install, launch VoxVPN and log in with your voxvpn.net email + password
4. Verify you can connect to a server

### Uploading for Users

**Option A — Upload to your own hosting/CDN (recommended):**
1. Upload `VoxVPN-Setup-2.0.0.exe` to your file host
2. Copy the direct download URL
3. Go to **Admin → Downloads** and paste the URL
4. Users who visit `/download` on the site will get the latest version

**Option B — GitHub Releases:**
1. Create a new release tag: `git tag v2.0.0 && git push --tags`
2. The GitHub Actions workflow (`.github/workflows/desktop-build.yml`) will automatically build and publish the release
3. Copy the direct `.exe` asset URL from the GitHub release
4. Update the URL in Admin → Downloads

---

## Updating the Version

When you make changes and want to release a new version:

1. Update the version in **two places**:
   - `electron/main.js` → `const APP_VERSION = '2.0.1';`
   - `installer/windows/VoxVPN.iss` → `#define MyAppVersion "2.0.1"`

2. Rebuild following the steps above

3. Upload the new installer and update the download URL in Admin

---

## Code Signing (Recommended for Production)

Without a code signing certificate, Windows SmartScreen will show a warning to users. To suppress this:

1. Purchase a code signing certificate from:
   - **Sectigo** (~$200/year) — https://sectigo.com/ssl-certificates-tls/code-signing
   - **DigiCert** (~$300/year)
   - **SignPath.io** (free for open source)

2. After building, sign the installer:
```bat
signtool sign /f "your-cert.pfx" /p "YourPassword" ^
  /tr http://timestamp.digicert.com /td sha256 /fd sha256 ^
  "installer\windows\output\VoxVPN-Setup-2.0.0.exe"
```

3. Add the certificate to GitHub Secrets as `WIN_SIGNING_CERT` (base64) and `WIN_SIGNING_PASSWORD` for automated CI builds.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Inno Setup 6 not found` | Install from https://jrsoftware.org/isinfo.php |
| `openvpn-installer.exe missing` | Download from https://openvpn.net/community-downloads/ and rename |
| `npm install failed` | Check internet connection; try `npm cache clean --force` |
| `electron-builder failed` | Make sure Node.js 18+ is installed |
| `VoxVPN.exe not found` in Inno Setup | Ensure electron-builder ran successfully and `dist/win-unpacked/VoxVPN.exe` exists |
| TAP adapter install fails | Run installer as Administrator |
| Login fails after install | Check subscription is active at voxvpn.net |

---

## File Structure Reference

```
installer/
├── BUILD_GUIDE.md              ← This file
├── windows/
│   ├── VoxVPN.iss              ← Inno Setup script (installer definition)
│   ├── build.bat               ← One-click build script
│   ├── assets/
│   │   ├── icon.ico            ← App icon (YOU MUST ADD THIS)
│   │   └── openvpn-installer.exe ← OpenVPN (YOU MUST ADD THIS)
│   └── output/                 ← Final .exe installer appears here
electron/
│   ├── main.js                 ← Electron main process
│   ├── preload.js              ← Secure IPC bridge
│   ├── Login.jsx               ← Login screen (uses voxvpn.net credentials)
│   ├── Dashboard.jsx           ← Main VPN control dashboard
│   └── App.jsx                 ← Electron app root
``