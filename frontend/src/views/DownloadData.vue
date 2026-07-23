<template>
  <v-container fluid class="fill-height bg-main pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="3" lg="2" class="bg-white elevation-1 z-index-2 panel-lateral">
        <div class="pa-6">
          <div class="d-flex align-center mb-8">
            <v-img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Escudo_de_Guatemala.svg" width="40" height="40" contain class="mr-3"></v-img>
            <div>
              <div class="text-caption font-weight-black text-blue-darken-4 line-height-1">GOBIERNO DE</div>
              <div class="text-subtitle-2 font-weight-black text-blue-darken-4">GUATEMALA</div>
            </div>
          </div>

          <h3 class="text-overline font-weight-bold text-grey-darken-1 mb-4">Filtros de Reporte</h3>

          <v-select
            v-model="filters.departamento"
            class="mb-4 custom-input"
            clearable
            label="Departamento"
            prepend-inner-icon="mdi-map-marker"
            density="comfortable"
            variant="solo-filled"
            flat
            :items="departamentosDisponibles"
            @update:model-value="onDepartamentoChange"
          ></v-select>

          <v-select
            v-model="filters.municipio"
            class="mb-4 custom-input"
            clearable
            label="Municipio"
            prepend-inner-icon="mdi-city-variant-outline"
            density="comfortable"
            variant="solo-filled"
            flat
            :items="municipiosDisponibles"
            :disabled="!filters.departamento"
            :hint="!filters.departamento ? 'Elige un departamento primero' : ''"
            persistent-hint
            @update:model-value="aplicarFiltro"
          ></v-select>

          <v-select
            v-model="filters.origen"
            class="mb-6 mt-2 custom-input"
            clearable
            label="Origen"
            prepend-inner-icon="mdi-source-branch"
            density="comfortable"
            variant="solo-filled"
            flat
            :items="ORIGENES"
            item-title="titulo"
            item-value="valor"
            @update:model-value="aplicarFiltro"
          ></v-select>
          <v-btn
            block
            color="#003366"
            size="large"
            class="text-none font-weight-bold rounded-lg mb-2"
            elevation="0"
            @click="aplicarFiltro"
          >
            Aplicar Filtros
          </v-btn>
          
          <v-btn
            block
            variant="text"
            color="grey-darken-1"
            class="text-none"
            @click="limpiarFiltros"
          >
            Restablecer
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="9" lg="10" class="pa-6 pa-lg-10">
        <div class="d-flex align-center justify-space-between mb-8">
          <div>
            <h1 class="text-h4 font-weight-bold text-blue-darken-4">Descargar Reportes y Actas</h1>
            <p class="text-body-1 text-grey-darken-1">Gestión y exportación de donaciones tecnológicas</p>
          </div>

          <div class="d-flex gap-3">
            <v-btn
              variant="outlined"
              color="#0094D3"
              prepend-icon="mdi-file-excel"
              class="text-none font-weight-bold rounded-lg px-6"
              size="large"
              @click="descargar('excel')"
            >
              Excel
            </v-btn> 
                  <v-btn
              variant="outlined"
              color="#d32f2f"
              prepend-icon="mdi-file-pdf-box"
              class="text-none font-weight-bold rounded-lg px-6"
              size="large"
              @click="descargar('pdf')"
            >
              PDF
            </v-btn>
          </div>
        </div>

        <v-card class="rounded-xl border-none elevation-sm">
          <!-- Búsqueda rápida sobre la tabla: cubre código de establecimiento,
               nombre, origen y fecha. -->
          <div class="pa-4 pb-0">
            <v-text-field
              v-model="search"
              label="Buscar por código de establecimiento, escuela, origen…"
              prepend-inner-icon="mdi-magnify"
              variant="solo-filled"
              flat
              density="comfortable"
              hide-details
              clearable
              class="custom-input"
            ></v-text-field>
          </div>

          <v-data-table
            :headers="headers"
            :items="resultados"
            :loading="loading"
            :search="search"
            :items-per-page="10"
            :items-per-page-options="[
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: -1, title: 'Todas' },
            ]"
            item-value="id"
            hover
            class="custom-table"
          >

            <template v-slot:item.actas="{ item }">
              <v-chip
                :color="item.actas.length ? '#003366' : 'grey'"
                variant="tonal"
                size="small"
                class="font-weight-bold"
                prepend-icon="mdi-file-document-multiple-outline"
              >
                {{ item.actas.length }}
              </v-chip>
            </template>

            <template v-slot:item.acciones="{ item }">
              <v-btn
                color="#003366"
                variant="tonal"
                size="small"
                class="text-none font-weight-bold"
                append-icon="mdi-arrow-right"
                @click="verDetalle(item)"
              >
                Ver más
              </v-btn>
            </template>

            <template v-slot:loading>
              <v-skeleton-loader type="table-row-divider@5"></v-skeleton-loader>
            </template>

            <template v-slot:no-data>
              <div class="pa-8 text-center text-grey">
                No hay dotaciones que coincidan con los filtros.
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- ============ DETALLE COMPLETO DE LA DOTACIÓN ============ -->
    <v-dialog v-model="dialogDetalle" max-width="900" scrollable>
      <v-card v-if="detalle" class="rounded-xl">

        <!-- Cabecera -->
        <div class="detalle-head">
          <div class="d-flex align-center">
            <v-avatar color="rgba(255,255,255,0.15)" size="48" class="mr-4">
              <v-icon color="white" size="28">mdi-school</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold text-white">{{ detalle.escuela }}</div>
              <div class="text-caption text-white" style="opacity: 0.85;">
                UDI {{ detalle.codigo }} · {{ detalle.establecimiento.departamento }} /
                {{ detalle.establecimiento.municipio }}
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="dialogDetalle = false" />
        </div>

        <v-card-text class="pa-6">

          <!-- Resumen de la dotación -->
          <div class="d-flex flex-wrap ga-2 mb-6">
            <v-chip variant="tonal" color="#003366" prepend-icon="mdi-calendar">
              Registro: {{ detalle.fecha }}
            </v-chip>
            <v-chip variant="tonal" :color="detalle.origen === 'Compra' ? 'deep-purple' : 'teal'"
              prepend-icon="mdi-source-branch">
              {{ detalle.origen }}
            </v-chip>
            <v-chip variant="tonal" color="indigo" prepend-icon="mdi-devices">
              {{ detalle.cantidadEquipos }} equipo(s)
            </v-chip>
            <v-chip variant="tonal" color="#003366" prepend-icon="mdi-file-document-multiple-outline">
              {{ detalle.actas.length }} acta(s)
            </v-chip>
          </div>

          <!-- Datos del establecimiento -->
          <div class="text-overline font-weight-bold text-grey-darken-1 mb-2">
            Datos del establecimiento
          </div>
          <v-row dense class="mb-4">
            <v-col cols="12" sm="6" md="4" v-for="dato in datosEstablecimiento" :key="dato.label">
              <div class="dato-box">
                <div class="dato-box__label">{{ dato.label }}</div>
                <div class="dato-box__valor">{{ dato.valor }}</div>
              </div>
            </v-col>
          </v-row>

          <!-- Beneficiados -->
          <div class="text-overline font-weight-bold text-grey-darken-1 mb-2">
            Beneficiados
          </div>
          <v-row dense class="mb-2">
            <v-col cols="6" sm="3" v-for="stat in statsBeneficiados" :key="stat.label">
              <div class="stat-box">
                <div class="stat-box__num">{{ stat.valor }}</div>
                <div class="stat-box__label">{{ stat.label }}</div>
              </div>
            </v-col>
          </v-row>
          <div class="d-flex flex-wrap ga-2 mb-6">
            <v-chip size="small" variant="outlined" v-for="etnia in etniasBeneficiados" :key="etnia.label">
              {{ etnia.label }}: <strong class="ml-1">{{ etnia.valor }}</strong>
            </v-chip>
          </div>

          <!-- Actas -->
          <div class="text-overline font-weight-bold text-grey-darken-1 mb-2">
            Actas de entrega ({{ detalle.actas.length }})
          </div>
          <v-alert v-if="detalle.actas.length === 0" type="info" variant="tonal"
            density="compact" class="text-body-2 mb-6">
            Esta dotación no tiene actas registradas.
          </v-alert>
          <v-table v-else density="comfortable" class="tabla-actas mb-2">
            <thead>
              <tr>
                <th class="text-left">No. de acta</th>
                <th class="text-left">Fecha de entrega</th>
                <th class="text-left">Origen</th>
                <th class="text-left">Folios</th>
                <th class="text-right">Documento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="acta in actasPaginadas" :key="acta.id">
                <td class="font-weight-medium">{{ acta.no_acta || '—' }}</td>
                <td>{{ formatearFecha(acta.fecha_entrega) }}</td>
                <td>
                  <v-chip size="x-small" variant="tonal"
                    :color="acta.origen === 'COMPRA' ? 'deep-purple' : 'teal'">
                    {{ etiquetaOrigen(acta.origen) }}
                  </v-chip>
                </td>
                <td>{{ acta.folios || '—' }}</td>
                <td class="text-right">
                  <v-btn v-if="acta.url" size="small" color="primary" variant="tonal"
                    class="text-none" prepend-icon="mdi-file-pdf-box" @click="abrirActa(acta)">
                    Ver PDF
                  </v-btn>
                  <span v-else class="text-caption text-grey">Sin archivo</span>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Paginación de actas: sólo aparece si hay más de una página. -->
          <div v-if="actasTotalPages > 1" class="d-flex justify-center mb-6">
            <v-pagination
              v-model="actasPage"
              :length="actasTotalPages"
              :total-visible="5"
              density="comfortable"
              size="small"
            />
          </div>
          <div v-else class="mb-6"></div>

          <!-- Equipos -->
          <template v-if="detalle.equipos.length">
            <div class="text-overline font-weight-bold text-grey-darken-1 mb-2">
              Equipos entregados ({{ detalle.equipos.length }})
            </div>
            <v-table density="comfortable" class="tabla-actas mb-6">
              <thead>
                <tr>
                  <th class="text-left">Tipo</th>
                  <th class="text-left">Modelo</th>
                  <th class="text-left">No. de serie</th>
                  <th class="text-left">SICOIN</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="eq in detalle.equipos" :key="eq.id">
                  <td>{{ eq.tipo }}</td>
                  <td>{{ eq.modelo }}</td>
                  <td>{{ eq.numero_serie }}</td>
                  <td>{{ eq.codigo_sicoin }}</td>
                </tr>
              </tbody>
            </v-table>
          </template>

          <!-- Fotos de evidencia -->
          <template v-if="detalle.imagenes.length">
            <div class="text-overline font-weight-bold text-grey-darken-1 mb-2">
              Fotos de evidencia ({{ detalle.imagenes.length }})
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-img v-for="img in detalle.imagenes" :key="img.id" :src="img.url"
                width="104" height="104" cover class="rounded-lg evidencia-mini"
                @click="abrirUrl(img.url)" />
            </div>
          </template>

        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialogDetalle = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api, { urlArchivo } from '@/helpers/api.js'
