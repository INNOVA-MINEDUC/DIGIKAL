import { QueryTypes } from 'sequelize';
import tabletsDb, { tabletsDbConfigurada } from '../config/tabletsDb.js';
import { errorServidor, errorValidacion } from '../utils/http.js';

/**
 * Servicio "Ciudadanía Digital" — consulta de las tablets entregadas.
 *
 * LEE la base `tablets`, que es de otro sistema (ver config/tabletsDb.js): la
 * alimenta el proceso que procesa los archivos que envían las OPF. Aquí SOLO
 * se consulta; no hay altas, bajas ni modificaciones.
 *
 * De dónde sale cada cosa:
 *   - `dispositivos`           → una fila por tablet de ESTUDIANTE
 *   - `dispositivos_docentes`  → una fila por tablet de DOCENTE (puede traer
 *                                una segunda serie en `serie_2`)
 *   - `establecimientos`       → catálogo: nombre, departamento y municipio
 * Las dos tablas de dispositivos se unen con UNION ALL porque, para esta
 * vista, una tablet es una tablet sin importar a quién se entregó.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DATOS PERSONALES — no se devuelven nunca
 * ═══════════════════════════════════════════════════════════════════════════
 * Estas tablas guardan nombre del beneficiario, nombre y CUI del tutor y
 * teléfono, y las consultas de esta vista son PÚBLICAS (sin token). Por eso
 * las respuestas se quedan a nivel de EQUIPO y ESTABLECIMIENTO: serie, marca,
 * modelo, estado y a qué centro educativo pertenece. Nada que identifique a
 * una persona. Tampoco se expone `observaciones`, que es texto libre escrito
 * por cada OPF y puede contener cualquier cosa.
 * Si en el futuro hace falta el detalle por persona, tiene que ir en un
 * endpoint aparte, detrás de autenticación y con su propia justificación.
 */

/** Normaliza como el frontend y el mapa: minúsculas y sin tildes. */
const norm = (s) => String(s ?? '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .trim();

/**
 * Escapa los comodines de LIKE en lo que escribe el usuario. Sin esto, buscar
 * «%» devolvería la base entera y «_» casaría con cualquier carácter.
 */
const escaparLike = (s) => String(s ?? '').replace(/[\\%_]/g, (c) => `\\${c}`);

/** Sin credenciales configuradas la vista sigue en pie, pero vacía. */
const sinBaseDeTablets = (res, contexto) => {
  console.error(`[Ciudadania] ${contexto}: faltan las credenciales TABLETS_DB_* en .env`);
  return res.status(503).json({ message: 'El servicio de tablets no está disponible en este momento' });
};

/**
 * Une las dos tablas de dispositivos en una sola lista de tablets.
 * `serie_2` va como fila aparte: es un segundo equipo, no un duplicado.
 */
const TABLETS_UNIDAS = `
  SELECT cod_estab_reportado AS cod, 'estudiante' AS tipo, serie,
         marca, modelo, estado_registro, cargado_en
    FROM dispositivos
   WHERE TRIM(COALESCE(serie, '')) <> ''
  UNION ALL
  SELECT cod_estab_reportado, 'docente', serie,
         marca, modelo, estado_registro, cargado_en
    FROM dispositivos_docentes
   WHERE TRIM(COALESCE(serie, '')) <> ''
  UNION ALL
  SELECT cod_estab_reportado, 'docente', serie_2,
         marca, modelo, estado_registro, cargado_en
    FROM dispositivos_docentes
   WHERE TRIM(COALESCE(serie_2, '')) <> ''
`;

/** KPIs, ranking y datos del mapa. */
export const getResumen = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'getResumen');

  try {
    const [totales] = await tabletsDb.query(
      `SELECT COUNT(*) AS totalTablets,
              COUNT(DISTINCT cod) AS totalEstablecimientos
         FROM (${TABLETS_UNIDAS}) t`,
      { type: QueryTypes.SELECT }
    );

    // El nombre del departamento se devuelve en minúsculas porque la vista lo
    // presenta con `text-capitalize`; en la base viene en mayúsculas.
    const porDepartamento = await tabletsDb.query(
      `SELECT LOWER(e.departamento) AS departamento, COUNT(*) AS cantidad
         FROM (${TABLETS_UNIDAS}) t
         JOIN establecimientos e ON e.codigo = t.cod
        WHERE TRIM(COALESCE(e.departamento, '')) <> ''
        GROUP BY LOWER(e.departamento)
        ORDER BY cantidad DESC`,
      { type: QueryTypes.SELECT }
    );

    const ranking = porDepartamento.map((d) => ({
      departamento: d.departamento,
      cantidad: Number(d.cantidad),
    }));

    return res.status(200).json({
      totalTablets: Number(totales?.totalTablets || 0),
      totalEstablecimientos: Number(totales?.totalEstablecimientos || 0),
      departamentoTop: ranking[0] || null,
      porDepartamento: ranking,
    });
  } catch (error) {
    return errorServidor(res, '[Ciudadania] getResumen', error, 'Error al obtener el resumen de Ciudadanía Digital');
  }
};

