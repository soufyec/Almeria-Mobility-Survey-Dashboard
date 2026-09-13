'use strict';
/**
 * Descubrimiento de la TV por SSDP (UPnP) y lectura de su descripción XML.
 * Los Samsung de 2013 anuncian, entre otros:
 *   urn:samsung.com:device:RemoteControlReceiver:1   (puerto 7676, /smp_N_)
 *   urn:schemas-upnp-org:device:MediaRenderer:1      (DLNA DMR)
 */
const dgram = require('dgram');
const http = require('http');
const { URL } = require('url');

const SSDP_ADDR = '239.255.255.250';
const SSDP_PORT = 1900;
const SEARCH_TARGETS = [
  'urn:samsung.com:device:RemoteControlReceiver:1',
  'urn:schemas-upnp-org:device:MediaRenderer:1',
  'ssdp:all',
];

function httpGet(url, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout, headers: { 'User-Agent': 'SmartTVRemote/1.0 UPnP/1.0' } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([^<]*)</${name}>`, 'i'));
  return m ? m[1].trim() : null;
}

function parseServices(xml, base) {
  const services = [];
  const re = /<service>([\s\S]*?)<\/service>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const s = m[1];
    const type = tag(s, 'serviceType');
    const controlURL = tag(s, 'controlURL');
    if (type && controlURL) services.push({ type, controlURL: new URL(controlURL, base).toString() });
  }
  return services;
}

/** Lee y resume una descripción de dispositivo UPnP. */
async function describe(location) {
  const { body } = await httpGet(location);
  const base = tag(body, 'URLBase') || location;
  return {
    location,
    deviceType: tag(body, 'deviceType'),
    friendlyName: tag(body, 'friendlyName'),
    manufacturer: tag(body, 'manufacturer'),
    modelName: tag(body, 'modelName'),
    modelNumber: tag(body, 'modelNumber'),
    udn: tag(body, 'UDN'),
    services: parseServices(body, base),
  };
}

/** Envía M-SEARCH y devuelve las localizaciones únicas encontradas. */
function ssdpSearch({ timeout = 3000 } = {}) {
  return new Promise((resolve) => {
    const found = new Map();
    const sock = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    sock.on('error', () => {});
    sock.on('message', (msg, rinfo) => {
      const text = msg.toString('utf8');
      const loc = /^location:\s*(.+)$/im.exec(text);
      const st = /^st:\s*(.+)$/im.exec(text);
      const server = /^server:\s*(.+)$/im.exec(text);
      if (loc) {
        const location = loc[1].trim();
        const entry = found.get(location) || { location, ip: rinfo.address, st: new Set(), server: server?.[1]?.trim() };
        if (st) entry.st.add(st[1].trim());
        found.set(location, entry);
      }
    });
    sock.bind(0, () => {
      try { sock.setMulticastTTL(2); } catch (_) {}
      for (const st of SEARCH_TARGETS) {
        const msg = Buffer.from(
          'M-SEARCH * HTTP/1.1\r\n' +
          `HOST: ${SSDP_ADDR}:${SSDP_PORT}\r\n` +
          'MAN: "ssdp:discover"\r\n' +
          'MX: 2\r\n' +
          `ST: ${st}\r\n\r\n`,
        );
        sock.send(msg, 0, msg.length, SSDP_PORT, SSDP_ADDR);
      }
    });
    setTimeout(() => {
      try { sock.close(); } catch (_) {}
      resolve([...found.values()].map((e) => ({ ...e, st: [...e.st] })));
    }, timeout);
  });
}

/** Busca televisores Samsung en la red y agrupa sus servicios por IP. */
async function discoverTVs({ timeout = 3000 } = {}) {
  const results = await ssdpSearch({ timeout });
  const byIp = new Map();
  for (const r of results) {
    const isSamsung = /samsung/i.test(r.server || '') || r.st.some((s) => /samsung/i.test(s)) || /:7676\//.test(r.location);
    let desc = null;
    try { desc = await describe(r.location); } catch (_) { continue; }
    const samsungDesc = /samsung/i.test(desc.manufacturer || '') || /samsung/i.test(desc.friendlyName || '');
    if (!isSamsung && !samsungDesc) continue;
    const entry = byIp.get(r.ip) || { ip: r.ip, name: null, model: null, devices: [], services: [] };
    entry.name = entry.name || desc.friendlyName;
    entry.model = entry.model || desc.modelName || desc.modelNumber;
    entry.devices.push({ location: r.location, deviceType: desc.deviceType, friendlyName: desc.friendlyName, modelName: desc.modelName });
    for (const s of desc.services) if (!entry.services.some((x) => x.controlURL === s.controlURL)) entry.services.push(s);
    byIp.set(r.ip, entry);
  }
  return [...byIp.values()];
}

/**
 * Si SSDP no funciona (redes con multicast bloqueado), sondea directamente
 * las descripciones típicas de los Samsung de 2013 en el puerto 7676.
 */
async function probeSamsung(ip) {
  const entry = { ip, name: null, model: null, devices: [], services: [] };
  const attempts = [];
  for (let n = 1; n <= 20; n++) attempts.push(`http://${ip}:7676/smp_${n}_`);
  attempts.push(`http://${ip}:7676/rcr/`, `http://${ip}:7676/dmr/`);
  await Promise.all(attempts.map(async (loc) => {
    try {
      const desc = await describe(loc);
      if (!desc.deviceType) return;
      entry.name = entry.name || desc.friendlyName;
      entry.model = entry.model || desc.modelName || desc.modelNumber;
      entry.devices.push({ location: loc, deviceType: desc.deviceType, friendlyName: desc.friendlyName, modelName: desc.modelName });
      for (const s of desc.services) if (!entry.services.some((x) => x.controlURL === s.controlURL)) entry.services.push(s);
    } catch (_) { /* ignorar */ }
  }));
  return entry.devices.length ? entry : null;
}

module.exports = { discoverTVs, probeSamsung, describe, ssdpSearch, httpGet };
