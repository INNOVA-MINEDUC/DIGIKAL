<template>
  <!-- A pantalla completa en móvil, igual que el detalle de la dotación. -->
  <v-dialog v-model="abierto" max-width="820" scrollable :fullscreen="esMovil">
    <v-card :class="esMovil ? '' : 'rounded-xl'">

      <div class="reporte-head">
        <div class="d-flex align-center reporte-head__info">
          <v-avatar color="rgba(255,255,255,0.15)" size="44" class="mr-3">
            <v-icon color="white" size="26">mdi-school-outline</v-icon>
          </v-avatar>
          <div class="reporte-head__texto">
            <div class="text-subtitle-1 text-sm-h6 font-weight-bold text-white">
              Establecimientos dotados y conectados
            </div>
            <div class="text-caption text-white" style="opacity: 0.85;">
              Una fila por establecimiento · datos del API del MINEDUC
            </div>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" color="white" @click="abierto = false" />
      </div>

      <v-card-text class="pa-4 pa-sm-6">

        <!-- La primera consulta recorre el API del MINEDUC y tarda unos
             segundos; las siguientes salen de la caché del servidor. -->
        <div v-if="cargando" class="py-10 text-center">
          <v-progress-circular indeterminate color="#003366" class="mb-4" />
          <div class="text-body-2 text-grey-darken-1">
            Consultando los establecimientos en el API del MINEDUC…
          </div>
        </div>

        <v-alert v-else-if="errorCarga" type="error" variant="tonal" class="text-body-2">
          {{ errorCarga }}
          <template #append>
            <v-btn variant="text" size="small" class="text-none" @click="cargar">Reintentar</v-btn>
          </template>
        </v-alert>

        <template v-else>
          <div class="text-overline font-weight-bold text-grey-darken-1 mb-1">Estado</div>
          <v-chip-group v-model="filtros.estado" mandatory column class="mb-3">
            <v-chip
              v-for="op in ESTADOS"
              :key="op.valor"
              :value="op.valor"
              filter
              variant="outlined"
              color="#003366"
              size="small"
            >
              {{ op.titulo }}
              <span class="ml-1 text-grey-darken-1">({{ conteoPorEstado[op.valor] }})</span>
            </v-chip>
          </v-chip-group>

          <div class="text-overline font-weight-bold text-grey-darken-1 mb-1">Ubicación y conectividad</div>
          <v-row dense class="mb-2">
            <v-col cols="12" sm="6">
              <v-select
                v-model="filtros.departamento"
                :items="departamentos"
                label="Departamento"
                prepend-inner-icon="mdi-map-marker"
                clearable
                density="comfortable"
                variant="solo-filled"
                flat
                hide-details
                class="custom-input"
                @update:model-value="filtros.municipio = null"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="filtros.municipio"
                :items="municipios"
                label="Municipio"
                prepend-inner-icon="mdi-city-variant-outline"
                clearable
                density="comfortable"
                variant="solo-filled"
                flat
                hide-details
                class="custom-input"
                :disabled="!filtros.departamento"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="filtros.proveedor"
                :items="proveedores"
                label="Proveedor de internet"
                prepend-inner-icon="mdi-wifi"
                clearable
                density="comfortable"
                variant="solo-filled"
                flat
                hide-details
                class="custom-input"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="filtros.tipoConectividad"
                :items="tiposConectividad"
                label="Tipo de conectividad"
                prepend-inner-icon="mdi-access-point-network"
                clearable
                density="comfortable"
                variant="solo-filled"
                flat
                hide-details
                class="custom-input"
              />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" sm="6">
              <div class="text-overline font-weight-bold text-grey-darken-1 mb-1">Fecha de conexión</div>
              <div class="d-flex ga-2">
                <v-text-field
                  v-model="filtros.conexionDesde"
                  type="date"
                  label="Desde"
                  density="comfortable"
                  variant="solo-filled"
                  flat
                  class="custom-input"
                  :hide-details="!errorConexion"
                />
                <v-text-field
                  v-model="filtros.conexionHasta"
                  type="date"
                  label="Hasta"
                  density="comfortable"
                  variant="solo-filled"
                  flat
                  class="custom-input"
                  :error-messages="errorConexion"
                  :hide-details="!errorConexion"
                />
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-overline font-weight-bold text-grey-darken-1 mb-1">Fecha de dotación</div>
              <div class="d-flex ga-2">
                <v-text-field
                  v-model="filtros.dotacionDesde"
                  type="date"
                  label="Desde"
                  density="comfortable"
                  variant="solo-filled"
                  flat
                  class="custom-input"
                  :hide-details="!errorDotacion"
                />
                <v-text-field
                  v-model="filtros.dotacionHasta"
                  type="date"
                  label="Hasta"
                  density="comfortable"
                  variant="solo-filled"
                  flat
                  class="custom-input"
                  :error-messages="errorDotacion"
                  :hide-details="!errorDotacion"
                />
              </div>
            </v-col>
          </v-row>
          <div class="text-caption text-grey-darken-1 mt-1 mb-5">
            Con una fecha de conexión sólo quedan los establecimientos conectados en ese rango;
            con una de dotación, sólo los dotados en ese rango.
          </div>

          <div class="resumen-box">
            <div class="resumen-box__num">{{ filtrados.length }}</div>
            <div class="text-body-2">
              <div class="font-weight-bold text-blue-darken-4">establecimiento(s) a descargar</div>
              <div class="text-grey-darken-1">
                {{ resumen.conectados }} conectados · {{ resumen.dotados }} dotados ·
                {{ resumen.inscritos.toLocaleString('es-GT') }} estudiantes inscritos
              </div>
            </div>
          </div>
        </template>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <v-btn variant="text" color="grey-darken-1" class="text-none" :disabled="cargando" @click="restablecer">
          Restablecer
        </v-btn>
        <v-spacer />
        <v-btn variant="text" class="text-none" @click="abierto = false">Cancelar</v-btn>
        <!-- Color en `style`, como en el resto de la vista: con un hex en la
             prop `color` el botón acababa saliendo gris. Deshabilitado se deja
             sin estilo para que se note que no se puede pulsar. -->
        <v-btn
          variant="flat"
          class="text-none font-weight-bold"
          prepend-icon="mdi-file-excel"
          :style="puedeDescargar ? 'background-color:#0094D3;color:#ffffff;' : ''"
          :disabled="!puedeDescargar"
          :loading="generando"
          @click="descargar"
        >
          Descargar Excel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import ExcelJS from 'exceljs'
