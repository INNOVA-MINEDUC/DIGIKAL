import { QueryTypes } from 'sequelize';
import tabletsDb, { tabletsDbConfigurada } from '../config/tabletsDb.js';
import { subirArchivo, resolverUrl } from '../services/bucketService.js';
import { validarMetadatos, validarContenido } from '../utils/archivos.js';
import { errorServidor, errorValidacion } from '../utils/http.js';
import logger from '../utils/logger.js';
import { logAction } from '../services/auditService.js';

/**
 * Ciudadanía Digikal — solicitudes de cambio del número de serie.
 *
 * Flujo
 * -----
 *   1. La OPF / dirección envía la solicitud con la serie registrada, la serie
 *      correcta y el oficio FIRMADO Y SELLADO por el director (endpoint
 *      público). El documento va al bucket; en la base sólo queda su URL.
 *   2. Alguien del personal abre la solicitud, ve el documento junto a las dos
 *      series y confirma que coinciden  →  `verificar`  (estado 'verificada').
 *   3. Al aprobar se actualiza la serie REAL en `dispositivos` /
 *      `dispositivos_docentes` y la fila conserva `serie_anterior` como
 *      constancia de qué decía antes el registro.
 *
 * Una solicitud es UN EQUIPO, no una columna
 * ------------------------------------------
 * En `dispositivos_docentes`, `serie` y `serie_2` son los DOS IMEI del mismo
 * aparato dual-SIM (ver esquema): si el equipo se reemplaza, cambian los dos a
 * la vez. Por eso la solicitud lleva `serie_2_anterior` / `serie_2_nueva` y no
 * una columna que diga "cuál de las dos". En estudiantes esas dos van NULL.
 *
 * `tipo_cambio` importa para lo que pasa después con la serie vieja:
 *   correccion    → la serie anterior era un error de tipeo, nunca existió.
 *   garantia      → el proveedor cambió el equipo; la vieja fue real y sale de
 *                   circulación (queda en la vista v_series_retiradas).
 *   robo_extravio → igual que garantía, pero el equipo se perdió.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ESCRITURA en la base de tablets — excepción consciente
 * ═══════════════════════════════════════════════════════════════════════════
 * config/tabletsDb.js dice que esa base es de sólo lectura. Este controlador
 * es la ÚNICA excepción, y está acotada a propósito:
 *   - Sólo toca las columnas de serie (y marca/modelo si el reemplazo vino con
 *     otro equipo) de una fila localizada por su clave primaria completa, y
 *     sólo desde `aprobar`.
 *   - Antes del UPDATE se relee la fila con FOR UPDATE y se comprueba que la
 *     serie siga siendo la que se pidió corregir: si cambió por otra vía, se
 *     aborta en vez de sobrescribir a ciegas.
 *   - Todo va en una transacción junto con el cambio de estado.
 */

/** En qué tabla vive cada tipo, y cuál es la primera mitad de su clave primaria. */
const TABLA_POR_TIPO = Object.freeze({
  estudiante: { tabla: 'dispositivos', columnaPersona: 'cod_pers', tieneSerie2: false },
  docente: { tabla: 'dispositivos_docentes', columnaPersona: 'num_empleado', tieneSerie2: true },
});

const TIPOS_CAMBIO = Object.freeze(['correccion', 'garantia', 'robo_extravio']);
const ESTADOS = Object.freeze(['pendiente', 'no_coincide', 'verificada', 'aprobada', 'rechazada']);

const limpiar = (v) => String(v ?? '').trim();
const normSerie = (v) => limpiar(v).toLowerCase();
const oNulo = (v, max) => {
  const t = limpiar(v);
  return t ? t.slice(0, max) : null;
};

const sinBaseDeTablets = (res, contexto) => {
  logger.error('[SolicitudSerie] %s: faltan las credenciales TABLETS_DB_*', contexto);
  return res.status(503).json({ message: 'El servicio de tablets no está disponible en este momento' });
};

/**
 * Escapa los comodines de LIKE. Mismo criterio que CiudadaniaController: sin
 * esto, buscar «%» casaría con cualquier serie.
 */
