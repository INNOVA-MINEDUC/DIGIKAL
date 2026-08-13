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

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validarEmail = (email) => {
  if (typeof email !== 'string' || !RE_EMAIL.test(email.trim())) {
    return 'El correo electrónico no es válido';
  }
  return null;
};

export const normalizarEmail = (email) => String(email ?? '').trim().toLowerCase();
