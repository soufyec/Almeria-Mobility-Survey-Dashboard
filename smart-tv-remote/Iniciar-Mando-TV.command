#!/bin/bash
# macOS: doble clic para arrancar el mando. La primera vez: clic derecho → Abrir.
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Falta Node.js. Descárgalo de https://nodejs.org (versión LTS), instálalo y vuelve a abrir este archivo."
  open "https://nodejs.org"
  read -r -p "Pulsa Intro para cerrar"
  exit 1
fi
[ -d node_modules ] || npm install --omit=dev --no-audit --no-fund
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
echo "==========================================="
echo "  Mando TV en marcha. En el iPhone abre:"
echo "  http://${IP:-<IP-del-portátil>}:3000/"
echo "  (o Ajustes → Invitar para ver el QR)"
echo "  Deja esta ventana abierta. Ctrl+C para parar."
echo "==========================================="
sleep 2 && open "http://localhost:3000/" &
node server/index.js
