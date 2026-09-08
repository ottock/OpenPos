@echo off
setlocal
echo +++ EXECUTING launchFrontend.bat +++
pushd "%~dp0\..\frontend"
npm run dev
popd
echo +++ EXECUTED launchFrontend.bat +++
endlocal