const escaparLike = (s) => String(s ?? '').replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Localiza la fila de dispositivo a la que pertenece una serie y devuelve las
 * coordenadas exactas (tabla + PK) para poder actualizarla después.
 *
 * Busca en `serie` y en `serie_2`: en docentes son los dos IMEI del MISMO
 * aparato, así que teclear cualquiera de los dos debe encontrar el equipo.
 * También contempla las filas que traen los dos IMEI dentro del mismo campo
 * separados por un espacio (ver la nota de CiudadaniaController.buscarPorSerie).
 */
const localizarDispositivo = async (serie) => {
  const filas = await tabletsDb.query(
    `SELECT 'estudiante' AS tipo, cod_pers AS codPersona, cod_estab_reportado AS codEstab,
            serie AS serieActual, NULL AS serie2Actual, marca, modelo
       FROM dispositivos
      WHERE LOWER(TRIM(serie)) = :serie
         OR CONCAT(' ', LOWER(TRIM(serie)), ' ') LIKE CONCAT('% ', :serieLike, ' %') ESCAPE '\\\\'
     UNION ALL
     SELECT 'docente', num_empleado, cod_estab_reportado,
            serie, serie_2, marca, modelo
       FROM dispositivos_docentes
      WHERE LOWER(TRIM(serie)) = :serie
         OR LOWER(TRIM(serie_2)) = :serie
         OR CONCAT(' ', LOWER(TRIM(serie)), ' ') LIKE CONCAT('% ', :serieLike, ' %') ESCAPE '\\\\'
      LIMIT 1`,
    {
      replacements: { serie: normSerie(serie), serieLike: escaparLike(normSerie(serie)) },
      type: QueryTypes.SELECT,
    }
  );

  return filas[0] || null;
};

/**
 * ¿Esa serie ya está en uso por OTRO equipo? Se excluye el equipo de la propia
 * solicitud: en un cambio por garantía es normal que una de las dos series
 * (los dos IMEI) siga siendo la misma.
 */
const serieEnOtroEquipo = async (serie, coords) => {
  const encontrado = await localizarDispositivo(serie);
  if (!encontrado) return false;

  const mismoEquipo =
    encontrado.tipo === coords.tipo &&
    String(encontrado.codPersona) === String(coords.codPersona) &&
    String(encontrado.codEstab) === String(coords.codEstab);

  return !mismoEquipo;
};

/** La unique key ux_sol_activa impide dos solicitudes abiertas sobre el mismo equipo. */
const esDuplicadoActivo = (error) =>
  error?.original?.code === 'ER_DUP_ENTRY' || error?.parent?.code === 'ER_DUP_ENTRY';

/* ════════════════════════════════════════════════════════════════════════
   1. Crear la solicitud (público, con documento adjunto)
   ════════════════════════════════════════════════════════════════════════ */
