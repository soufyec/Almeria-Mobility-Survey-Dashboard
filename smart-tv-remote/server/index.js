'use strict';
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const QRCode = require('qrcode');
const { WebSocketServer } = require('ws');

const { SamsungLegacyRemote, STATES } = require('./samsung-legacy');
const { KEYS, ALL_KEYS } = require('./keys');
const { discoverTVs, probeSamsung } = require('./discovery');
const { TvUpnp } = require('./upnp');
const { wake } = require('./wol');
const { pickLocalAddress, lanInterfaces } = require('./network');
const configStore = require('./config');

const PORT = Number(process.env.PORT || 3000);
const ACCESS_PIN = (process.env.ACCESS_PIN || '').trim();
const MEDIA_DIR = path.join(configStore.DATA_DIR, 'media');
fs.mkdirSync(MEDIA_DIR, { recursive: true });

let config = configStore.load();
let remote = null;
let upnp = new TvUpnp(config.services);
let volumeCache = { volume: null, mute: null, at: 0 };
let currentMedia = null;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

// ---------------------------------------------------------------- PIN opcional
function pinOk(req) {
  if (!ACCESS_PIN) return true;
  const cookie = /(?:^|;\s*)tvpin=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  const given = req.headers['x-pin'] || req.query.pin || cookie;
  return given === ACCESS_PIN;
}
app.use((req, res, next) => {
  if (ACCESS_PIN && req.query.pin === ACCESS_PIN) {
    res.setHeader('Set-Cookie', `tvpin=${encodeURIComponent(ACCESS_PIN)}; Path=/; Max-Age=31536000; SameSite=Lax`);
  }
  if (req.path.startsWith('/api/') && req.path !== '/api/auth' && !pinOk(req)) {
    return res.status(401).json({ error: 'PIN requerido', pinRequired: true });
  }
  next();
});
app.post('/api/auth', (req, res) => {
  if (!ACCESS_PIN || req.body?.pin === ACCESS_PIN) {
    if (ACCESS_PIN) res.setHeader('Set-Cookie', `tvpin=${encodeURIComponent(ACCESS_PIN)}; Path=/; Max-Age=31536000; SameSite=Lax`);
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'PIN incorrecto' });
});

// ---------------------------------------------------------------- Estado / WS
function publicConfig() {
  const { services, ...rest } = config;
  return { ...rest, hasUpnp: !!upnp.rc, hasCast: !!upnp.avt, pinRequired: !!ACCESS_PIN };
}
function state() {
  return {
    type: 'state',
    config: publicConfig(),
    remote: remote ? remote.snapshot() : { state: STATES.DISCONNECTED, host: config.tvIp, tvName: null, lastError: null },
    volume: volumeCache,
    media: currentMedia,
    clients: wss.clients.size,
    server: { port: PORT, addresses: lanInterfaces().map((i) => i.address) },
  };
}
function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const c of wss.clients) if (c.readyState === 1) c.send(data);
}
const broadcastState = () => broadcast(state());

function buildRemote() {
  if (remote) remote.disconnect();
  remote = null;
  if (!config.tvIp) return;
  const local = pickLocalAddress(config.tvIp);
  remote = new SamsungLegacyRemote({
    host: config.tvIp,
    port: config.tvPort || 55000,
    name: config.remoteName || 'Mando Web',
    clientIp: local.address,
    clientMac: local.mac,
  });
  remote.on('state', (s, detail) => {
    broadcast({ type: 'remote', state: s, detail: detail || null, tvName: remote.tvName });
    broadcastState();
  });
  remote.on('waiting', () => broadcast({ type: 'waiting', message: 'Acepta el aviso "Permitir" en la pantalla de la TV' }));
  remote.on('sent', (item) => broadcast({ type: 'sent', key: item.key || null, kind: item.kind }));
  remote.on('error', (e) => broadcast({ type: 'error', message: e.message }));
}
buildRemote();

