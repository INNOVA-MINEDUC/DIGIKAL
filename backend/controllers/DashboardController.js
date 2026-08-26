import axios from 'axios';
import https from 'https';
import { Op } from 'sequelize';
import '../models/Relations.js';
import Escuela from '../models/Escuela.js';
import Dotacion from '../models/Dotacion.js';
import Equipo from '../models/Equipo.js';
import ModeloEquipo from '../models/ModeloEquipo.js';
import TipoEquipo from '../models/TipoEquipo.js';
import Internet from '../models/Internet.js';
import DotacionImagen from '../models/DotacionImagen.js';
import Acta from '../models/Acta.js';
import { resolverUrl } from '../services/bucketService.js';
import { errorServidor } from '../utils/http.js';
import logger from '../utils/logger.js';

// URL y token del API MDM configurables por entorno. Por defecto apuntan al
// dev público; para usar un backend local con el campo `inventario`, definir
// MDM_GRAPHQL_URL (y opcionalmente MDM_PUBLIC_TOKEN) en el .env.
const GRAPHQL_URL  = process.env.MDM_GRAPHQL_URL;
const PUBLIC_TOKEN = process.env.MDM_PUBLIC_TOKEN;
const TIMEOUT_MS   = 30_000;
const MAX_RETRIES  = 4;

// Traer todas las escuelas son ~23 peticiones seguidas; el API MDM corta la
// conexión (ECONNRESET) si se le abren muchas conexiones nuevas muy rápido.
// Un agente con keep-alive reutiliza la conexión y reduce esos cortes.
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 3 });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Los dos endpoints del MINEDUC son complementarios: `api-mdm` tiene la lista
// (`establecimientos`) pero NO el campo `inventario`; `api-ayuda` tiene
// `establecimiento(id).inventario` pero NO la lista. Los IDs coinciden entre
// ambos, así que el detalle se consulta contra el de ayuda.
const AYUDA_GRAPHQL_URL = process.env.AYUDA_GRAPHQL_URL;

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
  nivelesDistribucion: [],
  paginacion: { pagina: 1, tamanoPagina: 10, total: 0, totalPaginas: 1 },
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

// Valores canónicos del sistema (enum NivelEstablecimiento del API MDM).
const NIVELES_CANONICOS = ['PRE_PRIMARIA', 'PRIMARIA', 'BASICO', 'DIVERSIFICADO'];

// Normaliza cualquier grafía de nivel al valor del sistema. Acepta el array
// que devuelve el API (["DIVERSIFICADO"]) o el string local ("Ciclo Básico").
// Devuelve un array de niveles canónicos (una escuela puede tener varios).
const normalizeNiveles = (value) => {
  if (value == null) return [];
  const partes = Array.isArray(value) ? value : String(value).split(/[,;/]+/);
  const encontrados = new Set();

  for (const parte of partes) {
    const base = String(parte).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    if (!base.trim()) continue;

    if (/pre[\s_-]*primari|parvul|inicial|pre[\s_-]*escolar/.test(base)) encontrados.add('PRE_PRIMARIA');
    const sinPre = base.replace(/pre[\s_-]*primari\w*/g, ' ');
    if (/primari/.test(sinPre)) encontrados.add('PRIMARIA');
    if (/basic/.test(base)) encontrados.add('BASICO');
    if (/diversific|bachiller/.test(base)) encontrados.add('DIVERSIFICADO');
  }

  return NIVELES_CANONICOS.filter((n) => encontrados.has(n));
};

const gqlPost = async (query, url = GRAPHQL_URL, variables = undefined) => {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await axios.post(
        url,
        { query, variables },
        {
          headers: { 'Content-Type': 'application/json', publicToken: PUBLIC_TOKEN },
          timeout: TIMEOUT_MS,
          httpsAgent,
          validateStatus: () => true,
        }
      );
    } catch (err) {
      lastErr = err;
      // `read ECONNRESET` a veces llega sin code; se detecta por el mensaje.
      const msg = String(err.message || '');
      const retryable =
        ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT'].includes(err.code) ||
        /ECONNRESET|socket hang up|timeout/i.test(msg);
      if (!retryable || attempt === MAX_RETRIES) break;
      // Backoff creciente: 0.6s, 1.2s, 1.8s…
      await sleep(attempt * 600);
    }
  }
  throw lastErr;
};