import Swal from 'sweetalert2'
import api from '@/helpers/api.js'

const abierto = defineModel({ type: Boolean, default: false })

const { smAndDown: esMovil } = useDisplay()

const ESTADOS = [
  { valor: 'todos', titulo: 'Todos (dotados o conectados)', cumple: () => true },
  { valor: 'conectados', titulo: 'Con conectividad', cumple: (e) => e.conectado },
  { valor: 'dotados', titulo: 'Con dotación', cumple: (e) => e.dotado },
  { valor: 'ambos', titulo: 'Dotados y conectados', cumple: (e) => e.dotado && e.conectado },
  { valor: 'solo_conectados', titulo: 'Sólo conectividad (sin dotación)', cumple: (e) => e.conectado && !e.dotado },
  { valor: 'solo_dotados', titulo: 'Sólo dotación (sin conectividad)', cumple: (e) => e.dotado && !e.conectado },
]

const FILTROS_INICIALES = {
  estado: 'todos',
  departamento: null,
  municipio: null,
  proveedor: null,
  tipoConectividad: null,
  conexionDesde: '',
  conexionHasta: '',
  dotacionDesde: '',
  dotacionHasta: '',
}

const datos = ref([])
const cargando = ref(false)
const errorCarga = ref('')
const generando = ref(false)
const filtros = ref({ ...FILTROS_INICIALES })

const cargar = async () => {
  cargando.value = true
  errorCarga.value = ''
  try {
    const { data } = await api.get('/api/v1/dotacion/establecimientos')
    datos.value = data.establecimientos || []
  } catch (error) {
    errorCarga.value = error.response?.data?.message || 'No se pudieron consultar los establecimientos.'
  } finally {
    cargando.value = false
  }
}

// Se consulta al abrir por primera vez, no al entrar a la vista: la mayoría de
// las visitas a Dotaciones no usan este reporte.
watch(abierto, (valor) => {
  if (valor && !datos.value.length && !cargando.value) cargar()
})

const restablecer = () => {
  filtros.value = { ...FILTROS_INICIALES }
}

const ordenar = (lista) => [...new Set(lista.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))

