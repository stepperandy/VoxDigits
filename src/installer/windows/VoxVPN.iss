; VoxVPN Windows Installer Script
; Requires Inno Setup 6+ from https://jrsoftware.org/isinfo.php

#define MyAppName "VoxVPN"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "VoxVPN"
#define MyAppURL "https://voxvpn.net"
#define MyAppExeName "VoxVPN.exe"

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
; Require admin so WireGuard can install properly
PrivilegesRequired=admin
OutputDir=output
OutputBaseFilename=VoxVPN-Setup-{#MyAppVersion}
SetupIconFile=assets\icon.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
; Minimum Windows 10
MinVersion=10.0.17763
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startupicon"; Description: "Launch VoxVPN on Windows startup"; GroupDescription: "Startup Options:"

[Files]
; Main Electron app
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; WireGuard installer (bundled)
Source: "assets\wireguard-installer.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

; Visual C++ Redistributable (if needed)
; Source: "assets\vc_redist.x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon

[Run]
; Install WireGuard silently first
Filename: "{tmp}\wireguard-installer.exe"; Parameters: "/S"; StatusMsg: "Installing WireGuard..."; Flags: waitprocfinished

; Launch VoxVPN after install
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
; Stop any running VoxVPN processes before uninstall
Filename: "taskkill"; Parameters: "/F /IM {#MyAppExeName}"; Flags: runhidden waitprocfinished

[Code]
// Check if WireGuard is already installed
function WireGuardInstalled(): Boolean;
var
  ResultCode: Integer;
begin
  Result := RegKeyExists(HKLM, 'SOFTWARE\WireGuard');
end;

// Check if app is already running
procedure KillRunningApp();
var
  ResultCode: Integer;
begin
  Exec('taskkill', '/F /IM ' + '{#MyAppExeName}', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function InitializeSetup(): Boolean;
begin
  KillRunningApp();
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then begin
    if WireGuardInstalled() then begin
      Log('WireGuard already installed, skipping...');
    end;
  end;
end;