; VoxVPN Windows Installer
; Installs OpenVPN CLI + GUI + Electron app
; Requires Inno Setup 6 — https://jrsoftware.org/isinfo.php

#define MyAppName      "VoxVPN"
#define MyAppVersion   "1.0.0"
#define MyAppPublisher "VoxVPN"
#define MyAppURL       "https://voxvpn.net"
#define MyAppExeName   "VoxVPN.exe"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
PrivilegesRequired=admin
OutputDir=output
OutputBaseFilename=VoxVPN-Setup-{#MyAppVersion}
SetupIconFile=assets\icon.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
MinVersion=10.0.17763
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional Icons:"; Flags: unchecked

[Files]
; Electron app (built by electron-builder --dir)
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; OpenVPN Community installer (download from openvpn.net/community-downloads)
Source: "assets\openvpn-installer.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

; Server .ovpn config files
Source: "assets\configs\*.ovpn"; DestDir: "{app}\configs"; Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{group}\{#MyAppName}";                       Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}";                Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; ── Step 1: Kill OpenVPN GUI if it's already running ──────────────────────────
Filename: "taskkill"; Parameters: "/F /IM openvpn-gui.exe"; Flags: runhidden waitprocfinished

; ── Step 2: Install OpenVPN CLI + GUI + TAP driver silently ──────────────────
; /SELECT_OPENVPN=1   → install openvpn.exe CLI
; /SELECT_OPENVPNGUI=1 → install openvpn-gui.exe
; /SELECT_TAP=1       → install TAP/TUN driver (required for VPN tunnel)
; /SELECT_SERVICE=1   → install OpenVPN service
; /SELECT_PATH=1      → add openvpn.exe to system PATH
Filename: "{tmp}\openvpn-installer.exe"; \
  Parameters: "/S /SELECT_OPENVPN=1 /SELECT_OPENVPNGUI=1 /SELECT_TAP=1 /SELECT_SERVICE=0 /SELECT_OPENSSL_UTILITIES=0 /SELECT_EASY_RSA=0 /SELECT_PATH=1"; \
  StatusMsg: "Installing OpenVPN with GUI..."; \
  Flags: waitprocfinished

; ── Step 3: Copy .ovpn configs to OpenVPN config folder ───────────────────────
Filename: "xcopy"; \
  Parameters: """{app}\configs\*"" ""{commonappdata}\OpenVPN\config\"" /Y /E /I"; \
  Flags: runhidden waitprocfinished

; ── Step 4: Launch VoxVPN after install ───────────────────────────────────────
Filename: "{app}\{#MyAppExeName}"; \
  Description: "Launch VoxVPN"; \
  Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "taskkill"; Parameters: "/F /IM {#MyAppExeName}"; Flags: runhidden waitprocfinished
Filename: "taskkill"; Parameters: "/F /IM openvpn.exe";     Flags: runhidden waitprocfinished
Filename: "taskkill"; Parameters: "/F /IM openvpn-gui.exe"; Flags: runhidden waitprocfinished

[Code]
procedure KillExisting();
var RC: Integer;
begin
  Exec('taskkill', '/F /IM ' + '{#MyAppExeName}', '', SW_HIDE, ewWaitUntilTerminated, RC);
  Exec('taskkill', '/F /IM openvpn-gui.exe',       '', SW_HIDE, ewWaitUntilTerminated, RC);
end;

function InitializeSetup(): Boolean;
begin
  KillExisting();
  Result := True;
end;