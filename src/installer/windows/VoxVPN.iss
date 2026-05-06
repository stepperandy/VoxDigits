; VoxVPN Windows Installer v1.5
; Installs OpenVPN CLI + GUI + TAP driver + Electron app + all server configs
; Requires Inno Setup 6 — https://jrsoftware.org/isinfo.php
; Portable-ready: works on any Windows 10/11 PC, not just the build machine

#define MyAppName      "VoxVPN"
#define MyAppVersion   "1.5.0"
#define MyAppPublisher "VoxVPN"
#define MyAppURL       "https://voxvpn.net"
#define MyAppExeName   "VoxVPN.exe"
#define MyAppGUID      "{{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}"

[Setup]
AppId={#MyAppGUID}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/contact
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
; Require admin so TAP driver installs cleanly
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=output
OutputBaseFilename=VoxVPN-Setup-{#MyAppVersion}
; Use icon only if present — set to a real .ico at build time
; SetupIconFile=assets\icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
; Windows 10 1809+ minimum (TAP-Windows6 requirement)
MinVersion=10.0.17763
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}
; Allow running setup from any location / USB drive
DisableDirPage=no
DisableProgramGroupPage=auto
; Prevent running two instances of setup simultaneously
SetupMutex=VoxVPNSetupMutex

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon";   Description: "Create a &desktop shortcut";        GroupDescription: "Additional Icons:"; Flags: unchecked
Name: "startupicon";   Description: "Start VoxVPN automatically at login"; GroupDescription: "Additional Icons:"; Flags: unchecked

[Files]
; ── Electron app (electron-builder --dir output) ──────────────────────────────
Source: "dist\win-unpacked\*"; DestDir: "{app}"; \
  Flags: ignoreversion recursesubdirs createallsubdirs

; ── OpenVPN Community installer ───────────────────────────────────────────────
; Download latest from: https://openvpn.net/community-downloads/
; Rename to openvpn-installer.exe and place in assets\
Source: "assets\openvpn-installer.exe"; DestDir: "{tmp}"; \
  Flags: deleteafterinstall

; ── Server .ovpn config files (all regions) ───────────────────────────────────
Source: "assets\configs\*.ovpn"; DestDir: "{app}\configs"; \
  Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{group}\{#MyAppName}";                        Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}";  Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}";                 Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}";                   Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon

[Run]
; ── Kill any running VoxVPN / OpenVPN instances ───────────────────────────────
Filename: "taskkill"; Parameters: "/F /IM openvpn-gui.exe";    Flags: runhidden waitprocfinished
Filename: "taskkill"; Parameters: "/F /IM openvpn.exe";        Flags: runhidden waitprocfinished

; ── Install OpenVPN silently with all required components ─────────────────────
;    /S              → silent install
;    SELECT_OPENVPN  → openvpn.exe CLI binary
;    SELECT_OPENVPNGUI → openvpn-gui.exe tray application
;    SELECT_TAP      → TAP-Windows6 virtual adapter (essential for tunneling)
;    SELECT_SERVICE  → OpenVPN service (auto-start VPN on Windows boot)
;    SELECT_PATH     → adds openvpn.exe to system PATH
Filename: "{tmp}\openvpn-installer.exe"; \
  Parameters: "/S /SELECT_OPENVPN=1 /SELECT_OPENVPNGUI=1 /SELECT_TAP=1 /SELECT_SERVICE=1 /SELECT_OPENSSL_UTILITIES=0 /SELECT_EASY_RSA=0 /SELECT_PATH=1"; \
  StatusMsg: "Installing OpenVPN & TAP driver (this may take a moment)..."; \
  Flags: waitprocfinished

; ── Copy all .ovpn configs to the OpenVPN config directory ────────────────────
;    Works on all locales — uses {commonappdata} (C:\ProgramData) constant
Filename: "{sys}\xcopy.exe"; \
  Parameters: """{app}\configs\*"" ""{commonappdata}\OpenVPN\config\"" /Y /E /I /Q"; \
  Flags: runhidden waitprocfinished

; ── Launch VoxVPN after install ───────────────────────────────────────────────
Filename: "{app}\{#MyAppExeName}"; \
  Description: "Launch {#MyAppName}"; \
  Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "taskkill"; Parameters: "/F /IM {#MyAppExeName}";  Flags: runhidden waitprocfinished
Filename: "taskkill"; Parameters: "/F /IM openvpn.exe";      Flags: runhidden waitprocfinished
Filename: "taskkill"; Parameters: "/F /IM openvpn-gui.exe";  Flags: runhidden waitprocfinished

[Code]
// Kill existing processes before setup begins — prevents locked-file errors
procedure KillExisting();
var RC: Integer;
begin
  Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM ' + '{#MyAppExeName}', '', SW_HIDE, ewWaitUntilTerminated, RC);
  Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM openvpn-gui.exe',       '', SW_HIDE, ewWaitUntilTerminated, RC);
  Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM openvpn.exe',           '', SW_HIDE, ewWaitUntilTerminated, RC);
end;

function InitializeSetup(): Boolean;
begin
  KillExisting();
  Result := True;
end;

// Ensure the OpenVPN config directory exists before xcopy runs
procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigDir: String;
  RC: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    ConfigDir := ExpandConstant('{commonappdata}\OpenVPN\config');
    if not DirExists(ConfigDir) then
      ForceDirectories(ConfigDir);
  end;
end;