/**
 * ¿A qué establecimiento pertenece esta serie?
 *
 * Devuelve SIEMPRE 200: `{ pertenece: true|false }`. Que una serie no esté
 * registrada es información válida sobre esa tablet, no un error de la
 * petición.
 */
export const buscarPorSerie = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'buscarPorSerie');

  try {
    const serie = String(req.params.numeroSerie ?? '').trim();
    if (!serie) return errorValidacion(res, 'Debe indicar un número de serie');

    /* Comparación sin distinguir mayúsculas ni espacios en los extremos: las
       series llegan de archivos llenados a mano por cada OPF.

       El segundo criterio no sobra: 67 equipos tienen los DOS IMEI metidos en
       el mismo campo, separados por un espacio ("3503...044 3503...051"). Sin
       esto, quien teclee uno solo de los dos —que es lo que trae la etiqueta
       de la caja— no encontraría su tablet. Se rodea el campo de espacios y se
       busca el número como palabra suelta. */
    const filas = await tabletsDb.query(
      `SELECT t.serie            AS numeroSerie,
              t.tipo             AS tipoBeneficiario,
              t.marca, t.modelo,
              t.estado_registro  AS estadoRegistro,
              t.cargado_en       AS registradaEn,
              t.cod              AS codigoEstablecimiento,
              e.nombre           AS nombreEstablecimiento,
              LOWER(e.departamento) AS departamento,
              LOWER(e.municipio)    AS municipio
         FROM (${TABLETS_UNIDAS}) t
         LEFT JOIN establecimientos e ON e.codigo = t.cod
        WHERE LOWER(TRIM(t.serie)) = :serie
           OR CONCAT(' ', LOWER(TRIM(t.serie)), ' ') LIKE CONCAT('% ', :serieLike, ' %') ESCAPE '\\\\'
        ORDER BY t.cargado_en DESC
        LIMIT 1`,
      {
        replacements: {
          serie: serie.toLowerCase(),
          serieLike: escaparLike(serie.toLowerCase()),
        },
        type: QueryTypes.SELECT,
      }
    );

    return res.status(200).json({
      pertenece: filas.length > 0,
      tablet: filas[0] || null,
    });
  } catch (error) {
    return errorServidor(res, '[Ciudadania] buscarPorSerie', error, 'Error al buscar la tablet');
  }
};

/**
 * Cuántas tablets tiene cada establecimiento (búsqueda por código o nombre).
 * Sólo aparecen los establecimientos que TIENEN tablets registradas.
 *
 * Devuelve CONTEOS, no la lista de series. Son dos motivos:
 *   - es lo que la vista muestra: cuántas fueron a estudiantes y cuántas a
 *     docentes;
 *   - el endpoint es público, y publicar el listado completo de series de un
 *     centro educativo no aporta nada a quien consulta y sí facilita el
 *     trabajo a quien quisiera hacer un inventario ajeno. Para comprobar una
 *     tablet concreta ya está la búsqueda por número de serie.
 */
