@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -Command "Start-Process '%~f0' -Verb RunAs"
  exit /b
)

echo Killing existing OpenVPN...
taskkill /IM openvpn.exe /F >nul 2>&1
taskkill /IM openvpn-gui.exe /F >nul 2>&1
timeout /t 2 >nul

echo Connecting to Amsterdam...
"C:\Program Files\OpenVPN\bin\openvpn.exe" --config "%USERPROFILE%\OpenVPN\config\amsterdam.ovpn" --log "%TEMP%\voxvpn.log"

if %errorlevel% neq 0 (
  echo.
  echo FAILED. Trying alternate config path...
  "C:\Program Files\OpenVPN\bin\openvpn.exe" --config "C:\Program Files\OpenVPN\config\amsterdam.ovpn" --log "%TEMP%\voxvpn.log"
)

echo.
echo OpenVPN exited. Log: %TEMP%\voxvpn.log
pause