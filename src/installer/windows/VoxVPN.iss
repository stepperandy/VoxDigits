; VoxVPN Shield Agent — Windows Installer v3.0.0
; Installs the Electron desktop app and OpenVPN Community Edition.
; Requires Inno Setup 6.

#define MyAppName      "VoxVPN Shield Agent"
#define MyAppShortName "VoxVPN Shield"
#define MyAppVersion   "3.0.0"
#define MyAppPublisher "VoxDigits Communications LLC"
#define MyAppURL       "https://voxvpn.net"
#define MyAppExeName   "VoxVPN Shield Agent.exe"
#define MyAppGUID      "{{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}"

[Setup]
AppId={#MyAppGUID}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/contact
AppUpdatesURL={#MyAppURL}/download
DefaultDirName={autopf}\VoxVPN Shield
DefaultGroupName=VoxVPN Shield
AllowNoIcons=yes
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=output
OutputBaseFilename=VoxVPN-Shield-Setup-{#MyAppVersion}
SetupIconFile=assets\icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
MinVersion=10.0.17763
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}
SetupMutex=VoxVPNShieldSetupMutex

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional Icons:"; Flags: checkedonce
Name: "startupicon"; Description: "Start {#MyAppShortName} automatically at login"; GroupDescription: "Additional Icons:"; Flags: checkedonce

[Files]
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "assets\OpenVPN-2.7.7-I001-amd64.msi"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "assets\configs\*.ovpn"; DestDir: "{app}\configs"; Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{group}\{#MyAppShortName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppShortName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppShortName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppShortName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon

[Run]
Filename: "{sys}\msiexec.exe"; Parameters: "/i \"{tmp}\OpenVPN-2.7.7-I001-amd64.msi\" /qn /norestart"; StatusMsg: "Installing OpenVPN and network drivers..."; Flags: waituntilterminated
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppShortName}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "taskkill"; Parameters: "/F /IM \"{#MyAppExeName}\""; Flags: runhidden waituntilterminated
Filename: "taskkill"; Parameters: "/F /IM openvpn.exe"; Flags: runhidden waituntilterminated

[Code]
procedure KillExisting();
var RC: Integer;
begin
  Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM "{#MyAppExeName}"', '', SW_HIDE, ewWaitUntilTerminated, RC);
  Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM openvpn.exe', '', SW_HIDE, ewWaitUntilTerminated, RC);
end;

function InitializeSetup(): Boolean;
begin
  KillExisting();
  Result := True;
end;