import Swal from 'sweetalert2'

import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const resultados = ref([]);
const loading = ref(false)
const datosOriginales = ref([]);
const filters = ref({
  departamento: null,
  municipio: null,
  origen: null
})

// Refleja el ENUM de dotaciones.origen en la base.
const ORIGENES = [
  { valor: 'DONACION', titulo: 'Donación' },
  { valor: 'COMPRA', titulo: 'Compra' },
]

const etiquetaOrigen = (valor) =>
  ORIGENES.find(o => o.valor === valor)?.titulo || 'Sin origen'

const nombreDepto = (d) => d.escuela?.departamento?.nombre || null
const nombreMuni = (d) => d.escuela?.municipio?.nombre || null

// Opciones de ubicación derivadas de las dotaciones cargadas: sólo aparecen
// los lugares que realmente tienen registros.
const departamentosDisponibles = computed(() =>
  [...new Set(datosOriginales.value.map(nombreDepto).filter(Boolean))].sort()
)

// Los municipios dependen del departamento elegido.
const municipiosDisponibles = computed(() => {
  if (!filters.value.departamento) return []
  return [...new Set(
    datosOriginales.value
      .filter(d => nombreDepto(d) === filters.value.departamento)
      .map(nombreMuni)
      .filter(Boolean)
  )].sort()
})

