@echo off
setlocal
echo +++ EXECUTING launchBackend.bat +++
pushd "%~dp0\..\backend"
.venv\Scripts\python.exe src\main.py
popd
pause
echo +++ EXECUTED launchBackend.bat +++
endlocal