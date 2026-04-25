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

    // OpenVPN .ovpn config
    const ovpnConfig = `client
dev tun
proto udp
remote ${server.ip_address} ${server.port || 1194}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-CBC
auth SHA256
verb 3
keepalive 10 120

# VoxVPN Server - ${server.region} (${server.city || server.country})
# Generated for: ${user.email}

<ca>
${server.public_key || '# CA certificate will be provided by your VoxVPN server'}
</ca>`;

    await base44.entities.LinkedDevice.update(device.id, {
      last_connected: new Date().toISOString(),
    });

    // Windows: PowerShell installer that auto-installs OpenVPN + imports config
    if ((platform || '').toLowerCase() === 'windows') {
      const psScript = `# VoxVPN Windows Setup - ${server.city || server.region}
# Right-click this file and select "Run with PowerShell" (as Administrator)
# =====================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ██╗   ██╗ ██████╗ ██╗  ██╗██╗   ██╗██████╗ ███╗   ██╗" -ForegroundColor Cyan
Write-Host "  VoxVPN Setup - Server: ${server.city || server.region}" -ForegroundColor White
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

# Step 1: Install OpenVPN if not present
$ovpnPath = "$env:ProgramFiles\\OpenVPN\\bin\\openvpn.exe"
if (-not (Test-Path $ovpnPath)) {
    Write-Host "[1/3] Downloading OpenVPN..." -ForegroundColor Cyan
    $ovpnInstaller = "$env:TEMP\\openvpn-installer.exe"
    Invoke-WebRequest -Uri "https://swupdate.openvpn.org/community/releases/OpenVPN-2.6.12-I001-amd64.msi" -OutFile $ovpnInstaller -UseBasicParsing
    Write-Host "[1/3] Installing OpenVPN silently..." -ForegroundColor Cyan
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i $ovpnInstaller /quiet /norestart" -Wait
    Remove-Item $ovpnInstaller -Force -ErrorAction SilentlyContinue
    Write-Host "[1/3] OpenVPN installed." -ForegroundColor Green
} else {
    Write-Host "[1/3] OpenVPN already installed." -ForegroundColor Green
}

# Step 2: Write VoxVPN config
Write-Host "[2/3] Writing VoxVPN configuration..." -ForegroundColor Cyan
$configDir = "$env:ProgramFiles\\OpenVPN\\config"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
$configPath = "$configDir\\VoxVPN-${serverLabel}.ovpn"
$configContent = @'
${ovpnConfig}
'@
Set-Content -Path $configPath -Value $configContent -Encoding UTF8
Write-Host "[2/3] Config saved to: $configPath" -ForegroundColor Green

Write-Host ""
Write-Host "  =============================================" -ForegroundColor Green
Write-Host "  VoxVPN config installed for ${server.city || server.region}!" -ForegroundColor Green
Write-Host "  Open OpenVPN GUI from your system tray," -ForegroundColor White
Write-Host "  right-click the icon, and select Connect." -ForegroundColor White
Write-Host "  =============================================" -ForegroundColor Green
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

    // macOS: shell script installer for OpenVPN
    if ((platform || '').toLowerCase() === 'macos') {
      const shScript = `#!/bin/bash
# VoxVPN macOS Setup - ${server.city || server.region}
# Run in Terminal: sudo bash VoxVPN-${serverLabel}-Setup.sh

echo "VoxVPN Setup — ${server.city || server.region}"
echo "www.voxvpn.net"

if [ "$EUID" -ne 0 ]; then
  echo "[!] Please run as root: sudo bash $0"
  exit 1
fi

# Install OpenVPN via Homebrew
if ! command -v openvpn &> /dev/null; then
  echo "[1/3] Installing OpenVPN..."
  if ! command -v brew &> /dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew install openvpn
fi
echo "[1/3] OpenVPN ready."

echo "[2/3] Writing VoxVPN configuration..."
mkdir -p /etc/openvpn
cat > /etc/openvpn/VoxVPN-${serverLabel}.ovpn << 'CONF'
${ovpnConfig}
CONF
chmod 600 /etc/openvpn/VoxVPN-${serverLabel}.ovpn
echo "[2/3] Config saved."

echo "[3/3] Connecting to VoxVPN..."
openvpn --config /etc/openvpn/VoxVPN-${serverLabel}.ovpn --daemon
echo "✅ VoxVPN is ACTIVE — ${server.city || server.region}"
echo "To disconnect: sudo pkill openvpn"
`;
      return new Response(shScript, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="VoxVPN-${serverLabel}-Setup.sh"`,
        },
      });
    }

    // Linux: OpenVPN shell installer
    if ((platform || '').toLowerCase() === 'linux') {
      const shScript = `#!/bin/bash
# VoxVPN Linux Setup - ${server.city || server.region}
# Run: sudo bash VoxVPN-${serverLabel}-Setup.sh
echo "[1/3] Installing OpenVPN..."
apt-get update -qq && apt-get install -y openvpn 2>/dev/null || yum install -y openvpn 2>/dev/null
echo "[2/3] Writing config..."
mkdir -p /etc/openvpn
cat > /etc/openvpn/VoxVPN-${serverLabel}.ovpn << 'CONF'
${ovpnConfig}
CONF
chmod 600 /etc/openvpn/VoxVPN-${serverLabel}.ovpn
echo "[3/3] Connecting..."
openvpn --config /etc/openvpn/VoxVPN-${serverLabel}.ovpn --daemon
echo "✅ VoxVPN connected to ${server.city || server.region}"
echo "To disconnect: sudo pkill openvpn"
`;
      return new Response(shScript, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="VoxVPN-${serverLabel}-Setup.sh"`,
        },
      });
    }

    // iOS / Android / default: plain .ovpn file for OpenVPN Connect app
    return new Response(ovpnConfig, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="VoxVPN-${serverLabel}.ovpn"`,
      },
    });

  } catch (error) {
    console.error('downloadVpnConfigForServer error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});