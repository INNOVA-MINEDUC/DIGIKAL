import axios from 'axios';
import { Op } from 'sequelize';
import '../models/Relations.js';
import Escuela from '../models/Escuela.js';
import Dotacion from '../models/Dotacion.js';
import Equipo from '../models/Equipo.js';
import ModeloEquipo from '../models/ModeloEquipo.js';
import TipoEquipo from '../models/TipoEquipo.js';
import Internet from '../models/Internet.js';

const GRAPHQL_URL  = 'https://api-mdm-dev.mineduc.edu.gt/graphql';
const PUBLIC_TOKEN = 'publicTk';
const TIMEOUT_MS   = 30_000;
const MAX_RETRIES  = 2;

// El API pagina: sin tamanoPagina solo devuelve 10 registros.
// 5000 revienta su base de datos (ECONNRESET); 500 es estable.
const PAGE_SIZE = 500;
const MAX_PAGES = 40;

const EMPTY_RESPONSE = {
  establecimientos: 0,
  totalEstudiantes: 0,
  totalHombres: 0,
  totalMujeres: 0,
  totalEquipos: 0,
  totalInternet: 0,
  establecimientosDotados: 0,
  estudiantesDotados: 0,
  modelosEquipos: [],
  escuelas: [],
};

const norm = (s) => {
  if (!s) return '';
  return s
    .replace(/[­º]/g, '')       // artefactos del GeoJSON
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')      // tildes
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const gqlPost = async (query) => {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await axios.post(
        GRAPHQL_URL,
        { query },
        {
          headers: { 'Content-Type': 'application/json', publicToken: PUBLIC_TOKEN },
          timeout: TIMEOUT_MS,
          validateStatus: () => true,
        }
      );
    } catch (err) {
      lastErr = err;
      const retryable = ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT'].includes(err.code);
      if (!retryable || attempt === MAX_RETRIES) break;
      await new Promise((r) => setTimeout(r, attempt * 800));
    }
  }
  throw lastErr;
};

const gqlData = async (query) => {
  const res = await gqlPost(query);
  if (res.status >= 400) {
    throw new Error(`API MDM status ${res.status}: ${JSON.stringify(res.data).slice(0, 200)}`);
  }
  if (res.data?.errors) {
    throw new Error(`GraphQL: ${res.data.errors.map((e) => e.message).join('; ')}`);
  }
  return res.data?.data;
};

/* ── Resolución de IDs (los del API, no los de la BD local) ─────────────── */

let deptCache = null;

const getDeptId = async (deptName) => {
  if (!deptCache) {
    const data = await gqlData(
      `query { departamentos(filtro: { tamanoPagina: 50 }) { id nombre } }`
    );
    deptCache = {};
    for (const d of data?.departamentos || []) deptCache[norm(d.nombre)] = d.id;
  }
  return deptCache[norm(deptName)] ?? null;
};

const muniCacheByDept = {};

const getMuniId = async (muniName, deptId) => {
  if (!muniCacheByDept[deptId]) {
    const data = await gqlData(
      `query { municipios(filtro: { departamentoId: ${deptId}, tamanoPagina: 100 }) { id nombre } }`
    );
    const map = new Map();
    for (const m of data?.municipios || []) map.set(norm(m.nombre), m.id);
    muniCacheByDept[deptId] = map;
  }

  const map = muniCacheByDept[deptId];
  const busq = norm(muniName);
  if (!busq) return null;

  if (map.has(busq)) return map.get(busq);
  // El GeoJSON usa nombres cortos: "chichicastenango" ⊂ "santo tomas chichicastenango"
  for (const [nombre, id] of map) if (nombre.includes(busq)) return id;
  for (const [nombre, id] of map) if (busq.includes(nombre) && nombre.length >= 4) return id;

  console.warn(`[Dashboard] Municipio no resuelto: "${muniName}" en dept ${deptId}`);
  return null;
};

/* ── Establecimientos del API MDM (paginado) ────────────────────────────── */

