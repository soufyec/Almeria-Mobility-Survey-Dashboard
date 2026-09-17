# Mando web para Samsung Smart TV 2013 (serie F · UE40F6340)

Web app (PWA) para controlar el televisor desde cualquier móvil de la casa, sin instalar nada
en los teléfonos: quien venga solo tiene que conectarse a tu Wi‑Fi y escanear un código QR.

Funciona con los Samsung de 2013 (serie F) y, en general, con los modelos 2008‑2013 que usan el
protocolo de mando por red en el **puerto TCP 55000** (series C, D, E y F). El navegador no puede
abrir sockets TCP, así que hace falta un pequeño **servidor puente** en la red local (un PC,
un Raspberry Pi, un NAS o un contenedor Docker). Ese servidor sirve la web y habla con la TV.

```
   móvil A ─┐                                    ┌─ TCP 55000  (teclas del mando)
   móvil B ─┼─ Wi‑Fi ─▶  servidor Node.js  ─────┼─ HTTP 7676  (UPnP: volumen exacto)
   móvil C ─┘           (esta app, :3000)        └─ DLNA       (fotos/vídeos del móvil a la TV)
```

## Qué incluye

- **Mando completo**: cruceta (botones o *touchpad* con gestos), OK, Atrás, Salir, Menú, Smart Hub,
  Fuente, Guía, Info, Tools, colores A/B/C/D, reproducción, canal ±, volumen ±, silencio, apagar.
  Pulsación larga = repetición (volumen, canales, flechas).
- **Volumen exacto** con deslizador (vía UPnP RenderingControl) y estado sincronizado entre móviles.
- **Canales**: teclado numérico, lista, favoritos, teletexto, subtítulos y cambio de **fuente**
  (TV, HDMI 1‑4, AV, componentes).
- **Accesos rápidos** (macros): p. ej. "La 1" = `1 OK`, "Consola" = `HDMI1`.
- **Multimedia**: envía una foto, vídeo o canción **desde el móvil a la TV** (DLNA *push*), o una URL.
- **Ajustes**: búsqueda automática de la TV (SSDP), emparejamiento, Wake‑on‑LAN, texto experimental.
- **Invitar**: código QR y enlace para compartir; PIN opcional de acceso.
- **PWA**: instalable en la pantalla de inicio (Android/iOS), modo oscuro, funciona en cualquier navegador.
- **Multiusuario**: todos los móviles comparten una única conexión con la TV (la TV solo admite una).

## Instalación rápida (portátil + iPhone)

