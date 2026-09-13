@echo off
REM Windows: doble clic para arrancar el mando.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Falta Node.js. Descargalo de https://nodejs.org ^(version LTS^), instalalo y vuelve a abrir este archivo.
  start https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules call npm install --omit=dev --no-audit --no-fund
echo ===========================================
echo   Mando TV en marcha. En el iPhone abre la
echo   direccion que aparece abajo, o entra en
echo   Ajustes - Invitar para ver el codigo QR.
echo   Deja esta ventana abierta.
echo ===========================================
start "" http://localhost:3000/
node server\index.js
pause