const gqlData = async (query, url = GRAPHQL_URL, variables = undefined) => {
  const res = await gqlPost(query, url, variables);
  if (res.status >= 400) {
    throw new Error(`API MDM status ${res.status}: ${JSON.stringify(res.data).slice(0, 200)}`);
  }
  if (res.data?.errors) {
    throw new Error(`GraphQL: ${res.data.errors.map((e) => e.message).join('; ')}`);
  }
  return res.data?.data;
};

/* ── Ubicaciones (departamentos/municipios) para traducir ids ↔ nombres ───
   estadisticasEstablecimientos (api-ayuda) sólo devuelve departamentoId y
   municipioId; los nombres se toman de estas tablas de referencia del api-mdm,
   que sí las expone. Se cargan una vez y se cachean. */

let ubicacionesCache = null;

const cargarUbicaciones = async () => {
  if (ubicacionesCache) return ubicacionesCache;

  const [dd, mm] = await Promise.all([
    gqlData(`query { departamentos(filtro: { tamanoPagina: 50 }) { id nombre } }`),
    gqlData(`query { municipios(filtro: { tamanoPagina: 600 }) { id nombre departamentoId } }`),
  ]);

  const deptNombrePorId = new Map();
  const deptIdPorNombre = new Map();
  for (const d of dd?.departamentos || []) {
    deptNombrePorId.set(d.id, d.nombre);
    deptIdPorNombre.set(norm(d.nombre), d.id);
  }

  const muniNombrePorId = new Map();
  const muniPorDept = new Map(); // deptId -> [{ norm, id }]
  for (const m of mm?.municipios || []) {
    muniNombrePorId.set(m.id, m.nombre);
    if (!muniPorDept.has(m.departamentoId)) muniPorDept.set(m.departamentoId, []);
    muniPorDept.get(m.departamentoId).push({ norm: norm(m.nombre), id: m.id });
  }

  ubicacionesCache = { deptNombrePorId, deptIdPorNombre, muniNombrePorId, muniPorDept };
  return ubicacionesCache;
};

// El mapa manda nombres del GeoJSON (a veces cortos): "chichicastenango" ⊂
// "santo tomas chichicastenango". Se resuelve el municipio a su id para poder
// filtrar la lista localmente (estadisticasEstablecimientos sólo filtra por
// departamento).
const resolverMuniId = (ubic, deptName, muniName) => {
  const deptId = ubic.deptIdPorNombre.get(norm(deptName));
  if (deptId == null) return null;
  const lista = ubic.muniPorDept.get(deptId) || [];
  const busq = norm(muniName);
  if (!busq) return null;

  let hit = lista.find((m) => m.norm === busq);
  if (!hit) hit = lista.find((m) => m.norm.includes(busq));
  if (!hit) hit = lista.find((m) => busq.includes(m.norm) && m.norm.length >= 4);
  return hit?.id ?? null;
};

/* ── Establecimientos del API de ayuda (estadisticasEstablecimientos) ──────
   Una sola llamada devuelve los totales del país (o del departamento filtrado)
   y la lista completa. El filtro es por NOMBRE de departamento. Los campos por
   escuela vienen en su mayoría null: el detalle rico está en establecimiento(id). */
const AYUDA_LISTA_FIELDS = `
  id nombre codigoMineduc
  departamentoId municipioId
  poseeConectividad velocidadConectividad fechaConexion fechaDatacion
  inscritos2026 estudiantesInscritos cantidadHombres cantidadMujeres
  telefono correoElectronico latitud longitud opf dotado
  empresaConectividadId tipoConectividadId
  empresaConectividad { id nombre }
`;

