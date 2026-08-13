/**
 * Respuestas de error uniformes.
 *
 * Antes casi todos los controladores hacían `res.json({ error: error.message })`.
 * Un error de Sequelize devuelve ahí nombres de tablas, de columnas y a veces
 * fragmentos de SQL: reconocimiento gratis para quien esté sondeando la API.
 * El detalle se queda en el log del servidor; el cliente recibe una frase
 * genérica que no describe la implementación.
 */

import { IS_PROD } from '../config/env.js';

/**
 * @param {import('express').Response} res
 * @param {string} contexto  Etiqueta para el log, p. ej. '[Escuelas] getEscuelas'
 * @param {unknown} error    El error capturado
 * @param {string} mensaje   Lo que sí ve el cliente
 * @param {number} status
 */
export const errorServidor = (res, contexto, error, mensaje = 'Error interno del servidor', status = 500) => {
  console.error(`${contexto}:`, error);

  const cuerpo = { message: mensaje };

  // Fuera de producción sí conviene ver el detalle para depurar.
  if (!IS_PROD && error instanceof Error) {
    cuerpo.detalle = error.message;
  }

  return res.status(status).json(cuerpo);
};

/** Error de validación: aquí el mensaje sí es para el usuario. */
export const errorValidacion = (res, mensaje, status = 400) =>
  res.status(status).json({ message: mensaje });