wss.on('connection', (ws, req) => {
  if (!pinOk(req)) { ws.send(JSON.stringify({ type: 'auth', pinRequired: true })); ws.close(); return; }
  ws.send(JSON.stringify(state()));
  broadcast({ type: 'clients', clients: wss.clients.size });
  ws.on('message', async (raw) => {
    let msg; try { msg = JSON.parse(raw); } catch (_) { return; }
    if (msg.type === 'key' && typeof msg.key === 'string') {
      try { await pressKeys([msg.key]); } catch (e) { ws.send(JSON.stringify({ type: 'error', message: e.message })); }
    } else if (msg.type === 'keys' && Array.isArray(msg.keys)) {
      try { await pressKeys(msg.keys); } catch (e) { ws.send(JSON.stringify({ type: 'error', message: e.message })); }
    } else if (msg.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
    }
  });
  ws.on('close', () => broadcast({ type: 'clients', clients: wss.clients.size }));
});

// ---------------------------------------------------------------- Helpers
function requireRemote() {
  if (!remote) { const e = new Error('Configura primero la IP de la TV (Ajustes)'); e.status = 409; throw e; }
  return remote;
}
async function pressKeys(keys) {
  const r = requireRemote();
  for (const k of keys) {
    if (!ALL_KEYS.has(k) && !/^KEY_[A-Z0-9_]+$/.test(k)) throw Object.assign(new Error(`Tecla no válida: ${k}`), { status: 400 });
  }
  const results = [];
  for (const k of keys) results.push(await r.sendKey(k));
  return results;
}
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
  res.status(e.status || 500).json({ error: e.message });
});

// ---------------------------------------------------------------- API
app.get('/api/state', (req, res) => res.json(state()));
app.get('/api/keys', (req, res) => res.json(KEYS));

app.post('/api/connect', wrap(async (req, res) => {
  await requireRemote().connect();
  res.json({ ok: true, remote: remote.snapshot() });
}));
app.post('/api/disconnect', wrap(async (req, res) => {
  if (remote) remote.disconnect();
  res.json({ ok: true });
}));

app.post('/api/key', wrap(async (req, res) => {
  const keys = Array.isArray(req.body.keys) ? req.body.keys : [req.body.key];
  await pressKeys(keys.filter(Boolean));
  res.json({ ok: true });
}));
app.post('/api/text', wrap(async (req, res) => {
  const text = String(req.body.text || '').slice(0, 200);
  if (!text) throw Object.assign(new Error('Texto vacío'), { status: 400 });
  await requireRemote().sendText(text);
  res.json({ ok: true });
}));
app.post('/api/channel', wrap(async (req, res) => {
  const n = String(req.body.number || '').replace(/\D/g, '').slice(0, 4);
  if (!n) throw Object.assign(new Error('Número de canal no válido'), { status: 400 });
  await pressKeys([...n].map((d) => `KEY_${d}`).concat(['KEY_ENTER']));
  res.json({ ok: true });
}));

// Volumen exacto mediante UPnP (RenderingControl); si no está disponible, +/- por teclas.
app.get('/api/volume', wrap(async (req, res) => {
  if (!upnp.rc) return res.json({ available: false });
  const v = await upnp.getVolume();
  volumeCache = { ...v, at: Date.now() };
  broadcast({ type: 'volume', ...volumeCache });
  res.json({ available: true, ...v });
}));
app.post('/api/volume', wrap(async (req, res) => {
  const target = Number(req.body.volume);
  if (!Number.isFinite(target)) throw Object.assign(new Error('Volumen no válido'), { status: 400 });
  if (upnp.rc) {
    await upnp.setVolume(target);
    volumeCache = { volume: Math.round(target), mute: volumeCache.mute, at: Date.now() };
  } else {
    const cur = Number.isFinite(volumeCache.volume) ? volumeCache.volume : null;
    if (cur === null) throw Object.assign(new Error('Volumen exacto no disponible en esta TV; usa Vol +/−'), { status: 409 });
    const diff = Math.round(target) - cur;
    await pressKeys(Array(Math.abs(diff)).fill(diff > 0 ? 'KEY_VOLUP' : 'KEY_VOLDOWN'));
    volumeCache = { volume: Math.round(target), mute: volumeCache.mute, at: Date.now() };
  }
  broadcast({ type: 'volume', ...volumeCache });
  res.json({ ok: true, ...volumeCache });
}));
app.post('/api/mute', wrap(async (req, res) => {
  const mute = !!req.body.mute;
  if (upnp.rc) await upnp.setMute(mute); else await pressKeys(['KEY_MUTE']);
  volumeCache = { ...volumeCache, mute, at: Date.now() };
  broadcast({ type: 'volume', ...volumeCache });
  res.json({ ok: true });
}));

