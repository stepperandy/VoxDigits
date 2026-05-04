# VoxVPN Windows Installer

## Prerequisites

1. **Inno Setup 6** — https://jrsoftware.org/isinfo.php
2. **Node.js 18+** — https://nodejs.org
3. **electron-builder** — configured in root `package.json`
4. **WireGuard installer** — download from https://www.wireguard.com/install/ and place at `installer/windows/assets/wireguard-installer.exe`
5. **App icon** — place a `.ico` file at `installer/windows/assets/icon.ico`

## Setup

### 1. Add electron-builder to your project

In your root `package.json`, add:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "build:win": "electron-builder --win"
  },
  "build": {
    "appId": "net.voxvpn.app",
    "productName": "VoxVPN",
    "files": [
      "electron/**/*",
      "dist/**/*"
    ],
    "win": {
      "target": "dir",
      "icon": "installer/windows/assets/icon.ico"
    },
    "extraResources": [
      {
        "from": "electron/backend",
        "to": "backend"
      }
    ]
  }
}
```

### 2. Place required assets

```
installer/windows/
├── assets/
│   ├── icon.ico              ← App icon (256x256 recommended)
│   └── wireguard-installer.exe  ← WireGuard MSI from wireguard.com
├── output/                   ← Generated installer goes here
├── VoxVPN.iss               ← Main Inno Setup script
├── build.bat                ← One-click build script
└── README.md
```

### 3. Build the installer

Double-click `build.bat` or run from command line:

```bat
cd installer/windows
build.bat
```

The installer `VoxVPN-Setup-1.0.0.exe` will appear in `installer/windows/output/`.

## What the installer does

1. ✅ Checks Windows 10+ (build 17763+)
2. ✅ Requests admin privileges (needed for WireGuard)
3. ✅ Silently installs WireGuard (if not already installed)
4. ✅ Installs VoxVPN app to `Program Files`
5. ✅ Creates Start Menu shortcuts
6. ✅ Optional: Desktop shortcut
7. ✅ Optional: Launch on Windows startup
8. ✅ Creates uninstaller (Add/Remove Programs)

## Code Signing (Recommended)

To avoid Windows SmartScreen warnings, sign the installer:

```bat
signtool sign /f "your-cert.pfx" /p "password" /tr http://timestamp.digicert.com /td sha256 /fd sha256 "output\VoxVPN-Setup-1.0.0.exe"
```

Get a code signing certificate from:
- DigiCert (~$300/yr)
- Sectigo (~$200/yr)
- SignPath.io (free for open source)