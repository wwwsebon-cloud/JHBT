@echo off
rem Copy firestore.rules to the clipboard and open the Firebase rules page. (rules-copy.bat test = copy only)
powershell -NoProfile -Command "$ErrorActionPreference='Stop'; $t = Get-Content -Raw -Encoding UTF8 -LiteralPath '%~dp0..\firestore.rules'; Set-Clipboard -Value $t; if ((Get-Clipboard -Raw) -ne $t) { exit 1 }; Write-Host ('COPIED: ' + ($t -split [char]10).Count + ' lines')"
if errorlevel 1 (
  echo FAILED: could not copy firestore.rules
  if /i not "%~1"=="test" pause
  exit /b 1
)
if /i "%~1"=="test" exit /b 0
start "" "https://console.firebase.google.com/project/jihoobattle/firestore/rules"
echo.
echo 1. In the editor: Ctrl+A, then Ctrl+V
echo 2. Click Publish
echo.
pause
