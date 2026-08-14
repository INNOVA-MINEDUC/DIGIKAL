import rateLimit from 'express-rate-limit';

/**
 * Limitadores compartidos.
 *
 * Antes cada archivo de rutas definía el suyo copiando y pegando, y así fue
 * como el limitador de auth.routes.js acabó colgado de `/validate-token` en
 * lugar del inicio de sesión: el login quedó sin límite de intentos y nadie lo
 * notó porque seguía funcionando. Con una sola definición por caso de uso el
 * error deja de ser posible.
 *
 * Nota: app.js declara `trust proxy`, así que la IP que se usa como clave es la
 * real del cliente y no la del proxy de Docker/Nginx.
 */

const QUINCE_MINUTOS = 15 * 60 * 1000;

const base = {
  windowMs: QUINCE_MINUTOS,
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Inicio de sesión: cinco fallos por IP cada quince minutos.
 * `skipSuccessfulRequests` hace que los aciertos no gasten cupo, de modo que
 * un usuario legítimo que entra y sale no se queda fuera.
 *
 * Esto solo cubre la dimensión "IP". El bloqueo por cuenta vive en
 * AuthController, porque una botnet cambia de IP pero no de objetivo.
 */
export const loginLimiter = rateLimit({
  ...base,
  max: 5,
  skipSuccessfulRequests: true,
  message: { message: 'Demasiados intentos de inicio de sesión. Espere 15 minutos.' },
});

/** Rutas autenticadas de uso normal. */
export const apiLimiter = rateLimit({
  ...base,
  max: 300,
  message: { message: 'Demasiadas solicitudes. Intente más tarde.' },
});

/** Operaciones de escritura: más caras y menos frecuentes. */
export const escrituraLimiter = rateLimit({
  ...base,
  max: 100,
  message: { message: 'Demasiadas operaciones. Intente más tarde.' },
});

/**
 * Lectura pública sin token (mapa y tablero de la página de inicio). Es la
 * superficie que cualquiera puede golpear, así que el cupo es por IP y acotado:
 * suficiente para navegar el mapa, insuficiente para descargar el país entero.
 */
export const publicoLimiter = rateLimit({
  ...base,
  max: 120,
  message: { message: 'Demasiadas solicitudes. Intente más tarde.' },
});

/** Subida de archivos: lo más costoso que expone el sistema. */
export const uploadLimiter = rateLimit({
  ...base,
  max: 30,
  message: { message: 'Demasiadas cargas de archivos. Intente más tarde.' },
});
