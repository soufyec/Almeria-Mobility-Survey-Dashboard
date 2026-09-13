'use strict';
/**
 * Cliente del protocolo "legacy" de mando a distancia Samsung (2008-2013).
 *
 * Los televisores de la serie F de 2013 (p. ej. UE40F6340) escuchan en el
 * puerto TCP 55000. El protocolo es binario y muy sencillo:
 *
 *   paquete  = 0x00 | len16LE(app) | app | len16LE(payload) | payload
 *
 *   payload de autenticación:
 *     0x64 0x00 | str(base64(ipCliente)) | str(base64(macCliente)) | str(base64(nombre))
 *   payload de tecla:
 *     0x00 0x00 0x00 | str(base64("KEY_XXX"))
 *   payload de texto (experimental, no todos los modelos):
 *     0x01 0x00 | str(base64(texto))
 *
 *   donde str(x) = len16LE(x) | x
 *
 * Respuestas de la TV (tras cabecera + nombre de la TV):
 *   64 00 01 00        acceso concedido
 *   64 00 00 00        acceso denegado por el usuario
 *   0a 00 02 00 00 00  esperando a que el usuario acepte en pantalla
 *   65 00              tiempo agotado / cancelado
 *   00 00 00 00        tecla aceptada
 */

const net = require('net');
const EventEmitter = require('events');

const APP_STRING = 'iphone.iapp.samsung';

function len16(n) {
  return Buffer.from([n & 0xff, (n >> 8) & 0xff]);
}
function str(value, raw = false) {
  let buf = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  if (!raw) buf = Buffer.from(buf.toString('base64'), 'ascii');
  return Buffer.concat([len16(buf.length), buf]);
}
function packet(payload) {
  return Buffer.concat([Buffer.from([0x00]), str(APP_STRING, true), str(payload, true)]);
}

const STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  AUTHORIZING: 'authorizing',
  CONNECTED: 'connected',
  DENIED: 'denied',
  UNREACHABLE: 'unreachable',
};

class SamsungLegacyRemote extends EventEmitter {
  /**
   * @param {object} opts
   * @param {string} opts.host       IP de la TV
   * @param {number} [opts.port]     55000 por defecto
   * @param {string} [opts.name]     Nombre que muestra la TV en el aviso "¿Permitir?"
   * @param {string} [opts.clientIp] IP del equipo que ejecuta el puente
   * @param {string} [opts.clientMac] MAC (o identificador) del cliente
   * @param {number} [opts.keyInterval] ms entre teclas (100 por defecto)
   * @param {number} [opts.idleTimeout] ms de inactividad antes de cerrar (0 = nunca)
   */
  constructor(opts) {
    super();
    this.host = opts.host;
    this.port = opts.port || 55000;
    this.name = opts.name || 'Mando Web';
    this.clientIp = opts.clientIp || '0.0.0.0';
    this.clientMac = opts.clientMac || '00:00:00:00:00:00';
    this.keyInterval = opts.keyInterval ?? 100;
    this.idleTimeout = opts.idleTimeout ?? 0;
    this.connectTimeout = opts.connectTimeout ?? 4000;
    this.authTimeout = opts.authTimeout ?? 60000;

    this.state = STATES.DISCONNECTED;
    this.tvName = null;
    this.lastError = null;
    this.socket = null;
    this.rx = Buffer.alloc(0);
    this.queue = [];
    this.busy = false;
    this.pendingAuth = null;
    this.pendingAck = null;
    this.idleTimer = null;
  }

  _setState(state, extra) {
    if (this.state !== state) {
      this.state = state;
      this.emit('state', state, extra);
    }
  }

  /** Abre la conexión y realiza la autenticación. Idempotente. */
  connect() {
    if (this.state === STATES.CONNECTED) return Promise.resolve();
    if (this.pendingAuth) return this.pendingAuth.promise;

    const pending = {};
    pending.promise = new Promise((resolve, reject) => {
      pending.resolve = resolve;
      pending.reject = reject;
    });
    this.pendingAuth = pending;

    this._teardown(false);
    this._setState(STATES.CONNECTING);

    const socket = new net.Socket();
    this.socket = socket;
    this.rx = Buffer.alloc(0);
    socket.setNoDelay(true);
    socket.setTimeout(this.connectTimeout);

    socket.once('timeout', () => {
      if (this.state === STATES.CONNECTING) {
        socket.destroy(new Error('Tiempo de conexión agotado'));
      }
    });
    socket.on('data', (chunk) => this._onData(chunk));
    socket.on('error', (err) => this._onError(err));
    socket.on('close', () => this._onClose());

    socket.connect(this.port, this.host, () => {
      socket.setTimeout(0);
      this._setState(STATES.AUTHORIZING);
      const payload = Buffer.concat([
        Buffer.from([0x64, 0x00]),
        str(this.clientIp),
        str(this.clientMac),
        str(this.name),
      ]);
      socket.write(packet(payload));
      pending.timer = setTimeout(() => {
        this._failAuth(new Error('La TV no respondió a la autorización'));
      }, this.authTimeout);
    });

    return pending.promise;
  }

  _failAuth(err, state = STATES.DISCONNECTED) {
    const pending = this.pendingAuth;
    this.pendingAuth = null;
    if (pending) {
      clearTimeout(pending.timer);
      pending.reject(err);
    }
    this.lastError = err.message;
    this._setState(state, err.message);
    this._teardown(false);
  }