Requisitos: [Node.js](https://nodejs.org) (versión LTS) instalado en un portátil que esté **en la misma Wi‑Fi** que la TV.

**Sin terminal:** descarga esta carpeta y haz doble clic en `Iniciar-Mando-TV.command` (Mac; la primera vez
clic derecho → Abrir) o `Iniciar-Mando-TV.bat` (Windows). Instala lo necesario, arranca el servidor y abre
la app en el navegador del portátil. En el iPhone abre la dirección que muestra la ventana o escanea el QR de
**Ajustes → Invitar**. En Safari, usa **Compartir → Añadir a pantalla de inicio** para tenerla como app.

Mientras la ventana esté abierta y el portátil despierto, todos los iPhone de la casa pueden usar el mando.
Si el portátil se suspende, el mando deja de responder hasta que lo despiertes (ajusta la suspensión con la
tapa abierta si quieres dejarlo en marcha).

**Con terminal:**

```bash
cd smart-tv-remote
npm install
npm start
```

Verás algo como `Abre en el móvil: http://192.168.1.20:3000/`. Abre esa dirección en el móvil.

### Con Docker (Raspberry Pi, NAS, etc.)

```bash
cd smart-tv-remote
docker compose up -d --build
```

`network_mode: host` es necesario para que funcione la búsqueda por multicast y para que la TV
pueda descargar los vídeos/fotos que envías desde el móvil.

### Como servicio (arranque automático en Linux)

Copia la carpeta a `/opt/smart-tv-remote`, ejecuta `npm install --omit=dev` y usa
`smart-tv-remote.service` (ajusta `User=` y la ruta de `node`):

```bash
sudo cp smart-tv-remote.service /etc/systemd/system/
sudo systemctl enable --now smart-tv-remote
```

## Primer uso

1. Enciende la TV y comprueba que está en la misma Wi‑Fi/red que el servidor.
2. En el móvil, abre la app → **Ajustes** → **Buscar TV** → **Usar**.
   Si no aparece, escribe la IP de la TV a mano (en la TV: *Menú → Red → Estado de red*).
3. Pulsa **Conectar / Emparejar**. En la pantalla de la TV aparecerá un aviso
   **"Mando Web … ¿Permitir?"**: acéptalo con el mando físico. Solo se pide una vez.
4. Ya puedes usar el mando. Para invitar a alguien: **Ajustes → Invitar** (QR o enlace).

En la TV, si no aparece el aviso o no responde, revisa:
*Menú → Red → AllShare Settings* (que no esté bloqueado el dispositivo) y
*Menú → Sistema → Administrador de dispositivos*. Borra allí dispositivos denegados si te equivocaste.

## Sin router: usando el hotspot del móvil

Funciona igual: el portátil y la TV se conectan al hotspot del iPhone, y los invitados también. Como el
hotspot suele asignar IPs distintas cada vez, la app **vuelve a buscar la TV automáticamente** si deja de
responder y actualiza la IP sola. En **Ajustes → Invitar** puedes guardar el nombre y la contraseña del
hotspot para que aparezca un QR de red: el invitado lo escanea con la cámara, se conecta, y con el segundo
QR abre el mando. La contraseña se guarda solo en `data/config.json` del portátil.

## Configuración (variables de entorno)

Copia `.env.example` a `.env` o pásalas al arrancar (`PORT=8080 npm start`):

| Variable      | Por defecto  | Descripción                                                         |
|---------------|--------------|---------------------------------------------------------------------|
| `PORT`        | `3000`       | Puerto HTTP de la web app                                           |
| `TV_IP`       |              | IP de la TV (también se puede fijar desde Ajustes)                  |
| `TV_PORT`     | `55000`      | Puerto del protocolo de mando                                       |
| `TV_MAC`      |              | MAC de la TV, solo para Wake‑on‑LAN                                 |
| `REMOTE_NAME` | `Mando Web`  | Nombre que muestra la TV en el aviso de permiso                     |
| `ACCESS_PIN`  |              | Si se define, la app pide este PIN (el QR ya lo incluye)            |
| `DATA_DIR`    | `./data`     | Carpeta de configuración y archivos multimedia temporales           |

## API (por si quieres integrarla con domótica)

| Método | Ruta                      | Cuerpo / descripción                                       |
|--------|---------------------------|------------------------------------------------------------|
| GET    | `/api/state`              | Estado completo (TV, conexión, volumen, clientes)          |
| GET    | `/api/keys`               | Catálogo de teclas por categoría                           |
| POST   | `/api/key`                | `{ "key": "KEY_VOLUP" }` o `{ "keys": ["KEY_1","KEY_ENTER"] }` |
| POST   | `/api/channel`            | `{ "number": "12" }`                                       |
| POST   | `/api/text`               | `{ "text": "hola" }` (experimental)                        |
| GET    | `/api/volume`             | Volumen y silencio actuales (UPnP)                         |
| POST   | `/api/volume`             | `{ "volume": 25 }`                                         |
| POST   | `/api/mute`               | `{ "mute": true }`                                         |
| POST   | `/api/connect` `/api/disconnect` | Conectar/emparejar o cerrar la conexión              |
| GET    | `/api/discover`           | Busca televisores Samsung en la red                        |
| POST   | `/api/tv`                 | `{ "ip": "192.168.1.50", "port": 55000, "remoteName": "…", "mac": "…" }` |
| POST   | `/api/wake`               | Envía Wake‑on‑LAN (`{ "mac": "…" }` opcional)              |
| GET/POST/DELETE | `/api/favorites[/:id]` | Accesos rápidos                                     |
| POST   | `/api/media`              | multipart `file` → se reproduce en la TV (DLNA)            |
| POST   | `/api/media/url`          | `{ "url": "http://…/video.mp4" }`                          |
| POST   | `/api/media/control`      | `{ "action": "play" | "pause" | "stop" }`                  |
| GET    | `/api/qr.png` `/api/invite` | QR y enlace para invitar                                 |
| WS     | `/ws`                     | Estado en tiempo real; acepta `{ "type": "key", "key": "…" }` |

Ejemplo con Home Assistant / curl:

```bash
curl -X POST http://192.168.1.20:3000/api/key -H 'Content-Type: application/json' -d '{"key":"KEY_MUTE"}'
```

## Probar sin la TV (emulador)

```bash
npm run fake-tv          # en una terminal: emula la TV en 55000 y UPnP en 7676
npm start                # en otra: configura la IP 127.0.0.1 en Ajustes
npm test                 # tests del protocolo
```

## Limitaciones conocidas

- **Encender la TV**: los Samsung de 2013 no se encienden por red; el botón WoL se incluye por si
  tu unidad lo soporta, pero lo normal es que no. Apagar sí funciona.
- **Solo funciona en la red local**. No expongas el puerto a Internet; si lo haces, usa al menos `ACCESS_PIN`
  y preferiblemente una VPN.
- **Texto**: el envío de texto por el protocolo legacy es experimental y no todos los modelos lo aceptan.
- **DLNA**: la TV debe tener AllShare habilitado; los formatos de vídeo admitidos son los de la propia TV
  (MP4/H.264 funciona bien; formatos raros pueden no reproducirse).
- El protocolo permite **una sola conexión** a la vez con la TV: si otra app (p. ej. Smart View) está
  conectada, desconéctala.

## Estructura

```
smart-tv-remote/
├─ server/
│  ├─ index.js          servidor HTTP + WebSocket + API
│  ├─ samsung-legacy.js protocolo de mando (puerto 55000)
│  ├─ discovery.js      búsqueda SSDP / descripción UPnP
│  ├─ upnp.js           RenderingControl (volumen) y AVTransport (DLNA)
│  ├─ keys.js           catálogo de teclas
│  ├─ wol.js            Wake-on-LAN
│  ├─ network.js        detección de IP local
│  └─ config.js         persistencia en data/config.json
├─ public/              web app (PWA): index.html, app.js, styles.css, sw.js, manifest, iconos
├─ scripts/fake-tv.js   emulador de TV para desarrollo
├─ test/                tests del protocolo
├─ Dockerfile, docker-compose.yml, smart-tv-remote.service
└─ .env.example
```
