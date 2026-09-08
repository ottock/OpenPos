@echo off
setlocal
echo +++ EXECUTING launchBackend.bat +++
start "Backend" cmd /k "launchBackend.bat"
start "Frontend" cmd /k "launchFrontend.bat"
echo +++ TERMINALS OPENED +++
endlocal