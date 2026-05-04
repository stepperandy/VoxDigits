@echo off
:: VoxVPN - Connect to Amsterdam
:: Run as Administrator (auto-elevates)

net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit /b
)

echo Disconnecting existing VPN...
taskkill /IM openvpn.exe /F >nul 2>&1
timeout /t 3 >nul

echo Connecting to Amsterdam...
"C:\Program Files\OpenVPN\bin\openvpn.exe" --config "C:\Program Files\OpenVPN\config\amsterdam.ovpn" --log "%TEMP%\voxvpn.log"