// Al cambiar de departamento se limpia el municipio: el anterior ya no aplica.
const onDepartamentoChange = () => {
  filters.value.municipio = null
  aplicarFiltro()
}

// `fecha_entrega` viene como 'YYYY-MM-DD' (DATEONLY). Se parte a mano en vez
// de usar new Date(), que la interpreta como UTC y en Guatemala muestra el día
// anterior.
const formatearFecha = (valor) => {
  if (!valor) return '—'

  const [anio, mes, dia] = String(valor).slice(0, 10).split('-')
  if (!anio || !mes || !dia) return '—'

  return `${dia}/${mes}/${anio}`
}

// La tabla muestra sólo lo esencial; el resto va en el diálogo "Ver más".
const headers = [
  { title: 'FECHA REGISTRO', key: 'fecha', align: 'start' },
  { title: 'ORIGEN', key: 'origen' },
  { title: 'CENTRO EDUCATIVO', key: 'escuela' },
  { title: 'CÓDIGO UDI', key: 'codigo' },
  { title: 'ACTAS', key: 'actas', align: 'center', sortable: false },
  { title: '', key: 'acciones', align: 'end', sortable: false },
]

// Búsqueda rápida sobre la tabla (código de establecimiento, escuela, etc.).
const search = ref('')

// Diálogo de detalle completo de una dotación.
const dialogDetalle = ref(false)
const detalle = ref(null)