export const crearSolicitud = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'crearSolicitud');

  try {
    const serieAnterior = limpiar(req.body?.serieAnterior);
    const serieNueva = limpiar(req.body?.serieNueva);
    const serie2Nueva = limpiar(req.body?.serie2Nueva);
    const tipoCambio = limpiar(req.body?.tipoCambio).toLowerCase();

    if (!serieAnterior) return errorValidacion(res, 'Indique el número de serie que está registrado actualmente');
    if (!serieNueva) return errorValidacion(res, 'Indique el número de serie correcto');
    if (serieNueva.length > 60 || serie2Nueva.length > 60) {
      return errorValidacion(res, 'El número de serie no puede pasar de 60 caracteres');
    }
    if (!TIPOS_CAMBIO.includes(tipoCambio)) {
      return errorValidacion(
        res,
        'Indique el motivo del cambio: corrección de un error, reemplazo por garantía, o robo/extravío'
      );
    }

    // Los archivos llegan por multer.fields(): el oficio del director es
    // obligatorio; el ticket de garantía es opcional.
    const oficio = req.files?.documento?.[0] || null;
    const garantia = req.files?.documentoGarantia?.[0] || null;

    if (!oficio) {
      return errorValidacion(res, 'Adjunte el documento firmado y sellado por el director que autoriza el cambio');
    }

    for (const archivo of [oficio, garantia].filter(Boolean)) {
      const rechazo = validarMetadatos(archivo, 'documento') || validarContenido(archivo, 'documento');
      if (rechazo) return errorValidacion(res, rechazo);
    }

    // La serie que se dice tener registrada debe existir de verdad.
    const dispositivo = await localizarDispositivo(serieAnterior);
    if (!dispositivo) {
      return errorValidacion(
        res,
        `No hay ninguna tableta registrada con el número de serie «${serieAnterior}». Verifique que esté completo y tal como aparece en el registro.`
      );
    }

    const soportaSerie2 = TABLA_POR_TIPO[dispositivo.tipo]?.tieneSerie2 === true;
    // En estudiantes no hay segundo IMEI: se ignora lo que venga.
    const serie2Final = soportaSerie2 ? (serie2Nueva || null) : null;

    // Que algo cambie de verdad.
    const cambiaSerie = normSerie(serieNueva) !== normSerie(dispositivo.serieActual);
    const cambiaSerie2 = soportaSerie2 &&
      normSerie(serie2Final) !== normSerie(dispositivo.serie2Actual);

    if (!cambiaSerie && !cambiaSerie2) {
      return errorValidacion(res, 'Los números de serie indicados son iguales a los registrados: no hay nada que corregir');
    }

    const coords = {
      tipo: dispositivo.tipo,
      codPersona: dispositivo.codPersona,
      codEstab: dispositivo.codEstab,
    };

    // Las series nuevas no pueden chocar con OTRO equipo ya registrado.
    for (const s of [serieNueva, serie2Final].filter(Boolean)) {
      if (await serieEnOtroEquipo(s, coords)) {
        return errorValidacion(
          res,
          `El número de serie «${s}» ya está registrado en otra tableta. Revise que sea el correcto.`
        );
      }
    }

    // El documento va al bucket; si no está disponible cae al respaldo local
    // (ver services/bucketService.js). En la base se guarda la dirección.
    const subidaOficio = await subirArchivo(oficio, 'solicitudes');
    const documentoUrl = subidaOficio?.data?.direccion;
    if (!documentoUrl) {
      return errorServidor(res, '[SolicitudSerie] crearSolicitud', new Error('El almacenamiento no devolvió dirección'),
        'No se pudo guardar el documento. Intente de nuevo.');
    }

    let documentoGarantiaUrl = null;
    if (garantia) {
      const subidaGarantia = await subirArchivo(garantia, 'solicitudes');
      documentoGarantiaUrl = subidaGarantia?.data?.direccion || null;
    }

    const [id] = await tabletsDb.query(
      `INSERT INTO solicitudes_cambio_serie
         (tipo_beneficiario, cod_persona, cod_estab_reportado, tipo_cambio,
          serie_anterior, serie_2_anterior, serie_nueva, serie_2_nueva,
          marca_nueva, modelo_nuevo,
          documento_url, documento_nombre, documento_mime, documento_tamano,
          documento_garantia_url,
          motivo, solicitante_nombre, solicitante_email, solicitante_telefono,
          estado)
       VALUES
         (:tipo, :codPersona, :codEstab, :tipoCambio,
          :serieAnterior, :serie2Anterior, :serieNueva, :serie2Nueva,
          :marcaNueva, :modeloNuevo,
          :documentoUrl, :documentoNombre, :documentoMime, :documentoTamano,
          :documentoGarantiaUrl,
          :motivo, :solNombre, :solEmail, :solTelefono,
          'pendiente')`,
      {
        replacements: {
          tipo: dispositivo.tipo,
          codPersona: dispositivo.codPersona,
          codEstab: dispositivo.codEstab,
          tipoCambio,
          // Se guardan las series TAL COMO ESTÁN EN LA BASE, no como las
          // escribió el usuario: son las que hay que comparar al aplicar.
          serieAnterior: dispositivo.serieActual,
          serie2Anterior: soportaSerie2 ? (dispositivo.serie2Actual || null) : null,
          serieNueva,
          serie2Nueva: serie2Final,
          marcaNueva: oNulo(req.body?.marcaNueva, 60),
          modeloNuevo: oNulo(req.body?.modeloNuevo, 60),
          documentoUrl,
          documentoNombre: oNulo(oficio.originalname, 255),
          documentoMime: oNulo(oficio.mimetype, 100),
          documentoTamano: oficio.size ?? null,
          documentoGarantiaUrl,
          motivo: oNulo(req.body?.motivo, 500),
          solNombre: oNulo(req.body?.solicitanteNombre, 255),
          solEmail: oNulo(req.body?.solicitanteEmail, 255),
          solTelefono: oNulo(req.body?.solicitanteTelefono, 30),
        },
        type: QueryTypes.INSERT,
      }
    );

    return res.status(201).json({
      message: 'Solicitud enviada. Será revisada por el personal de DIGECADE.',
      solicitud: {
        id,
        estado: 'pendiente',
        tipoCambio,
        serieAnterior: dispositivo.serieActual,
        serieNueva,
      },
    });
  } catch (error) {
    // La unique key ux_sol_activa sólo deja UNA solicitud abierta por equipo.
    if (esDuplicadoActivo(error)) {
      return errorValidacion(res, 'Esta tableta ya tiene una solicitud de cambio en trámite. Espere a que sea revisada.');
    }
    return errorServidor(res, '[SolicitudSerie] crearSolicitud', error, 'No se pudo registrar la solicitud');
  }
};

