



import ExcelJS from 'exceljs'
import sequelize from '../config/connection.js'
import { fn, col, where, Op } from 'sequelize'

import Escuela from '../models/Escuela.js'
import Dotacion from '../models/Dotacion.js'
import Beneficiario from '../models/Beneficiado.js'
import Acta from '../models/Acta.js'
import Equipo from '../models/Equipo.js'
import DotacionEquipo from '../models/DotacionEquipo.js'
import TipoEquipo from '../models/TipoEquipo.js'
import ModeloEquipo from '../models/ModeloEquipo.js'
import Departamento from '../models/Departamento.js'
import Municipio from '../models/Municipio.js'
import Internet from '../models/Internet.js'
import Proyecto from '../models/Proyecto.js'

const clean = (value) => {
  if (value === undefined || value === null) return null
  if (value instanceof Date) return value

  const text = String(value).trim()
  if (!text) return null

  const lower = text.toLowerCase()

  if (
    lower === 'sin_info' ||
    lower === 'sin info' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'null' ||
    lower === 'undefined'
  ) {
    return null
  }

  return text
}

const cleanLower = (value) => {
  const text = clean(value)
  return text ? text.toLowerCase() : null
}

const toNumber = (value, fallback = 0) => {
  const text = clean(value)
  if (text === null) return fallback
  const n = Number(text)
  return Number.isFinite(n) ? n : fallback
}

const toNumberOrNull = (value) => {
  const text = clean(value)
  if (text === null) return null
  const n = Number(text)
  return Number.isFinite(n) ? n : null
}

const pad = (n) => String(n).padStart(2, '0')

const excelSerialToDate = (serial) => {
  const base = new Date(1899, 11, 30)
  return new Date(base.getTime() + serial * 86400000)
}