// Las opciones salen de los datos: sólo aparece lo que tiene registros.
const departamentos = computed(() => ordenar(datos.value.map((e) => e.departamento)))
const municipios = computed(() => {
  if (!filtros.value.departamento) return []
  return ordenar(
    datos.value.filter((e) => e.departamento === filtros.value.departamento).map((e) => e.municipio)
  )
})
const proveedores = computed(() => ordenar(datos.value.map((e) => e.proveedor)))
const tiposConectividad = computed(() => ordenar(datos.value.map((e) => e.tipoConectividad)))

// Las fechas llegan del backend como 'YYYY-MM-DD', igual que el valor de un
// <input type="date">, así que se comparan como texto sin pasar por Date (que
// las leería como UTC y en Guatemala correría el día).
const errorRango = (desde, hasta) =>
  desde && hasta && desde > hasta ? 'La fecha final es anterior a la inicial' : ''

const errorConexion = computed(() => errorRango(filtros.value.conexionDesde, filtros.value.conexionHasta))
const errorDotacion = computed(() => errorRango(filtros.value.dotacionDesde, filtros.value.dotacionHasta))

const enRango = (fecha, desde, hasta) => {
  if (!desde && !hasta) return true
  if (!fecha) return false
  if (desde && fecha < desde) return false
  if (hasta && fecha > hasta) return false
  return true
}

// Todo menos el estado: sirve para contar cuántos hay en cada estado con el
// resto de filtros puestos, y que los números de los chips digan la verdad.
const filtradosSinEstado = computed(() => {
  const f = filtros.value
  return datos.value.filter((e) => {
    if (f.departamento && e.departamento !== f.departamento) return false
    if (f.municipio && e.municipio !== f.municipio) return false
    if (f.proveedor && e.proveedor !== f.proveedor) return false
    if (f.tipoConectividad && e.tipoConectividad !== f.tipoConectividad) return false
    if (!enRango(e.fechaConexion, f.conexionDesde, f.conexionHasta)) return false
    if (!enRango(e.fechaDotacion, f.dotacionDesde, f.dotacionHasta)) return false
    return true
  })
})

const conteoPorEstado = computed(() =>
  Object.fromEntries(ESTADOS.map((op) => [op.valor, filtradosSinEstado.value.filter(op.cumple).length]))
)

const filtrados = computed(() => {
  const estado = ESTADOS.find((op) => op.valor === filtros.value.estado) || ESTADOS[0]
  return filtradosSinEstado.value
    .filter(estado.cumple)
    .sort((a, b) =>
      a.departamento.localeCompare(b.departamento, 'es') ||
      a.municipio.localeCompare(b.municipio, 'es') ||
      a.nombre.localeCompare(b.nombre, 'es')
    )
})

const resumen = computed(() => ({
  conectados: filtrados.value.filter((e) => e.conectado).length,
  dotados: filtrados.value.filter((e) => e.dotado).length,
  inscritos: filtrados.value.reduce((t, e) => t + (e.inscritos || 0), 0),
}))

const puedeDescargar = computed(() =>
  !cargando.value && !errorCarga.value && filtrados.value.length > 0 &&
  !errorConexion.value && !errorDotacion.value
)

/* ── Excel ──────────────────────────────────────────────────────────────── */

const AZUL = '0D3B5D'
const AZUL_CLARO = 'E8EEF4'
const HOJA = 'Establecimientos'
const FILA_ENCABEZADO = 5

const COLUMNAS = [
  { header: 'No.', key: 'no', width: 6 },
  { header: 'Código MINEDUC', key: 'codigo', width: 16 },
  { header: 'Establecimiento', key: 'nombre', width: 46 },
  { header: 'Departamento', key: 'departamento', width: 16 },
  { header: 'Municipio', key: 'municipio', width: 22 },
  { header: 'Dirección', key: 'direccion', width: 34 },
  { header: 'Nivel', key: 'nivel', width: 14 },
  { header: 'Conectado', key: 'conectado', width: 11 },
  { header: 'Proveedor de internet', key: 'proveedor', width: 18 },
  { header: 'Tipo de conectividad', key: 'tipoConectividad', width: 14 },
  { header: 'Velocidad (Mbps)', key: 'velocidad', width: 11 },
  { header: 'Fecha de conexión', key: 'fechaConexion', width: 13 },
  { header: 'Dotado', key: 'dotado', width: 9 },
  { header: 'Fecha de dotación', key: 'fechaDotacion', width: 13 },
  { header: 'Inscritos 2026', key: 'inscritos', width: 11 },
  { header: 'Hombres', key: 'hombres', width: 10 },
  { header: 'Mujeres', key: 'mujeres', width: 10 },
  { header: 'Teléfono', key: 'telefono', width: 13 },
  { header: 'Correo electrónico', key: 'correo', width: 30 },
  { header: 'OPF', key: 'opf', width: 7 },
  { header: 'Latitud', key: 'latitud', width: 11 },
  { header: 'Longitud', key: 'longitud', width: 11 },
]