/* ════════════════════════════════════════════════════════════════════════
   2. Bandeja de solicitudes (personal con sesión)
   ════════════════════════════════════════════════════════════════════════ */
const CAMPOS_LISTA = `
  s.id, s.estado, s.tipo_beneficiario AS tipoBeneficiario, s.tipo_cambio AS tipoCambio,
  s.cod_estab_reportado AS codigoEstablecimiento,
  e.nombre AS nombreEstablecimiento,
  LOWER(e.departamento) AS departamento,
  LOWER(e.municipio)    AS municipio,
  s.serie_anterior   AS serieAnterior,
  s.serie_2_anterior AS serie2Anterior,
  s.serie_nueva      AS serieNueva,
  s.serie_2_nueva    AS serie2Nueva,
  s.marca_nueva      AS marcaNueva,
  s.modelo_nuevo     AS modeloNuevo,
  s.documento_url    AS documentoUrl,
  s.documento_nombre AS documentoNombre,
  s.documento_mime   AS documentoMime,
  s.documento_garantia_url AS documentoGarantiaUrl,
  s.verificado_en AS verificadoEn, s.verificado_por AS verificadoPor,
  s.verificacion_nota AS verificacionNota,
  s.serie_aplicada AS serieAplicada, s.aplicada_en AS aplicadaEn,
  s.motivo, s.motivo_rechazo AS motivoRechazo,
  s.solicitante_nombre AS solicitanteNombre,
  s.solicitante_email  AS solicitanteEmail,
  s.solicitante_telefono AS solicitanteTelefono,
  s.revisado_por_nombre AS revisadoPorNombre,
  s.revisado_en AS revisadoEn,
  s.creado_en AS creadoEn
`;

/** La URL guardada puede ser del bucket o del respaldo local: se resuelve. */
const conUrlResuelta = (fila) => ({
  ...fila,
  documentoUrl: resolverUrl(fila.documentoUrl),
  documentoGarantiaUrl: resolverUrl(fila.documentoGarantiaUrl),
  // No hay columna `verificado`: el estado lo dice todo.
  verificado: fila.estado === 'verificada' || fila.estado === 'aprobada',
  // Conveniencia para el front: evita repetir la comparación de estado en
  // cada vista que necesita distinguir este caso.
  noCoincide: fila.estado === 'no_coincide',
});

