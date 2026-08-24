import Fuse from 'fuse.js';
import Departamento from '../models/Departamento.js';
import Municipio from '../models/Municipio.js';
import logger from '../utils/logger.js';

/**
 * Traduce los nombres de departamento y municipio que devuelve el API del
 * MINEDUC a los ids de las tablas locales.
 *
 * Hace falta porque los dos catálogos no coinciden literalmente. Medido contra
 * los 340 municipios del API: 317 casan exactamente y 15 sólo con tratamiento
 * —el API usa el nombre largo ("SAN MIGUEL PETAPA") donde la tabla local tiene
 * el corto ("petapa"), y a veces llegan con la ñ rota ("CABA?AS")—.
 *
 * Antes `createDotacion` hacía un findOne exacto y usaba el resultado sin
 * comprobarlo: cuando no casaba, reventaba con
 * `TypeError: Cannot read properties of null (reading 'id')`.
 *
 * REGLA IMPORTANTE: la búsqueda se acota SIEMPRE al departamento. Sin ese
 * filtro aparecen parejas falsas y peligrosas —"SIPACATE" (Escuintla) casaba
 * con "sipacapa" (San Marcos), "LA BLANCA" (San Marcos) con "agua blanca"
 * (Jutiapa)—, y un municipio mal asignado en silencio es peor que un error.
 */

const norm = (s) => String(s ?? '')
  .replace(/[­º]/g, '')          // artefactos del GeoJSON
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')   // tildes
  .replace(/[^\w\s]/g, ' ')          // puntuación y la '?' de la ñ rota
  .replace(/\s+/g, ' ')
  .trim();

/**
 * Umbral del emparejamiento difuso. 0.28 resuelve "SAN MIGUEL PANAM" →
 * "san miguel panán" (una letra de diferencia) sin producir ninguna pareja
 * falsa en los 340 municipios del API; con valores más altos empiezan a
 * aparecer. Si se toca, hay que volver a comprobar la lista completa.
 */
const UMBRAL_DIFUSO = 0.28;

/** Cache en memoria: los catálogos no cambian durante la vida del proceso. */
let cache = null;

const cargar = async () => {
  if (cache) return cache;

  const [departamentos, municipios] = await Promise.all([
    Departamento.findAll({ attributes: ['id', 'nombre'], raw: true }),
    Municipio.findAll({ attributes: ['id', 'nombre', 'departamentoId'], raw: true }),
  ]);

  const deptosPorNombre = new Map();
  for (const d of departamentos) deptosPorNombre.set(norm(d.nombre), d);

  const munisPorDepto = new Map();
  for (const m of municipios) {
    if (!munisPorDepto.has(m.departamentoId)) munisPorDepto.set(m.departamentoId, []);
    munisPorDepto.get(m.departamentoId).push({ ...m, n: norm(m.nombre) });
  }

  cache = { deptosPorNombre, munisPorDepto };
  return cache;
};

/** Permite refrescar los catálogos si se insertan municipios en caliente. */
export const limpiarCacheUbicaciones = () => { cache = null; };

/**
 * Busca el municipio dentro de la lista de UN departamento, de lo más estricto
 * a lo más tolerante.
 */
const emparejar = (lista, nombre) => {
  const n = norm(nombre);
  if (!n) return null;

  // 1. Igual.
  let hit = lista.find((m) => m.n === n);
  if (hit) return { municipio: hit, via: 'exacto' };

  // 2. El API trae el nombre largo y la tabla el corto:
  //    "san miguel petapa" contiene "petapa".
  hit = lista.find((m) => n.endsWith(` ${m.n}`) || n.startsWith(`${m.n} `));
  if (hit) return { municipio: hit, via: 'nombre largo del API' };

  // 3. Al revés: "la tinta" está guardado como "santa catalina la tinta".
  hit = lista.find((m) => m.n.endsWith(` ${n}`) || m.n.startsWith(`${n} `));
  if (hit) return { municipio: hit, via: 'nombre corto del API' };

  // 4. Diferencias de una o dos letras y caracteres rotos.
  const [mejor] = new Fuse(lista, { keys: ['n'], threshold: 0.3, includeScore: true }).search(n);
  if (mejor && mejor.score <= UMBRAL_DIFUSO) {
    return { municipio: mejor.item, via: `aproximado (${mejor.score.toFixed(2)})` };
  }

  return null;
};

/**
 * @returns {Promise<{departamento, municipio, via}>}
 * @throws  {Error} con `expuesto = true` y un mensaje que explica qué falta.
 */
export const resolverUbicacion = async (nombreDepartamento, nombreMunicipio) => {
  const dep = String(nombreDepartamento ?? '').trim();
  const mun = String(nombreMunicipio ?? '').trim();

  const fallo = (mensaje) => {
    const error = new Error(mensaje);
    error.expuesto = true;   // el mensaje es para el usuario (ver utils/http.js)
    error.status = 400;
    throw error;
  };

  if (!dep) fallo('Falta el departamento del establecimiento.');
  if (!mun) fallo('Falta el municipio del establecimiento.');

  const { deptosPorNombre, munisPorDepto } = await cargar();

  const departamento = deptosPorNombre.get(norm(dep));
  if (!departamento) {
    fallo(`El departamento "${dep}" no está en el catálogo del sistema.`);
  }

  const lista = munisPorDepto.get(departamento.id) || [];
  const encontrado = emparejar(lista, mun);

  if (!encontrado) {
    fallo(
      `El municipio "${mun}" no está en el catálogo del sistema para el ` +
      `departamento de ${departamento.nombre}. Avise al administrador para que ` +
      `lo agregue; la dotación no se registró.`
    );
  }

  if (encontrado.via !== 'exacto') {
    logger.warn(
      '[ubicaciones] "%s" (%s) se resolvió como "%s" por %s',
      mun, departamento.nombre, encontrado.municipio.nombre, encontrado.via
    );
  }

  return {
    departamento,
    municipio: encontrado.municipio,
    via: encontrado.via,
  };
};