export const buscarPorEstablecimiento = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'buscarPorEstablecimiento');

  try {
    const q = String(req.query.q ?? '').trim();
    if (!q || q.length < 2) return errorValidacion(res, 'Escriba al menos 2 caracteres para buscar');

    const filas = await tabletsDb.query(
      `SELECT e.codigo              AS codigoEstablecimiento,
              e.nombre              AS nombreEstablecimiento,
              LOWER(e.departamento) AS departamento,
              LOWER(e.municipio)    AS municipio,
              SUM(t.tipo = 'estudiante') AS tabletsEstudiantes,
              SUM(t.tipo = 'docente')    AS tabletsDocentes,
              COUNT(*)                   AS totalTablets
         FROM establecimientos e
         JOIN (${TABLETS_UNIDAS}) t ON t.cod = e.codigo
        WHERE e.codigo LIKE :comodin ESCAPE '\\\\' OR e.nombre LIKE :comodin ESCAPE '\\\\'
        GROUP BY e.codigo, e.nombre, e.departamento, e.municipio
        ORDER BY totalTablets DESC, e.nombre
        LIMIT 100`,
      { replacements: { comodin: `%${escaparLike(q)}%` }, type: QueryTypes.SELECT }
    );

    // SUM() vuelve como cadena (DECIMAL) en mysql2: se normaliza a número para
    // que la vista pueda sumarlos sin concatenarlos por error.
    const resultados = filas.map((f) => ({
      codigoEstablecimiento: f.codigoEstablecimiento,
      nombreEstablecimiento: f.nombreEstablecimiento,
      departamento: f.departamento,
      municipio: f.municipio,
      tabletsEstudiantes: Number(f.tabletsEstudiantes) || 0,
      tabletsDocentes: Number(f.tabletsDocentes) || 0,
      totalTablets: Number(f.totalTablets) || 0,
    }));

    return res.status(200).json({ resultados });
  } catch (error) {
    return errorServidor(res, '[Ciudadania] buscarPorEstablecimiento', error, 'Error al buscar por establecimiento');
  }
};

/** Listado paginado para el personal con sesión (solo lectura). */
export const listarTablets = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'listarTablets');

  try {
    const pagina = Math.max(parseInt(req.query.pagina, 10) || 1, 1);
    const tamanoPagina = Math.min(Math.max(parseInt(req.query.tamanoPagina, 10) || 20, 1), 100);

    const [{ total }] = await tabletsDb.query(
      `SELECT COUNT(*) AS total FROM (${TABLETS_UNIDAS}) t`,
      { type: QueryTypes.SELECT }
    );

    const filas = await tabletsDb.query(
      `SELECT t.serie            AS numeroSerie,
              t.tipo             AS tipoBeneficiario,
              t.marca, t.modelo,
              t.estado_registro  AS estadoRegistro,
              t.cargado_en       AS createdAt,
              t.cod              AS codigoEstablecimiento,
              e.nombre           AS nombreEstablecimiento,
              LOWER(e.departamento) AS departamento,
              LOWER(e.municipio)    AS municipio
         FROM (${TABLETS_UNIDAS}) t
         LEFT JOIN establecimientos e ON e.codigo = t.cod
        ORDER BY t.cargado_en DESC, t.serie
        LIMIT :limite OFFSET :salto`,
      {
        replacements: { limite: tamanoPagina, salto: (pagina - 1) * tamanoPagina },
        type: QueryTypes.SELECT,
      }
    );

    return res.status(200).json({
      data: filas.map((f) => ({ ...f, id: `${f.tipoBeneficiario}-${f.numeroSerie}` })),
      total: Number(total),
      pagina,
      totalPaginas: Math.max(Math.ceil(Number(total) / tamanoPagina), 1),
    });
  } catch (error) {
    return errorServidor(res, '[Ciudadania] listarTablets', error, 'Error al listar las tablets');
  }
};

export { norm };