export const listarSolicitudes = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'listarSolicitudes');

  try {
    const pagina = Math.max(parseInt(req.query.pagina, 10) || 1, 1);
    const tamanoPagina = Math.min(Math.max(parseInt(req.query.tamanoPagina, 10) || 20, 1), 100);
    const estado = limpiar(req.query.estado);
    const serie = limpiar(req.query.serie);

    const condiciones = [];
    const replacements = {};

    if (ESTADOS.includes(estado)) {
      condiciones.push('s.estado = :estado');
      replacements.estado = estado;
    }

    // Busca "contiene" (no exacto como en la consulta pública): quien revisa
    // suele acordarse sólo de una parte de la serie. Cubre las dos series de
    // docentes con IMEI dual igual que serie_anterior/serie_nueva.
    if (serie) {
      condiciones.push(`(
        LOWER(s.serie_anterior)   LIKE :serie OR
        LOWER(s.serie_nueva)      LIKE :serie OR
        LOWER(s.serie_2_anterior) LIKE :serie OR
        LOWER(s.serie_2_nueva)    LIKE :serie
      )`);
      replacements.serie = `%${normSerie(serie)}%`;
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const [{ total }] = await tabletsDb.query(
      `SELECT COUNT(*) AS total FROM solicitudes_cambio_serie s ${where}`,
      { replacements, type: QueryTypes.SELECT }
    );

    const filas = await tabletsDb.query(
      `SELECT ${CAMPOS_LISTA}
         FROM solicitudes_cambio_serie s
         LEFT JOIN establecimientos e ON e.codigo = s.cod_estab_reportado
         ${where}
        ORDER BY s.creado_en DESC
        LIMIT :limite OFFSET :salto`,
      {
        replacements: { ...replacements, limite: tamanoPagina, salto: (pagina - 1) * tamanoPagina },
        type: QueryTypes.SELECT,
      }
    );

    return res.status(200).json({
      data: filas.map(conUrlResuelta),
      total: Number(total),
      pagina,
      totalPaginas: Math.max(Math.ceil(Number(total) / tamanoPagina), 1),
    });
  } catch (error) {
    return errorServidor(res, '[SolicitudSerie] listarSolicitudes', error, 'No se pudieron listar las solicitudes');
  }
};

/** Detalle: es lo que alimenta la vista de verificación (documento + series). */
export const obtenerSolicitud = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'obtenerSolicitud');

  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) return errorValidacion(res, 'Identificador de solicitud no válido');

    const [fila] = await tabletsDb.query(
      `SELECT ${CAMPOS_LISTA}
         FROM solicitudes_cambio_serie s
         LEFT JOIN establecimientos e ON e.codigo = s.cod_estab_reportado
        WHERE s.id = :id
        LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!fila) return res.status(404).json({ message: 'No existe esa solicitud' });

    return res.status(200).json({ solicitud: conUrlResuelta(fila) });
  } catch (error) {
    return errorServidor(res, '[SolicitudSerie] obtenerSolicitud', error, 'No se pudo abrir la solicitud');
  }
};

/* ════════════════════════════════════════════════════════════════════════
   3. Verificar: la serie escrita coincide con la del documento
   ════════════════════════════════════════════════════════════════════════ */
export const verificarSolicitud = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'verificarSolicitud');

  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) return errorValidacion(res, 'Identificador de solicitud no válido');

    const coincide = req.body?.coincide === true;
    const nota = oNulo(req.body?.nota, 500);

    const [solicitud] = await tabletsDb.query(
      `SELECT id, estado, serie_anterior AS serieAnterior, serie_nueva AS serieNueva
         FROM solicitudes_cambio_serie WHERE id = :id LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    if (!solicitud) return res.status(404).json({ message: 'No existe esa solicitud' });
    // 'no_coincide' también se puede volver a verificar: es el caso normal de
    // que llegue un documento corregido y haya que revisarlo de nuevo.
    if (!['pendiente', 'no_coincide', 'verificada'].includes(solicitud.estado)) {
      return errorValidacion(res, `La solicitud ya está ${solicitud.estado}: no se puede volver a verificar`);
    }

    /* No coincide → estado propio 'no_coincide' (no 'pendiente'), para que se
       distinga de una solicitud que nadie ha revisado todavía, tanto en la
       bandeja como en la consulta pública. El siguiente paso natural es
       rechazarla con el motivo, o volver a verificar si llega un documento
       corregido. */
    await tabletsDb.query(
      `UPDATE solicitudes_cambio_serie
          SET estado = :estado,
              verificado_en = NOW(),
              verificado_por = :quien,
              verificacion_nota = :nota
        WHERE id = :id`,
      {
        replacements: {
          id,
          estado: coincide ? 'verificada' : 'no_coincide',
          quien: req.user?.name || req.user?.email || null,
          nota,
        },
        type: QueryTypes.UPDATE,
      }
    );

    await logAction(req, {
      action: coincide ? 'SOLICITUD_SERIE_VERIFICADA' : 'SOLICITUD_SERIE_NO_COINCIDE',
      module: 'CIUDADANIA_SERIE',
      resourceId: id,
      description: coincide
        ? `Verificó que la serie escrita coincide con el documento (solicitud #${id}, ${solicitud.serieAnterior} → ${solicitud.serieNueva})`
        : `Marcó que la serie escrita NO coincide con el documento (solicitud #${id}, ${solicitud.serieAnterior} → ${solicitud.serieNueva})${nota ? `: ${nota}` : ''}`,
    });

    return res.status(200).json({
      message: coincide
        ? 'Verificada: la serie coincide con el documento'
        : 'Se registró que la serie NO coincide con el documento',
      coincide,
    });
  } catch (error) {
    return errorServidor(res, '[SolicitudSerie] verificarSolicitud', error, 'No se pudo verificar la solicitud');
  }
};