  _teardown(emitState = true) {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.on('error', () => {});
      this.socket.destroy();
      this.socket = null;
    }
    clearTimeout(this.idleTimer);
    if (this.pendingAck) {
      const ack = this.pendingAck;
      this.pendingAck = null;
      clearTimeout(ack.timer);
      ack.reject(new Error('Conexión cerrada'));
    }
    if (emitState) this._setState(STATES.DISCONNECTED);
  }

  /** Cierra la conexión con la TV. */
  disconnect() {
    if (this.pendingAuth) this._failAuth(new Error('Desconectado'));
    this._teardown(true);
    this.busy = false;
    const q = this.queue.splice(0);
    q.forEach((item) => item.reject(new Error('Desconectado')));
  }

  _onError(err) {
    this.lastError = err.message;
    if (this.pendingAuth) {
      const unreachable = /ECONNREFUSED|EHOSTUNREACH|ETIMEDOUT|ENETUNREACH|agotado/i.test(err.message);
      this._failAuth(err, unreachable ? STATES.UNREACHABLE : STATES.DISCONNECTED);
    } else {
      this.emit('error', err);
      this._teardown(true);
    }
  }

  _onClose() {
    if (this.pendingAuth) {
      this._failAuth(new Error('La TV cerró la conexión durante la autorización'));
    } else if (this.socket) {
      this._teardown(true);
    }
  }

  _onData(chunk) {
    this.rx = Buffer.concat([this.rx, chunk]);
    // Estructura: 1 byte | len16 | nombreTV | len16 | respuesta
    for (;;) {
      if (this.rx.length < 3) return;
      const nameLen = this.rx.readUInt16LE(1);
      if (this.rx.length < 3 + nameLen + 2) return;
      const respLen = this.rx.readUInt16LE(3 + nameLen);
      const total = 3 + nameLen + 2 + respLen;
      if (this.rx.length < total) return;
      const tvName = this.rx.subarray(3, 3 + nameLen).toString('utf8');
      const resp = this.rx.subarray(3 + nameLen + 2, total);
      this.rx = this.rx.subarray(total);
      this._handleResponse(tvName, resp);
    }
  }

  _handleResponse(tvName, resp) {
    if (tvName) this.tvName = tvName;
    const hex = resp.toString('hex');
    this.emit('raw', hex);

    if (resp.length === 0) {
      this._teardown(true);
      return;
    }

    if (this.pendingAuth) {
      if (hex === '64000100') {
        const pending = this.pendingAuth;
        this.pendingAuth = null;
        clearTimeout(pending.timer);
        this.lastError = null;
        this._setState(STATES.CONNECTED);
        this._armIdle();
        pending.resolve();
      } else if (hex === '64000000') {
        this._failAuth(new Error('Acceso denegado en la TV'), STATES.DENIED);
      } else if (resp[0] === 0x0a) {
        this.emit('waiting');
      } else if (resp[0] === 0x65) {
        this._failAuth(new Error('Autorización cancelada o tiempo agotado en la TV'), STATES.DENIED);
      } else {
        this._failAuth(new Error(`Respuesta desconocida en autenticación: ${hex}`));
      }
      return;
    }

    if (this.pendingAck) {
      const ack = this.pendingAck;
      this.pendingAck = null;
      clearTimeout(ack.timer);
      ack.resolve(hex);
    }
  }

  _armIdle() {
    clearTimeout(this.idleTimer);
    if (this.idleTimeout > 0) {
      this.idleTimer = setTimeout(() => this.disconnect(), this.idleTimeout);
    }
  }

  /** Envía una tecla (p. ej. "KEY_VOLUP"). Se encola y serializa. */
  sendKey(key) {
    if (!/^KEY_[A-Z0-9_]+$/.test(key)) {
      return Promise.reject(new Error(`Tecla no válida: ${key}`));
    }
    const payload = Buffer.concat([Buffer.from([0x00, 0x00, 0x00]), str(key)]);
    return this._enqueue({ kind: 'key', key, payload });
  }

  /** Envía texto (experimental; no todos los modelos lo aceptan). */
  sendText(text) {
    const payload = Buffer.concat([Buffer.from([0x01, 0x00]), str(String(text))]);
    return this._enqueue({ kind: 'text', payload });
  }

  _enqueue(item) {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...item, resolve, reject });
      this._drain();
    });
  }

  async _drain() {
    if (this.busy) return;
    this.busy = true;
    try {
      while (this.queue.length) {
        const item = this.queue.shift();
        try {
          await this.connect();
          const hex = await this._write(item.payload);
          this._armIdle();
          this.emit('sent', item);
          item.resolve(hex);
        } catch (err) {
          item.reject(err);
          if (this.state !== STATES.CONNECTED) {
            // Si la TV no está accesible, vaciamos la cola para no bloquear.
            const rest = this.queue.splice(0);
            rest.forEach((r) => r.reject(err));
          }
        }
        if (this.keyInterval > 0) await new Promise((r) => setTimeout(r, this.keyInterval));
      }
    } finally {
      this.busy = false;
    }
  }

  _write(payload) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.state !== STATES.CONNECTED) {
        return reject(new Error('No conectado a la TV'));
      }
      this.pendingAck = { resolve, reject };
      // Algunos modelos no confirman cada tecla; no bloqueamos más de 1,5 s.
      this.pendingAck.timer = setTimeout(() => {
        if (this.pendingAck) {
          const ack = this.pendingAck;
          this.pendingAck = null;
          ack.resolve(null);
        }
      }, 1500);
      this.socket.write(packet(payload), (err) => {
        if (err) {
          clearTimeout(this.pendingAck?.timer);
          this.pendingAck = null;
          reject(err);
        }
      });
    });
  }

  snapshot() {
    return {
      host: this.host,
      port: this.port,
      state: this.state,
      tvName: this.tvName,
      lastError: this.lastError,
      queued: this.queue.length,
    };
  }
}

module.exports = { SamsungLegacyRemote, STATES, packet, str, len16, APP_STRING };
