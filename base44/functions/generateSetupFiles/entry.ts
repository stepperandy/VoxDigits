import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const setupTemplates = {
  windows: `@echo off
REM VoxVPN Windows Setup Installer
REM This script installs VoxVPN with elevated privileges

setlocal enabledelayedexpansion

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo VoxVPN Setup Installer
    echo =====================
    echo This installation requires administrator privileges.
    echo.
    pause
    exit /b 1
)

REM Set installation directory
set "INSTALL_DIR=%ProgramFiles%\\VoxVPN"
set "APP_NAME=VoxVPN"
set "VERSION=2.1.0"

echo.
echo Installing %APP_NAME% v%VERSION%...
echo.

REM Create installation directory
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copy application files
echo Copying application files...
cd /d "%INSTALL_DIR%" || exit /b 1

REM Create default config
echo [Interface] > config.conf
echo Address = 10.0.0.2/32 >> config.conf
echo DNS = 8.8.8.8, 8.8.4.4 >> config.conf
echo PrivateKey = REPLACE_WITH_PRIVATE_KEY >> config.conf
echo. >> config.conf
echo [Peer] >> config.conf
echo PublicKey = REPLACE_WITH_PUBLIC_KEY >> config.conf
echo AllowedIPs = 0.0.0.0/0 >> config.conf
echo Endpoint = vpn.voxvpn.com:51820 >> config.conf
echo PersistentKeepalive = 25 >> config.conf

REM Create uninstaller
echo Creating uninstaller...
echo @echo off > uninstall.bat
echo echo Uninstalling VoxVPN... >> uninstall.bat
echo rmdir /s /q "%%ProgramFiles%%\\VoxVPN" >> uninstall.bat
echo echo VoxVPN has been uninstalled. >> uninstall.bat
echo pause >> uninstall.bat

REM Create shortcut in Start Menu
powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%AppData%\\Microsoft\\Windows\\Start Menu\\Programs\\VoxVPN.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\\VoxVPN.exe'; $Shortcut.Description = 'VoxVPN - Secure VPN Connection'; $Shortcut.IconLocation = '%INSTALL_DIR%\\icon.ico'; $Shortcut.Save()"

REM Registry entry for uninstall (optional)
reg add "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\VoxVPN" /v "DisplayName" /d "VoxVPN v%VERSION%" /f >nul 2>&1
reg add "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\VoxVPN" /v "UninstallString" /d "\"%INSTALL_DIR%\\uninstall.bat\"" /f >nul 2>&1
reg add "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\VoxVPN" /v "DisplayVersion" /d "%VERSION%" /f >nul 2>&1

REM Create a README file
echo VoxVPN Installation Complete >> README.txt
echo. >> README.txt
echo Installation Directory: %INSTALL_DIR% >> README.txt
echo. >> README.txt
echo To uninstall, run: %INSTALL_DIR%\\uninstall.bat >> README.txt

echo.
echo =========================================
echo Installation Complete!
echo =========================================
echo.
echo VoxVPN has been successfully installed to:
echo %INSTALL_DIR%
echo.
echo Next steps:
echo 1. Open VoxVPN from Start Menu
echo 2. Import your VPN configuration
echo 3. Connect to your preferred server
echo.
echo For support: support@voxvpn.net
echo.
pause
exit /b 0`,

  macos: `# VoxVPN macOS Configuration
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  linux: `# VoxVPN Linux Configuration
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  ios: `# VoxVPN iOS Configuration
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  android: `# VoxVPN Android Configuration
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,

  router: `# VoxVPN Router Configuration
[Interface]
Address = 10.0.0.1/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY
ListenPort = 51820

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25`,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const platform = body.platform?.toLowerCase();

    if (!platform || !setupTemplates[platform]) {
      return Response.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const content = setupTemplates[platform];
    const ext = platform === 'windows' ? 'bat' : 'conf';
    const fileName = `VoxVPN-${platform.charAt(0).toUpperCase() + platform.slice(1)}-Setup.${ext}`;

    return Response.json({
      success: true,
      content,
      fileName,
      mimeType: platform === 'windows' ? 'application/x-batch' : 'text/plain',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});