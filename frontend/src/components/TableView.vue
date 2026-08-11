<template>
  <v-card class="tabla-establecimientos" rounded="lg" elevation="3">
    <!-- Encabezado -->
    <div class="tabla-header">
      <div class="tabla-header__titulo">
        <v-icon size="26" class="mr-2">mdi-office-building-marker</v-icon>
        <div>
          <h2 class="text-h6 font-weight-bold mb-0">Establecimientos intervenidos</h2>
          <span class="text-caption text-medium-emphasis">
            {{ store.totalEstablecimientos }} establecimiento(s) según el filtro actual
          </span>
        </div>
      </div>
    </div>

    <v-divider />

    <!-- Barra de filtros -->
    <div class="tabla-filtros">
      <v-text-field
        v-model="codigoMineduc"
        label="Código MINEDUC"
        placeholder="Ej. 02-03-0022-46"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="tabla-filtros__codigo"
        @keyup.enter="aplicarFiltros"
        @click:clear="limpiarCodigo"
      />

      <v-switch
        v-model="intervenida"
        label="Solo intervenidos"
        color="indigo"
        density="compact"
        hide-details
        inset
        @update:model-value="aplicarFiltros"
      />

      <v-switch
        v-model="dotado"
        label="Solo con dotación"
        color="primary"
        density="compact"
        hide-details
        inset
        @update:model-value="aplicarFiltros"
      />

      <v-switch
        v-model="conectividad"
        label="Solo conectados"
        color="success"
        density="compact"
        hide-details
        inset
        @update:model-value="aplicarFiltros"
      />

      <v-spacer />

      <v-btn color="primary" variant="flat" prepend-icon="mdi-magnify" @click="aplicarFiltros">
        Buscar
      </v-btn>
      <v-btn variant="text" prepend-icon="mdi-filter-remove-outline" @click="limpiarFiltros">
        Limpiar
      </v-btn>
    </div>

    <v-divider />

    <v-data-table-server
      :headers="headers"
      :items="items"
      :items-length="store.totalEstablecimientos"
      :loading="store.loading"
      :page="store.pagina"
      :items-per-page="10"
      :items-per-page-options="[{ value: 10, title: '10' }]"
      class="tabla-datos"
      density="compact"
      hover
      @update:options="onOptions"
    >
      <!-- Departamento -->
      <template #item.departamento.nombre="{ item }">
        <span v-if="item.departamento?.nombre">{{ titulo(item.departamento.nombre) }}</span>
        <span v-else class="text-disabled">—</span>
      </template>

      <!-- Municipio -->
      <template #item.municipio.nombre="{ item }">
        <span v-if="item.municipio?.nombre">{{ titulo(item.municipio.nombre) }}</span>
        <span v-else class="text-disabled">—</span>
      </template>

      <!-- Conectividad -->
      <template #item.poseeConectividad="{ item }">
        <v-chip
          :color="item.poseeConectividad ? 'success' : 'error'"
          size="small"
          variant="tonal"
        >
          <v-icon start size="14">{{ item.poseeConectividad ? 'mdi-wifi' : 'mdi-wifi-off' }}</v-icon>
          {{ item.poseeConectividad ? 'Sí' : 'No' }}
        </v-chip>
      </template>

      <!-- Dotación (Sí/No con icono, igual que conectividad) -->
      <template #item.dotado="{ item }">
        <v-chip
          :color="item.dotado ? 'success' : 'error'"
          size="small"
          variant="tonal"
        >
          <v-icon start size="14">{{ item.dotado ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
          {{ item.dotado ? 'Sí' : 'No' }}
        </v-chip>
      </template>

      <!-- Estudiantes -->
      <template #item.inscritos2026="{ item }">
        {{ item.inscritos2026 ?? '—' }}
      </template>

      <!-- Acciones -->
      <template #item.acciones="{ item }">
        <v-btn size="small" color="primary" variant="tonal" @click="showDetails(item)">
          Ver
        </v-btn>
      </template>

      <template #no-data>
        <v-alert type="info" variant="tonal" border="start" class="ma-4">
          No hay establecimientos para el filtro actual. Ajusta los filtros o selecciona una zona en el mapa.
        </v-alert>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEstablecimientosStore } from '../stores/escuelasStore'

const router = useRouter()
const store  = useEstablecimientosStore()
const items  = computed(() => store.getAll)

// Estado local de los filtros de la tabla, inicializado desde el store.
const intervenida   = ref(store.filtroActual.intervenida ?? true)
const dotado        = ref(store.filtroActual.dotado || false)
const conectividad  = ref(store.filtroActual.conectividad || false)
const codigoMineduc = ref(store.filtroActual.codigoMineduc || '')

const headers = [
  { title: 'Establecimiento',    key: 'nombreEscuela',         sortable: true  },
  { title: 'Código del Establecimiento',     key: 'codigoEscuela',         sortable: false },
  { title: 'Departamento',       key: 'departamento.nombre',   sortable: true  },
  { title: 'Municipio',          key: 'municipio.nombre',      sortable: true  },
  { title: 'Conectividad',       key: 'poseeConectividad',     sortable: true  },
  { title: 'Dotación',           key: 'dotado',                sortable: true  },
  { title: 'Beneficiados',     key: 'inscritos2026',         sortable: true  },
  { title: '',                   key: 'acciones',              sortable: false },
]

// El API MDM devuelve los nombres en mayúsculas ("GUATEMALA", "SANTA CRUZ DEL QUICHE")
const titulo = (s) =>
  s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())

