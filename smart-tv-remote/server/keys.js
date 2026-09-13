'use strict';
/**
 * Catálogo de teclas soportadas por los Samsung de 2013 (serie F) por el
 * protocolo legacy. Se agrupan por categorías para la interfaz.
 * Se excluyen a propósito teclas de servicio (KEY_FACTORY, KEY_3SPEED, etc.)
 */
const KEYS = {
  power: [
    { key: 'KEY_POWEROFF', label: 'Apagar', icon: '⏻' },
    { key: 'KEY_POWER', label: 'Power', icon: '⏼' },
  ],
  navigation: [
    { key: 'KEY_UP', label: 'Arriba', icon: '▲' },
    { key: 'KEY_DOWN', label: 'Abajo', icon: '▼' },
    { key: 'KEY_LEFT', label: 'Izquierda', icon: '◀' },
    { key: 'KEY_RIGHT', label: 'Derecha', icon: '▶' },
    { key: 'KEY_ENTER', label: 'OK', icon: 'OK' },
    { key: 'KEY_RETURN', label: 'Atrás', icon: '↩' },
    { key: 'KEY_EXIT', label: 'Salir', icon: '✕' },
  ],
  menus: [
    { key: 'KEY_MENU', label: 'Menú' },
    { key: 'KEY_CONTENTS', label: 'Smart Hub' },
    { key: 'KEY_SOURCE', label: 'Fuente' },
    { key: 'KEY_TOOLS', label: 'Tools' },
    { key: 'KEY_INFO', label: 'Info' },
    { key: 'KEY_GUIDE', label: 'Guía' },
    { key: 'KEY_CH_LIST', label: 'Lista canales' },
    { key: 'KEY_W_LINK', label: 'Media.P' },
    { key: 'KEY_EMANUAL', label: 'e-Manual' },
    { key: 'KEY_SEARCH', label: 'Buscar' },
  ],
  volume: [
    { key: 'KEY_VOLUP', label: 'Vol +' },
    { key: 'KEY_VOLDOWN', label: 'Vol −' },
    { key: 'KEY_MUTE', label: 'Silencio' },
  ],
  channel: [
    { key: 'KEY_CHUP', label: 'Canal +' },
    { key: 'KEY_CHDOWN', label: 'Canal −' },
    { key: 'KEY_PRECH', label: 'Canal anterior' },
    { key: 'KEY_FAVCH', label: 'Favoritos' },
    { key: 'KEY_TTX_MIX', label: 'Teletexto' },
  ],
  numbers: Array.from({ length: 10 }, (_, i) => ({ key: `KEY_${i}`, label: String(i) })).concat([
    { key: 'KEY_PLUS100', label: '-' },
  ]),
  colors: [
    { key: 'KEY_RED', label: 'A', color: '#e53935' },
    { key: 'KEY_GREEN', label: 'B', color: '#43a047' },
    { key: 'KEY_YELLOW', label: 'C', color: '#fdd835' },
    { key: 'KEY_CYAN', label: 'D', color: '#1e88e5' },
  ],
  media: [
    { key: 'KEY_REWIND', label: 'Rebobinar', icon: '⏪' },
    { key: 'KEY_PLAY', label: 'Reproducir', icon: '▶' },
    { key: 'KEY_PAUSE', label: 'Pausa', icon: '⏸' },
    { key: 'KEY_STOP', label: 'Parar', icon: '⏹' },
    { key: 'KEY_FF', label: 'Avanzar', icon: '⏩' },
    { key: 'KEY_REC', label: 'Grabar', icon: '⏺' },
  ],
  sources: [
    { key: 'KEY_TV', label: 'TV' },
    { key: 'KEY_HDMI', label: 'HDMI' },
    { key: 'KEY_HDMI1', label: 'HDMI 1' },
    { key: 'KEY_HDMI2', label: 'HDMI 2' },
    { key: 'KEY_HDMI3', label: 'HDMI 3' },
    { key: 'KEY_HDMI4', label: 'HDMI 4' },
    { key: 'KEY_AV1', label: 'AV' },
    { key: 'KEY_COMPONENT1', label: 'Componentes' },
    { key: 'KEY_DTV', label: 'TDT' },
  ],
  picture: [
    { key: 'KEY_PMODE', label: 'Modo imagen' },
    { key: 'KEY_SMODE', label: 'Modo sonido' },
    { key: 'KEY_PICTURE_SIZE', label: 'Tamaño imagen' },
    { key: 'KEY_ASPECT', label: 'Aspecto' },
    { key: 'KEY_3D', label: '3D' },
    { key: 'KEY_SUB_TITLE', label: 'Subtítulos' },
    { key: 'KEY_CAPTION', label: 'Caption' },
    { key: 'KEY_MTS', label: 'Dual (audio)' },
    { key: 'KEY_AD', label: 'Audiodescripción' },
    { key: 'KEY_SLEEP', label: 'Temporizador' },
    { key: 'KEY_SRS', label: 'SRS' },
    { key: 'KEY_DVR', label: 'DVR' },
    { key: 'KEY_PANNEL_CHDOWN', label: 'Panel Ch−' },
  ],
};

const ALL_KEYS = new Set(Object.values(KEYS).flat().map((k) => k.key));

module.exports = { KEYS, ALL_KEYS };
