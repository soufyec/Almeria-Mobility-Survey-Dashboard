'use strict';
const os = require('os');

function ipToInt(ip) {
  return ip.split('.').reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
}

/** Devuelve las interfaces IPv4 no internas con su máscara y MAC. */
function lanInterfaces() {
  const out = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) {
        out.push({ name, address: a.address, netmask: a.netmask, mac: a.mac });
      }
    }
  }
  return out;
}

/** IP local más adecuada para hablar con `targetIp` (misma subred si es posible). */
function pickLocalAddress(targetIp) {
  const ifaces = lanInterfaces();
  if (!ifaces.length) return { address: '127.0.0.1', mac: '00:00:00:00:00:00' };
  if (targetIp && /^\d+\.\d+\.\d+\.\d+$/.test(targetIp)) {
    const t = ipToInt(targetIp);
    for (const i of ifaces) {
      const mask = ipToInt(i.netmask);
      if ((ipToInt(i.address) & mask) === (t & mask)) return i;
    }
  }
  // Preferimos rangos privados típicos de casa.
  const priv = ifaces.find((i) => /^(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))/.test(i.address));
  return priv || ifaces[0];
}

module.exports = { lanInterfaces, pickLocalAddress, ipToInt };