/**
 * Trae una página de establecimientos del api-ayuda.
 *
 * El API pagina en el servidor (pagina/tamanoPagina) y filtra por NOMBRE de
 * departamento y de municipio. `totalEstablecimientos` es el total global del
 * filtro (no de la página), así que sirve para armar el paginador.
 * `empresaConectividad { id nombre }` da el proveedor de internet directo del
 * API, sin depender de la BD local.
 *
 * Todos los filtros booleanos usan la misma convención: null = no filtrar (ojo,
 * no es lo mismo que false, que traería sólo los que NO cumplen).
 *   - `intervenida`: por defecto true (sólo intervenidos); null trae todos.
 *   - `dotado` / `conectividad`: null salvo que la tabla los active.
 *   - `codigoMineduc` (String; null = no filtrar).
 *
 * Nota: entre los intervenidos, todos están dotados y conectados, así que esos
 * dos filtros sólo cambian el resultado cuando `intervenida` está apagado.
 */
const fetchDesdeAyuda = async ({
  dept = null,
  muni = null,
  intervenida = false,
  dotado = null,
  conectividad = null,
  codigoMineduc = null,
  pagina = 1,
  tamanoPagina = 10,
} = {}) => {
  const data = await gqlData(
    `query($departamento: String, $municipio: String, $intervenida: Boolean, $dotado: Boolean, $conectividad: Boolean, $codigoMineduc: String, $pagina: Int, $tamanoPagina: Int) {
      estadisticasEstablecimientos(filtro: {
        intervenida: $intervenida
        departamento: $departamento
        municipio: $municipio
        dotado: $dotado
        conectividad: $conectividad
        codigoMineduc: $codigoMineduc
        pagina: $pagina
        tamanoPagina: $tamanoPagina
      }) {
        totalEstablecimientos totalEstudiantesInscritos2026 totalHombres totalMujeres
        establecimientos { ${AYUDA_LISTA_FIELDS} }
      }
    }`,
    AYUDA_GRAPHQL_URL,
    {
      departamento: dept ?? null,
      municipio: muni ?? null,
      intervenida: intervenida ?? null,
      dotado: dotado ?? null,
      conectividad: conectividad ?? null,
      codigoMineduc: codigoMineduc ?? null,
      pagina,
      tamanoPagina,
    }
  );
  return data?.estadisticasEstablecimientos || null;
};