// Paginación de la tabla de actas dentro del diálogo (10 por página).
const actasPage = ref(1)
const ACTAS_POR_PAGINA = 10

const actasTotalPages = computed(() =>
  Math.max(1, Math.ceil((detalle.value?.actas?.length || 0) / ACTAS_POR_PAGINA))
)

const actasPaginadas = computed(() => {
  const actas = detalle.value?.actas || []
  const inicio = (actasPage.value - 1) * ACTAS_POR_PAGINA
  return actas.slice(inicio, inicio + ACTAS_POR_PAGINA)
})

const verDetalle = (item) => {
  detalle.value = item
  actasPage.value = 1   // cada dotación arranca en la primera página de actas
  dialogDetalle.value = true
}

// Grillas del diálogo, derivadas del elemento seleccionado.
const datosEstablecimiento = computed(() => {
  const e = detalle.value?.establecimiento
  if (!e) return []
  return [
    { label: 'Departamento', valor: e.departamento },
    { label: 'Municipio', valor: e.municipio },
    { label: 'Dirección', valor: e.direccion },
    { label: 'Director', valor: e.director },
    { label: 'Teléfono', valor: e.telefono },
    { label: 'Correo', valor: e.correo },
    { label: 'Nivel', valor: e.nivel },
    { label: 'Jornada', valor: e.jornada },
  ]
})

const statsBeneficiados = computed(() => {
  const b = detalle.value?.beneficiados
  if (!b) return []
  return [
    { label: 'Hombres', valor: b.hombres },
    { label: 'Mujeres', valor: b.mujeres },
    { label: 'Docentes', valor: b.docentes },
    { label: 'Total', valor: b.total },
  ]
})

const etniasBeneficiados = computed(() => {
  const b = detalle.value?.beneficiados
  if (!b) return []
  return [
    { label: 'Mayas', valor: b.mayas },
    { label: 'Xincas', valor: b.xincas },
    { label: 'Garífunas', valor: b.garifunas },
    { label: 'Otros', valor: b.otros },
  ]
})

// La gestión de proyectos (diálogo de alta + GET/POST /api/v1/proyectos) se
// eliminó junto con la tabla `proyectos`. El origen es un ENUM fijo, no un
// catálogo que el usuario pueda administrar.

