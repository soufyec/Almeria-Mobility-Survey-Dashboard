/* Mando web para Samsung Smart TV 2013 — lógica de cliente */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const STATE_LABEL = {
    disconnected: 'Desconectado',
    connecting: 'Conectando…',
    authorizing: 'Esperando permiso en la TV…',
    connected: 'Conectado',
    denied: 'Acceso denegado en la TV',
    unreachable: 'TV apagada o no accesible',
  };

  let state = null;
  let ws = null;
  let wsReady = false;
  let keysCatalog = null;
  let chBuffer = '';
  let chTimer = null;

  // ------------------------------------------------------------ utilidades
  const toast = (msg, kind = '') => {
    const t = $('#toast');
    t.textContent = msg;
    t.className = `toast ${kind}`;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (t.hidden = true), 2600);
  };
  const vibrate = (ms = 12) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) {} };

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
      body: opts.body && typeof opts.body !== 'string' && !(opts.body instanceof FormData) ? JSON.stringify(opts.body) : opts.body,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && data.pinRequired) { $('#pinOverlay').hidden = false; throw new Error('PIN requerido'); }
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  }

  function sendKey(key) {
    vibrate();
    if (wsReady) {
      ws.send(JSON.stringify({ type: 'key', key }));
    } else {
      api('/api/key', { method: 'POST', body: { key } }).catch((e) => toast(e.message, 'error'));
    }
  }
  function sendKeys(keys) {
    vibrate(20);
    if (wsReady) ws.send(JSON.stringify({ type: 'keys', keys }));
    else api('/api/key', { method: 'POST', body: { keys } }).catch((e) => toast(e.message, 'error'));
  }

  // ------------------------------------------------------------ WebSocket
  function connectWs() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}/ws`);
    ws.onopen = () => { wsReady = true; };
    ws.onclose = () => { wsReady = false; setTimeout(connectWs, 1500); };
    ws.onerror = () => ws.close();
    ws.onmessage = (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch (_) { return; }
      switch (msg.type) {
        case 'state': state = msg; render(); break;
        case 'remote':
          if (state) { state.remote.state = msg.state; state.remote.lastError = msg.detail; state.remote.tvName = msg.tvName; }
          renderStatus();
          if (msg.state === 'connected') banner(null);
          if (msg.state === 'denied') banner(msg.detail || STATE_LABEL.denied, 'error');
          if (msg.state === 'unreachable') banner('La TV no responde. ¿Está encendida y en la misma red?', 'error');
          break;
        case 'waiting': banner(msg.message, 'warn'); break;
        case 'volume': if (state) { state.volume = msg; renderVolume(); } break;
        case 'clients': $('#clients').textContent = `👥 ${msg.clients}`; break;
        case 'error': toast(msg.message, 'error'); break;
        case 'info': toast(msg.message); break;
        case 'auth': $('#pinOverlay').hidden = false; break;
        case 'sent': flash(msg.key); break;
      }
    };
  }
  function flash(key) {
    if (!key) return;
    $$(`[data-key="${key}"]`).forEach((b) => { b.classList.add('pressed'); setTimeout(() => b.classList.remove('pressed'), 120); });
  }
  function banner(text, kind = 'warn') {
    const b = $('#banner');
    if (!text) { b.hidden = true; return; }
    b.textContent = text;
    b.className = `banner ${kind === 'warn' ? '' : kind}`;
    b.hidden = false;
  }

  // ------------------------------------------------------------ render
  function render() {
    if (!state) return;
    renderStatus();
    renderVolume();
    renderSettings();
    renderFavorites();
    renderMedia();
  }
  function renderStatus() {
    const r = state.remote || {};
    const c = state.config || {};
    $('#statusDot').className = `dot ${r.state || 'disconnected'}`;
    $('#tvTitle').textContent = c.tvName || c.tvModel || (c.tvIp ? `Samsung ${c.tvIp}` : 'Samsung TV');
    $('#tvSub').textContent = c.tvIp ? `${STATE_LABEL[r.state] || r.state} · ${c.tvIp}` : 'Sin configurar → Ajustes';
    $('#clients').textContent = `👥 ${state.clients || 1}`;
    $('#connInfo').innerHTML = c.tvIp
      ? `<b>${STATE_LABEL[r.state] || r.state}</b><br>IP ${c.tvIp}:${c.tvPort}${c.tvModel ? ' · ' + c.tvModel : ''}${r.tvName ? ' · ' + r.tvName : ''}` +
        `<br>Volumen exacto (UPnP): ${c.hasUpnp ? 'sí' : 'no'} · Envío multimedia (DLNA): ${c.hasCast ? 'sí' : 'no'}` +
        (r.lastError ? `<br><span style="color:#ff9a9d">${r.lastError}</span>` : '')
      : 'Configura la IP de la TV o pulsa “Buscar TV”.';
  }
  function renderVolume() {
    const v = state.volume || {};
    const slider = $('#volSlider');
    const has = state.config?.hasUpnp;
    slider.disabled = !has;
    if (Number.isFinite(v.volume)) { slider.value = v.volume; $('#volValue').textContent = v.mute ? '🔇' : v.volume; }
    else $('#volValue').textContent = has ? '…' : '±';
    $('#btnMute').classList.toggle('active-mute', !!v.mute);
  }
  function renderSettings() {
    const c = state.config || {};
    if (document.activeElement?.closest('#tab-settings')) return; // no pisar lo que escribe el usuario
    $('#cfgIp').value = c.tvIp || '';
    $('#cfgPort').value = c.tvPort || 55000;
    $('#cfgName').value = c.remoteName || '';
    $('#cfgMac').value = c.tvMac || '';
    $('#castHint').textContent = c.hasCast
      ? 'Elige una foto, vídeo o canción de tu móvil y se verá en la TV.'
      : 'La TV no ha anunciado DLNA (AllShare). Guarda de nuevo la IP en Ajustes con la TV encendida.';
  }
  function renderFavorites() {
    const list = $('#favorites');
    const favs = state.config?.favorites || [];
    list.innerHTML = favs.length ? '' : '<p class="hint">Aún no hay accesos rápidos.</p>';
    favs.forEach((f) => {
      const b = document.createElement('button');
      b.className = 'fav';
      b.textContent = f.label;
      b.title = f.keys.join(' ');
      b.onclick = () => sendKeys(f.keys);
      const d = document.createElement('button');
      d.className = 'del'; d.textContent = '✕'; d.title = 'Eliminar';
      d.onclick = (e) => { e.stopPropagation(); api(`/api/favorites/${f.id}`, { method: 'DELETE' }).catch((err) => toast(err.message, 'error')); };
      b.appendChild(d);
      list.appendChild(b);
    });
  }
  function renderMedia() {
    const m = state.media;
    $('#nowPlaying').textContent = m ? `${m.kind === 'image' ? '🖼' : m.kind === 'audio' ? '🎵' : '🎬'} ${m.title}` : 'Nada en reproducción';
  }
  function renderKeyGrid(container, items) {
    container.innerHTML = '';
    items.forEach((k) => {
      const b = document.createElement('button');
      b.className = 'key';
      b.dataset.key = k.key;
      b.textContent = k.label;
      container.appendChild(b);
    });
  }

  // ------------------------------------------------------------ teclas (delegación)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-key]');
    if (b) { sendKey(b.dataset.key); return; }
    const m = e.target.closest('[data-media]');
    if (m) {
      vibrate();
      api('/api/media/control', { method: 'POST', body: { action: m.dataset.media } })
        .then(() => toast('Hecho', 'ok')).catch((err) => toast(err.message, 'error'));
    }
  });

  // Pulsación larga = repetición (útil para volumen / canales / flechas)
  let repeatTimer = null;
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-key]');
    if (!b) return;
    const key = b.dataset.key;
    if (!/KEY_(VOLUP|VOLDOWN|CHUP|CHDOWN|UP|DOWN|LEFT|RIGHT)/.test(key)) return;
    clearTimeout(repeatTimer);
    repeatTimer = setTimeout(function rep() { sendKey(key); repeatTimer = setTimeout(rep, 220); }, 450);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => document.addEventListener(ev, () => clearTimeout(repeatTimer)));

  // ------------------------------------------------------------ pestañas
  $$('.tab-btn').forEach((b) => b.addEventListener('click', () => {
    $$('.tab-btn').forEach((x) => x.classList.toggle('active', x === b));
    $$('.tab').forEach((t) => t.classList.toggle('active', t.id === `tab-${b.dataset.tab}`));
    try { localStorage.setItem('tab', b.dataset.tab); } catch (_) {}
    if (b.dataset.tab === 'settings') refreshInvite();
  }));
  try { const t = localStorage.getItem('tab'); if (t) $(`.tab-btn[data-tab="${t}"]`)?.click(); } catch (_) {}

  // ------------------------------------------------------------ D-pad vs touchpad
  const setMode = (touch) => {
    $('#dpad').hidden = touch;
    $('#touchpad').hidden = !touch;
    $('#modeButtons').classList.toggle('active', !touch);
    $('#modeTouch').classList.toggle('active', touch);
    try { localStorage.setItem('touch', touch ? '1' : '0'); } catch (_) {}
  };
  $('#modeButtons').onclick = () => setMode(false);
  $('#modeTouch').onclick = () => setMode(true);
  try { if (localStorage.getItem('touch') === '1') setMode(true); } catch (_) {}

  (() => {
    const pad = $('#touchpad');
    let start = null, moved = false, lastStep = null;
    const STEP = 45; // px por movimiento
    pad.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      start = { x: e.clientX, y: e.clientY }; moved = false; lastStep = { x: 0, y: 0 };
      pad.classList.add('swiping'); pad.setPointerCapture(e.pointerId);
    });
    pad.addEventListener('pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      const sx = Math.trunc(dx / STEP), sy = Math.trunc(dy / STEP);
      if (sx !== lastStep.x) { sendKey(sx > lastStep.x ? 'KEY_RIGHT' : 'KEY_LEFT'); lastStep.x = sx; moved = true; }
      if (sy !== lastStep.y) { sendKey(sy > lastStep.y ? 'KEY_DOWN' : 'KEY_UP'); lastStep.y = sy; moved = true; }
    });
    const end = () => {
      if (!start) return;
      if (!moved) sendKey('KEY_ENTER');
      start = null; pad.classList.remove('swiping');
    };
    pad.addEventListener('pointerup', end);
    pad.addEventListener('pointercancel', end);
  })();

  // ------------------------------------------------------------ volumen exacto
  (() => {
    const slider = $('#volSlider');
    let t = null;
    slider.addEventListener('input', () => { $('#volValue').textContent = slider.value; });
    slider.addEventListener('change', () => {
      clearTimeout(t);
      t = setTimeout(() => api('/api/volume', { method: 'POST', body: { volume: Number(slider.value) } }).catch((e) => toast(e.message, 'error')), 80);
    });
  })();

  // ------------------------------------------------------------ canales
  const renderCh = () => { $('#chDisplay').textContent = chBuffer || '–'; };
  const goChannel = () => {
    if (!chBuffer) return;
    const n = chBuffer; chBuffer = ''; renderCh();
    api('/api/channel', { method: 'POST', body: { number: n } }).catch((e) => toast(e.message, 'error'));
  };
  $$('[data-digit]').forEach((b) => b.addEventListener('click', () => {
    vibrate();
    if (chBuffer.length >= 4) return;
    chBuffer += b.dataset.digit; renderCh();
    clearTimeout(chTimer); chTimer = setTimeout(goChannel, 2500);
  }));
  $('#chClear').onclick = () => { chBuffer = ''; renderCh(); clearTimeout(chTimer); };
  $('#chGo').onclick = () => { clearTimeout(chTimer); goChannel(); };

  const ALIASES = { OK: 'KEY_ENTER', ENTER: 'KEY_ENTER', ATRAS: 'KEY_RETURN', ATRÁS: 'KEY_RETURN', VOLVER: 'KEY_RETURN', SALIR: 'KEY_EXIT', MENU: 'KEY_MENU', MENÚ: 'KEY_MENU', FUENTE: 'KEY_SOURCE', TV: 'KEY_TV', HDMI: 'KEY_HDMI', HDMI1: 'KEY_HDMI1', HDMI2: 'KEY_HDMI2', HDMI3: 'KEY_HDMI3', HDMI4: 'KEY_HDMI4', ARRIBA: 'KEY_UP', ABAJO: 'KEY_DOWN', IZQ: 'KEY_LEFT', DER: 'KEY_RIGHT', MUTE: 'KEY_MUTE', SMARTHUB: 'KEY_CONTENTS', HUB: 'KEY_CONTENTS', GUIA: 'KEY_GUIDE', GUÍA: 'KEY_GUIDE', INFO: 'KEY_INFO', PLAY: 'KEY_PLAY', PAUSA: 'KEY_PAUSE', STOP: 'KEY_STOP' };
  $('#favForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const label = $('#favLabel').value.trim();
    const keys = $('#favKeys').value.trim().split(/[\s,]+/).filter(Boolean).flatMap((tok) => {
      const up = tok.toUpperCase();
      if (/^KEY_/.test(up)) return [up];
      if (ALIASES[up]) return [ALIASES[up]];
      if (/^\d+$/.test(up)) return [...up].map((d) => `KEY_${d}`);
      return [];
    });
    if (!keys.length) return toast('No se reconocen las teclas', 'error');
    api('/api/favorites', { method: 'POST', body: { label, keys } })
      .then(() => { $('#favLabel').value = ''; $('#favKeys').value = ''; toast('Acceso rápido guardado', 'ok'); })
      .catch((err) => toast(err.message, 'error'));
  });

  // ------------------------------------------------------------ multimedia
  $('#mediaFile').addEventListener('change', () => {
    const file = $('#mediaFile').files[0];
    if (!file) return;
    const form = new FormData(); form.append('file', file);
    const prog = $('#uploadProgress'); prog.hidden = false; prog.firstElementChild.style.width = '0%';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/media');
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) prog.firstElementChild.style.width = `${Math.round((e.loaded / e.total) * 100)}%`; };
    xhr.onload = () => {
      prog.hidden = true; $('#mediaFile').value = '';
      let data = {}; try { data = JSON.parse(xhr.responseText); } catch (_) {}
      if (xhr.status >= 200 && xhr.status < 300) toast('Enviado a la TV', 'ok');
      else toast(data.error || 'Error al enviar', 'error');
    };
    xhr.onerror = () => { prog.hidden = true; toast('Error de red al subir', 'error'); };
    xhr.send(form);
  });
  $('#urlForm').addEventListener('submit', (e) => {
    e.preventDefault();
    api('/api/media/url', { method: 'POST', body: { url: $('#mediaUrl').value.trim() } })
      .then(() => toast('Reproduciendo en la TV', 'ok')).catch((err) => toast(err.message, 'error'));
  });

  // ------------------------------------------------------------ ajustes
  $('#btnSaveTv').onclick = () => {
    api('/api/tv', { method: 'POST', body: { ip: $('#cfgIp').value.trim(), port: Number($('#cfgPort').value) || 55000, remoteName: $('#cfgName').value.trim(), mac: $('#cfgMac').value.trim() } })
      .then(() => { toast('TV guardada. Pulsa Conectar para emparejar.', 'ok'); $('#discovered').innerHTML = ''; })
      .catch((err) => toast(err.message, 'error'));
  };
  $('#btnDiscover').onclick = async () => {
    const box = $('#discovered');
    box.innerHTML = '<p class="hint">Buscando televisores Samsung en la red (3 s)…</p>';
    try {
      const { tvs } = await api('/api/discover');
      box.innerHTML = tvs.length ? '' : '<p class="hint">No se encontró ninguna TV. Comprueba que esté encendida y en la misma Wi‑Fi, o escribe la IP a mano.</p>';
      tvs.forEach((tv) => {
        const d = document.createElement('div');
        d.className = 'disc';
        d.innerHTML = `<div><b>${tv.name || 'Samsung TV'}</b><span>${tv.model || ''} · ${tv.ip}</span></div>`;
        const b = document.createElement('button'); b.className = 'key primary'; b.textContent = 'Usar';
        b.onclick = () => { $('#cfgIp').value = tv.ip; $('#btnSaveTv').click(); };
        d.appendChild(b); box.appendChild(d);
      });
    } catch (err) { box.innerHTML = ''; toast(err.message, 'error'); }
  };
  $('#btnConnect').onclick = () => {
    banner('Conectando… si la TV pregunta, acepta “Permitir”.', 'info');
    api('/api/connect', { method: 'POST' }).then(() => { banner(null); toast('Conectado a la TV', 'ok'); }).catch((err) => banner(err.message, 'error'));
  };
  $('#btnDisconnect').onclick = () => api('/api/disconnect', { method: 'POST' }).then(() => toast('Desconectado')).catch((err) => toast(err.message, 'error'));
  $('#btnWake').onclick = () => api('/api/wake', { method: 'POST', body: { mac: $('#cfgMac').value.trim() } }).then((r) => toast(r.note, 'ok')).catch((err) => toast(err.message, 'error'));
  $('#textForm').addEventListener('submit', (e) => {
    e.preventDefault();
    api('/api/text', { method: 'POST', body: { text: $('#textInput').value } }).then(() => toast('Texto enviado', 'ok')).catch((err) => toast(err.message, 'error'));
  });

  async function refreshInvite() {
    try {
      const inv = await api('/api/invite');
      $('#inviteUrl').textContent = inv.url;
      $('#qr').src = `/api/qr.png?t=${Date.now()}`;
    } catch (_) {}
    const w = state?.config?.wifi;
    const has = !!(w && w.ssid);
    $('#wifiBlock').hidden = !has;
    if (has) { $('#wifiQr').src = `/api/wifi-qr.png?t=${Date.now()}`; $('#wifiName').textContent = w.ssid; $('#wifiSsid').value = w.ssid; }
    $('#wifiSetup').open = !has;
  }
  $('#btnSaveWifi').onclick = () => {
    api('/api/wifi', { method: 'POST', body: { ssid: $('#wifiSsid').value.trim(), password: $('#wifiPass').value } })
      .then(() => { $('#wifiPass').value = ''; toast('Red guardada', 'ok'); setTimeout(refreshInvite, 300); })
      .catch((err) => toast(err.message, 'error'));
  };
  $('#btnShare').onclick = async () => {
    const url = $('#inviteUrl').textContent || location.href;
    if (navigator.share) { try { await navigator.share({ title: 'Mando TV', text: 'Controla la tele desde tu móvil', url }); } catch (_) {} }
    else { try { await navigator.clipboard.writeText(url); toast('Enlace copiado', 'ok'); } catch (_) { toast(url); } }
  };

  // ------------------------------------------------------------ PIN
  $('#pinForm').addEventListener('submit', (e) => {
    e.preventDefault();
    api('/api/auth', { method: 'POST', body: { pin: $('#pinInput').value } })
      .then(() => { $('#pinOverlay').hidden = true; location.reload(); })
      .catch(() => toast('PIN incorrecto', 'error'));
  });

  // ------------------------------------------------------------ arranque
  async function init() {
    try {
      keysCatalog = await api('/api/keys');
      renderKeyGrid($('#moreKeys'), [...keysCatalog.menus, ...keysCatalog.channel, ...keysCatalog.power]);
      renderKeyGrid($('#sources'), keysCatalog.sources);
      renderKeyGrid($('#pictureKeys'), keysCatalog.picture);
      state = await api('/api/state');
      render();
      if (state.config?.hasUpnp) api('/api/volume').catch(() => {});
    } catch (e) { if (e.message !== 'PIN requerido') toast(e.message, 'error'); }
    connectWs();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  init();
})();
