'use strict';
/**
 * Emulador de un Samsung 2013 en el puerto 55000 (y UPnP básico en 7676)
 * para probar la app sin la TV real:   npm run fake-tv
 * Variables: FAKE_PORT (55000), FAKE_AUTO_ACCEPT=1 (acepta sin "esperar"), FAKE_DENY=1
 */
const net = require('net');
const http = require('http');

const PORT = Number(process.env.FAKE_PORT || 55000);
const UPNP_PORT = Number(process.env.FAKE_UPNP_PORT || 7676);
const TV_NAME = 'iapp.samsung';
let volume = 17, mute = false;

function str(b) { const buf = Buffer.isBuffer(b) ? b : Buffer.from(b); return Buffer.concat([Buffer.from([buf.length & 0xff, buf.length >> 8]), buf]); }
function reply(sock, payload) { sock.write(Buffer.concat([Buffer.from([0x00]), str(TV_NAME), str(payload)])); }

net.createServer((sock) => {
  let rx = Buffer.alloc(0);
  let authed = false;
  sock.on('data', (chunk) => {
    rx = Buffer.concat([rx, chunk]);
    for (;;) {
      if (rx.length < 3) return;
      const appLen = rx.readUInt16LE(1);
      if (rx.length < 3 + appLen + 2) return;
      const payLen = rx.readUInt16LE(3 + appLen);
      const total = 3 + appLen + 2 + payLen;
      if (rx.length < total) return;
      const payload = rx.subarray(3 + appLen + 2, total);
      rx = rx.subarray(total);
      if (payload[0] === 0x64) {
        const ipLen = payload.readUInt16LE(2);
        const macLen = payload.readUInt16LE(4 + ipLen);
        const nameLen = payload.readUInt16LE(6 + ipLen + macLen);
        const name = Buffer.from(payload.subarray(8 + ipLen + macLen, 8 + ipLen + macLen + nameLen).toString(), 'base64').toString();
        console.log(`[fake-tv] solicitud de "${name}" desde ${sock.remoteAddress}`);
        if (process.env.FAKE_DENY) { reply(sock, Buffer.from([0x64, 0x00, 0x00, 0x00])); continue; }
        if (process.env.FAKE_AUTO_ACCEPT) { authed = true; reply(sock, Buffer.from([0x64, 0x00, 0x01, 0x00])); continue; }
        reply(sock, Buffer.from([0x0a, 0x00, 0x02, 0x00, 0x00, 0x00]));
        setTimeout(() => { authed = true; reply(sock, Buffer.from([0x64, 0x00, 0x01, 0x00])); console.log('[fake-tv] usuario acepta'); }, 800);
      } else if (payload[0] === 0x00 && authed) {
        const kl = payload.readUInt16LE(3);
        const key = Buffer.from(payload.subarray(5, 5 + kl).toString(), 'base64').toString();
        if (key === 'KEY_VOLUP') volume = Math.min(100, volume + 1);
        if (key === 'KEY_VOLDOWN') volume = Math.max(0, volume - 1);
        if (key === 'KEY_MUTE') mute = !mute;
        console.log(`[fake-tv] tecla ${key} (vol ${volume}${mute ? ' mute' : ''})`);
        reply(sock, Buffer.from([0x00, 0x00, 0x00, 0x00]));
      } else if (payload[0] === 0x01) {
        const tl = payload.readUInt16LE(2);
        console.log(`[fake-tv] texto: ${Buffer.from(payload.subarray(4, 4 + tl).toString(), 'base64').toString()}`);
        reply(sock, Buffer.from([0x00, 0x00, 0x00, 0x00]));
      }
    }
  });
  sock.on('error', () => {});
}).listen(PORT, () => console.log(`[fake-tv] mando legacy en puerto ${PORT}`));

// UPnP mínimo: descripción + RenderingControl + AVTransport
const desc = (port) => `<?xml version="1.0"?><root xmlns="urn:schemas-upnp-org:device-1-0"><device>
<deviceType>urn:schemas-upnp-org:device:MediaRenderer:1</deviceType><friendlyName>[TV] Samsung Fake</friendlyName>
<manufacturer>Samsung Electronics</manufacturer><modelName>UE40F6340</modelName><UDN>uuid:fake</UDN>
<serviceList><service><serviceType>urn:schemas-upnp-org:service:RenderingControl:1</serviceType><controlURL>http://127.0.0.1:${port}/rc</controlURL></service>
<service><serviceType>urn:schemas-upnp-org:service:AVTransport:1</serviceType><controlURL>http://127.0.0.1:${port}/avt</controlURL></service></serviceList>
</device></root>`;
http.createServer((req, res) => {
  if (req.method === 'GET' && /^\/smp_2_/.test(req.url)) { res.setHeader('Content-Type', 'text/xml'); return res.end(desc(UPNP_PORT)); }
  if (req.method === 'POST') {
    let body = ''; req.on('data', (c) => (body += c)); req.on('end', () => {
      const action = /SOAPAction.*#(\w+)/i.exec(req.headers.soapaction ? `SOAPAction:${req.headers.soapaction}` : '')?.[1] || /<u:(\w+)/.exec(body)?.[1];
      const arg = (n) => new RegExp(`<${n}>([^<]*)</${n}>`).exec(body)?.[1];
      let inner = '';
      if (action === 'GetVolume') inner = `<CurrentVolume>${volume}</CurrentVolume>`;
      if (action === 'GetMute') inner = `<CurrentMute>${mute ? 1 : 0}</CurrentMute>`;
      if (action === 'SetVolume') volume = Number(arg('DesiredVolume'));
      if (action === 'SetMute') mute = arg('DesiredMute') === '1';
      if (action === 'SetAVTransportURI') console.log('[fake-tv] DLNA URI:', arg('CurrentURI'));
      if (action === 'GetTransportInfo') inner = '<CurrentTransportState>PLAYING</CurrentTransportState><CurrentTransportStatus>OK</CurrentTransportStatus>';
      console.log(`[fake-tv] UPnP ${action}`);
      res.setHeader('Content-Type', 'text/xml');
      res.end(`<?xml version="1.0"?><s:Envelope><s:Body><u:${action}Response>${inner}</u:${action}Response></s:Body></s:Envelope>`);
    });
    return;
  }
  res.statusCode = 404; res.end();
}).listen(UPNP_PORT, () => console.log(`[fake-tv] UPnP en puerto ${UPNP_PORT}`));
