'use strict';
const dgram = require('dgram');

/** Envía un paquete mágico Wake-on-LAN. (Los Samsung de 2013 rara vez lo soportan.) */
function wake(mac, { address = '255.255.255.255', port = 9 } = {}) {
  return new Promise((resolve, reject) => {
    const clean = String(mac).replace(/[^0-9a-f]/gi, '');
    if (clean.length !== 12) return reject(new Error('MAC no válida'));
    const macBuf = Buffer.from(clean, 'hex');
    const magic = Buffer.concat([Buffer.alloc(6, 0xff), ...Array(16).fill(macBuf)]);
    const sock = dgram.createSocket('udp4');
    sock.once('error', (e) => { sock.close(); reject(e); });
    sock.bind(() => {
      sock.setBroadcast(true);
      sock.send(magic, 0, magic.length, port, address, (err) => {
        sock.close();
        err ? reject(err) : resolve();
      });
    });
  });
}

module.exports = { wake };
