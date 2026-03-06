<template>
  <div style="width: 100%;">
    <h1 class="text-h5 mb-4">📊 Escuelas</h1>

    <v-data-table
      :headers="headers"
      :items="items"
      :loading="store.loading"
      class="elevation-2"
      :items-per-page="10"
    >

      <!-- 🔹 Columna Departamento -->
      <template #item.departamento="{ item }">
        {{ item.raw.departamento?.nombre }}
      </template>

      <!-- 🔹 Columna Municipio -->
      <template #item.municipio="{ item }">
        {{ item.raw.municipio?.nombre }}
      </template>

      <!-- 🔹 Botón detalle -->
      <template #item.acciones="{ item }">
        <v-btn
          size="small"
          color="primary"
          @click="showDetails(item.raw)"
        >
          Ver
        </v-btn>
      </template>

      <!-- 🔹 Mensaje vacío -->
      <template #no-data>
        <v-alert type="info" border="start">
          No hay escuelas para mostrar
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
const store = useEstablecimientosStore()

// 🔹 Reactivo: cuando el store cambie, la tabla se actualiza sola
const items = computed(() => store.getAll)

// 🔹 Headers
const headers = [
  { title: 'Escuela', key: 'nombre' },
  { title: 'Código MINEDUC', key: 'codigoMineduc' },
  { title: 'Departamento', key: 'departamento.nombre' },
  { title: 'Municipio', key: 'municipio.nombre' },
  { title: 'Acciones', key: 'acciones', sortable: false }
]

// 🔹 Navegación
function showDetails(item) {
  router.push({
    path: '/details',
    state: { escuela: item }
  })
}
</script>