const buscarData = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/api/v1/dotacion`);
    datosOriginales.value = response.data;
    aplicarFiltro();
  } catch (error) {
    console.error('❌ Error al obtener datos:', error);
  } finally {
    loading.value = false;
  }
};

// Aplica los filtros de la barra lateral. Se usa tanto para la tabla como para
// las exportaciones, así ambas ven exactamente el mismo conjunto.
const filtrarDotaciones = (data) => {
  return data.filter(d => {
    if (filters.value.origen && d.origen !== filters.value.origen) return false
    if (filters.value.departamento && nombreDepto(d) !== filters.value.departamento) return false
    if (filters.value.municipio && nombreMuni(d) !== filters.value.municipio) return false
    return true
  })
}

const aplicarFiltro = () => {
  const data = filtrarDotaciones(datosOriginales.value);

  // Mapeo y formateo de datos para la tabla
  resultados.value = data.map(d => {
    const escuela = d.escuela || {};

    // Nombres únicos de tipos y modelos, para el detalle.
    const tiposUnicos = [...new Set(d.equipos?.map(e => e.modelo?.tipo?.nombre).filter(Boolean))];
    const modelosUnicos = [...new Set(d.equipos?.map(e => e.modelo?.nombre_modelo).filter(Boolean))];

    // Beneficiados: el registro está a nivel de escuela (ver modelo). Se toma
    // el primero, que es el que usa el reporte de exportación.
    const b = escuela.beneficiarios?.[0] || {};

    return {
      // --- Resumen visible en la tabla ---
      id: d.id,
      fecha: formatearFecha(d.fecha_entrega),
      origen: etiquetaOrigen(d.origen),
      escuela: escuela.nombreEscuela || 'Sin nombre',
      codigo: escuela.codigoEscuela || 'N/A',

      // --- Detalle (diálogo "Ver más") ---
      establecimiento: {
        departamento: escuela.departamento?.nombre || 'Sin departamento',
        municipio: escuela.municipio?.nombre || 'Sin municipio',
        direccion: escuela.direccion || '—',
        director: escuela.director || '—',
        telefono: escuela.telefono || '—',
        correo: escuela.correo || '—',
        nivel: escuela.nivel || '—',
        jornada: escuela.jornada || '—',
      },
      beneficiados: {
        hombres: Number(b.hombres || 0),
        mujeres: Number(b.mujeres || 0),
        docentes: Number(b.docentes || 0),
        total: Number(b.total || 0),
        mayas: Number(b.mayas || 0),
        xincas: Number(b.xincas || 0),
        garifunas: Number(b.garifunas || 0),
        otros: Number(b.otros || 0),
      },
      equipos: (d.equipos || []).map(e => ({
        id: e.id,
        numero_serie: e.numero_serie || '—',
        codigo_sicoin: e.codigo_sicoin || '—',
        modelo: e.modelo?.nombre_modelo || '—',
        tipo: e.modelo?.tipo?.nombre || '—',
      })),
      tipos: tiposUnicos.join(', '),
      modelos: modelosUnicos.join(', '),
      cantidadEquipos: d.equipos?.length || 0,
      // Una dotación puede tener varias actas. `url` la resuelve el backend
      // según dónde quedó el archivo (bucket o disco local).
      actas: (d.actas || []).map(a => ({ ...a, url: urlArchivo(a.url) })),
      imagenes: (d.imagenes || [])
        .map(i => ({ ...i, url: urlArchivo(i.url_publica) }))
        .filter(i => i.url),
    };
  });
};

const abrirUrl = (url) => {
  if (url) window.open(url, '_blank');
};

const abrirActa = (acta) => abrirUrl(acta.url);

const limpiarFiltros = () => {
  filters.value = { departamento: null, municipio: null, origen: null };
  aplicarFiltro();
}

const getFilteredDotaciones = () => filtrarDotaciones(datosOriginales.value)

// Etiqueta legible de los filtros activos, para el encabezado de los reportes.
const filtrosAplicados = () => {
  const partes = []
  if (filters.value.departamento) partes.push(`Depto: ${filters.value.departamento}`)
  if (filters.value.municipio) partes.push(`Municipio: ${filters.value.municipio}`)
  if (filters.value.origen) partes.push(`Origen: ${etiquetaOrigen(filters.value.origen)}`)
  return partes.length ? partes.join('  ·  ') : 'Sin filtros (todos los registros)'
}

// Totales calculados sobre las dotaciones (no sobre las filas aplanadas, que
// repiten la escuela por equipo y falsearían las cuentas).
const resumenDotaciones = (dotaciones) => {
  const porOrigen = {}
  const escuelas = new Set()
  let totalEquipos = 0

  dotaciones.forEach((d) => {
    const etq = etiquetaOrigen(d.origen)
    porOrigen[etq] = (porOrigen[etq] || 0) + 1
    totalEquipos += d.equipos?.length || 0
    if (d.escuela?.codigoEscuela) escuelas.add(d.escuela.codigoEscuela)
  })

  return {
    totalDotaciones: dotaciones.length,
    totalEscuelas: escuelas.size,
    totalEquipos,
    porOrigen,
  }
}

const flattenReporte = (dotaciones) => {
  const rows = []

  dotaciones.forEach((d) => {
    const escuela = d.escuela || {}
    const dept = escuela.departamento?.nombre || ''
    const muni = escuela.municipio?.nombre || ''
    const beneficiario = escuela.beneficiarios?.[0] || {}
    const actas = d.actas || []
    const internet = d.internet || {}

    const base = {
      fecha_entrega: formatearFecha(d.fecha_entrega),
      origen: etiquetaOrigen(d.origen),
      escuela: escuela.nombreEscuela || '',
      codigo: escuela.codigoEscuela || '',
      departamento: dept,
      municipio: muni,
      direccion: escuela.direccion || '',
      telefono: escuela.telefono || '',
      correo: escuela.correo || '',
      nivel: escuela.nivel || '',
      jornada: escuela.jornada || '',
      director: escuela.director || '',

      // Varias actas por dotación: se listan separadas por coma en una celda,
      // para no multiplicar las filas del reporte.
      no_acta: actas.map(a => a.no_acta).filter(Boolean).join(', '),
      folios: actas.map(a => a.folios).filter(Boolean).join(', '),
      correlativo: actas.map(a => a.correlativo).filter(Boolean).join(', '),

      // Numéricos como Number para que Excel los sume y ordene.
      hombres: Number(beneficiario.hombres || 0),
      mujeres: Number(beneficiario.mujeres || 0),
      docentes: Number(beneficiario.docentes || 0),
      mayas: Number(beneficiario.mayas || 0),
      xincas: Number(beneficiario.xincas || 0),
      garifunas: Number(beneficiario.garifunas || 0),
      otros: Number(beneficiario.otros || 0),
      edad_0_13: Number(beneficiario.edad_0_13 || 0),
      edad_13_30: Number(beneficiario.edad_13_30 || 0),
      edad_30_60: Number(beneficiario.edad_30_60 || 0),
      edad_mas_60: Number(beneficiario.edad_mas_60 || 0),

      tipo_registro: d.descripcion || '',
      empresa_internet: internet.empresa || '',
      fecha_internet: internet.fecha_instalacion
        ? formatearFecha(internet.fecha_instalacion)
        : '',

      tipo_equipo: '',
      modelo: '',
      serie: '',
      sicoin: '',
      valor: null
    }

    if (d.equipos?.length > 0) {
      d.equipos.forEach((eq) => {
        rows.push({
          ...base,
          tipo_equipo: eq.modelo?.tipo?.nombre || '',
          modelo: eq.modelo?.nombre_modelo || '',
          serie: eq.numero_serie || '',
          sicoin: eq.codigo_sicoin || '',
          valor: eq.valor != null ? Number(eq.valor) : null
        })
      })
    } else {
      rows.push({
        ...base,
        tipo_equipo: d.id_internet ? 'Internet' : 'Sin equipo'
      })
    }
  })

  return rows
}

const AZUL = '0D3B5D'
const AZUL_CLARO = 'E8EEF4'

const descargarExcel = async (rows, resumen) => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'DIGIKAL · MINEDUC'
  workbook.created = new Date()

  const columnas = [
    { header: 'Fecha entrega', key: 'fecha_entrega', width: 14 },
    { header: 'Origen', key: 'origen', width: 12 },
    { header: 'Escuela', key: 'escuela', width: 35 },
    { header: 'Código UDI', key: 'codigo', width: 16 },
    { header: 'Departamento', key: 'departamento', width: 18 },
    { header: 'Municipio', key: 'municipio', width: 18 },
    { header: 'Dirección', key: 'direccion', width: 22 },
    { header: 'Teléfono', key: 'telefono', width: 14 },
    { header: 'Correo', key: 'correo', width: 24 },
    { header: 'Nivel', key: 'nivel', width: 14 },
    { header: 'Jornada', key: 'jornada', width: 14 },
    { header: 'Director', key: 'director', width: 18 },
    { header: 'Acta', key: 'no_acta', width: 16 },
    { header: 'Folios', key: 'folios', width: 12 },
    { header: 'Correlativo', key: 'correlativo', width: 12 },
    { header: 'Hombres', key: 'hombres', width: 10 },
    { header: 'Mujeres', key: 'mujeres', width: 10 },
    { header: 'Docentes', key: 'docentes', width: 10 },
    { header: 'Mayas', key: 'mayas', width: 10 },
    { header: 'Xincas', key: 'xincas', width: 10 },
    { header: 'Garífunas', key: 'garifunas', width: 10 },
    { header: 'Otros', key: 'otros', width: 10 },
    { header: '0-13', key: 'edad_0_13', width: 8 },
    { header: '13-30', key: 'edad_13_30', width: 8 },
    { header: '30-60', key: 'edad_30_60', width: 8 },
    { header: '60+', key: 'edad_mas_60', width: 8 },
    { header: 'Tipo equipo', key: 'tipo_equipo', width: 18 },
    { header: 'Modelo', key: 'modelo', width: 22 },
    { header: 'Serie', key: 'serie', width: 18 },
    { header: 'SICOIN', key: 'sicoin', width: 14 },
    { header: 'Valor', key: 'valor', width: 12 },
    { header: 'Internet empresa', key: 'empresa_internet', width: 20 },
    { header: 'Internet fecha', key: 'fecha_internet', width: 14 }
  ]

  /* ---------- Hoja de detalle ---------- */
  const sheet = workbook.addWorksheet('Detalle', {
    views: [{ state: 'frozen', ySplit: 5 }]   // fija el bloque de título + encabezado
  })

  const totalCols = columnas.length

  // Bloque de título (filas 1-3), sobre el ancho de la tabla.
  sheet.mergeCells(1, 1, 1, totalCols)
  const t1 = sheet.getCell(1, 1)
  t1.value = 'Reporte de Dotaciones Tecnológicas'
  t1.font = { bold: true, size: 16, color: { argb: AZUL } }
  t1.alignment = { vertical: 'middle' }
  sheet.getRow(1).height = 24

  sheet.mergeCells(2, 1, 2, totalCols)
  const t2 = sheet.getCell(2, 1)
  t2.value = `Ministerio de Educación · Generado: ${new Date().toLocaleString('es-GT')}`
  t2.font = { size: 10, color: { argb: '64748B' } }

  sheet.mergeCells(3, 1, 3, totalCols)
  const t3 = sheet.getCell(3, 1)
  t3.value = `Filtros: ${filtrosAplicados()}   |   ${resumen.totalDotaciones} dotación(es) · ${resumen.totalEscuelas} establecimiento(s) · ${resumen.totalEquipos} equipo(s)`
  t3.font = { size: 10, italic: true, color: { argb: '475569' } }

  // Fila 4 vacía como separador; encabezado en la fila 5.
  const filaHeader = 5
  sheet.getRow(filaHeader).values = columnas.map(c => c.header)
  sheet.columns.forEach((col, i) => { col.width = columnas[i].width; col.key = columnas[i].key })

  const header = sheet.getRow(filaHeader)
  header.height = 20
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = { bottom: { style: 'thin', color: { argb: AZUL } } }
  })

  // Filtro automático sobre el encabezado.
  sheet.autoFilter = {
    from: { row: filaHeader, column: 1 },
    to: { row: filaHeader, column: totalCols }
  }

  // Datos.
  rows.forEach((row, idx) => {
    const fila = sheet.addRow(row)
    const par = idx % 2 === 0
    fila.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' }
      if (par) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_CLARO } }
      }
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'CBD5E1' } }
      }
    })
  })

  // Formato de moneda para la columna Valor.
  sheet.getColumn('valor').numFmt = '"Q"#,##0.00'

  /* ---------- Hoja de resumen ---------- */
  const hojaResumen = workbook.addWorksheet('Resumen')
  hojaResumen.columns = [
    { header: 'Indicador', key: 'k', width: 32 },
    { header: 'Valor', key: 'v', width: 16 }
  ]
  const encR = hojaResumen.getRow(1)
  encR.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } }
  })

  hojaResumen.addRow({ k: 'Total de dotaciones', v: resumen.totalDotaciones })
  hojaResumen.addRow({ k: 'Establecimientos distintos', v: resumen.totalEscuelas })
  hojaResumen.addRow({ k: 'Total de equipos', v: resumen.totalEquipos })
  hojaResumen.addRow({ k: '', v: '' })
  hojaResumen.addRow({ k: 'Dotaciones por origen', v: '' }).getCell(1).font = { bold: true }
  Object.entries(resumen.porOrigen).forEach(([origen, cant]) => {
    hojaResumen.addRow({ k: `   ${origen}`, v: cant })
  })

  await descargarBlob(
    await workbook.xlsx.writeBuffer(),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xlsx'
  )
}

const descargarBlob = (data, mime, ext) => {
  const blob = new Blob([data], { type: mime })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_dotaciones_${new Date().toISOString().slice(0, 10)}.${ext}`
  a.click()
  window.URL.revokeObjectURL(url)
}