/* ════════════════════════════════════════════════════════════════════════
   4. Aprobar: aplica el cambio REAL y deja constancia
   ════════════════════════════════════════════════════════════════════════ */
export const aprobarSolicitud = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'aprobarSolicitud');

  const tx = await tabletsDb.transaction();
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      await tx.rollback();
      return errorValidacion(res, 'Identificador de solicitud no válido');
    }

    // FOR UPDATE: bloquea la fila para que dos revisores no apliquen el mismo
    // cambio a la vez.
    const [solicitud] = await tabletsDb.query(
      `SELECT * FROM solicitudes_cambio_serie WHERE id = :id LIMIT 1 FOR UPDATE`,
      { replacements: { id }, type: QueryTypes.SELECT, transaction: tx }
    );

    if (!solicitud) {
      await tx.rollback();
      return res.status(404).json({ message: 'No existe esa solicitud' });
    }
    if (solicitud.estado === 'aprobada') {
      await tx.rollback();
      return errorValidacion(res, 'Esa solicitud ya fue aprobada');
    }
    if (solicitud.estado === 'rechazada') {
      await tx.rollback();
      return errorValidacion(res, 'Esa solicitud fue rechazada: no se puede aprobar');
    }
    if (solicitud.estado !== 'verificada') {
      await tx.rollback();
      return errorValidacion(res, 'Primero hay que verificar que la serie coincide con el documento');
    }

    const destino = TABLA_POR_TIPO[solicitud.tipo_beneficiario];
    if (!destino) {
      await tx.rollback();
      return errorServidor(res, '[SolicitudSerie] aprobarSolicitud',
        new Error(`Tipo inválido: ${solicitud.tipo_beneficiario}`),
        'La solicitud tiene datos inconsistentes y no se puede aplicar');
    }

    const coordenadas = {
      codPersona: solicitud.cod_persona,
      codEstab: solicitud.cod_estab_reportado,
    };

    /* Se relee la fila del equipo DENTRO de la transacción y con FOR UPDATE, y
       se comprueba a mano que la serie siga siendo la registrada al crear la
       solicitud. Si cambió por otra vía, se aborta en vez de sobrescribir.

       La comprobación es explícita y no se apoya en `affectedRows`, cuyo
       formato de retorno depende del driver: un falso 0 bloquearía
       aprobaciones legítimas y un falso positivo pisaría un dato. */
    const [equipo] = await tabletsDb.query(
      `SELECT serie${destino.tieneSerie2 ? ', serie_2' : ''}
         FROM \`${destino.tabla}\`
        WHERE \`${destino.columnaPersona}\` = :codPersona
          AND cod_estab_reportado = :codEstab
        LIMIT 1
        FOR UPDATE`,
      { replacements: coordenadas, type: QueryTypes.SELECT, transaction: tx }
    );

    if (!equipo) {
      await tx.rollback();
      return errorValidacion(res, 'Ya no existe el registro del equipo que pedía corregirse.');
    }

    if (normSerie(equipo.serie) !== normSerie(solicitud.serie_anterior)) {
      await tx.rollback();
      return errorValidacion(
        res,
        `El registro cambió desde que se envió la solicitud: ahora dice «${equipo.serie}» y no «${solicitud.serie_anterior}». Revise el caso antes de aprobar.`
      );
    }

    /* SET armado sólo con columnas de esta lista fija; los valores siempre van
       como parámetros. Nada del nombre de columna sale de la petición. */
    const asignaciones = ['serie = :serieNueva'];
    const valores = { ...coordenadas, serieNueva: solicitud.serie_nueva };

    if (destino.tieneSerie2 && solicitud.serie_2_nueva) {
      asignaciones.push('serie_2 = :serie2Nueva');
      valores.serie2Nueva = solicitud.serie_2_nueva;
    }
    // Sólo si el reemplazo vino con otro equipo (pasa en garantía).
    if (solicitud.marca_nueva) {
      asignaciones.push('marca = :marcaNueva');
      valores.marcaNueva = solicitud.marca_nueva;
    }
    if (solicitud.modelo_nuevo) {
      asignaciones.push('modelo = :modeloNuevo');
      valores.modeloNuevo = solicitud.modelo_nuevo;
    }

    await tabletsDb.query(
      `UPDATE \`${destino.tabla}\`
          SET ${asignaciones.join(', ')}
        WHERE \`${destino.columnaPersona}\` = :codPersona
          AND cod_estab_reportado = :codEstab`,
      { replacements: valores, type: QueryTypes.UPDATE, transaction: tx }
    );

    await tabletsDb.query(
      `UPDATE solicitudes_cambio_serie
          SET estado = 'aprobada',
              serie_aplicada = 1,
              aplicada_en = NOW(),
              revisado_por_id = :revisorId,
              revisado_por_nombre = :revisorNombre,
              revisado_por_email = :revisorEmail,
              revisado_en = NOW()
        WHERE id = :id`,
      {
        replacements: {
          id,
          revisorId: req.user?.id ?? null,
          revisorNombre: req.user?.name ?? null,
          revisorEmail: req.user?.email ?? null,
        },
        type: QueryTypes.UPDATE,
        transaction: tx,
      }
    );

    await tx.commit();

    logger.info(
      '[SolicitudSerie] Serie actualizada: solicitud=%s tipo=%s tabla=%s %s -> %s (por %s)',
      id, solicitud.tipo_cambio, destino.tabla,
      solicitud.serie_anterior, solicitud.serie_nueva, req.user?.email || 'desconocido'
    );

    // Este es el paso que de verdad cambia un dato real (fuera de la
    // transacción a propósito: si falla el registro de auditoría no debe
    // deshacerse un cambio que ya quedó confirmado en la base).
    await logAction(req, {
      action: 'SOLICITUD_SERIE_APROBADA',
      module: 'CIUDADANIA_SERIE',
      resourceId: id,
      description: `Aprobó la solicitud #${id} y actualizó la serie en ${destino.tabla} de `
        + `${solicitud.serie_anterior} a ${solicitud.serie_nueva}`
        + `${destino.tieneSerie2 && solicitud.serie_2_nueva ? ` (serie 2: ${solicitud.serie_2_anterior} → ${solicitud.serie_2_nueva})` : ''}`,
    });

    return res.status(200).json({
      message: 'Solicitud aprobada y número de serie actualizado',
      serieAnterior: solicitud.serie_anterior,
      serieNueva: solicitud.serie_nueva,
    });
  } catch (error) {
    await tx.rollback();
    return errorServidor(res, '[SolicitudSerie] aprobarSolicitud', error, 'No se pudo aprobar la solicitud');
  }
};

