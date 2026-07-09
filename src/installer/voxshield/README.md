# VoxShield Business Security — Windows Installer

## Prerequisites

1. **Node.js 20+** — https://nodejs.org/
2. **Inno Setup 6** — https://jrsoftware.org/isinfo.php
3. **Electron + electron-builder** (installed via `npm install`)

## Build Steps

### Option A: One-click build
```bat
cd src\installer\voxshield
build.bat
```

### Option B: Manual steps
```bat
:: 1. Install dependencies
npm install

:: 2. Build the Electron app (unpacked)
npm run build:win

:: 3. Compile the installer
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" VoxShield.iss
```

## Output

The compiled installer will be at:
```
src/installer/voxshield/output/VoxShield-Setup-1.0.0.exe
```

## What the Installer Does

- Installs the VoxShield desktop security agent to `Program Files\VoxShield`
- Creates Start Menu and optional Desktop shortcuts
- Optional auto-start on Windows login
- Requires admin privileges (for DNS filtering / hosts file access)
- Kills any running VoxShield process before install/uninstall
- Windows 10 1809+ minimum

## Customization

Edit `VoxShield.iss` to change:
- App name, version, publisher
- Default install directory
- Shortcut options
- Custom install tasks (e.g., bundled drivers, configs)