; VoxShield Business Security — Windows Installer v1.0
; Installs the VoxShield desktop security agent with system tray, DNS filtering,
; auto-start, and background protection for business/agency environments.
; Requires Inno Setup 6 — https://jrsoftware.org/isinfo.php

#define AppName        "VoxShield Business Security"
#define AppShortName   "VoxShield"
#define AppVersion     "1.0.0"
#define AppPublisher   "VoxDigits Communications LLC"
#define AppURL         "https://voxvpn.net"
#define AppExeName     "VoxShield.exe"
#define AppGUID        "{{B2C3D4E5-F6A7-8901-BCDE-F23456789012}"

[Setup]
AppId={#AppGUID}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}/contact
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\VoxShield
DefaultGroupName=VoxShield
AllowNoIcons=yes
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=output
OutputBaseFilename=VoxShield-Setup-{#AppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
MinVersion=10.0.17763
UninstallDisplayIcon={app}\{#AppExeName}
UninstallDisplayName={#AppName}
DisableDirPage=no
DisableProgramGroupPage=auto
SetupMutex=VoxShieldSetupMutex

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional Icons:"; Flags: unchecked
Name: "startupicon"; Description: "Start {#AppShortName} automatically at login"; GroupDescription: "Additional Icons:"; Flags: checkedonce

[Files]
; Electron app output (electron-builder --dir)
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#AppShortName}";                       Filename: "{app}\{#AppExeName}"
Name: "{group}\{cm:UninstallProgram,{#AppShortName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#AppShortName}";               Filename: "{app}\{#AppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#AppShortName}";                 Filename: "{app}\{#AppExeName}"; Tasks: startupicon

[Run]
; Kill running instances before install
Filename: "taskkill"; Parameters: "/F /IM ""{#AppExeName}"""; Flags: runhidden waitprocfinished

; Launch after install
Filename: "{app}\{#AppExeName}"; Description: "Launch {#AppShortName}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "taskkill"; Parameters: "/F /IM ""{#AppExeName}"""; Flags: runhidden waitprocfinished

[Code]
procedure KillExisting();
var RC: Integer;
begin
  Exec(ExpandConstant('{sys}\taskkill.exe'), '/F /IM ' + '{#AppExeName}', '', SW_HIDE, ewWaitUntilTerminated, RC);
end;

function InitializeSetup(): Boolean;
begin
  KillExisting();
  Result := True;
end;