const toDate = (value) => {
  if (value === undefined || value === null || value === '') return null
  if (value instanceof Date) return value

  if (typeof value === 'number') {
    const d = excelSerialToDate(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const text = String(value).trim()
  if (!text) return null

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const toDateOnly = (value) => {
  const date = toDate(value)
  if (!date) return null
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const todayDateOnly = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const normalizeHeader = (value) => {
  if (value === undefined || value === null) return ''

  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const cellValue = (raw) => {
  if (raw === undefined || raw === null) return null

  if (raw instanceof Date) return raw

  if (typeof raw === 'object') {
    if (raw.text) return raw.text
    if (raw.richText && Array.isArray(raw.richText)) {
      return raw.richText.map((r) => r.text || '').join('')
    }
    if (raw.result !== undefined) return raw.result
    if (raw.hyperlink) return raw.text || raw.hyperlink
  }

  return raw
}

const rowToObject = (sheet, rowNumber, headers) => {
  const row = sheet.getRow(rowNumber)
  const data = {}

  for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
    const key = headers[colNumber]
    if (!key) continue
    data[key] = cellValue(row.getCell(colNumber).value)
  }

  return data
}

const isBlank = (value) => clean(value) === null

const assignIfPresent = (obj, key, rawValue, transform = (v) => v) => {
  const value = transform(rawValue)
  if (value !== null && value !== undefined && value !== '') {
    obj[key] = value
  }
}

const assignIfBlank = (obj, key, currentValue, rawValue, transform = (v) => v) => {
  if (isBlank(currentValue)) {
    assignIfPresent(obj, key, rawValue, transform)
  }
}

const hasAny = (data, keys) => keys.some((k) => clean(data[k]) !== null || data[k] === 0)

const headerAliases = {
  correoelectronico: 'correo_electronico',
  empresa_conexion: 'empresa_conexion',
  fecha_conexion: 'fecha_conexion',
  fecha_entrega: 'fecha_entrega',
  codigo_establecimiento: 'codigo_establecimiento',
  nombre_establecimiento: 'nombre_establecimiento',
  tipo_registro: 'tipo_registro',
  tipo_equipo: 'tipo_equipo',
  descripcion_tecnica: 'descripcion_tecnica',
  beneficiarios_total: 'beneficiarios_total',
  beneficiarios_hombres: 'beneficiarios_hombres',
  beneficiarios_mujeres: 'beneficiarios_mujeres',
  beneficiarios_maya: 'beneficiarios_maya',
  beneficiarios_xinca: 'beneficiarios_xinca',
  beneficiarios_garifuna: 'beneficiarios_garifuna',
  beneficiarios_otros: 'beneficiarios_otros',
  edad_0_13: 'edad_0_13',
  edad_13_30: 'edad_13_30',
  edad_30_60: 'edad_30_60',
  edad_mas_60: 'edad_mas_60',
  serie: 'serie',
  sicoin: 'sicoin',
  modelo: 'modelo',
  monto: 'monto',
  cantidad: 'cantidad',
  telefono: 'telefono',
  direccion: 'direccion',
  jornada: 'jornada',
  nivel: 'nivel',
  director: 'director',
  departamento: 'departamento',
  municipio: 'municipio'
}

const normalizeData = (data) => {
  const out = {}
  for (const [key, value] of Object.entries(data)) {
    const mapped = headerAliases[key] || key
    out[mapped] = value
  }
  return out
}

const normalizeRegistroTipo = (value) => {
  const text = cleanLower(value)
  if (!text) return null

  if (text.includes('internet') || text.includes('conexion') || text.includes('conexión')) {
    return 'internet'
  }

  if (
    text.includes('equipo') ||
    text.includes('dotacion') ||
    text.includes('dotación') ||
    text.includes('entrega')
  ) {
    return 'equipo'
  }

  return text
}

const findDepartamento = async (nombre, transaction) => {
  const value = clean(nombre)
  if (!value) return null

  return await Departamento.findOne({
    where: where(fn('LOWER', col('nombre')), value.toLowerCase()),
    transaction
  })
}

const findMunicipio = async (nombre, departamentoId, transaction) => {
  const value = clean(nombre)
  if (!value || !departamentoId) return null

  return await Municipio.findOne({
    where: {
      departamentoId,
      [Op.and]: [where(fn('LOWER', col('nombre')), value.toLowerCase())]
    },
    transaction
  })
}

const resolveUbicacion = async (data, transaction) => {
  const departamentoNombre = clean(data.departamento)
  const municipioNombre = clean(data.municipio)

  if (!departamentoNombre) {
    throw new Error('Falta departamento')
  }

  if (!municipioNombre) {
    throw new Error('Falta municipio')
  }

  const depto = await findDepartamento(departamentoNombre, transaction)
  if (!depto) {
    throw new Error(`No existe el departamento "${departamentoNombre}"`)
  }

  const muni = await findMunicipio(municipioNombre, depto.id, transaction)
  if (!muni) {
    throw new Error(
      `No existe el municipio "${municipioNombre}" para el departamento "${departamentoNombre}"`
    )
  }

  return { departamento: depto, municipio: muni }
}

const upsertEscuela = async (data, transaction) => {
  const codigoEscuela = clean(data.codigo_establecimiento)
  const nombreEscuela = clean(data.nombre_establecimiento)

  if (!codigoEscuela) {
    throw new Error('codigo_establecimiento es requerido')
  }

  if (!nombreEscuela) {
    throw new Error('nombre_establecimiento es requerido')
  }

  const { departamento, municipio } = await resolveUbicacion(data, transaction)

  let escuela = await Escuela.findOne({
    where: { codigoEscuela },
    transaction
  })

  const payload = {
    nombreEscuela,
    codigoEscuela,
    departamentoId: departamento.id,
    municipioId: municipio.id,
    direccion: clean(data.direccion),
    telefono: clean(data.telefono),
    correo: clean(data.correo_electronico),
    director: clean(data.director),
    jornada: clean(data.jornada),
    nivel: clean(data.nivel)
  }

  if (!escuela) {
    escuela = await Escuela.create(payload, { transaction })
    return escuela
  }

  const updates = {}

  assignIfBlank(updates, 'nombreEscuela', escuela.nombreEscuela, payload.nombreEscuela)
  assignIfBlank(updates, 'departamentoId', escuela.departamentoId, payload.departamentoId)
  assignIfBlank(updates, 'municipioId', escuela.municipioId, payload.municipioId)
  assignIfBlank(updates, 'direccion', escuela.direccion, payload.direccion)
  assignIfBlank(updates, 'telefono', escuela.telefono, payload.telefono)
  assignIfBlank(updates, 'correo', escuela.correo, payload.correo)
  assignIfBlank(updates, 'director', escuela.director, payload.director)
  assignIfBlank(updates, 'jornada', escuela.jornada, payload.jornada)
  assignIfBlank(updates, 'nivel', escuela.nivel, payload.nivel)

  if (Object.keys(updates).length > 0) {
    await escuela.update(updates, { transaction })
  }

  return escuela
}

const buildDescripcionTecnica = (data) => {
  const partes = []

  const descripcion = clean(data.descripcion_tecnica)
  const tipo = clean(data.tipo_equipo)
  const modelo = clean(data.modelo)
  const serie = clean(data.serie)
  const sicoin = clean(data.sicoin)
  const cantidad = clean(data.cantidad)
  const monto = clean(data.monto)

  if (descripcion) partes.push(descripcion)
  if (tipo) partes.push(`Tipo: ${tipo}`)
  if (modelo) partes.push(`Modelo: ${modelo}`)
  if (serie) partes.push(`Serie: ${serie}`)
  if (sicoin) partes.push(`SICOIN: ${sicoin}`)
  if (cantidad) partes.push(`Cantidad: ${cantidad}`)
  if (monto) partes.push(`Monto: ${monto}`)

  return partes.join(' | ')
}

const resolveTipoYModelo = async (data, transaction) => {
  const tipoNombre = clean(data.tipo_equipo)
  const modeloNombre = clean(data.modelo)

  if (!tipoNombre && !modeloNombre) {
    return { tipo: null, modelo: null }
  }

  if (!tipoNombre) {
    throw new Error('tipo_equipo es requerido para filas de equipo')
  }

  if (!modeloNombre) {
    throw new Error('modelo es requerido para filas de equipo')
  }

  let tipo = await TipoEquipo.findOne({
    where: where(fn('LOWER', col('nombre')), tipoNombre.toLowerCase()),
    transaction
  })

  if (!tipo) {
    tipo = await TipoEquipo.create(
      { nombre: tipoNombre },
      { transaction }
    )
  }

  let modelo = await ModeloEquipo.findOne({
    where: {
      tipo_id: tipo.id,
      [Op.and]: [where(fn('LOWER', col('nombre_modelo')), modeloNombre.toLowerCase())]
    },
    transaction
  })

  const descripcionTecnica = buildDescripcionTecnica(data)

  if (!modelo) {
    modelo = await ModeloEquipo.create(
      {
        tipo_id: tipo.id,
        nombre_modelo: modeloNombre,
        descripcion_tecnica: descripcionTecnica || null
      },
      { transaction }
    )
  } else if (descripcionTecnica && isBlank(modelo.descripcion_tecnica)) {
    await modelo.update(
      { descripcion_tecnica: descripcionTecnica },
      { transaction }
    )
  }

  return { tipo, modelo }
}

const upsertEquipo = async (data, modeloId, transaction) => {
  const numeroSerie = clean(data.serie)
  const codigoSicoin = clean(data.sicoin)
  const valor = toNumberOrNull(data.monto)

  if (!numeroSerie) {
    throw new Error('serie es requerida para filas de equipo')
  }

  if (!codigoSicoin) {
    throw new Error('sicoin es requerido para filas de equipo')
  }

  if (!modeloId) {
    throw new Error('No se pudo resolver el modelo del equipo')
  }

  let equipo = await Equipo.findOne({
    where: {
      [Op.or]: [
        { numero_serie: numeroSerie },
        { codigo_sicoin: codigoSicoin }
      ]
    },
    transaction
  })

  const payload = {
    modelo_id: modeloId,
    numero_serie: numeroSerie,
    codigo_sicoin: codigoSicoin,
    valor
  }

  if (!equipo) {
    equipo = await Equipo.create(payload, { transaction })
    return equipo
  }

  const updates = {}

  assignIfBlank(updates, 'modelo_id', equipo.modelo_id, payload.modelo_id)
  assignIfBlank(updates, 'numero_serie', equipo.numero_serie, payload.numero_serie)
  assignIfBlank(updates, 'codigo_sicoin', equipo.codigo_sicoin, payload.codigo_sicoin)
  assignIfBlank(updates, 'valor', equipo.valor, payload.valor, (v) => toNumberOrNull(v))

  if (Object.keys(updates).length > 0) {
    await equipo.update(updates, { transaction })
  }

  return equipo
}

const upsertInternet = async (data, transaction) => {
  const empresa = clean(data.empresa_conexion)
  const fechaInstalacion = toDateOnly(data.fecha_conexion) || todayDateOnly()

  if (!empresa) {
    throw new Error('empresa_conexion es requerida para filas de internet')
  }

  let internet = await Internet.findOne({
    where: {
      [Op.and]: [
        where(fn('LOWER', col('empresa')), empresa.toLowerCase()),
        where(fn('DATE', col('fecha_instalacion')), fechaInstalacion)
      ]
    },
    transaction
  })

  if (!internet) {
    internet = await Internet.create(
      {
        empresa,
        fecha_instalacion: fechaInstalacion
      },
      { transaction }
    )
    return internet
  }

  const updates = {}

  assignIfBlank(updates, 'empresa', internet.empresa, empresa)
  assignIfBlank(updates, 'fecha_instalacion', internet.fecha_instalacion, fechaInstalacion)

  if (Object.keys(updates).length > 0) {
    await internet.update(updates, { transaction })
  }

  return internet
}

const upsertDotacion = async ({ escuelaId, idProyecto, fechaEntrega, descripcion, idInternet = null }, transaction) => {
  const fecha = fechaEntrega || todayDateOnly()
  const desc = descripcion || 'DOTACION'

  let dotacion = await Dotacion.findOne({
    where: {
      id_escuela: escuelaId,
      fecha_entrega: fecha,
      descripcion: desc
    },
    transaction
  })

  if (!dotacion) {
    dotacion = await Dotacion.create(
      {
        id_escuela: escuelaId,
        id_proyecto: idProyecto,
        id_internet: idInternet,
        fecha_entrega: fecha,
        descripcion: desc
      },
      { transaction }
    )
    return dotacion
  }

  const updates = {}

  assignIfBlank(updates, 'id_internet', dotacion.id_internet, idInternet)
  assignIfBlank(updates, 'fecha_entrega', dotacion.fecha_entrega, fecha)
  assignIfBlank(updates, 'descripcion', dotacion.descripcion, desc)

  if (Object.keys(updates).length > 0) {
    await dotacion.update(updates, { transaction })
  }

  return dotacion
}

const upsertBeneficiario = async (data, escuelaId, transaction) => {
  const hasData = hasAny(data, [
    'beneficiarios_total',
    'beneficiarios_hombres',
    'beneficiarios_mujeres',
    'beneficiarios_maya',
    'beneficiarios_xinca',
    'beneficiarios_garifuna',
    'beneficiarios_otros',
    'edad_0_13',
    'edad_13_30',
    'edad_30_60',
    'edad_mas_60'
  ])

  if (!hasData) return null

  const fecha = toDate(data.fecha_entrega)
  const ciclo = fecha ? String(fecha.getFullYear()) : String(new Date().getFullYear())

  let beneficiario = await Beneficiario.findOne({
    where: {
      escuela_id: escuelaId,
      ciclo_educativo: ciclo
    },
    transaction
  })

  const payload = {
    escuela_id: escuelaId,
    ciclo_educativo: ciclo,
    hombres: toNumber(data.beneficiarios_hombres),
    mujeres: toNumber(data.beneficiarios_mujeres),
    docentes: toNumber(data.beneficiarios_total),
    mayas: toNumber(data.beneficiarios_maya),
    xincas: toNumber(data.beneficiarios_xinca),
    garifunas: toNumber(data.beneficiarios_garifuna),
    otros: toNumber(data.beneficiarios_otros),

    // Si ya agregaste estas columnas en la tabla, se guardan.
    edad_0_13: toNumber(data.edad_0_13),
    edad_13_30: toNumber(data.edad_13_30),
    edad_30_60: toNumber(data.edad_30_60),
    edad_mas_60: toNumber(data.edad_mas_60)
  }

  if (!beneficiario) {
    beneficiario = await Beneficiario.create(payload, { transaction })
    return beneficiario
  }

  const updates = {}

  assignIfPresent(updates, 'hombres', data.beneficiarios_hombres, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'mujeres', data.beneficiarios_mujeres, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'docentes', data.beneficiarios_total, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'mayas', data.beneficiarios_maya, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'xincas', data.beneficiarios_xinca, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'garifunas', data.beneficiarios_garifuna, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'otros', data.beneficiarios_otros, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'edad_0_13', data.edad_0_13, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'edad_13_30', data.edad_13_30, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'edad_30_60', data.edad_30_60, (v) => toNumberOrNull(v))
  assignIfPresent(updates, 'edad_mas_60', data.edad_mas_60, (v) => toNumberOrNull(v))

  if (Object.keys(updates).length > 0) {
    await beneficiario.update(updates, { transaction })
  }

  return beneficiario
}

const upsertActa = async (data, dotacionId, transaction) => {
  const hasData = hasAny(data, ['acta', 'folios', 'correlativo', 'fecha_entrega'])
  if (!hasData) return null

  const fechaEntrega = toDateOnly(data.fecha_entrega) || todayDateOnly()

  let acta = await Acta.findOne({
    where: { dotacion_id: dotacionId },
    transaction
  })

  const payload = {
    no_acta: clean(data.acta) || 'sin_info',
    dotacion_id: dotacionId,
    fecha_entrega: fechaEntrega,
    folios: clean(data.folios) || 'sin_info',
    correlativo: clean(data.correlativo) || 'sin_info',
    acta_pdf: null
  }

  if (!acta) {
    acta = await Acta.create(payload, { transaction })
    return acta
  }

  const updates = {}
  assignIfBlank(updates, 'no_acta', acta.no_acta, payload.no_acta)
  assignIfBlank(updates, 'fecha_entrega', acta.fecha_entrega, payload.fecha_entrega)
  assignIfBlank(updates, 'folios', acta.folios, payload.folios)
  assignIfBlank(updates, 'correlativo', acta.correlativo, payload.correlativo)

  if (Object.keys(updates).length > 0) {
    await acta.update(updates, { transaction })
  }

  return acta
}

const validateRow = (data) => {
  const errores = []

  if (!clean(data.codigo_establecimiento)) errores.push('Falta codigo_establecimiento')
  if (!clean(data.nombre_establecimiento)) errores.push('Falta nombre_establecimiento')
  if (!clean(data.departamento)) errores.push('Falta departamento')
  if (!clean(data.municipio)) errores.push('Falta municipio')

  const tipoRegistro = normalizeRegistroTipo(data.tipo_registro)

  if (!tipoRegistro) {
    errores.push('Falta tipo_registro')
  } else if (tipoRegistro === 'internet') {
    if (!clean(data.empresa_conexion)) {
      errores.push('Falta empresa_conexion para registro de internet')
    }
  } else {
    if (!clean(data.tipo_equipo)) errores.push('Falta tipo_equipo para registro de equipo')
    if (!clean(data.modelo)) errores.push('Falta modelo para registro de equipo')
    if (!clean(data.serie)) errores.push('Falta serie para registro de equipo')
    if (!clean(data.sicoin)) errores.push('Falta sicoin para registro de equipo')
  }

  return errores
}

const getFechaFila = (data) => {
  return toDateOnly(data.fecha_entrega) || toDateOnly(data.fecha_conexion) || todayDateOnly()
}

const mergeRows = (rows) => {
  const merged = {}

  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if ((merged[key] === undefined || clean(merged[key]) === null) && (clean(value) !== null || value === 0)) {
        merged[key] = value
      }
    }
  }

  return merged
}

const groupBy = (rows, keyFn) => {
  const map = new Map()

  for (const row of rows) {
    const key = keyFn(row)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(row)
  }

  return map
}

export const importarExcelDotaciones = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'No se recibió el archivo Excel'
    })
  }

  const workbook = new ExcelJS.Workbook()

  const insertados = []
  const noInsertados = []
  const errores = []

  const registrarNoInsertado = ({
    fila = null,
    escuela = null,
    codigo_establecimiento = null,
    tipo_registro = null,
    etapa = null,
    motivo = null,
    detalle = null
  }) => {
    noInsertados.push({
      fila,
      escuela,
      codigo_establecimiento,
      tipo_registro,
      etapa,
      motivo,
      detalle
    })
  }

  try {
    await workbook.xlsx.load(req.file.buffer)

    const sheet = workbook.getWorksheet(1)

    if (!sheet) {
      return res.status(400).json({
        message: 'No se encontró la primera hoja del Excel'
      })
    }

    // Buscar proyecto por defecto (PROVEDUC) o el primero disponible
    let proyecto = await Proyecto.findOne({
      where: { nombre: { [Op.like]: '%PROVEDUC%' } }
    });

    if (!proyecto) {
      proyecto = await Proyecto.findOne();
    }

    if (!proyecto) {
      return res.status(400).json({
        message: 'No se encontró ningún proyecto en la base de datos. Por favor cree uno antes de importar.'
      });
    }

    const idProyectoDefault = proyecto.id;

    const headers = []
    sheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = normalizeHeader(cell.value)
    })

    const seenRegistroIds = new Set()
    const filasValidas = []

    let filasProcesadas = 0
    let filasDuplicadas = 0

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const rawData = rowToObject(sheet, rowNumber, headers)
      const data = normalizeData(rawData)

      const filaVacia = Object.keys(data).every((k) => clean(data[k]) === null)
      if (filaVacia) continue

      filasProcesadas += 1

      const registroId = clean(data.registro_id)
      if (registroId) {
        if (seenRegistroIds.has(registroId)) {
          filasDuplicadas += 1
          registrarNoInsertado({
            fila: rowNumber,
            codigo_establecimiento: clean(data.codigo_establecimiento),
            tipo_registro: clean(data.tipo_registro),
            etapa: 'duplicado',
            motivo: `registro_id duplicado: ${registroId}`
          })
          continue
        }
        seenRegistroIds.add(registroId)
      }

      const validationErrors = validateRow(data)
      if (validationErrors.length > 0) {
        errores.push({
          fila: rowNumber,
          error: validationErrors.join(' | ')
        })

        registrarNoInsertado({
          fila: rowNumber,
          codigo_establecimiento: clean(data.codigo_establecimiento),
          tipo_registro: clean(data.tipo_registro),
          etapa: 'validacion',
          motivo: validationErrors.join(' | ')
        })

        continue
      }

      filasValidas.push({
        rowNumber,
        data
      })
    }

    const gruposEscuela = groupBy(filasValidas, ({ data }) => clean(data.codigo_establecimiento))

    let filasExitosas = 0

    for (const [codigoEscuela, registros] of gruposEscuela.entries()) {
      const transaction = await sequelize.transaction()

      try {
        const rows = registros.map((r) => r.data)

        // Datos de escuela: sí se puede combinar porque son del mismo establecimiento.
        const schoolData = mergeRows(rows)

        const escuela = await upsertEscuela(schoolData, transaction)
        await upsertBeneficiario(schoolData, escuela.id, transaction)

        const rowsInternet = registros.filter(
          ({ data }) => normalizeRegistroTipo(data.tipo_registro) === 'internet'
        )

        const rowsEquipo = registros.filter(
          ({ data }) => normalizeRegistroTipo(data.tipo_registro) === 'equipo'
        )

        // =========================
        // INTERNET
        // =========================
        const gruposInternet = groupBy(rowsInternet, ({ data }) => {
          const empresa = clean(data.empresa_conexion) || 'sin_empresa'
          const fecha = getFechaFila(data)
          return `${empresa}__${fecha}`
        })

        for (const internetRows of gruposInternet.values()) {
          try {
            const internetData = mergeRows(internetRows.map((r) => r.data))
            const fechaEntrega = getFechaFila(internetData)

            const internet = await upsertInternet(internetData, transaction)

            const dotacionInternet = await upsertDotacion(
              {
                escuelaId: escuela.id,
                idProyecto: idProyectoDefault,
                fechaEntrega,
                descripcion: 'CONEXION INTERNET',
                idInternet: internet.id
              },
              transaction
            )

            await upsertActa(internetData, dotacionInternet.id, transaction)

            for (const fila of internetRows) {
              insertados.push({
                fila: fila.rowNumber,
                escuela: clean(schoolData.nombre_establecimiento),
                codigo_establecimiento: codigoEscuela,
                tipo_registro: 'internet',
                etapa: 'insertado',
                dotacion_id: dotacionInternet.id
              })
              filasExitosas += 1
            }
          } catch (errorInternet) {
            for (const fila of internetRows) {
              registrarNoInsertado({
                fila: fila.rowNumber,
                escuela: clean(schoolData.nombre_establecimiento),
                codigo_establecimiento: codigoEscuela,
                tipo_registro: 'internet',
                etapa: 'internet',
                motivo: errorInternet.message
              })
            }
          }
        }

        // =========================
        // EQUIPO
        // =========================
        const gruposEquipos = groupBy(rowsEquipo, ({ data }) => getFechaFila(data))

        for (const [fechaEntrega, equipoRows] of gruposEquipos.entries()) {
          let dotacionEquipo = null

          try {
            const equipoDataGrupo = mergeRows(equipoRows.map((r) => r.data))

            dotacionEquipo = await upsertDotacion(
              {
                escuelaId: escuela.id,
                idProyecto: idProyectoDefault,
                fechaEntrega,
                descripcion: 'DOTACION DE EQUIPO'
              },
              transaction
            )

            await upsertActa(equipoDataGrupo, dotacionEquipo.id, transaction)

            for (const fila of equipoRows) {
              try {
                const { modelo } = await resolveTipoYModelo(fila.data, transaction)
                const equipo = await upsertEquipo(fila.data, modelo.id, transaction)

                const existeRelacion = await DotacionEquipo.findOne({
                  where: {
                    dotacion_id: dotacionEquipo.id,
                    equipo_id: equipo.id
                  },
                  transaction
                })

                if (!existeRelacion) {
                  await DotacionEquipo.create(
                    {
                      dotacion_id: dotacionEquipo.id,
                      equipo_id: equipo.id
                    },
                    { transaction }
                  )
                }

                insertados.push({
                  fila: fila.rowNumber,
                  escuela: clean(schoolData.nombre_establecimiento),
                  codigo_establecimiento: codigoEscuela,
                  tipo_registro: 'equipo',
                  etapa: 'insertado',
                  dotacion_id: dotacionEquipo.id,
                  serie: clean(fila.data.serie),
                  sicoin: clean(fila.data.sicoin)
                })

                filasExitosas += 1
              } catch (errorEquipoFila) {
                registrarNoInsertado({
                  fila: fila.rowNumber,
                  escuela: clean(schoolData.nombre_establecimiento),
                  codigo_establecimiento: codigoEscuela,
                  tipo_registro: 'equipo',
                  etapa: 'equipo',
                  motivo: errorEquipoFila.message,
                  detalle: {
                    serie: clean(fila.data.serie),
                    sicoin: clean(fila.data.sicoin),
                    modelo: clean(fila.data.modelo),
                    tipo_equipo: clean(fila.data.tipo_equipo)
                  }
                })
              }
            }
          } catch (errorGrupoEquipo) {
            for (const fila of equipoRows) {
              registrarNoInsertado({
                fila: fila.rowNumber,
                escuela: clean(schoolData.nombre_establecimiento),
                codigo_establecimiento: codigoEscuela,
                tipo_registro: 'equipo',
                etapa: 'grupo_equipo',
                motivo: errorGrupoEquipo.message
              })
            }
          }
        }

        await transaction.commit()
      } catch (errorFilaEscuela) {
        await transaction.rollback()

        errores.push({
          escuela: codigoEscuela,
          error: errorFilaEscuela.message
        })

        // Si falla la escuela completa, marcamos todas sus filas como no insertadas.
        for (const fila of registros) {
          registrarNoInsertado({
            fila: fila.rowNumber,
            escuela: clean(fila.data.nombre_establecimiento),
            codigo_establecimiento: codigoEscuela,
            tipo_registro: normalizeRegistroTipo(fila.data.tipo_registro),
            etapa: 'escuela',
            motivo: errorFilaEscuela.message
          })
        }
      }
    }

    return res.status(200).json({
      message: 'Importación terminada',
      filasProcesadas,
      filasExitosas,
      filasDuplicadas,
      filasConError: errores.length,
      insertados,
      noInsertados,
      errores
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error al importar Excel',
      error: error.message
    })
  }
}