// Descubrimiento y configuración de la TV
app.get('/api/discover', wrap(async (req, res) => {
  const tvs = await discoverTVs({ timeout: Number(req.query.timeout) || 3000 });
  res.json({ tvs });
}));
app.post('/api/tv', wrap(async (req, res) => {
  const ip = String(req.body.ip || '').trim();
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) throw Object.assign(new Error('IP no válida'), { status: 400 });
  config.tvIp = ip;
  config.tvPort = Number(req.body.port) || 55000;
  if (req.body.remoteName) config.remoteName = String(req.body.remoteName).slice(0, 40);
  if (req.body.mac !== undefined) config.tvMac = String(req.body.mac || '').trim();
  // Intentar completar nombre/modelo/servicios UPnP (no bloqueante si falla)
  try {
    const probed = await probeSamsung(ip);
    if (probed) {
      config.tvName = probed.name || config.tvName;
      config.tvModel = probed.model || config.tvModel;
      config.services = probed.services;
    } else {
      config.services = [];
    }
  } catch (_) { /* sin UPnP */ }
  upnp = new TvUpnp(config.services);
  configStore.save(config);
  buildRemote();
  broadcastState();
  res.json({ ok: true, config: publicConfig() });
}));
app.post('/api/wake', wrap(async (req, res) => {
  const mac = req.body.mac || config.tvMac;
  if (!mac) throw Object.assign(new Error('No hay MAC configurada'), { status: 400 });
  await wake(mac);
  res.json({ ok: true, note: 'Paquete WoL enviado (los Samsung de 2013 no siempre lo soportan).' });
}));

// Favoritos / macros (secuencias de teclas)
app.get('/api/favorites', (req, res) => res.json(config.favorites || []));
app.post('/api/favorites', wrap(async (req, res) => {
  const label = String(req.body.label || '').trim().slice(0, 30);
  const keys = (req.body.keys || []).filter((k) => /^KEY_[A-Z0-9_]+$/.test(k)).slice(0, 12);
  if (!label || !keys.length) throw Object.assign(new Error('Etiqueta y teclas requeridas'), { status: 400 });
  config.favorites = (config.favorites || []).concat([{ id: crypto.randomUUID(), label, keys }]).slice(0, 24);
  configStore.save(config);
  broadcastState();
  res.json(config.favorites);
}));
app.delete('/api/favorites/:id', wrap(async (req, res) => {
  config.favorites = (config.favorites || []).filter((f) => f.id !== req.params.id);
  configStore.save(config);
  broadcastState();
  res.json(config.favorites);
}));

