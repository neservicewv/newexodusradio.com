@echo off
REM New Exodus Radio - local preview server
REM Double-click this file, then open http://localhost:8080 in your browser.
REM Close this window to stop the server.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
