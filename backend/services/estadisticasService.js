/**
 * Agregaciones sobre los registros de estadísticas.
 *
 * Todo se calcula a partir de la misma lista de registros, así que los totales
 * de una tabla siempre cuadran con los de las demás. Ninguna cifra está escrita
 * a mano en este archivo.
 */

import {
  CICLOS,
  ETIQUETAS_CICLO,
  METRICAS,
  MUNICIPIOS_POR_DEPARTAMENTO,
  obtenerRegistros,
} from './estadisticasData.js';

const ceros = () => Object.fromEntries(METRICAS.map((m) => [m, 0]));

const acumular = (destino, registro) => {
  for (const m of METRICAS) destino[m] += registro[m] ?? 0;
  return destino;
};

/**
 * Municipios impactados: NO es sumable por fila (los registros de un mismo
 * departamento comparten sus municipios). Se cuenta una vez por departamento
 * presente en el corte.
 *
 * Ojo: el dato es a nivel de departamento, no por año ni por ciclo. Al filtrar
 * (p. ej. ?anio=2026) se devuelven todos los municipios del departamento, no
 * sólo los atendidos ese año — para eso haría falta el detalle por municipio.
 */
export const contarMunicipios = (registros) => {
  const departamentos = new Set(registros.map((reg) => reg.departamento));
  let total = 0;
  for (const depto of departamentos) total += MUNICIPIOS_POR_DEPARTAMENTO[depto] ?? 0;
  return total;
};

/** Agrupa por una o varias claves y suma las métricas de cada grupo. */
export const agrupar = (registros, claves) => {
  const grupos = new Map();

  for (const reg of registros) {
    const id = claves.map((k) => reg[k]).join('|');
    let grupo = grupos.get(id);
    if (!grupo) {
      grupo = { ...Object.fromEntries(claves.map((k) => [k, reg[k]])), ...ceros(), _registros: [] };
      grupos.set(id, grupo);
    }
    acumular(grupo, reg);
    grupo._registros.push(reg);
  }

  return [...grupos.values()].map(({ _registros, ...grupo }) => ({
    ...grupo,
    municipios: contarMunicipios(_registros),
  }));
};

/** Filtros opcionales de query string: ?anio=2026&ciclo=BASICO&departamento=Petén */
export const filtrar = (registros, { anio, ciclo, departamento } = {}) => {
  return registros.filter((reg) => {
    if (anio && Number(anio) !== reg.anio) return false;
    if (ciclo && String(ciclo).toUpperCase() !== reg.ciclo) return false;
    if (departamento && departamento !== reg.departamento) return false;
    return true;
  });
};

/* ── Las cuatro vistas del dashboard ────────────────────────────────────── */

/** Tabla 1 — resumen por ciclo educativo y año. */
export const resumenPorCicloAnio = (registros) =>
  agrupar(registros, ['ciclo', 'anio'])
    .map((fila) => ({ ...fila, cicloEtiqueta: ETIQUETAS_CICLO[fila.ciclo] ?? fila.ciclo }))
    .sort((a, b) => a.anio - b.anio || CICLOS.indexOf(a.ciclo) - CICLOS.indexOf(b.ciclo));

/** Tabla 2 — resumen por departamento, ordenado de mayor a menor cobertura. */
export const resumenPorDepartamento = (registros) =>
  agrupar(registros, ['departamento'])
    .sort((a, b) => b.establecimientos - a.establecimientos || a.departamento.localeCompare(b.departamento));

/** Tabla 3 — resumen por año. */
export const resumenPorAnio = (registros) =>
  agrupar(registros, ['anio']).sort((a, b) => a.anio - b.anio);

/** Tabla 4 — indicadores clave (totales + razones derivadas). */
export const indicadoresClave = (registros) => {
  const totales = registros.reduce(acumular, ceros());
  const municipios = contarMunicipios(registros);
  const departamentos = new Set(registros.map((r) => r.departamento)).size;
  const redondear = (n) => Math.round(n * 100) / 100;

  return {
    ...totales,
    municipios,
    departamentos,
    promedioEquiposPorCentro: totales.establecimientos
      ? redondear(totales.equipos / totales.establecimientos)
      : 0,
    promedioBeneficiadosPorCentro: totales.establecimientos
      ? redondear(totales.beneficiados / totales.establecimientos)
      : 0,
    porcentajeConectividad: totales.establecimientos
      ? redondear((totales.conectividad / totales.establecimientos) * 100)
      : 0,
    porcentajeFormacion: totales.beneficiados
      ? redondear((totales.formacion / totales.beneficiados) * 100)
      : 0,
  };
};

/** Payload completo del dashboard: una sola llamada trae las cuatro vistas. */
export const construirEstadisticas = async (filtros = {}) => {
  const todos = await obtenerRegistros();
  const registros = filtrar(todos, filtros);

  return {
    filtros: {
      aplicados: filtros,
      // opciones disponibles, calculadas sobre el universo sin filtrar
      anios: [...new Set(todos.map((r) => r.anio))].sort(),
      ciclos: [...new Set(todos.map((r) => r.ciclo))]
        .sort((a, b) => CICLOS.indexOf(a) - CICLOS.indexOf(b))
        .map((c) => ({ valor: c, etiqueta: ETIQUETAS_CICLO[c] ?? c })),
      departamentos: [...new Set(todos.map((r) => r.departamento))].sort(),
    },
    indicadores: indicadoresClave(registros),
    porCicloAnio: resumenPorCicloAnio(registros),
    porDepartamento: resumenPorDepartamento(registros),
    porAnio: resumenPorAnio(registros),
  };
};
