'use strict';
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'config.json');

const DEFAULTS = {
  tvIp: process.env.TV_IP || '',
  tvPort: Number(process.env.TV_PORT || 55000),
  tvMac: process.env.TV_MAC || '',
  tvName: '',
  tvModel: '',
  remoteName: process.env.REMOTE_NAME || 'Mando Web',
  services: [],
  favorites: [], // { label, keys: ['KEY_1','KEY_2'] }
};

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return { ...DEFAULTS, ...raw };
  } catch (_) {
    return { ...DEFAULTS };
  }
}

function save(cfg) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2));
  return cfg;
}

module.exports = { load, save, DATA_DIR, DEFAULTS };