// Multimedia: subir foto/vídeo desde el móvil y reproducirlo en la TV (DLNA push)
const upload = multer({
  storage: multer.diskStorage({
    destination: MEDIA_DIR,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname || '').toLowerCase()}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^(image|video|audio)\//.test(file.mimetype)),
});
const MIME_BY_EXT = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.mkv': 'video/x-matroska', '.avi': 'video/x-msvideo', '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.wav': 'audio/wav', '.flac': 'audio/flac' };
function mediaBaseUrl() {
  const local = pickLocalAddress(config.tvIp);
  return `http://${local.address}:${PORT}`;
}
function cleanupMedia(keep = 5) {
  const files = fs.readdirSync(MEDIA_DIR).map((f) => ({ f, t: fs.statSync(path.join(MEDIA_DIR, f)).mtimeMs })).sort((a, b) => b.t - a.t);
  files.slice(keep).forEach(({ f }) => { try { fs.unlinkSync(path.join(MEDIA_DIR, f)); } catch (_) {} });
}
app.post('/api/media', upload.single('file'), wrap(async (req, res) => {
  if (!req.file) throw Object.assign(new Error('Archivo no admitido (solo imagen, vídeo o audio)'), { status: 400 });
  const mime = req.file.mimetype || MIME_BY_EXT[path.extname(req.file.filename)] || 'application/octet-stream';
  const url = `${mediaBaseUrl()}/media/${req.file.filename}`;
  cleanupMedia();
  currentMedia = { url, mime, title: req.file.originalname, kind: mime.split('/')[0], at: Date.now() };
  await upnp.play(url, { mime, title: req.file.originalname });
  broadcastState();
  res.json({ ok: true, media: currentMedia });
}));
app.post('/api/media/url', wrap(async (req, res) => {
  const url = String(req.body.url || '').trim();
  if (!/^https?:\/\//.test(url)) throw Object.assign(new Error('URL no válida'), { status: 400 });
  const mime = String(req.body.mime || MIME_BY_EXT[path.extname(new URL(url).pathname).toLowerCase()] || 'video/mp4');
  currentMedia = { url, mime, title: req.body.title || url, kind: mime.split('/')[0], at: Date.now() };
  await upnp.play(url, { mime, title: currentMedia.title });
  broadcastState();
  res.json({ ok: true, media: currentMedia });
}));
app.post('/api/media/control', wrap(async (req, res) => {
  const a = req.body.action;
  if (a === 'pause') await upnp.pause();
  else if (a === 'play') await upnp.resume();
  else if (a === 'stop') { await upnp.stop(); currentMedia = null; broadcastState(); }
  else throw Object.assign(new Error('Acción no válida'), { status: 400 });
  res.json({ ok: true, transport: await upnp.transportInfo().catch(() => null) });
}));

// Servir los archivos subidos con soporte de rangos y cabeceras DLNA (la TV lo exige)
app.all('/media/:name', (req, res) => {
  const name = path.basename(req.params.name);
  const file = path.join(MEDIA_DIR, name);
  if (!fs.existsSync(file)) return res.status(404).end();
  const size = fs.statSync(file).size;
  const mime = MIME_BY_EXT[path.extname(name).toLowerCase()] || 'application/octet-stream';
  res.setHeader('Content-Type', mime);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('transferMode.dlna.org', mime.startsWith('image/') ? 'Interactive' : 'Streaming');
  res.setHeader('contentFeatures.dlna.org', mime.startsWith('image/')
    ? 'DLNA.ORG_OP=01;DLNA.ORG_FLAGS=00f00000000000000000000000000000'
    : 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000');
  res.setHeader('Connection', 'close');
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  let start = 0, end = size - 1;
  if (range) {
    if (range[1]) start = Number(range[1]);
    if (range[2]) end = Number(range[2]);
    if (!range[1] && range[2]) { start = size - Number(range[2]); end = size - 1; }
    if (start > end || start >= size) { res.setHeader('Content-Range', `bytes */${size}`); return res.status(416).end(); }
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
  }
  res.setHeader('Content-Length', end - start + 1);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file, { start, end }).pipe(res);
});

// QR para invitar a otros móviles
app.get('/api/qr.png', wrap(async (req, res) => {
  const host = req.headers.host || `${pickLocalAddress(config.tvIp).address}:${PORT}`;
  const url = `http://${host}/${ACCESS_PIN ? `?pin=${encodeURIComponent(ACCESS_PIN)}` : ''}`;
  res.setHeader('Content-Type', 'image/png');
  res.send(await QRCode.toBuffer(url, { width: 320, margin: 1 }));
}));
app.get('/api/invite', (req, res) => {
  const local = pickLocalAddress(config.tvIp);
  res.json({ url: `http://${local.address}:${PORT}/`, addresses: lanInterfaces().map((i) => `http://${i.address}:${PORT}/`) });
});

// ---------------------------------------------------------------- Estáticos
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: 0 }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

// Refresco periódico del volumen por UPnP para que todos los móviles vean lo mismo
setInterval(async () => {
  if (!upnp.rc || wss.clients.size === 0) return;
  try {
    const v = await upnp.getVolume();
    if (v.volume !== volumeCache.volume || v.mute !== volumeCache.mute) {
      volumeCache = { ...v, at: Date.now() };
      broadcast({ type: 'volume', ...volumeCache });
    }
  } catch (_) { /* TV apagada */ }
}, 5000);

server.listen(PORT, '0.0.0.0', () => {
  const addrs = lanInterfaces().map((i) => `http://${i.address}:${PORT}/`);
  console.log('Smart TV Remote listo.');
  console.log('Abre en el móvil:', addrs.join('  ') || `http://localhost:${PORT}/`);
  console.log('TV configurada:', config.tvIp || '(ninguna, usa Ajustes → Buscar TV)');
  if (ACCESS_PIN) console.log('Acceso protegido con PIN.');
});

process.on('SIGINT', () => { if (remote) remote.disconnect(); process.exit(0); });
process.on('SIGTERM', () => { if (remote) remote.disconnect(); process.exit(0); });