// Conservado sólo por si se necesita el fetch paginado del api-mdm en el futuro.
const ESTABLECIMIENTO_FIELDS = `
  id nombre codigoMineduc
  poseeConectividad velocidadConectividad fechaConexion
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

    // Respiro entre páginas: el API resetea la conexión si se le piden muchas
    // páginas seguidas sin pausa.
    await sleep(150);
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
    attributes: ['id', 'codigoEscuela', 'jornada', 'nivel'],
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

    porCodigo.set(escuela.codigoEscuela, {
      equipos, fechaEntrega, internet,
      jornada: escuela.jornada,
      nivel: escuela.nivel,
    });
  }

  return porCodigo;
};

/* ── Handler ────────────────────────────────────────────────────────────── */

// Paginación server-side. Límites defensivos: el API resetea la conexión con
// páginas enormes, así que se topa el tamaño.
const PAGINA_DEFAULT = 1;
const TAMANO_DEFAULT = 10;
const TAMANO_MAX = 500;

const aEntero = (valor, porDefecto) => {
  const n = Number.parseInt(valor, 10);
  return Number.isFinite(n) ? n : porDefecto;
};

const clampPagina = (valor) => Math.max(1, aEntero(valor, PAGINA_DEFAULT));
const clampTamano = (valor) =>
  Math.min(TAMANO_MAX, Math.max(1, aEntero(valor, TAMANO_DEFAULT)));

// Filtros booleanos de la tabla: sólo se aplican cuando vienen en true. Un
// false o ausente => null (no filtrar), para no traer justo lo contrario.
const soloSiTrue = (valor) => (valor === true ? true : null);

// Código MINEDUC: se limpia y, si queda vacío, no filtra.
const limpiarCodigo = (valor) => {
  const texto = (valor ?? '').toString().trim();
  return texto ? texto : null;
};

// ── Caché en memoria del conjunto filtrado ──────────────────────────────────
// Traer todo el universo del filtro (con "todos" son ~11 mil establecimientos)
// + join local + mapear es la parte cara (~9 s). Se guarda por clave de filtro
// durante un tiempo corto, así la primera carga es el único costo y las páginas
// y búsquedas siguientes salen al instante. Se limita el tamaño para no crecer.
const CACHE_TTL_MS = 60_000;
const CACHE_MAX = 30;
const cacheDashboard = new Map(); // clave -> { ts, valor }

const leerCacheDashboard = (clave) => {
  const hit = cacheDashboard.get(clave);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL_MS) {
    cacheDashboard.delete(clave);
    return null;
  }
  return hit.valor;
};

const guardarCacheDashboard = (clave, valor) => {
  // Poda simple: al llenarse, se borra la entrada más antigua.
  if (cacheDashboard.size >= CACHE_MAX) {
    const primera = cacheDashboard.keys().next().value;
    if (primera !== undefined) cacheDashboard.delete(primera);
  }
  cacheDashboard.set(clave, { ts: Date.now(), valor });
};

export const getEscuelasDotadas = async (req, res) => {
  try {
    const { dept, muni } = req.body || {};
    const pagina = clampPagina(req.body?.pagina);
    const tamanoPagina = clampTamano(req.body?.tamanoPagina);
    // Por defecto sólo intervenidos; la tabla puede apagarlo para ver todos.
    const intervenida = req.body?.intervenida === undefined ? true : soloSiTrue(req.body?.intervenida);
    const dotado = soloSiTrue(req.body?.dotado);
    const conectividad = soloSiTrue(req.body?.conectividad);
    const codigoMineduc = limpiarCodigo(req.body?.codigoMineduc);
    // Búsqueda por nombre: el API no la soporta, se filtra en memoria.
    const busqueda = (req.body?.busqueda ?? '').toString().trim().toLowerCase();

    // Tablas de referencia para traducir ids ↔ nombres (no debe tumbar todo si
    // falla el api-mdm de referencia).
    let ubic = null;
    try {
      ubic = await cargarUbicaciones();
    } catch (refErr) {
      logger.error('[Dashboard] No se pudieron cargar ubicaciones de referencia:', refErr.message);
    }

    // El municipio del GeoJSON puede venir con otra grafía que la del API. Se
    // resuelve al nombre canónico de la tabla de referencia para poder empujar
    // el filtro al API (y que la paginación sea correcta). Si no se resuelve, se
    // pagina el departamento completo, como antes.
    let muniNombre = null;
    if (muni && dept) {
      if (ubic) {
        const muniId = resolverMuniId(ubic, dept, muni);
        muniNombre = muniId != null ? (ubic.muniNombrePorId.get(muniId) ?? null) : null;
      }
      if (!muniNombre) {
        // `muni` llega en el cuerpo de una ruta pública: va como argumento y no
        // dentro de la cadena de formato, para que no pueda colar %s y falsear
        // el resto de la línea del log.
        logger.warn('[Dashboard] Municipio no resuelto: "%s" — se pagina el departamento completo', muni);
      }
    }

    // El conjunto completo mapeado se cachea por clave de filtro (sin paginación
    // ni búsqueda, que se aplican en memoria más abajo).
    const claveCache = JSON.stringify({
      dept: dept ?? null,
      muni: muniNombre,
      intervenida,
      dotado,
      conectividad,
      codigoMineduc,
    });
    let cache = leerCacheDashboard(claveCache);

    if (!cache) {
      // Se trae el conjunto COMPLETO del filtro (sin paginar: pagina/tamanoPagina
      // en null). Así los KPIs (establecimientos, dotados, conectados, estudiantes)
      // se calculan sobre todo el universo filtrado y son consistentes entre sí,
      // en vez de reflejar sólo la página visible. La paginación de la tabla se
      // hace luego en memoria.
      const stats = await fetchDesdeAyuda({
        dept,
        muni: muniNombre,
        intervenida,
        dotado,
        conectividad,
        codigoMineduc,
        pagina: null,
        tamanoPagina: null,
      });
      const lista = stats?.establecimientos || [];

      // La BD local puede estar caída o vacía: no debe tumbar los datos del API.
      let dotacionesLocales = new Map();
      try {
        const codigos = lista.map((e) => e.codigoMineduc).filter(Boolean);
        dotacionesLocales = await getDotacionesPorCodigo(codigos);
      } catch (dbErr) {
        logger.error('[Dashboard] No se pudieron leer dotaciones locales:', dbErr.message);
      }

      const mapeadas = lista.map((e) => {
      const local = dotacionesLocales.get(e.codigoMineduc);
      const equipos = local?.equipos ?? [];
      const fechaDotacion = e.fechaDatacion ?? local?.fechaEntrega ?? null;
      // El API de ayuda ya trae `dotado`; se combina con la señal local.
      const dotado = Boolean(e.dotado) || fechaDotacion != null || equipos.length > 0;
      const estudiantes = e.inscritos2026 ?? e.estudiantesInscritos ?? 0;

      const niveles = local?.nivel ? normalizeNiveles(local.nivel) : [];

      return {
        id: e.id,
        nombreEscuela: e.nombre,
        codigoEscuela: e.codigoMineduc,
        // estadisticasEstablecimientos sólo da los ids; el nombre viene de la
        // tabla de referencia.
        departamento: { nombre: ubic?.deptNombrePorId.get(e.departamentoId) ?? '' },
        municipio: { nombre: ubic?.muniNombrePorId.get(e.municipioId) ?? '' },

        poseeConectividad: e.poseeConectividad ?? false,
        velocidadConectividad: e.velocidadConectividad,
        fechaConectividad: e.fechaConexion,
        // El proveedor sale directo del API; la BD local queda como respaldo.
        empresaInternet: e.empresaConectividad?.nombre ?? local?.internet?.empresa ?? null,
        empresaConectividad: e.empresaConectividad ?? null,
        empresaConectividadId: e.empresaConectividadId ?? null,
        tipoConectividadId: e.tipoConectividadId ?? null,

        dotado,
        fechaDatacion: fechaDotacion,
        equipos,
        cantidadEquipos: equipos.length,

        inscritos2026: estudiantes,
        cantidadHombres: e.cantidadHombres ?? 0,
        cantidadMujeres: e.cantidadMujeres ?? 0,

        telefono: e.telefono,
        correoElectronico: e.correoElectronico,
        direccion: null,
        latitud: e.latitud,
        longitud: e.longitud,
        nivel: niveles.join(', '),
        niveles,
        jornada: local?.jornada ?? null,
        opf: e.opf,
      };
      });

      cache = {
        escuelasMapeadas: mapeadas,
        totalEstudiantesApi: stats?.totalEstudiantesInscritos2026 ?? null,
        totalHombresApi: stats?.totalHombres ?? 0,
        totalMujeresApi: stats?.totalMujeres ?? 0,
      };
      guardarCacheDashboard(claveCache, cache);
    }

    const escuelasMapeadas = cache.escuelasMapeadas;

    // Búsqueda por nombre (en memoria, porque el API no la soporta). Todos los
    // KPIs y la paginación de abajo trabajan ya sobre este conjunto filtrado.
    const escuelas = busqueda
      ? escuelasMapeadas.filter((e) => (e.nombreEscuela || '').toLowerCase().includes(busqueda))
      : escuelasMapeadas;

    // Desglose por nivel educativo: cuántos establecimientos hay en cada nivel.
    // Una escuela con varios niveles cuenta en cada uno.
    const conteoNiveles = new Map();
    for (const escuela of escuelas) {
      const nivelesEsc = escuela.niveles.length ? escuela.niveles : ['SIN_NIVEL'];
      for (const nivel of nivelesEsc) {
        conteoNiveles.set(nivel, (conteoNiveles.get(nivel) || 0) + 1);
      }
    }
    const ETIQUETAS_NIVEL = {
      PRE_PRIMARIA: 'Pre-primaria',
      PRIMARIA: 'Primaria',
      BASICO: 'Básico',
      DIVERSIFICADO: 'Diversificado',
      SIN_NIVEL: 'Sin nivel',
    };
    const ordenNivel = [...NIVELES_CANONICOS, 'SIN_NIVEL'];
    const nivelesDistribucion = ordenNivel
      .filter((n) => conteoNiveles.has(n))
      .map((n) => ({ nivel: n, etiqueta: ETIQUETAS_NIVEL[n] || n, cantidad: conteoNiveles.get(n) }));

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

    // Todos los KPIs se calculan sobre el conjunto COMPLETO del filtro, así que
    // son consistentes entre sí y no cambian al pasar de página.
    const total = escuelas.length;
    const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina));

    // El total de estudiantes: si no hay búsqueda por nombre, se usa el total
    // exacto del API; con búsqueda se suma sobre el subconjunto encontrado.
    const estudiantesSuma = escuelas.reduce((a, e) => a + (e.inscritos2026 || 0), 0);
    const totalEstudiantes = busqueda ? estudiantesSuma : (cache.totalEstudiantesApi ?? estudiantesSuma);

    // Página para la tabla: se corta en memoria y se numera con un correlativo
    // continuo (1, 2, 3… a través de las páginas).
    const inicio = (pagina - 1) * tamanoPagina;
    const escuelasPagina = escuelas
      .slice(inicio, inicio + tamanoPagina)
      .map((e, i) => ({ ...e, correlativo: inicio + i + 1 }));

    return res.status(200).json({
      establecimientos: total,
      totalEstudiantes,
      totalHombres: cache.totalHombresApi ?? 0,
      totalMujeres: cache.totalMujeresApi ?? 0,

      establecimientosDotados: dotadas.length,
      totalEquipos: escuelas.reduce((a, e) => a + e.cantidadEquipos, 0),
      estudiantesDotados: dotadas.reduce((a, e) => a + e.inscritos2026, 0),
      modelosEquipos,
      nivelesDistribucion,
      totalInternet: escuelas.filter((e) => e.poseeConectividad).length,

      paginacion: { pagina, tamanoPagina, total, totalPaginas },

      escuelas: escuelasPagina,
    });

  } catch (error) {
    // Esta ruta es pública: `_warning` llevaba el mensaje de error interno
    // (fallos de Sequelize o del API del MINEDUC) a cualquier visitante. Se
    // conserva el aviso para que el front sepa que los datos vienen vacíos,
    // pero sin contar por qué.
    logger.error('[Dashboard] Error:', error);
    return res.status(200).json({
      ...EMPTY_RESPONSE,
      _warning: 'No fue posible obtener los datos en este momento.',
    });
  }
};

/* ── Detalle de un establecimiento + su inventario ──────────────────────────
   Corre la query establecimiento(id) contra MDM_GRAPHQL_URL. El campo
   `inventario` sólo existe en la versión nueva del API (backend local); si el
   endpoint configurado no lo tiene, se reintenta sin inventario para al menos
   devolver los datos del establecimiento.                                     */

const ESTABLECIMIENTO_DETALLE_FIELDS = `
  id nombre codigoMineduc
  cantidadHombres cantidadMujeres estudiantesInscritos inscritos2026
  correoElectronico telefono opf
  departamentoId municipioId
  poseeConectividad velocidadConectividad fechaConexion fechaDatacion
  empresaConectividadId tipoConectividadId
  latitud longitud