const descargarPdf = async (rows, resumen) => {
  const doc = new jsPDF('landscape')
  const anchoPag = doc.internal.pageSize.getWidth()
  const azul = [13, 59, 93]

  // --- Banda de título ---
  doc.setFillColor(...azul)
  doc.rect(0, 0, anchoPag, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('Reporte de Dotaciones Tecnológicas', 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Ministerio de Educación de Guatemala', 14, 19)

  // --- Metadatos y resumen ---
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(9)
  const porOrigen = Object.entries(resumen.porOrigen)
    .map(([o, c]) => `${o}: ${c}`).join('   ·   ') || '—'

  doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 14, 33)
  doc.text(`Filtros: ${filtrosAplicados()}`, 14, 38)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...azul)
  doc.text(
    `${resumen.totalDotaciones} dotación(es)  ·  ${resumen.totalEscuelas} establecimiento(s)  ·  ${resumen.totalEquipos} equipo(s)      [ ${porOrigen} ]`,
    14, 44
  )

  autoTable(doc, {
    startY: 49,
    head: [[
      'Fecha', 'Origen', 'Escuela', 'Código UDI', 'Depto', 'Municipio',
      'Acta(s)', 'Tipo equipo', 'Modelo', 'Serie', 'SICOIN'
    ]],
    body: rows.map(r => ([
      r.fecha_entrega,
      r.origen,
      r.escuela,
      r.codigo,
      r.departamento,
      r.municipio,
      r.no_acta || '—',
      r.tipo_equipo,
      r.modelo,
      r.serie,
      r.sicoin
    ])),
    styles: { fontSize: 7, cellPadding: 1.8, overflow: 'linebreak' },
    headStyles: { fillColor: azul, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [232, 238, 244] },
    columnStyles: {
      2: { cellWidth: 45 },   // Escuela
      8: { cellWidth: 30 },   // Modelo
    },
    margin: { bottom: 16 },
    // Pie con número de página en cada hoja.
    didDrawPage: (data) => {
      const alto = doc.internal.pageSize.getHeight()
      const pagina = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184)
      doc.text('DIGIKAL · MINEDUC', data.settings.margin.left, alto - 8)
      doc.text(`Página ${pagina}`, anchoPag - data.settings.margin.right, alto - 8, { align: 'right' })
    }
  })

  doc.save(`reporte_dotaciones_${new Date().toISOString().slice(0, 10)}.pdf`)
}

