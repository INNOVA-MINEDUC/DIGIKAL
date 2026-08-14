import { ROLES_VALIDOS } from '../config/env.js';

/**
 * Política de contraseñas.
 *
 * Antes `createUser` aceptaba "1" como contraseña: no había ninguna
 * comprobación de longitud ni de composición.
 */

const LONGITUD_MINIMA = 12;

// Las que salen primero en cualquier diccionario de ataque. No pretende ser
// exhaustiva; corta lo evidente sin necesitar una dependencia externa.
const CONTRASEÑAS_COMUNES = new Set([
  'password', 'contrasena', 'contraseña', '123456789012', 'qwertyuiop12',
  'administrador', 'mineduc12345', 'digikal12345', 'password1234',
  'admin1234567', 'guatemala123',
]);

/** @returns {string|null} el motivo del rechazo, o null si es válida. */
export const validarPassword = (password) => {
  if (typeof password !== 'string' || !password) {
    return 'La contraseña es obligatoria';
  }

  if (password.length < LONGITUD_MINIMA) {
    return `La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres`;
  }

  if (CONTRASEÑAS_COMUNES.has(password.toLowerCase())) {
    return 'La contraseña es demasiado común. Elija otra.';
  }

  const clases = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/]
    .filter((re) => re.test(password)).length;

  if (clases < 3) {
    return 'La contraseña debe combinar al menos tres de: minúsculas, mayúsculas, números y símbolos';
  }

  return null;
};

/**
 * El rol debe existir en el catálogo. Antes `roleId` se tomaba del cuerpo de la
 * petición tal cual, de modo que cualquiera podía asignarse el rol 1 (admin).
 */
export const validarRoleId = (roleId) => {
  if (roleId === undefined || roleId === null || roleId === '') return null;

  if (!ROLES_VALIDOS.includes(Number(roleId))) {
    return 'El rol indicado no existe';
  }

  return null;
};

/** Longitud máxima de una dirección de correo (RFC 5321). */
const LONGITUD_MAX_EMAIL = 254;

const EMAIL_INVALIDO = 'El correo electrónico no es válido';

/**
 * Validación del correo sin expresiones regulares con retroceso.
 *
 * La versión anterior usaba /^[^\s@]+@[^\s@]+\.[^\s@]+$/. El punto también
 * entra en [^\s@], así que los dos cuantificadores de la parte del dominio se
 * solapan: ante una cadena que no casa, el motor prueba todas las particiones
 * posibles y el coste crece al cuadrado. Medido: 16 KB de entrada bloqueaban
 * 200 ms el bucle de eventos, y como express.json acepta hasta 1 MB, una sola
 * petición podía dejar el servidor parado varios minutos (CodeQL: polynomial
 * regular expression used on uncontrolled data).
 *
 * Partir la cadena recorre la entrada una sola vez: el coste es lineal y no
 * depende de la forma del texto.
 */
export const validarEmail = (email) => {
  const valor = typeof email === 'string' ? email.trim() : '';

  if (!valor || valor.length > LONGITUD_MAX_EMAIL) return EMAIL_INVALIDO;

  // `/\s/` no lleva cuantificador: una pasada, sin retroceso posible.
  if (/\s/.test(valor)) return EMAIL_INVALIDO;

  const partes = valor.split('@');
  if (partes.length !== 2) return EMAIL_INVALIDO;

  const [local, dominio] = partes;
  if (!local || !dominio) return EMAIL_INVALIDO;

  // El dominio necesita al menos un punto y ninguna etiqueta vacía: descarta
  // "a..b", ".a" y "a." además de "sinpunto".
  const etiquetas = dominio.split('.');
  if (etiquetas.length < 2 || etiquetas.some((etiqueta) => etiqueta.length === 0)) {
    return EMAIL_INVALIDO;
  }

  return null;
};

export const normalizarEmail = (email) => String(email ?? '').trim().toLowerCase();
