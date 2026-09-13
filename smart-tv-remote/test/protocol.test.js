'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { packet, str, len16 } = require('../server/samsung-legacy');

test('len16 es little-endian', () => {
  assert.deepStrictEqual([...len16(0x0102)], [0x02, 0x01]);
});

test('str codifica en base64 con prefijo de longitud', () => {
  const b = str('KEY_VOLUP');
  const b64 = Buffer.from('KEY_VOLUP').toString('base64');
  assert.strictEqual(b.readUInt16LE(0), b64.length);
  assert.strictEqual(b.subarray(2).toString(), b64);
});

test('packet de tecla tiene la estructura esperada', () => {
  const payload = Buffer.concat([Buffer.from([0, 0, 0]), str('KEY_ENTER')]);
  const p = packet(payload);
  assert.strictEqual(p[0], 0x00);
  const appLen = p.readUInt16LE(1);
  assert.strictEqual(p.subarray(3, 3 + appLen).toString(), 'iphone.iapp.samsung');
  const payLen = p.readUInt16LE(3 + appLen);
  assert.strictEqual(payLen, payload.length);
  assert.deepStrictEqual(p.subarray(5 + appLen), payload);
});