function showDetails(item) {
  // Se pasa el id del establecimiento (lo requiere la query establecimiento(id))
  // y el código como respaldo/lectura.
  router.push({ name: 'details', query: { id: item.id, codigoMineduc: item.codigoEscuela } })
}

// Aplica los filtros de la tabla volviendo a la primera página. El store combina
// estos filtros con la ubicación (departamento/municipio) elegida en el mapa.
function aplicarFiltros() {
  store.fetchDashboard({
    intervenida: intervenida.value,
    dotado: dotado.value,
    conectividad: conectividad.value,
    codigoMineduc: codigoMineduc.value,
    pagina: 1,
  })
}

function limpiarCodigo() {
  codigoMineduc.value = ''
  aplicarFiltros()
}

function limpiarFiltros() {
  intervenida.value = true
  dotado.value = false
  conectividad.value = false
  codigoMineduc.value = ''
  aplicarFiltros()
}

// La v-data-table-server avisa cuando cambia la página. Se pide esa página al
// backend; los filtros persisten en el store, así que no hace falta reenviarlos.
// El store ignora la consulta si es idéntica a la ya cargada, de modo que el
// disparo inicial al montar no duplica la carga que hace el mapa.
function onOptions({ page, itemsPerPage }) {
  store.fetchDashboard({ pagina: page, tamanoPagina: itemsPerPage })
}
</script>

<style scoped>
.tabla-establecimientos {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  background: #ffffff;
}

.tabla-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(90deg, #0d3b5d 0%, #12507d 100%);
  color: #ffffff;
}

.tabla-header__titulo {
  display: flex;
  align-items: center;
}

.tabla-header :deep(.v-icon) {
  color: #ffffff;
}

.tabla-filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #f6f8fb;
}

.tabla-filtros__codigo {
  max-width: 260px;
  flex: 1 1 200px;
}

/* La tabla ancha (10 columnas) hace scroll horizontal adentro de la tarjeta,
   no rompe el ancho de la página. */
.tabla-datos {
  font-size: 13px;
}

.tabla-datos :deep(.v-table__wrapper) {
  overflow-x: auto;
}

/* Filas y celdas más compactas */
.tabla-datos :deep(td),
.tabla-datos :deep(th) {
  padding: 0 10px !important;
  white-space: nowrap;
}

/* Encabezados de la tabla más formales */
.tabla-datos :deep(thead th) {
  background: #eef2f7 !important;
  color: #0d3b5d !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.3px;
}
</style>
