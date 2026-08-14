/**
 * Estadísticas de dotación, conectividad y formación.
 *
 * Cada endpoint expone una de las vistas del dashboard; `getEstadisticas`
 * las devuelve todas juntas para que la pantalla se arme con una sola llamada.
 * Todos aceptan los mismos filtros por query string: ?anio, ?ciclo, ?departamento
 */

import {
  construirEstadisticas,
  filtrar,
  indicadoresClave,
  resumenPorAnio,
  resumenPorCicloAnio,
  resumenPorDepartamento,
} from '../services/estadisticasService.js';
import { obtenerRegistros } from '../services/estadisticasData.js';
import { errorServidor } from '../utils/http.js';

const leerFiltros = (req) => {
  const { anio, ciclo, departamento } = req.query || {};
  const filtros = {};
  if (anio) filtros.anio = anio;
  if (ciclo) filtros.ciclo = ciclo;
  if (departamento) filtros.departamento = departamento;
  return filtros;
};

/** Envuelve un handler para no repetir el try/catch en cada uno. */
const handler = (fn) => async (req, res) => {
  try {
    return res.status(200).json(await fn(req));
  } catch (error) {
    console.error('[Estadisticas] Error:', error.message);
    return errorServidor(res, '[Estadisticas]', error, "Error al construir las estadísticas");
  }
};

const registrosFiltrados = async (req) => filtrar(await obtenerRegistros(), leerFiltros(req));

export const getEstadisticas = handler((req) => construirEstadisticas(leerFiltros(req)));

export const getIndicadores = handler(async (req) => ({
  indicadores: indicadoresClave(await registrosFiltrados(req)),
}));

export const getPorCicloAnio = handler(async (req) => ({
  porCicloAnio: resumenPorCicloAnio(await registrosFiltrados(req)),
}));

export const getPorDepartamento = handler(async (req) => ({
  porDepartamento: resumenPorDepartamento(await registrosFiltrados(req)),
}));

export const getPorAnio = handler(async (req) => ({
  porAnio: resumenPorAnio(await registrosFiltrados(req)),
}));
