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
  // El primer argumento de console.error es la cadena de formato. Antes se
  // construía con una plantilla —`${contexto}:`— y eso permite, si algún día
  // `contexto` deja de ser un literal, que un especificador (%s, %d…) colado
  // en él altere el resto del mensaje y falsee la traza. Con la cadena fija y
  // los valores como argumentos aparte, la salida es la misma y no hay
  // forma de inyectar formato.
  console.error('%s:', contexto, error);

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