// Letra de la columna en la hoja de detalle, para las fórmulas del resumen.
const letra = (key) => String.fromCharCode(65 + COLUMNAS.findIndex((c) => c.key === key))

// ExcelJS convierte las fechas a serial usando UTC: con Date.UTC el día queda
// exacto, sin el corrimiento de la zona horaria.
const aFechaExcel = (iso) => {
  if (!iso) return null
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia))
}

const fechaLegible = (iso) => (iso ? iso.split('-').reverse().join('/') : '')

const rangoLegible = (desde, hasta) =>
  `${desde ? fechaLegible(desde) : 'inicio'} a ${hasta ? fechaLegible(hasta) : 'hoy'}`

const filtrosAplicados = () => {
  const f = filtros.value
  const partes = []
  if (f.estado !== 'todos') partes.push(`Estado: ${ESTADOS.find((op) => op.valor === f.estado)?.titulo}`)
  if (f.departamento) partes.push(`Depto: ${f.departamento}`)
  if (f.municipio) partes.push(`Municipio: ${f.municipio}`)
  if (f.proveedor) partes.push(`Proveedor: ${f.proveedor}`)
  if (f.tipoConectividad) partes.push(`Conectividad: ${f.tipoConectividad}`)
  if (f.conexionDesde || f.conexionHasta) partes.push(`Conexión: ${rangoLegible(f.conexionDesde, f.conexionHasta)}`)
  if (f.dotacionDesde || f.dotacionHasta) partes.push(`Dotación: ${rangoLegible(f.dotacionDesde, f.dotacionHasta)}`)
  return partes.length ? partes.join('  ·  ') : 'Sin filtros (todos los dotados o conectados)'
}

// Lo mismo para la bitácora, con valores legibles en lugar de códigos.
const filtrosAuditoria = () => {
  const f = filtros.value
  return {
    estado: f.estado !== 'todos' ? ESTADOS.find((op) => op.valor === f.estado)?.titulo : null,
    departamento: f.departamento,
    municipio: f.municipio,
    proveedor: f.proveedor,
    tipoConectividad: f.tipoConectividad,
    conexionDesde: f.conexionDesde || null,
    conexionHasta: f.conexionHasta || null,
    dotacionDesde: f.dotacionDesde || null,
    dotacionHasta: f.dotacionHasta || null,
  }
}

const bloqueTitulo = (hoja, titulo, totalCols) => {
  const lineas = [
    { texto: titulo, font: { bold: true, size: 16, color: { argb: AZUL } } },
    { texto: `Ministerio de Educación · Generado: ${new Date().toLocaleString('es-GT')}`, font: { size: 10, color: { argb: '64748B' } } },
    { texto: `Filtros: ${filtrosAplicados()}`, font: { size: 10, italic: true, color: { argb: '475569' } } },
  ]
  lineas.forEach(({ texto, font }, i) => {
    hoja.mergeCells(i + 1, 1, i + 1, totalCols)
    const celda = hoja.getCell(i + 1, 1)
    celda.value = texto
    celda.font = font
    celda.alignment = { vertical: 'middle' }
  })
  hoja.getRow(1).height = 24
}

const estiloEncabezado = (fila) => {
  fila.height = 30
  fila.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  })
}