// OJO: no se pide `jornada`. El enum JornadaEstablecimiento del API sólo acepta
// DOBLE/INTERMEDIA/MATUTINA/NOCTURNA/SIN_JORNADA/VESPERTINA, pero su base tiene
// filas con "MIXTA" y "FIN_DE_SEMANA", y el campo revienta la consulta entera.
// La jornada se toma de la tabla local `escuelas`, donde es un STRING libre.
const ESTABLECIMIENTO_FIELDS = `
  id nombre codigoMineduc
  poseeConectividad velocidadConectividad fechaConectividad
  fechaDatacion inscritos2026 estudiantesInscritos
  cantidadHombres cantidadMujeres
  telefono correoElectronico direccion latitud longitud
  opf nivel
  departamento { id nombre }
  municipio { id nombre }
  empresaConectividad { id nombre }
`;

const fetchEstablecimientos = async (deptId, muniId) => {
  const todos = [];

  for (let pagina = 1; pagina <= MAX_PAGES; pagina++) {
    const filtros = [`pagina: ${pagina}`, `tamanoPagina: ${PAGE_SIZE}`];
    if (deptId != null) filtros.push(`departamentoId: ${deptId}`);
    if (muniId != null) filtros.push(`municipioId: ${muniId}`);

    const data = await gqlData(
      `query { establecimientos(filtro: { ${filtros.join(', ')} }) { ${ESTABLECIMIENTO_FIELDS} } }`
    );
    const pagina_actual = data?.establecimientos || [];
    todos.push(...pagina_actual);

    if (pagina_actual.length < PAGE_SIZE) break;
  }

  return todos;
};

/* ── Dotaciones de la BD local, indexadas por código MINEDUC ─────────────
   El API MDM no tiene modelos de equipo; esa información sólo existe aquí.
   Enlace: escuelas.codigoEscuela ↔ establecimiento.codigoMineduc          */

const getDotacionesPorCodigo = async (codigos) => {
  const porCodigo = new Map();
  if (!codigos.length) return porCodigo;

  const escuelas = await Escuela.findAll({
    where: { codigoEscuela: { [Op.in]: codigos } },
    attributes: ['id', 'codigoEscuela', 'jornada'],
    include: [{
      model: Dotacion,
      as: 'dotaciones',
      required: false,
      attributes: ['id', 'fecha_entrega'],
      include: [
        {
          model: Equipo,
          as: 'equipos',
          required: false,
          attributes: ['id', 'numero_serie', 'valor'],
          through: { attributes: [] },
          include: [{
            model: ModeloEquipo,
            as: 'modelo',
            required: false,
            attributes: ['id', 'nombre_modelo'],
            include: [{ model: TipoEquipo, as: 'tipo', required: false, attributes: ['nombre'] }],
          }],
        },
        { model: Internet, as: 'internet', required: false, attributes: ['empresa', 'fecha_instalacion'] },
      ],
    }],
  });

  for (const escuela of escuelas) {
    const equipos = [];
    let fechaEntrega = null;
    let internet = null;

    for (const dotacion of escuela.dotaciones || []) {
      if (dotacion.fecha_entrega && (!fechaEntrega || dotacion.fecha_entrega > fechaEntrega)) {
        fechaEntrega = dotacion.fecha_entrega;
      }
      if (dotacion.internet?.empresa && !internet) {
        internet = {
          empresa: dotacion.internet.empresa,
          fechaInstalacion: dotacion.internet.fecha_instalacion,
        };
      }
      for (const equipo of dotacion.equipos || []) {
        equipos.push({
          numeroSerie: equipo.numero_serie,
          valor: equipo.valor,
          modelo: equipo.modelo?.nombre_modelo ?? 'Sin modelo',
          tipo: equipo.modelo?.tipo?.nombre ?? 'Sin tipo',
        });
      }
    }

    porCodigo.set(escuela.codigoEscuela, { equipos, fechaEntrega, internet, jornada: escuela.jornada });
  }

  return porCodigo;
};

/* ── Handler ────────────────────────────────────────────────────────────── */

