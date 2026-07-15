<template>
  <div style="width: 100%; padding: 12px;">
    <h1 class="text-h5 mb-4">Establecimientos</h1>

    <v-data-table
      :headers="headers"
      :items="items"
      :loading="store.loading"
      class="elevation-2"
      :items-per-page="10"
      density="compact"
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
          variant="flat"
        >
          {{ item.poseeConectividad ? 'Sí' : 'No' }}
        </v-chip>
      </template>

      <!-- Velocidad -->
      <template #item.velocidadConectividad="{ item }">
        <span v-if="item.velocidadConectividad">{{ item.velocidadConectividad }} Mbps</span>
        <span v-else class="text-disabled">—</span>
      </template>

      <!-- Proveedor de internet -->
      <template #item.empresaInternet="{ item }">
        <span v-if="item.empresaInternet">{{ item.empresaInternet }}</span>
        <span v-else class="text-disabled">—</span>
      </template>

      <!-- Cantidad de equipos -->
      <template #item.cantidadEquipos="{ item }">
        <v-chip
          :color="item.cantidadEquipos > 0 ? 'primary' : 'default'"
          size="small"
          variant="flat"
        >
          {{ item.cantidadEquipos > 0 ? item.cantidadEquipos : 'Sin dotar' }}
        </v-chip>
      </template>

      <!-- Modelos dotados -->
      <template #item.equipos="{ item }">
        <div v-if="item.equipos?.length" class="d-flex flex-wrap ga-1 py-1">
          <v-chip
            v-for="m in resumenModelos(item.equipos)"
            :key="m.modelo"
            size="x-small"
            variant="tonal"
            color="indigo"
          >
            {{ m.modelo }} <strong v-if="m.cantidad > 1" class="ml-1">x{{ m.cantidad }}</strong>
          </v-chip>
        </div>
        <span v-else class="text-disabled">—</span>
      </template>

      <!-- Fecha dotación -->
      <template #item.fechaDatacion="{ item }">
        <span v-if="item.fechaDatacion">{{ formatFecha(item.fechaDatacion) }}</span>
        <span v-else class="text-disabled">—</span>
      </template>

      <!-- Estudiantes -->
      <template #item.inscritos2026="{ item }">
        {{ item.inscritos2026 ?? '—' }}
      </template>

      <!-- Acciones -->
      <template #item.acciones="{ item }">
        <v-btn size="small" color="primary" variant="text" @click="showDetails(item)">
          Ver
        </v-btn>
      </template>

      <template #no-data>
        <v-alert type="info" border="start" class="ma-2">
          Selecciona un municipio o departamento en el mapa
        </v-alert>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEstablecimientosStore } from '../stores/escuelasStore'

const router = useRouter()
const store  = useEstablecimientosStore()
const items  = computed(() => store.getAll)

const headers = [
  { title: 'Establecimiento',    key: 'nombreEscuela',         sortable: true  },
  { title: 'Código MINEDUC',     key: 'codigoEscuela',         sortable: false },
  { title: 'Departamento',       key: 'departamento.nombre',   sortable: true  },
  { title: 'Municipio',          key: 'municipio.nombre',      sortable: true  },
  { title: 'Conectividad',       key: 'poseeConectividad',     sortable: true  },
  { title: 'Velocidad',          key: 'velocidadConectividad', sortable: true  },
  { title: 'Proveedor',          key: 'empresaInternet',       sortable: true  },
  { title: 'Equipos',            key: 'cantidadEquipos',       sortable: true  },
  { title: 'Modelos dotados',    key: 'equipos',               sortable: false },
  { title: 'Fecha dotación',     key: 'fechaDatacion',         sortable: true  },
  { title: 'Inscritos 2026',     key: 'inscritos2026',         sortable: true  },
  { title: '',                   key: 'acciones',              sortable: false },
]

// El API MDM devuelve los nombres en mayúsculas ("GUATEMALA", "SANTA CRUZ DEL QUICHE")
const titulo = (s) =>
  s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())

// Agrupa los equipos de una escuela por modelo: "Laptop HP 240 G9 x3"
function resumenModelos(equipos) {
  if (!equipos?.length) return []
  const conteo = new Map()
  for (const e of equipos) {
    conteo.set(e.modelo, (conteo.get(e.modelo) || 0) + 1)
  }
  return [...conteo.entries()].map(([modelo, cantidad]) => ({ modelo, cantidad }))
}

function formatFecha(f) {
  if (!f) return '—'
  const d = new Date(f)
  return isNaN(d) ? f : d.toLocaleDateString('es-GT')
}

function showDetails(item) {
  router.push({ name: 'details', query: { codigoMineduc: item.codigoEscuela } })
}
</script>
