@echo off
:: Generates one connect-<server>.bat for every .ovpn file in the configs folder
:: Run this once — it creates all your per-server launcher BATs

set CONFIG_DIR=..\..\assets\configs
set OUT_DIR=.

if not exist "%CONFIG_DIR%" (
  echo [ERROR] configs folder not found at %CONFIG_DIR%
  pause & exit /b 1
)

echo Generating launcher BAT files...
echo.

for %%F in ("%CONFIG_DIR%\*.ovpn") do (
  set "NAME=%%~nF"
  echo Creating connect-%%~nF.bat

  (
    echo @echo off
    echo :: VoxVPN - Connect to %%~nF
    echo net session ^>nul 2^>^&1
    echo if %%errorlevel%% neq 0 ^(
    echo   powershell -Command "Start-Process '%%~f0' -Verb RunAs"
    echo   exit /b
    echo ^)
    echo echo Disconnecting existing VPN...
    echo taskkill /IM openvpn.exe /F ^>nul 2^>^&1
    echo timeout /t 3 ^>nul
    echo echo Connecting to %%~nF...
    echo "C:\Program Files\OpenVPN\bin\openvpn.exe" --config "C:\Program Files\OpenVPN\config\%%~nF.ovpn" --log "%%TEMP%%\voxvpn.log"
  ) > "%OUT_DIR%\connect-%%~nF.bat"
)

echo.
echo Done! One .bat file created per server.
pause