const descargar = async (formato) => {
  try {
    const data = getFilteredDotaciones()
    const rows = flattenReporte(data)

    if (!rows.length) {
      Swal.fire({
        icon: 'info',
        title: 'Sin datos',
        text: 'No hay registros para exportar con esos filtros'
      })
      return
    }

    const resumen = resumenDotaciones(data)

    if (formato === 'excel') {
      await descargarExcel(rows, resumen)
    } else if (formato === 'pdf') {
      await descargarPdf(rows, resumen)
    }

    api.post('/api/v1/audit/log-download', {
      format: formato,
      filtros: filters.value
    }).catch((err) => console.error('No se pudo registrar la descarga en auditoría:', err))
  } catch (error) {
    console.error('Error exportando:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el archivo'
    })
  }
}

onMounted(() => {
  buscarData();
});
</script>

<style scoped>
.bg-main {
  background-color: #F8FAFC !important;
}

.line-height-1 {
  line-height: 1.1;
}

.z-index-2 {
  z-index: 2;
}

/* El panel de filtros abarca toda la altura: `fill-height` en el contenedor
   centra verticalmente su fila, lo que dejaba el panel del tamaño de su
   contenido. align-self stretch + min-height 100vh lo devuelven a full height. */
.panel-lateral {
  align-self: stretch;
  min-height: 100vh;
}