/* ════════════════════════════════════════════════════════════════════════
   5. Rechazar
   ════════════════════════════════════════════════════════════════════════ */
export const rechazarSolicitud = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'rechazarSolicitud');

  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) return errorValidacion(res, 'Identificador de solicitud no válido');

    const motivoRechazo = oNulo(req.body?.motivo, 500);
    if (!motivoRechazo) return errorValidacion(res, 'Indique por qué se rechaza la solicitud');

    const [solicitud] = await tabletsDb.query(
      `SELECT id, estado, serie_anterior AS serieAnterior, serie_nueva AS serieNueva
         FROM solicitudes_cambio_serie WHERE id = :id LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    if (!solicitud) return res.status(404).json({ message: 'No existe esa solicitud' });
    if (solicitud.estado === 'aprobada') {
      return errorValidacion(res, 'Esa solicitud ya fue aprobada: no se puede rechazar');
    }

    await tabletsDb.query(
      `UPDATE solicitudes_cambio_serie
          SET estado = 'rechazada',
              motivo_rechazo = :motivoRechazo,
              revisado_por_id = :revisorId,
              revisado_por_nombre = :revisorNombre,
              revisado_por_email = :revisorEmail,
              revisado_en = NOW()
        WHERE id = :id`,
      {
        replacements: {
          id,
          motivoRechazo,
          revisorId: req.user?.id ?? null,
          revisorNombre: req.user?.name ?? null,
          revisorEmail: req.user?.email ?? null,
        },
        type: QueryTypes.UPDATE,
      }
    );

    await logAction(req, {
      action: 'SOLICITUD_SERIE_RECHAZADA',
      module: 'CIUDADANIA_SERIE',
      resourceId: id,
      description: `Rechazó la solicitud #${id} (${solicitud.serieAnterior} → ${solicitud.serieNueva}): ${motivoRechazo}`,
    });

    return res.status(200).json({ message: 'Solicitud rechazada' });
  } catch (error) {
    return errorServidor(res, '[SolicitudSerie] rechazarSolicitud', error, 'No se pudo rechazar la solicitud');
  }
};

