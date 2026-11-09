[Setup]
; Basic Information
AppName=Time Vault Secure Fingerprint
AppVersion=1.0
AppPublisher=Time Vault Secure
AppPublisherURL=https://timevaultsecure.com
AppSupportURL=https://timevaultsecure.com/support
AppUpdatesURL=https://timevaultsecure.com/download

; Install Location
DefaultDirName={autopf}\Time Vault Secure Fingerprint
DefaultGroupName=Time Vault Secure
DisableProgramGroupPage=yes
; Request Admin privileges to write to Registry
PrivilegesRequired=admin

; Output
OutputBaseFilename=TimeVaultSecureSetup
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; IMPORTANT: You must run 'build_executable.bat' first to generate these files!
; We are packaging the executable created by PyInstaller
Source: "dist\TimeVaultSecureFingerprint\TimeVaultSecureFingerprint.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\TimeVaultSecureFingerprint\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Copy the Database and DLLs (PyInstaller usually handles this if configured, but safe to verify)

[Icons]
Name: "{group}\Time Vault Secure Fingerprint"; Filename: "{app}\TimeVaultSecureFingerprint.exe"
Name: "{autodesktop}\Time Vault Secure Fingerprint"; Filename: "{app}\TimeVaultSecureFingerprint.exe"; Tasks: desktopicon

[Registry]
; Register the custom protocol handler (The Magic Part) [fingerprint://]
Root: HKCR; Subkey: "fingerprint"; ValueType: string; ValueName: ""; ValueData: "URL:Fingerprint Protocol"; Flags: uninsdeletekey
Root: HKCR; Subkey: "fingerprint"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""; Flags: uninsdeletekey
Root: HKCR; Subkey: "fingerprint\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\TimeVaultSecureFingerprint.exe,0"
Root: HKCR; Subkey: "fingerprint\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\TimeVaultSecureFingerprint.exe"" ""%1"""

[Run]
Filename: "{app}\TimeVaultSecureFingerprint.exe"; Description: "{cm:LaunchProgram,Time Vault Secure Fingerprint}"; Flags: nowait postinstall skipifsilent