`;

const INVENTARIO_FIELDS = `
  inventario {
    id nombre marca modelo serie sicoin estado valor
    tipoId origenId encargadoId propietarioId establecimientoId
    creadoPorId editadoPorId fechaCreacion fechaEdicion atributosExtra
  }
`;

/**
 * Dotaciones registradas localmente para un código MINEDUC, con las fotos de
 * evidencia y las actas ya resueltas a URL abrible.
 *
 * `resolverUrl` traduce lo que hay en la base a algo que el navegador entiende:
 * las direcciones del bucket se devuelven tal cual y las del respaldo local
 * (prefijo `local:`) se convierten en la ruta /uploads correspondiente.
 *
 * Si algo falla aquí NO se rompe la ficha: se devuelve una lista vacía y el
 * establecimiento se muestra igual, sólo que sin evidencia.
 */
const dotacionesLocalesDe = async (codigoMineduc) => {
  if (!codigoMineduc) return [];

  try {
    const escuela = await Escuela.findOne({
      where: { codigoEscuela: codigoMineduc },
      include: [{
        model: Dotacion,
        as: 'dotaciones',
        include: [
          { model: DotacionImagen, as: 'imagenes' },
          { model: Acta, as: 'actas' },
        ],
      }],
      order: [[{ model: Dotacion, as: 'dotaciones' }, 'fecha_entrega', 'DESC']],
    });

    if (!escuela) return [];

    return (escuela.toJSON().dotaciones || []).map((d) => ({
      id: d.id,
      fecha_entrega: d.fecha_entrega,
      origen: d.origen,
      descripcion: d.descripcion,

      imagenes: (d.imagenes || [])
        .map((img) => ({ id: img.id, url: resolverUrl(img.url) }))
        .filter((img) => img.url),

      actas: (d.actas || []).map((a) => ({
        id: a.id,
        no_acta: a.no_acta,
        fecha_entrega: a.fecha_entrega,
        origen: a.origen,
        url: resolverUrl(a.acta_pdf),
      })),
    }));
  } catch (error) {
    logger.error('[Dashboard] No se pudieron leer las dotaciones locales:', error);
    return [];
  }
};

export const getEstablecimientoDetalle = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'id de establecimiento inválido' });
  }

  const buildDetalleQuery = (conInventario) => `
    query {
      establecimiento(id: ${id}) {
        ${ESTABLECIMIENTO_DETALLE_FIELDS}
        ${conInventario ? INVENTARIO_FIELDS : ''}
      }
    }
  `;

  try {
    // El inventario vive en el endpoint de ayuda; el detalle se consulta ahí.
    // Si por lo que sea ese endpoint no expone `inventario`, se reintenta sin
    // él contra el endpoint principal para al menos mostrar el establecimiento.
    let data;
    let sinInventario = false;
    try {
      data = await gqlData(buildDetalleQuery(true), AYUDA_GRAPHQL_URL);
    } catch (errConInv) {
      if (/inventario/i.test(errConInv.message)) {
        logger.warn('[Dashboard] El endpoint de ayuda no expone `inventario`; se devuelve el establecimiento sin inventario.');
        sinInventario = true;
        data = await gqlData(buildDetalleQuery(false));
      } else {
        throw errConInv;
      }
    }

    const est = data?.establecimiento;
    if (!est) {
      return res.status(404).json({ message: `No se encontró el establecimiento con id ${id}` });
    }

    /* Las fotos de evidencia y las actas NO están en el API del MINEDUC: se
       registran en este sistema y viven en la base local. El enlace entre
       ambos mundos es el código MINEDUC (escuelas.codigoEscuela). Sin esto la
       ficha del establecimiento mostraba el inventario pero ninguna evidencia,
       que sólo se veía en la vista de Dotaciones. */
    const dotaciones = await dotacionesLocalesDe(est.codigoMineduc);

    return res.status(200).json({
      establecimiento: {
        ...est,
        inventario: est.inventario || [],
        dotaciones,
        // Atajo para la galería: todas las fotos de todas las dotaciones del
        // establecimiento, ya con su URL resuelta.
        imagenes: dotaciones.flatMap((d) => d.imagenes),
      },
      _sinInventario: sinInventario || undefined,
    });
  } catch (error) {
    // El detalle del error se queda en el log: si el API del MINEDUC devuelve
    // un mensaje con su estructura interna, no tiene por qué llegar al cliente.
    return errorServidor(
      res,
      '[Dashboard] detalle establecimiento',
      error,
      'Error al consultar el establecimiento en el API',
      502
    );
  }
};
