import Fuse from 'fuse.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const muniData = JSON.parse(
  readFileSync(join(__dirname, 'muniApiData.json'), 'utf-8')
);

// Normaliza: sin guión suave (artefacto del GeoJSON), minúsculas, sin tildes, sin puntuación
const norm = (s) => {
  if (!s) return '';
  return s
    .replace(/[­º]/g, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Nombres acortados o con distinta grafía en el GeoJSON → nombre normalizado del CSV
const GEO_ALIASES = {
  'cahabon':                     'santa maria cahabon',
  'uspantan':                    'san miguel uspantan',
  'tucuru':                      'san miguel tucuru',
  'el chol':                     'santa cruz el chol',
  'chichicastenango':            'santo tomas chichicastenango',
  'pachalum':                    'pachalun',
  'el rodeo':                    'san jose el rodeo',
  'san juan la ermita':          'san juan ermita',
  'comalapa':                    'san juan comalapa',
  'colomba':                     'colomba costa cuca',
  'san felipe retalhuleu':       'san felipe',
  'genova':                      'genova costa cuca',
  'san miguel panan':            'san miguel panam',
  'san pablo jocopila':          'san pablo jocopilas',
  'pochuta':                     'san miguel pochuta',
  'la maquina':                  'san jose la maquina',
  'petapa':                      'san miguel petapa',
  'yepocapa':                    'san pedro yepocapa',
  'santa lucia cotzulmalguapa':  'santa lucia cotzumalguapa',
  'santa catalina la tinta':     'la tinta',
  'barillas':                    'santa cruz barillas',
  'san idelfonso ixtahuacan':    'san ildefonso ixtahuacan',
};

// Lookup principal: "nombre::departamento" → id  y  "nombre" → id (fallback)
const LOOKUP = {};
for (const m of muniData) {
  LOOKUP[`${m.nombre}::${m.departamento}`] = m.id;
  if (LOOKUP[m.nombre] == null) LOOKUP[m.nombre] = m.id;
}

// Fuse como red de seguridad para variantes no cubiertas por aliases
const fuse = new Fuse(muniData, {
  keys: ['nombre'],
  threshold: 0.2,
  includeScore: true,
  ignoreLocation: false,
  minMatchCharLength: 4,
});

/**
 * Devuelve el municipioId (entero) que usa el API de MINEDUC.
 *
 * @param {string} nombre  - Nombre del municipio tal como viene del GeoJSON
 * @param {string} [dept]  - Nombre del departamento para desambiguar
 * @returns {number|null}
 */
export function buscarMunicipioApiId(nombre, dept) {
  if (!nombre) return null;

  let busq = norm(nombre);
  const deptNorm = dept ? norm(dept) : null;

  // Aplica alias del GeoJSON si existe
  if (GEO_ALIASES[busq]) busq = GEO_ALIASES[busq];

  // 1. Lookup directo con departamento (más preciso, evita colisiones)
  if (deptNorm) {
    const id = LOOKUP[`${busq}::${deptNorm}`];
    if (id != null) return id;
  }

  // 2. Lookup directo sin departamento
  if (LOOKUP[busq] != null) return LOOKUP[busq];

  // 3. Fuse para variantes no cubiertas
  const results = fuse.search(busq);
  if (!results.length) {
    // `nombre` procede del filtro que envía el cliente: se pasa como argumento
    // y no dentro de la cadena de formato (ver utils/http.js).
    logger.warn('[municipioSearch] Sin resultados para: "%s" (busq: "%s")', nombre, busq);
    return null;
  }

  let best;
  if (deptNorm && results.length > 1) {
    const deptMatch = results.find((r) => r.item.departamento === deptNorm);
    best = deptMatch ?? results[0];
  } else {
    best = results[0];
  }

  if (best.score > 0.25) {
    logger.warn(
      '[municipioSearch] Score bajo (%s) para "%s" → "%s"',
      best.score.toFixed(3), nombre, best.item.nombre
    );
    return null;
  }

  return best.item.id;
}

export function buscarMunicipioCandidatos(nombre) {
  if (!nombre) return [];
  let busq = norm(nombre);
  if (GEO_ALIASES[busq]) busq = GEO_ALIASES[busq];
  return fuse.search(busq).map((r) => ({
    score: r.score?.toFixed(4),
    nombre: r.item.nombre,
    departamento: r.item.departamento,
    id: r.item.id,
  }));
}
