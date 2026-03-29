import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const setupTemplates = {
  windows: `# VoxVPN WireGuard Setup Installer for Windows
# This PowerShell script downloads and configures WireGuard VPN
# Run as Administrator

#Requires -RunAsAdministrator

param(
    [string]$ConfigUrl = "https://app.example.com/config.conf"
)

function Write-Status {
    param([string]$Message, [string]$Status = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Status] $Message"
}

Write-Status "VoxVPN WireGuard Installation Starting..."

# Check admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Status "This script requires Administrator privileges. Please run as Administrator." "ERROR"
    exit 1
}

# Define paths
$WireGuardPath = "C:\\Program Files\\WireGuard"
$ConfigPath = "$env:APPDATA\\WireGuard\\Configurations\\VoxVPN.conf"
$ConfigDir = "$env:APPDATA\\WireGuard\\Configurations"

# Create config directory
if (-NOT (Test-Path $ConfigDir)) {
    New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
    Write-Status "Created WireGuard configuration directory"
}

# Check if WireGuard is installed
if (-NOT (Test-Path "$WireGuardPath\\wg-quick.exe")) {
    Write-Status "WireGuard not found. Downloading installer..."
    
    try {
        $DownloadUrl = "https://download.wireguard.com/windows-client/wireguard-amd64-0.5.3.msi"
        $InstallerPath = "$env:TEMP\\wireguard-installer.msi"
        
        # Download WireGuard
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $InstallerPath -ErrorAction Stop
        Write-Status "Downloaded WireGuard installer"
        
        # Install WireGuard
        Write-Status "Installing WireGuard..."
        msiexec.exe /i $InstallerPath /quiet /norestart
        Start-Sleep -Seconds 10
        
        # Cleanup
        Remove-Item $InstallerPath -Force -ErrorAction SilentlyContinue
        Write-Status "WireGuard installed successfully"
    }
    catch {
        Write-Status "Failed to download/install WireGuard: $_" "ERROR"
        Write-Status "Please visit https://www.wireguard.com/install/ and install manually" "INFO"
        exit 1
    }
} else {
    Write-Status "WireGuard is already installed"
}

# Create VPN configuration file
$VpnConfig = @"
[Interface]
Address = 10.0.0.2/32
DNS = 8.8.8.8, 8.8.4.4
PrivateKey = REPLACE_WITH_PRIVATE_KEY

[Peer]
PublicKey = REPLACE_WITH_PUBLIC_KEY
AllowedIPs = 0.0.0.0/0
Endpoint = vpn.voxvpn.com:51820
PersistentKeepalive = 25
"@

try {
    Set-Content -Path $ConfigPath -Value $VpnConfig -Force
    Write-Status "VPN configuration installed to: $ConfigPath"
}
catch {
    Write-Status "Failed to create VPN configuration: $_" "ERROR"
    exit 1
}

# Import VPN configuration into WireGuard
Write-Status "Importing VPN configuration into WireGuard..."
try {
    & "$WireGuardPath\\wg-quick.exe" add VoxVPN "$ConfigPath" 2>&1 | Out-Null
    Write-Status "VPN configuration imported successfully"
}
catch {
    Write-Status "Note: Configuration imported but auto-connect may require manual setup" "WARN"
}

Write-Status "==============================================="
Write-Status "Installation Complete!"
Write-Status "==============================================="
Write-Status "Next Steps:"
Write-Status "1. Open WireGuard from Start Menu"
Write-Status "2. You should see 'VoxVPN' in your tunnel list"
Write-Status "3. Click 'Activate' to connect"
Write-Status "4. For support: support@voxvpn.net"
Write-Status "==============================================="

# Optional: Create desktop shortcut
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = "$DesktopPath\\WireGuard.lnk"

if (-NOT (Test-Path $ShortcutPath)) {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = "$WireGuardPath\\wireguard.exe"
    $Shortcut.Description = "WireGuard VPN Client"
    $Shortcut.Save()
    Write-Status "Desktop shortcut created"
}

exit 0`,

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
    const ext = platform === 'windows' ? 'ps1' : 'conf';
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