/* ════════════════════════════════════════════════════════════════════════
   6. Consulta pública del estado de una solicitud
   ════════════════════════════════════════════════════════════════════════ */
export const consultarEstado = async (req, res) => {
  if (!tabletsDbConfigurada) return sinBaseDeTablets(res, 'consultarEstado');

  try {
    const serie = limpiar(req.params.numeroSerie);
    if (!serie) return errorValidacion(res, 'Indique un número de serie');

    // Se responde lo mínimo: en qué va el trámite. Nada de datos de contacto
    // ni del documento, que este endpoint es público. `verificacionNota` sí
    // se incluye: es el único lugar donde queda escrito por qué el personal
    // marcó "no coincide".
    const filas = await tabletsDb.query(
      `SELECT id, estado, tipo_cambio AS tipoCambio,
              serie_anterior AS serieAnterior, serie_nueva AS serieNueva,
              serie_aplicada AS serieAplicada, creado_en AS creadoEn,
              revisado_en AS revisadoEn, motivo_rechazo AS motivoRechazo,
              verificado_en AS verificadoEn, verificacion_nota AS verificacionNota
         FROM solicitudes_cambio_serie
        WHERE LOWER(TRIM(serie_anterior))   = :serie
           OR LOWER(TRIM(serie_nueva))      = :serie
           OR LOWER(TRIM(serie_2_anterior)) = :serie
           OR LOWER(TRIM(serie_2_nueva))    = :serie
        ORDER BY creado_en DESC
        LIMIT 5`,
      { replacements: { serie: normSerie(serie) }, type: QueryTypes.SELECT }
    );

    // Conveniencia para el front (ver el comentario en `conUrlResuelta`).
    const solicitudes = filas.map((f) => ({
      ...f,
      noCoincide: f.estado === 'no_coincide',
    }));

    return res.status(200).json({ solicitudes });
  } catch (error) {
    return errorServidor(res, '[SolicitudSerie] consultarEstado', error, 'No se pudo consultar el estado');
  }
};
