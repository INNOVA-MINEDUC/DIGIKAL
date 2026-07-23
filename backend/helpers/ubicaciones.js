/**
 * Resolución de nombres de departamento y municipio a partir del `municipioId`
 * que devuelve el API.
 *
 * Por qué hace falta: `EstablecimientoEstadisticaDto` expone los objetos
 * `departamento { }` y `municipio { }` pero su resolver los devuelve en null.
 * Sólo llegan `departamentoId` y `municipioId`, y el API no tiene queries de
 * catálogo para traducirlos.
 *
 * Por qué desde el municipio y no desde el departamento: los ids de
 * departamento del API NO coinciden con los del catálogo local (para el API,
 * 11 = Petén; en `data_con_municipio_api.json`, 11 = Jutiapa). Los de municipio
 * sí coinciden — verificado contra 4 501 registros de 5 departamentos, con el
 * 100% resuelto. El departamento se deduce del municipio.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// `muniApiData` tiene los ids del API pero guarda los nombres normalizados
// (minúsculas, sin tildes). `data_con_municipio_api` tiene la grafía oficial
// en `municipioSistema`, pero con su propia numeración — se cruzan por
// nombre normalizado + departamento, no por id.
const muniData = JSON.parse(
  readFileSync(join(__dirname, 'muniApiData.json'), 'utf-8')
);

const muniOficial = JSON.parse(
  readFileSync(join(__dirname, 'data_con_municipio_api.json'), 'utf-8')
);

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

// Grafías oficiales, iguales a las del GeoJSON que usa el mapa del front: si no
// coincidieran, al hacer clic en un departamento el filtro no encontraría nada.
const DEPARTAMENTOS = [
  'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula', 'El Progreso',
  'Escuintla', 'Guatemala', 'Huehuetenango', 'Izabal', 'Jalapa', 'Jutiapa',
  'Petén', 'Quetzaltenango', 'Quiché', 'Retalhuleu', 'Sacatepéquez',
  'San Marcos', 'Santa Rosa', 'Sololá', 'Suchitepéquez', 'Totonicapán', 'Zacapa',
];

const DEPARTAMENTO_POR_NORM = new Map(DEPARTAMENTOS.map((d) => [norm(d), d]));

// El catálogo guarda los nombres en minúsculas y sin tildes; se les devuelve
// el formato de título dejando las partículas en minúscula.
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y']);

const aTitulo = (texto) =>
  String(texto ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra, i) =>
      i > 0 && PARTICULAS.has(palabra)
        ? palabra
        : palabra.charAt(0).toUpperCase() + palabra.slice(1)
    )
    .join(' ');

// Grafía oficial del municipio, indexada por nombre normalizado + departamento.
const OFICIAL_POR_CLAVE = new Map(
  muniOficial.map((m) => [`${norm(m.municipioApi)}|${norm(m.departamento)}`, m.municipioSistema])
);

const POR_MUNICIPIO_ID = new Map(
  muniData.map((m) => {
    // 333 de 340 municipios traen tildes del catálogo oficial; los 7 restantes
    // (los de creación más reciente) no están ahí y caen al formato de título.
    const oficial = OFICIAL_POR_CLAVE.get(`${norm(m.nombre)}|${norm(m.departamento)}`);

    return [
      m.id,
      {
        municipio: oficial ?? aTitulo(m.nombre),
        departamento: DEPARTAMENTO_POR_NORM.get(norm(m.departamento)) ?? aTitulo(m.departamento),
      },
    ];
  })
);

const VACIO = { municipio: '', departamento: '' };

/** Devuelve { municipio, departamento } para un municipioId del API. */
export const resolverUbicacion = (municipioId) =>
  POR_MUNICIPIO_ID.get(municipioId) ?? VACIO;

export { DEPARTAMENTOS };
