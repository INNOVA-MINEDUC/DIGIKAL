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
 *   - `dispositivos_docentes`  → una fila por tablet de DOCENTE (`serie_2` es
 *                                el SEGUNDO IMEI de ese mismo equipo, no otro)
 *   - `entregas`               → una fila por establecimiento que ENTREGÓ su
 *                                archivo: es la lista real de centros
 *                                atendidos, con su departamento y municipio
 *   - `establecimientos`       → catálogo completo (1021 centros): nombre,
 *                                departamento y municipio de cualquier código
 * Las dos tablas de dispositivos se unen con UNION ALL porque, para esta
 * vista, una tablet es una tablet sin importar a quién se entregó. Lo que se
 * CUENTA sale de EQUIPOS y de `entregas`; lo que se BUSCA, de TABLETS_SERIES.
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
 * Una fila por EQUIPO FÍSICO (tablets de estudiantes + de docentes).
 *
 * `serie_2` NO genera fila aquí: en los datos reales es el SEGUNDO IMEI del
 * mismo aparato (los BLACKVIEW TAB 60 PRO son dual-SIM) o el resto de una
 * celda mal partida en el archivo de la OPF ("SIN"/"SERIE", "SN:"/"LPAD…").
 * Contarlo como equipo aparte inflaba los KPIs en 18 tablets inexistentes.
 * Para BUSCAR sí hay que mirar ese campo — eso lo hace TABLETS_SERIES.
 *
 * TAMPOCO se exige que `serie` venga llena. Una fila de `dispositivos` es un
 * equipo entregado a una persona (PK `cod_pers` + `cod_estab_reportado`); que
 * la OPF dejara la casilla de la serie en blanco en su archivo es un dato
 * incompleto, no un equipo inexistente. Filtrar por serie no vacía dejaba
 * fuera 38 tablets reales —33 de ellas de un solo archivo
 * (01-15-0066-46_01.xlsx, TCL)— y hacía que los KPIs mostraran 5 395 donde la
 * tabla tiene 5 433. Esas filas se cuentan y se listan con la serie en NULL,
 * que es como el frontend distingue «sin serie registrada».
 * Para BUSCAR sí hace falta una serie, y ahí TABLETS_SERIES las sigue
 * descartando: no se puede localizar un equipo por un campo vacío.
 *
 * Ésta es la fuente de todo lo que se CUENTA: KPIs, ranking del mapa y
 * conteos por establecimiento.
 *
 * `ref` es la otra mitad de la clave primaria (`cod_pers` en estudiantes,
 * `num_empleado` en docentes). No se devuelve nunca al cliente: sólo sirve
 * para armar un identificador único de fila en el listado, porque la serie ya
 * no vale como identificador (hay 38 vacías y 134 repetidas).
 */
const EQUIPOS = `
  SELECT cod_estab_reportado AS cod, 'estudiante' AS tipo,
         cod_pers                               AS ref,
         NULLIF(TRIM(COALESCE(serie, '')), '')  AS serie,
         NULL                                   AS serie_2,
         marca, modelo, estado_registro, cargado_en
    FROM dispositivos
  UNION ALL
  SELECT cod_estab_reportado, 'docente',
         num_empleado,
         NULLIF(TRIM(COALESCE(serie, '')), ''),
         NULLIF(TRIM(COALESCE(serie_2, '')), ''),
         marca, modelo, estado_registro, cargado_en
    FROM dispositivos_docentes
`;

/**
 * Una fila por NÚMERO DE SERIE buscable — aquí sí entra `serie_2`, porque
 * quien teclea el IMEI de la etiqueta puede traer cualquiera de los dos.
 * Sólo para localizar equipos; nunca para contarlos (ver EQUIPOS).
 */
