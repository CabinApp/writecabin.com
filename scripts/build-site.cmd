@echo off
setlocal
pushd "%~dp0.."
if errorlevel 1 exit /b 1

set "SITE_RUNTIME_ROOT=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies"
if not defined PYTHON_BINARY (
    if exist "%SITE_RUNTIME_ROOT%\python\python.exe" (
        set "PYTHON_BINARY=%SITE_RUNTIME_ROOT%\python\python.exe"
    ) else (
        set "PYTHON_BINARY=python"
    )
)
if not defined NODE_BINARY (
    if exist "%SITE_RUNTIME_ROOT%\node\bin\node.exe" (
        set "NODE_BINARY=%SITE_RUNTIME_ROOT%\node\bin\node.exe"
    ) else (
        set "NODE_BINARY=node"
    )
)

"%PYTHON_BINARY%" scripts\build_routes.py --node "%NODE_BINARY%"
if errorlevel 1 (
    popd
    exit /b 1
)
if /I "%~1"=="--preview" (
    echo Preview: http://127.0.0.1:8766/blog ^(press Ctrl+C to stop^)
    "%PYTHON_BINARY%" scripts\serve.py --port 8766
)
popd
endlocal
