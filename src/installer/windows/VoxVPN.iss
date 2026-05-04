; VoxVPN Windows Installer Script (OpenVPN + Electron)
; Requires Inno Setup 6+ — https://jrsoftware.org/isinfo.php

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
AppSupportURL={#MyAppURL}/contact
AppUpdatesURL={#MyAppURL}
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
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startupicon"; Description: "Launch VoxVPN on Windows startup"; GroupDescription: "Startup Options:"

[Files]
; Electron app (built by electron-builder --dir)
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; OpenVPN installer — download from https://openvpn.net/community-downloads/
Source: "assets\openvpn-installer.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

; Server .ovpn configs
Source: "assets\configs\*.ovpn"; DestDir: "{app}\configs"; Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{group}\{#MyAppName}";                    Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}";             Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}";               Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon

[Run]
; Install OpenVPN CLI + TAP driver silently — GUI is explicitly disabled
; so it cannot intercept or take over the connection flow
Filename: "{tmp}\openvpn-installer.exe"; \
  Parameters: "/S /SELECT_OPENVPN=1 /SELECT_OPENVPNGUI=0 /SELECT_TAP=1 /SELECT_SERVICE=1 /SELECT_OPENSSL_UTILITIES=0 /SELECT_EASY_RSA=0 /SELECT_PATH=1"; \
  StatusMsg: "Installing OpenVPN (no GUI)..."; \
  Flags: waitprocfinished

; Kill OpenVPN GUI if it was previously installed and is running
Filename: "taskkill"; Parameters: "/F /IM openvpn-gui.exe"; Flags: runhidden waitprocfinished

; Copy .ovpn configs to OpenVPN config directory
Filename: "xcopy"; \
  Parameters: """{app}\configs\*"" ""{commonappdata}\OpenVPN\config\"" /Y /E /I"; \
  Flags: runhidden waitprocfinished

; Launch VoxVPN after install
Filename: "{app}\{#MyAppExeName}"; \
  Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; \
  Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "taskkill"; Parameters: "/F /IM {#MyAppExeName}";  Flags: runhidden waitprocfinished
Filename: "taskkill"; Parameters: "/F /IM openvpn.exe";      Flags: runhidden waitprocfinished
Filename: "taskkill"; Parameters: "/F /IM openvpn-gui.exe";  Flags: runhidden waitprocfinished

[Code]
function OpenVPNInstalled(): Boolean;
begin
  Result := RegKeyExists(HKLM, 'SOFTWARE\OpenVPN') or
            RegKeyExists(HKLM, 'SOFTWARE\WOW6432Node\OpenVPN');
end;

procedure KillRunningApp();
var RC: Integer;
begin
  Exec('taskkill', '/F /IM ' + '{#MyAppExeName}', '', SW_HIDE, ewWaitUntilTerminated, RC);
  Exec('taskkill', '/F /IM openvpn.exe',           '', SW_HIDE, ewWaitUntilTerminated, RC);
end;

function InitializeSetup(): Boolean;
begin
  KillRunningApp();
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep = ssInstall) and OpenVPNInstalled() then
    Log('OpenVPN already installed — skipping OpenVPN installer.');
end;