const hojaDetalle = (workbook, lista) => {
  const hoja = workbook.addWorksheet(HOJA, {
    views: [{ state: 'frozen', xSplit: 3, ySplit: FILA_ENCABEZADO }],
  })
  bloqueTitulo(hoja, 'Establecimientos dotados y conectados', COLUMNAS.length)

  hoja.getRow(FILA_ENCABEZADO).values = COLUMNAS.map((c) => c.header)
  hoja.columns.forEach((col, i) => { col.width = COLUMNAS[i].width; col.key = COLUMNAS[i].key })
  estiloEncabezado(hoja.getRow(FILA_ENCABEZADO))
  hoja.autoFilter = {
    from: { row: FILA_ENCABEZADO, column: 1 },
    to: { row: FILA_ENCABEZADO, column: COLUMNAS.length },
  }

  // Formato y alineación van celda por celda: asignados a la columna, ExcelJS
  // los aplica también al título combinado y al encabezado (lo centraría y le
  // quitaría el ajuste de texto).
  const FORMATOS = {
    fechaConexion: 'dd/mm/yyyy',
    fechaDotacion: 'dd/mm/yyyy',
    inscritos: '#,##0',
    hombres: '#,##0',
    mujeres: '#,##0',
  }
  const CENTRADAS = new Set([
    'no', 'conectado', 'tipoConectividad', 'velocidad', 'fechaConexion', 'dotado', 'fechaDotacion', 'opf',
  ])

  lista.forEach((e, idx) => {
    const fila = hoja.addRow({
      ...e,
      no: idx + 1,
      conectado: e.conectado ? 'Sí' : 'No',
      dotado: e.dotado ? 'Sí' : 'No',
      fechaConexion: aFechaExcel(e.fechaConexion),
      fechaDotacion: aFechaExcel(e.fechaDotacion),
    })
    fila.eachCell({ includeEmpty: true }, (cell, col) => {
      const key = COLUMNAS[col - 1]?.key
      cell.alignment = CENTRADAS.has(key)
        ? { vertical: 'middle', horizontal: 'center' }
        : { vertical: 'middle' }
      if (FORMATOS[key]) cell.numFmt = FORMATOS[key]
      if (idx % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_CLARO } }
      cell.border = { bottom: { style: 'hair', color: { argb: 'CBD5E1' } } }
    })
  })
}

/**
 * Resumen con fórmulas sobre la hoja de detalle, para que se recalcule si
 * alguien corrige o borra filas. Cada fórmula lleva su resultado ya calculado:
 * así el archivo muestra los números aunque se abra en un visor que no
 * recalcula (vista previa del correo, del teléfono…).
 */
