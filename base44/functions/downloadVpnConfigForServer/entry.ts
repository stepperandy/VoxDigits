import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { serverId, platform } = body;

    if (!serverId) {
      return Response.json({ error: 'serverId is required' }, { status: 400 });
    }

    // Verify subscription
    const subs = await base44.entities.VPNSubscription.filter({ user_email: user.email });
    if (!subs || subs.length === 0) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }
    const subscription = subs[0];
    if (subscription.status !== 'active') {
      return Response.json({ error: 'Subscription is not active' }, { status: 403 });
    }

    // Get user's device credentials
    const devices = await base44.entities.LinkedDevice.filter({ subscription_id: subscription.id });
    let device = devices.find(d => d.device_type === (platform || '').toLowerCase() && d.status === 'active')
      || devices.find(d => d.status === 'active')
      || devices[0];

    // If no device exists, provision one
    if (!device) {
      const provisionRes = await base44.functions.invoke('provisionVpnUser', {
        email: user.email,
        platform: platform || 'windows',
        deviceName: `${platform || 'Windows'} Device`,
      });
      if (provisionRes.data?.configContent) {
        return new Response(provisionRes.data.configContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="VoxVPN.conf"`,
          },
        });
      }
      return Response.json({ error: 'Failed to provision VPN profile' }, { status: 500 });
    }

    // Get the specific server
    const servers = await base44.asServiceRole.entities.VPNServer.filter({ status: 'online' });
    const server = servers.find(s => s.id === serverId);

    if (!server) {
      return Response.json({ error: 'Server not found or offline' }, { status: 404 });
    }

    const serverLabel = (server.city || server.region || 'Server').replace(/\s+/g, '-');

    const wireGuardConfig = `[Interface]
PrivateKey = ${device.vpn_profile_key}
Address = ${device.ip_address}/32
DNS = 1.1.1.1, 8.8.8.8

[Peer]
# VoxVPN Server - ${server.region} (${server.city || server.country})
PublicKey = ${server.public_key}
Endpoint = ${server.ip_address}:${server.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;

    await base44.entities.LinkedDevice.update(device.id, {
      last_connected: new Date().toISOString(),
    });

    // Windows: deliver a PowerShell installer that auto-installs WireGuard + imports config
    if ((platform || '').toLowerCase() === 'windows') {
      const escapedConfig = wireGuardConfig.replace(/`/g, '``').replace(/"/g, '`"').replace(/\$/g, '`$');
      const psScript = `# VoxVPN Windows Setup - ${server.city || server.region}
# Right-click this file and select "Run with PowerShell" (as Administrator)
# =====================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ██╗   ██╗ ██████╗ ██╗  ██╗██╗   ██╗██████╗ ███╗   ██╗" -ForegroundColor Cyan
Write-Host "  ██║   ██║██╔═══██╗╚██╗██╔╝██║   ██║██╔══██╗████╗  ██║" -ForegroundColor Cyan
Write-Host "  ██║   ██║██║   ██║ ╚███╔╝ ██║   ██║██████╔╝██╔██╗ ██║" -ForegroundColor Cyan
Write-Host "  ╚██╗ ██╔╝██║   ██║ ██╔██╗ ╚██╗ ██╔╝██╔═══╝ ██║╚██╗██║" -ForegroundColor Cyan
Write-Host "   ╚████╔╝ ╚██████╔╝██╔╝ ██╗ ╚████╔╝ ██║     ██║ ╚████║" -ForegroundColor Cyan
Write-Host "    ╚═══╝   ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚═╝     ╚═╝  ╚═══╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  VoxVPN Setup — Server: ${server.city || server.region}" -ForegroundColor White
Write-Host "  www.voxvpn.net | support@voxdigits.com" -ForegroundColor DarkGray
Write-Host ""

# Check admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] Please run this script as Administrator." -ForegroundColor Red
    Write-Host "    Right-click the file -> Run with PowerShell (as Administrator)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 1: Install WireGuard if not present
$wgPath = "$env:ProgramFiles\\WireGuard\\wireguard.exe"
if (-not (Test-Path $wgPath)) {
    Write-Host "[1/3] Downloading WireGuard..." -ForegroundColor Cyan
    $wgInstaller = "$env:TEMP\\wireguard-installer.exe"
    Invoke-WebRequest -Uri "https://download.wireguard.com/windows-client/wireguard-installer.exe" -OutFile $wgInstaller -UseBasicParsing
    Write-Host "[1/3] Installing WireGuard silently..." -ForegroundColor Cyan
    Start-Process -FilePath $wgInstaller -ArgumentList "/S" -Wait
    Remove-Item $wgInstaller -Force -ErrorAction SilentlyContinue
    Write-Host "[1/3] WireGuard installed." -ForegroundColor Green
} else {
    Write-Host "[1/3] WireGuard already installed." -ForegroundColor Green
}

# Step 2: Write VoxVPN config
Write-Host "[2/3] Writing VoxVPN configuration..." -ForegroundColor Cyan
$configDir = "$env:ProgramFiles\\WireGuard\\Data\\Configurations"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
$configPath = "$configDir\\VoxVPN-${serverLabel}.conf"
$configContent = @"
${wireGuardConfig}
"@
Set-Content -Path $configPath -Value $configContent -Encoding UTF8
Write-Host "[2/3] Config saved to: $configPath" -ForegroundColor Green

# Step 3: Import and activate tunnel
Write-Host "[3/3] Activating VoxVPN tunnel..." -ForegroundColor Cyan
& "$wgPath" /installtunnelservice $configPath
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "  =============================================" -ForegroundColor Green
Write-Host "  VoxVPN is now ACTIVE on ${server.city || server.region}!" -ForegroundColor Green
Write-Host "  Your traffic is encrypted and protected." -ForegroundColor Green
Write-Host "  =============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  To manage: Open WireGuard from your system tray" -ForegroundColor White
Write-Host "  To disconnect: wireguard /uninstalltunnelservice VoxVPN-${serverLabel}" -ForegroundColor DarkGray
Write-Host ""
Read-Host "Press Enter to close"
`;

      return new Response(psScript, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="VoxVPN-${serverLabel}-Setup.ps1"`,
        },
      });
    }

    // macOS: shell script installer
    if ((platform || '').toLowerCase() === 'macos') {
      const shScript = `#!/bin/bash
# VoxVPN macOS Setup - ${server.city || server.region}
# Run in Terminal: sudo bash VoxVPN-${serverLabel}-Setup.sh
# =====================================================================

echo ""
echo "  ██╗   ██╗ ██████╗ ██╗  ██╗██╗   ██╗██████╗ ███╗   ██╗"
echo "  VoxVPN Setup — ${server.city || server.region}"
echo "  www.voxvpn.net"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
  echo "[!] Please run as root: sudo bash $0"
  exit 1
fi

# Install WireGuard via Homebrew if not present
if ! command -v wg &> /dev/null; then
  echo "[1/3] Installing WireGuard..."
  if ! command -v brew &> /dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew install wireguard-tools
fi
echo "[1/3] WireGuard ready."

# Write config
echo "[2/3] Writing VoxVPN configuration..."
mkdir -p /etc/wireguard
cat > /etc/wireguard/VoxVPN-${serverLabel}.conf << 'CONF'
${wireGuardConfig}
CONF
chmod 600 /etc/wireguard/VoxVPN-${serverLabel}.conf
echo "[2/3] Config saved."

# Activate
echo "[3/3] Activating VoxVPN..."
wg-quick up /etc/wireguard/VoxVPN-${serverLabel}.conf

echo ""
echo "  ✅ VoxVPN is ACTIVE — ${server.city || server.region}"
echo "  To disconnect: sudo wg-quick down VoxVPN-${serverLabel}"
echo ""
`;
      return new Response(shScript, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="VoxVPN-${serverLabel}-Setup.sh"`,
        },
      });
    }

    // Linux: same shell approach
    if ((platform || '').toLowerCase() === 'linux') {
      const shScript = `#!/bin/bash
# VoxVPN Linux Setup - ${server.city || server.region}
# Run: sudo bash VoxVPN-${serverLabel}-Setup.sh
echo "[1/3] Installing WireGuard..."
apt-get update -qq && apt-get install -y wireguard 2>/dev/null || yum install -y wireguard-tools 2>/dev/null
echo "[2/3] Writing config..."
mkdir -p /etc/wireguard
cat > /etc/wireguard/VoxVPN-${serverLabel}.conf << 'CONF'
${wireGuardConfig}
CONF
chmod 600 /etc/wireguard/VoxVPN-${serverLabel}.conf
echo "[3/3] Activating..."
wg-quick up VoxVPN-${serverLabel}
echo "✅ VoxVPN connected to ${server.city || server.region}"
`;
      return new Response(shScript, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="VoxVPN-${serverLabel}-Setup.sh"`,
        },
      });
    }

    // iOS / Android / default: plain WireGuard .conf
    return new Response(wireGuardConfig, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="VoxVPN-${serverLabel}.conf"`,
      },
    });

  } catch (error) {
    console.error('downloadVpnConfigForServer error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});