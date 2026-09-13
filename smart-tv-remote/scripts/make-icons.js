'use strict';
// Genera icon-192.png e icon-512.png sin dependencias (PNG RGBA + zlib).
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x / size, y / size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}
const inRoundRect = (x, y, x0, y0, x1, y1, r) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};
const pixel = (u, v) => {
  const bg = [11, 15, 23, 255], blue = [61, 139, 255, 255], panel = [27, 35, 49, 255], white = [232, 237, 245, 255];
  if (!inRoundRect(u, v, 0, 0, 1, 1, 0.21)) return [0, 0, 0, 0];
  // Pie
  if (inRoundRect(u, v, 0.31, 0.695, 0.69, 0.73, 0.017)) return [47, 59, 82, 255];
  if (inRoundRect(u, v, 0.42, 0.645, 0.58, 0.687, 0.012)) return blue;
  // Marco y pantalla
  if (inRoundRect(u, v, 0.1875, 0.2344, 0.8125, 0.625, 0.043)) {
    const inner = inRoundRect(u, v, 0.215, 0.262, 0.785, 0.598, 0.03);
    if (!inner) return blue;
    const d = Math.hypot(u - 0.5, v - 0.43);
    if (d <= 0.09) {
      const cross = (Math.abs(u - 0.5) < 0.012 && Math.abs(v - 0.43) < 0.06) || (Math.abs(v - 0.43) < 0.012 && Math.abs(u - 0.5) < 0.06);
      return cross ? white : blue;
    }
    return panel;
  }
  return bg;
};
for (const size of [192, 512]) {
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'icons', `icon-${size}.png`), png(size, pixel));
}
console.log('iconos generados');
