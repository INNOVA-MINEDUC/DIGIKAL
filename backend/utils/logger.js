import { IS_PROD } from '../config/env.js';

/**
 * Registro con niveles.
 *
 * Sustituye a las llamadas directas a console.* del código de servidor. El
 * motivo no es sólo cosmético: en producción los mensajes informativos ensucian
 * el log, cuestan rendimiento y pueden filtrar datos (nombres de escuelas,
 * correos, orígenes). Pero los ERRORES tienen que seguir saliendo: son el único
 * rastro que queda cuando algo se rompe en un servidor al que nadie está
 * mirando. Borrarlos del todo es cambiar un problema por otro peor.
 *
 * Umbral por defecto:
 *   NODE_ENV=production  →  sólo `error`
 *   cualquier otro       →  todo
 *
 * Se puede forzar con LOG_LEVEL=error|warn|info|debug (útil para depurar un
 * incidente en producción sin tocar el código).
 *
 * La firma es la de console.*, así que admite cadenas de formato:
 *   logger.warn('[CORS] Origen bloqueado: %s', origin)
 * Es la forma segura de registrar datos que vienen del usuario (ver utils/http.js).
 */

const NIVELES = { error: 0, warn: 1, info: 2, debug: 3 };

const solicitado = String(process.env.LOG_LEVEL || '').toLowerCase();
const porDefecto = IS_PROD ? 'error' : 'debug';
const umbral = NIVELES[solicitado] ?? NIVELES[porDefecto];

const emisor = (nivel, salida) => (...args) => {
  if (NIVELES[nivel] <= umbral) salida(...args);
};

const logger = {
  error: emisor('error', (...a) => console.error(...a)),
  warn:  emisor('warn',  (...a) => console.warn(...a)),
  info:  emisor('info',  (...a) => console.log(...a)),
  debug: emisor('debug', (...a) => console.log(...a)),
};

export default logger;