const TABLETS_SERIES = `
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

/**
 * KPIs, ranking y datos del mapa — todo sale de la base, nada está fijo.
 *
 * Cada cifra viene de la tabla que la registra de verdad:
 *
 *   «Establecimientos con entrega» → `entregas`, UNA fila por centro que
 *      efectivamente entregó su archivo (PK `cod_estab`). NO se cuenta
 *      `COUNT(DISTINCT cod_estab_reportado)` de los dispositivos, que es lo
 *      que se hacía antes y daba 3 centros de más: por un lado cuenta
 *      códigos que aparecen sólo porque el archivo de OTRA OPF reportó
 *      estudiantes con ese código (la columna `otro_estab` de `entregas`),
 *      y por otro se deja fuera a los centros que sí entregaron pero cuyas
 *      filas no cruzaron con la base (`no_en_base`).
 *
 *   «Herramientas registradas» → EQUIPOS: `dispositivos` (estudiantes) +
 *      `dispositivos_docentes` (docentes), un equipo por fila. Se suman las
 *      dos porque también hay tablets asignadas a docentes; el desglose va
 *      aparte en `tabletsEstudiantes` / `tabletsDocentes`.
 *
 *   Mapa y ranking → los mismos equipos, agrupados por el departamento que
 *      trae `entregas` (el del centro que entregó). Sólo se cae al catálogo
 *      `establecimientos` para los pocos códigos reportados que no tienen
 *      fila en `entregas`, y así el ranking sigue sumando el total exacto.
 */
export const getResumen = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'getResumen');

  try {
    /* `dispositivos` (estudiantes) + `dispositivos_docentes` (docentes): hay
       herramientas asignadas a las dos poblaciones, así que el total suma las
       dos tablas. EQUIPOS ya las une con UNION ALL y deja `serie_2` fuera (es
       el segundo IMEI del mismo aparato), así que no se duplica nada.
       COALESCE en los dos parciales por si una de las tablas estuviera vacía:
       SUM() de cero filas devuelve NULL, no 0. */
    const [equipos] = await tabletsDb.query(
      `SELECT COUNT(*) AS totalTablets,
              COALESCE(SUM(t.tipo = 'estudiante'), 0) AS tabletsEstudiantes,
              COALESCE(SUM(t.tipo = 'docente'), 0)    AS tabletsDocentes
         FROM (${EQUIPOS}) t`,
      { type: QueryTypes.SELECT }
    );

    // Establecimientos que entregaron: la tabla `entregas` ya es una fila por
    // centro, así que el total es su número de filas.
    const [entregas] = await tabletsDb.query(
      'SELECT COUNT(*) AS totalEstablecimientos FROM entregas',
      { type: QueryTypes.SELECT }
    );

    // El nombre del departamento se devuelve en minúsculas porque la vista lo
    // presenta con `text-capitalize`; en la base viene en mayúsculas.
    const porDepartamento = await tabletsDb.query(
      `SELECT LOWER(COALESCE(NULLIF(TRIM(en.departamento), ''),
                             NULLIF(TRIM(es.departamento), ''))) AS departamento,
              COUNT(*)                        AS cantidad
         FROM (${EQUIPOS}) t
         LEFT JOIN entregas         en ON en.cod_estab = t.cod
         LEFT JOIN establecimientos es ON es.codigo    = t.cod
        GROUP BY departamento
       HAVING departamento IS NOT NULL
        ORDER BY cantidad DESC`,
      { type: QueryTypes.SELECT }
    );

    const ranking = porDepartamento.map((d) => ({
      departamento: d.departamento,
      cantidad: Number(d.cantidad),
    }));

    return res.status(200).json({
      // SUM() vuelve como cadena (DECIMAL) en mysql2: se normaliza a número
      // para que el frontend no los concatene al mostrarlos.
      totalTablets: Number(equipos?.totalTablets) || 0,
      tabletsEstudiantes: Number(equipos?.tabletsEstudiantes) || 0,
      tabletsDocentes: Number(equipos?.tabletsDocentes) || 0,
      totalEstablecimientos: Number(entregas?.totalEstablecimientos) || 0,
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
         FROM (${TABLETS_SERIES}) t
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
         JOIN (${EQUIPOS}) t ON t.cod = e.codigo
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
      `SELECT COUNT(*) AS total FROM (${EQUIPOS}) t`,
      { type: QueryTypes.SELECT }
    );

    const filas = await tabletsDb.query(
      `SELECT t.ref              AS ref,
              t.serie            AS numeroSerie,
              t.serie_2          AS numeroSerie2,
              t.tipo             AS tipoBeneficiario,
              t.marca, t.modelo,
              t.estado_registro  AS estadoRegistro,
              t.cargado_en       AS createdAt,
              t.cod              AS codigoEstablecimiento,
              e.nombre           AS nombreEstablecimiento,
              LOWER(e.departamento) AS departamento,
              LOWER(e.municipio)    AS municipio
         FROM (${EQUIPOS}) t
         LEFT JOIN establecimientos e ON e.codigo = t.cod
        ORDER BY t.cargado_en DESC, t.serie IS NULL, t.serie, t.ref
        LIMIT :limite OFFSET :salto`,
      {
        replacements: { limite: tamanoPagina, salto: (pagina - 1) * tamanoPagina },
        type: QueryTypes.SELECT,
      }
    );

    /* El `id` sale de la clave primaria de la fila (tipo + `ref` + código del
       establecimiento), no de la serie: hay 38 equipos sin serie y 134 series
       repetidas, así que usarla daba claves duplicadas en la tabla del
       frontend. `ref` se quita de la respuesta —es el código de la persona
       beneficiaria— y sólo viaja dentro del id. */
    return res.status(200).json({
      data: filas.map(({ ref, ...f }) => ({
        ...f,
        id: `${f.tipoBeneficiario}-${f.codigoEstablecimiento}-${ref}`,
      })),
      total: Number(total),
      pagina,
      totalPaginas: Math.max(Math.ceil(Number(total) / tamanoPagina), 1),
    });
  } catch (error) {
    return errorServidor(res, '[Ciudadania] listarTablets', error, 'Error al listar las tablets');
  }
};

export { norm };