const hojaResumen = (workbook, lista) => {
  const hoja = workbook.addWorksheet('Resumen')
  hoja.columns = [{ width: 30 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 16 }]
  bloqueTitulo(hoja, 'Resumen del reporte', 5)

  const ultima = FILA_ENCABEZADO + lista.length
  const rango = (key) => `${HOJA}!$${letra(key)}$${FILA_ENCABEZADO + 1}:$${letra(key)}$${ultima}`
  const formula = (texto, resultado) => ({ formula: texto, result: resultado })
  const suma = (l, key) => l.reduce((t, e) => t + (e[key] || 0), 0)

  let fila = 5
  const encabezado = (titulos) => {
    hoja.getRow(fila).values = titulos
    estiloEncabezado(hoja.getRow(fila))
    hoja.getRow(fila).height = 20
    fila++
  }
  const escribir = (valores, { negrita = false } = {}) => {
    const r = hoja.getRow(fila)
    r.values = valores
    r.eachCell((cell, col) => {
      if (col > 1) cell.numFmt = '#,##0'
      if (negrita) {
        cell.font = { bold: true }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_CLARO } }
      }
    })
    fila++
  }
  const subtitulo = (texto) => {
    fila++
    hoja.getCell(fila, 1).value = texto
    hoja.getCell(fila, 1).font = { bold: true, color: { argb: AZUL } }
    fila++
  }

  const conectados = lista.filter((e) => e.conectado)
  const dotados = lista.filter((e) => e.dotado)

  encabezado(['Indicador', 'Valor'])
  escribir(['Establecimientos', formula(`COUNTA(${rango('codigo')})`, lista.length)])
  escribir(['Con conectividad', formula(`COUNTIF(${rango('conectado')},"Sí")`, conectados.length)])
  escribir(['Con dotación', formula(`COUNTIF(${rango('dotado')},"Sí")`, dotados.length)])
  escribir(['Dotados y conectados', formula(
    `COUNTIFS(${rango('conectado')},"Sí",${rango('dotado')},"Sí")`,
    lista.filter((e) => e.conectado && e.dotado).length
  )])
  escribir(['Estudiantes inscritos 2026', formula(`SUM(${rango('inscritos')})`, suma(lista, 'inscritos'))])
  escribir(['Hombres', formula(`SUM(${rango('hombres')})`, suma(lista, 'hombres'))])
  escribir(['Mujeres', formula(`SUM(${rango('mujeres')})`, suma(lista, 'mujeres'))])

  // Por departamento.
  subtitulo('Por departamento')
  encabezado(['Departamento', 'Establecimientos', 'Conectados', 'Dotados', 'Inscritos 2026'])
  const primeraDepto = fila
  for (const depto of ordenar(lista.map((e) => e.departamento))) {
    const deDepto = lista.filter((e) => e.departamento === depto)
    const ref = `A${fila}`
    escribir([
      depto,
      formula(`COUNTIF(${rango('departamento')},${ref})`, deDepto.length),
      formula(`COUNTIFS(${rango('departamento')},${ref},${rango('conectado')},"Sí")`, deDepto.filter((e) => e.conectado).length),
      formula(`COUNTIFS(${rango('departamento')},${ref},${rango('dotado')},"Sí")`, deDepto.filter((e) => e.dotado).length),
      formula(`SUMIF(${rango('departamento')},${ref},${rango('inscritos')})`, suma(deDepto, 'inscritos')),
    ])
  }
  escribir([
    'Total',
    ...['B', 'C', 'D', 'E'].map((col, i) => formula(
      `SUM(${col}${primeraDepto}:${col}${fila - 1})`,
      [lista.length, conectados.length, dotados.length, suma(lista, 'inscritos')][i]
    )),
  ], { negrita: true })

  // Por proveedor: sólo tiene sentido si hay conectados en el reporte.
  const listaProveedores = ordenar(conectados.map((e) => e.proveedor))
  if (listaProveedores.length) {
    subtitulo('Conectados por proveedor')
    encabezado(['Proveedor', 'Establecimientos', 'Inscritos 2026'])
    const primeraProv = fila
    for (const prov of listaProveedores) {
      const deProv = conectados.filter((e) => e.proveedor === prov)
      escribir([
        prov,
        formula(`COUNTIF(${rango('proveedor')},A${fila})`, deProv.length),
        formula(`SUMIF(${rango('proveedor')},A${fila},${rango('inscritos')})`, suma(deProv, 'inscritos')),
      ])
    }
    escribir([
      'Total',
      formula(`SUM(B${primeraProv}:B${fila - 1})`, conectados.filter((e) => e.proveedor).length),
      formula(`SUM(C${primeraProv}:C${fila - 1})`, suma(conectados.filter((e) => e.proveedor), 'inscritos')),
    ], { negrita: true })
  }
}

const descargar = async () => {
  if (!puedeDescargar.value) return
  generando.value = true
  try {
    const lista = filtrados.value
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'DIGIKAL · MINEDUC'
    workbook.created = new Date()

    // El resumen se crea primero para que sea la pestaña que abre el archivo;
    // sus fórmulas apuntan a la hoja de detalle por nombre.
    hojaResumen(workbook, lista)
    hojaDetalle(workbook, lista)

    const blob = new Blob([await workbook.xlsx.writeBuffer()], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `establecimientos_dotados_conectados_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)

    api.post('/api/v1/audit/log-download', {
      format: 'excel',
      reporte: 'establecimientos',
      filtros: filtrosAuditoria(),
    }).catch((err) => console.error('No se pudo registrar la descarga en auditoría:', err))
  } catch (error) {
    console.error('Error exportando establecimientos:', error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el archivo' })
  } finally {
    generando.value = false
  }
}
</script>

<style scoped>
.reporte-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #003366 0%, #0094D3 100%);
}

/* El título no debe empujar la X de cerrar fuera de la cabecera. */
.reporte-head__info,
.reporte-head__texto {
  min-width: 0;
}

.reporte-head__texto {
  overflow-wrap: anywhere;
}

.custom-input :deep(.v-field) {
  border-radius: 12px !important;
  background-color: #f1f5f9 !important;
}

/* Cuántos establecimientos saldrán en el archivo con los filtros puestos. */
.resumen-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background-color: #f0f6fb;
  border: 1px solid rgba(0, 148, 211, 0.2);
  border-radius: 12px;
}

.resumen-box__num {
  font-size: 2rem;
  font-weight: 800;
  color: #003366;
  line-height: 1;
}

@media (max-width: 600px) {
  .reporte-head {
    padding: 14px 16px;
  }
}
</style>
