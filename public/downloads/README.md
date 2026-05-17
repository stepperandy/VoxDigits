# VoxVPN Downloads — Static File Hosting

This directory is the official distribution point for VoxVPN Desktop installers.

## Production URLs

| File | URL |
|------|-----|
| Latest Windows installer (alias) | `https://voxvpn.net/downloads/VoxVPN-Latest.exe` |
| Versioned installer | `https://voxvpn.net/downloads/VoxVPN-Setup-v2.0.0.exe` |

## How to publish a new release

1. Build the installer:
   ```bash
   npm run build:win
   ```
   Output: `installer/windows/output/VoxVPN Setup 2.0.0.exe`

2. Upload both files to your static host / CDN:
   - `VoxVPN-Setup-v2.0.0.exe`  ← versioned, permanent
   - `VoxVPN-Latest.exe`         ← always overwrite with the newest build

3. Update the `Download` entity in the Base44 admin:
   - Platform: `Windows`
   - Version: `2.0.0`
   - File URL: `https://voxvpn.net/downloads/VoxVPN-Latest.exe`
   - is_active: `true`

   The `latestVersion` backend function reads this record automatically.
   The Electron app will show an update banner on next launch.

## V1.5 retirement

GitHub releases are no longer used. The old URL:
  `https://github.com/stepperandy/VoxVPN-Setup-1.5/releases/download/v1.5/VoxVPN-Setup-v1.5.exe`
is deprecated. All downloads now come exclusively from voxvpn.net.