.custom-input :deep(.v-field) {
  border-radius: 12px !important;
  background-color: #f1f5f9 !important;
}

.custom-table {
  border-radius: 16px !important;
}

.custom-table :deep(thead) {
  background-color: #fcfcfc !important;
}

.custom-table :deep(th) {
  text-transform: uppercase;
  font-size: 0.75rem !important;
  letter-spacing: 0.5px;
  font-weight: 700 !important;
  color: #64748b !important;
}

/* ===== Diálogo de detalle de la dotación ===== */
.detalle-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #003366 0%, #0094D3 100%);
}

/* Ficha de dato del establecimiento (label + valor). */
.dato-box {
  height: 100%;
  padding: 10px 14px;
  background-color: #f7fafc;
  border-radius: 10px;
  border: 1px solid rgba(0, 51, 102, 0.08);
}

.dato-box__label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 700;
  color: #94a3b8;
}

.dato-box__valor {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  word-break: break-word;
}

/* Tarjeta numérica de beneficiados. */
.stat-box {
  text-align: center;
  padding: 12px 8px;
  background-color: #f0f6fb;
  border-radius: 12px;
  border: 1px solid rgba(0, 148, 211, 0.15);
}

.stat-box__num {
  font-size: 1.5rem;
  font-weight: 800;
  color: #003366;
  line-height: 1.1;
}

.stat-box__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: #64748b;
}

.tabla-actas {
  background-color: #fff;
  border: 1px solid rgba(0, 51, 102, 0.12);
  border-radius: 10px;
  overflow: hidden;
}

.tabla-actas :deep(th) {
  font-size: 0.7rem !important;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 700 !important;
  color: #64748b !important;
  background-color: #fafbfc;
}

.evidencia-mini {
  cursor: zoom-in;
  border: 1px solid rgba(0, 51, 102, 0.12);
  transition: transform 0.15s ease;
}

.evidencia-mini:hover {
  transform: scale(1.04);
}

.gap-3 {
  gap: 12px;
}

.elevation-sm {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
}
</style>