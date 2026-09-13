'use strict';
/**
 * Cliente SOAP mínimo para los servicios UPnP del televisor:
 *  - RenderingControl: leer/fijar volumen y silencio (valor exacto, no solo +/-)
 *  - AVTransport: enviar una URL de foto/vídeo/música a la TV (DLNA "push")
 */
const http = require('http');
const { URL } = require('url');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function soapCall(controlURL, serviceType, action, args = {}, timeout = 5000) {
  const body =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
    `<s:Body><u:${action} xmlns:u="${serviceType}">` +
    Object.entries(args).map(([k, v]) => `<${k}>${esc(v)}</${k}>`).join('') +
    `</u:${action}></s:Body></s:Envelope>`;
  const u = new URL(controlURL);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: u.hostname, port: u.port || 80, path: u.pathname + u.search, method: 'POST', timeout,
        headers: {
          'Content-Type': 'text/xml; charset="utf-8"',
          'Content-Length': Buffer.byteLength(body),
          SOAPAction: `"${serviceType}#${action}"`,
          'User-Agent': 'SmartTVRemote/1.0 UPnP/1.0 DLNADOC/1.50',
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode >= 400) {
            const code = /<errorCode>(\d+)<\/errorCode>/.exec(text)?.[1];
            const desc = /<errorDescription>([^<]*)<\/errorDescription>/.exec(text)?.[1];
            return reject(new Error(`UPnP ${action} falló (${res.statusCode}${code ? ' / ' + code : ''}${desc ? ': ' + desc : ''})`));
          }
          const out = {};
          const re = /<([A-Za-z0-9_]+)>([^<]*)<\/\1>/g;
          let m;
          while ((m = re.exec(text))) out[m[1]] = m[2];
          resolve(out);
        });
      },
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end(body);
  });
}

const RC = 'urn:schemas-upnp-org:service:RenderingControl:1';
const AVT = 'urn:schemas-upnp-org:service:AVTransport:1';

function findService(services, type) {
  return services.find((s) => s.type === type || s.type.startsWith(type.replace(/:\d+$/, '')));
}

class TvUpnp {
  constructor(services = []) {
    this.services = services;
  }
  get rc() { return findService(this.services, RC); }
  get avt() { return findService(this.services, AVT); }

  async getVolume() {
    if (!this.rc) throw new Error('RenderingControl no disponible');
    const [v, m] = await Promise.all([
      soapCall(this.rc.controlURL, this.rc.type, 'GetVolume', { InstanceID: 0, Channel: 'Master' }),
      soapCall(this.rc.controlURL, this.rc.type, 'GetMute', { InstanceID: 0, Channel: 'Master' }).catch(() => ({})),
    ]);
    return { volume: Number(v.CurrentVolume), mute: m.CurrentMute === '1' };
  }
  setVolume(volume) {
    if (!this.rc) throw new Error('RenderingControl no disponible');
    const v = Math.max(0, Math.min(100, Math.round(Number(volume))));
    return soapCall(this.rc.controlURL, this.rc.type, 'SetVolume', { InstanceID: 0, Channel: 'Master', DesiredVolume: v });
  }
  setMute(mute) {
    if (!this.rc) throw new Error('RenderingControl no disponible');
    return soapCall(this.rc.controlURL, this.rc.type, 'SetMute', { InstanceID: 0, Channel: 'Master', DesiredMute: mute ? 1 : 0 });
  }

  /** Reproduce una URL en la TV (DLNA push). `mime` p. ej. image/jpeg, video/mp4. */
  async play(url, { mime = 'video/mp4', title = 'Smart TV Remote' } = {}) {
    if (!this.avt) throw new Error('AVTransport no disponible (¿AllShare activado en la TV?)');
    const cls = mime.startsWith('image/') ? 'object.item.imageItem.photo'
      : mime.startsWith('audio/') ? 'object.item.audioItem.musicTrack'
      : 'object.item.videoItem.movie';
    const profile = mime === 'image/jpeg' ? 'DLNA.ORG_PN=JPEG_LRG;' : mime === 'image/png' ? 'DLNA.ORG_PN=PNG_LRG;' : '';
    const flags = mime.startsWith('image/') ? 'DLNA.ORG_OP=01;DLNA.ORG_FLAGS=00f00000000000000000000000000000'
      : 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000';
    const didl =
      '<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/" xmlns:sec="http://www.sec.co.kr/">' +
      `<item id="0" parentID="-1" restricted="1"><dc:title>${esc(title)}</dc:title><upnp:class>${cls}</upnp:class>` +
      `<res protocolInfo="http-get:*:${mime}:${profile}${flags}">${esc(url)}</res></item></DIDL-Lite>`;
    await soapCall(this.avt.controlURL, this.avt.type, 'Stop', { InstanceID: 0 }).catch(() => {});
    await soapCall(this.avt.controlURL, this.avt.type, 'SetAVTransportURI', { InstanceID: 0, CurrentURI: url, CurrentURIMetaData: didl });
    await soapCall(this.avt.controlURL, this.avt.type, 'Play', { InstanceID: 0, Speed: 1 });
  }
  pause() { return soapCall(this.avt.controlURL, this.avt.type, 'Pause', { InstanceID: 0 }); }
  resume() { return soapCall(this.avt.controlURL, this.avt.type, 'Play', { InstanceID: 0, Speed: 1 }); }
  stop() { return soapCall(this.avt.controlURL, this.avt.type, 'Stop', { InstanceID: 0 }); }
  async transportInfo() {
    if (!this.avt) return null;
    const r = await soapCall(this.avt.controlURL, this.avt.type, 'GetTransportInfo', { InstanceID: 0 });
    return { state: r.CurrentTransportState, status: r.CurrentTransportStatus };
  }
}

module.exports = { TvUpnp, soapCall, RC, AVT };
