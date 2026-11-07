@echo off
setlocal
pushd "%~dp0.."
if errorlevel 1 exit /b 1
node scripts\build.mjs
if errorlevel 1 (popd & exit /b 1)
if /I "%~1"=="--preview" node scripts\serve.mjs --dist
popd
endlocal