export const getEscuelasDotadas = async (req, res) => {
  try {
    const { dept, muni } = req.body || {};

    let deptId = null;
    let muniId = null;

    if (dept) {
      deptId = await getDeptId(dept);
      // Sin este corte, un nombre no resuelto haría una consulta sin filtro y
      // devolvería los ~1100 establecimientos del país como si fueran del depto.
      if (deptId == null) {
        console.warn(`[Dashboard] Departamento no resuelto: "${dept}"`);
        return res.status(200).json({ ...EMPTY_RESPONSE, _warning: `Departamento no encontrado: ${dept}` });
      }
    }
    if (muni && deptId != null) {
      muniId = await getMuniId(muni, deptId);
      if (muniId == null) {
        console.warn(`[Dashboard] Municipio no resuelto: "${muni}" — se muestra el departamento completo`);
      }
    }

    const lista = await fetchEstablecimientos(deptId, muniId);

    // La BD local puede estar caída o vacía: no debe tumbar los datos del MDM.
    let dotacionesLocales = new Map();
    try {
      const codigos = lista.map((e) => e.codigoMineduc).filter(Boolean);
      dotacionesLocales = await getDotacionesPorCodigo(codigos);
    } catch (dbErr) {
      console.error('[Dashboard] No se pudieron leer dotaciones locales:', dbErr.message);
    }

    const escuelas = lista.map((e) => {
      const local = dotacionesLocales.get(e.codigoMineduc);
      const equipos = local?.equipos ?? [];
      const fechaDotacion = e.fechaDatacion ?? local?.fechaEntrega ?? null;
      const dotado = fechaDotacion != null || equipos.length > 0;
      const estudiantes = e.inscritos2026 ?? e.estudiantesInscritos ?? 0;

      return {
        id: e.id,
        nombreEscuela: e.nombre,
        codigoEscuela: e.codigoMineduc,
        departamento: { nombre: e.departamento?.nombre ?? '' },
        municipio: { nombre: e.municipio?.nombre ?? '' },

        poseeConectividad: e.poseeConectividad ?? false,
        velocidadConectividad: e.velocidadConectividad,
        fechaConectividad: e.fechaConectividad,
        empresaInternet: e.empresaConectividad?.nombre ?? local?.internet?.empresa ?? null,

        dotado,
        fechaDatacion: fechaDotacion,
        equipos,
        cantidadEquipos: equipos.length,

        inscritos2026: estudiantes,
        cantidadHombres: e.cantidadHombres ?? 0,
        cantidadMujeres: e.cantidadMujeres ?? 0,

        telefono: e.telefono,
        correoElectronico: e.correoElectronico,
        direccion: e.direccion,
        latitud: e.latitud,
        longitud: e.longitud,
        nivel: Array.isArray(e.nivel) ? e.nivel.join(', ') : e.nivel,
        jornada: local?.jornada ?? null,
        opf: e.opf,
      };
    });

    // Desglose de modelos: cuántas unidades de cada modelo se han dotado.
    const conteoModelos = new Map();
    for (const escuela of escuelas) {
      for (const equipo of escuela.equipos) {
        const clave = `${equipo.tipo}||${equipo.modelo}`;
        const actual = conteoModelos.get(clave);
        if (actual) actual.cantidad += 1;
        else conteoModelos.set(clave, { tipo: equipo.tipo, modelo: equipo.modelo, cantidad: 1 });
      }
    }
    const modelosEquipos = [...conteoModelos.values()].sort((a, b) => b.cantidad - a.cantidad);

    const dotadas = escuelas.filter((e) => e.dotado);

    return res.status(200).json({
      establecimientos: escuelas.length,
      totalEstudiantes: escuelas.reduce((a, e) => a + e.inscritos2026, 0),
      totalHombres: escuelas.reduce((a, e) => a + e.cantidadHombres, 0),
      totalMujeres: escuelas.reduce((a, e) => a + e.cantidadMujeres, 0),

      establecimientosDotados: dotadas.length,
      totalEquipos: escuelas.reduce((a, e) => a + e.cantidadEquipos, 0),
      estudiantesDotados: dotadas.reduce((a, e) => a + e.inscritos2026, 0),
      modelosEquipos,

      totalInternet: escuelas.filter((e) => e.poseeConectividad).length,

      escuelas,
    });

  } catch (error) {
    console.error('[Dashboard] Error:', error.message);
    return res.status(200).json({ ...EMPTY_RESPONSE, _warning: error.message });
  }
};
