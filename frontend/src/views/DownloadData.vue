<template>
  <v-container fluid class="fill-height bg-main pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="3" lg="2" class="bg-white elevation-1 z-index-2">
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
            :items="departamentos"
            label="Departamento"
            variant="solo-filled"
            flat
            density="comfortable"
            class="mb-3 custom-input"
          ></v-select>

          <v-select
            v-model="filters.municipio"
            :items="municipios"
            label="Municipio"
            variant="solo-filled"
            flat
            density="comfortable"
            class="mb-3 custom-input"
            :disabled="!filters.departamento"
          ></v-select>

          <v-text-field
            v-model="filters.codigoEscuela"
            label="Código UDI"
            placeholder="00-00-0000"
            variant="solo-filled"
            flat
            density="comfortable"
            class="mb-6 custom-input"
          ></v-text-field>

          <v-btn
            block
            color="#003366"
            size="large"
            class="text-none font-weight-bold rounded-lg mb-2"
            elevation="0"
            @click="buscarData"
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
            <h1 class="text-h4 font-weight-bold text-blue-darken-4">Descargar Reportes</h1>
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
              color="#0094D3"
              prepend-icon="mdi-file-pdf-box"
              class="text-none font-weight-bold rounded-lg px-6 text-white"
              size="large"
              elevation="4"
              @click="descargar('pdf')"
            >
              Descargar PDF
            </v-btn>
          </div>
        </div>

        <v-card class="rounded-xl border-none elevation-sm">
          <v-data-table
            :headers="headers"
            :items="resultados"
            :loading="loading"
            hover
            class="custom-table"
          >
            <template v-slot:item.cantidad="{ value }">
              <v-chip variant="tonal" color="indigo" size="small" class="font-weight-bold">
                {{ value }} unidades
              </v-chip>
            </template>

            <template v-slot:item.estado="{ item }">
              <div class="d-flex align-center">
                <v-badge dot color="success" inline class="mr-2"></v-badge>
                <span class="text-body-2 font-weight-medium text-grey-darken-3">Auditado</span>
              </div>
            </template>

            <template v-slot:loading>
              <v-skeleton-loader type="table-row-divider@5"></v-skeleton-loader>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const filters = ref({ departamento: null, municipio: null, codigoEscuela: '' })

const departamentos = ['Guatemala', 'Sacatepéquez', 'Quetzaltenango', 'San Marcos']
const municipios = ['Ciudad de Guatemala', 'Mixco', 'Villa Nueva', 'Antigua Guatemala']

const headers = [
  { title: 'FECHA REGISTRO', key: 'fecha', align: 'start', class: 'text-grey' },
  { title: 'CENTRO EDUCATIVO', key: 'escuela' },
  { title: 'CÓDIGO UDI', key: 'codigo' },
  { title: 'CANTIDAD', key: 'cantidad', align: 'center' },
  { title: 'ESTADO', key: 'estado', align: 'end' },
]

const resultados = ref([
  { fecha: '05/02/2026', escuela: 'EORM Cantón La Unión', codigo: '01-01-0020-43', cantidad: 45 },
  { fecha: '04/02/2026', escuela: 'Inst. Normal Central para Varones', codigo: '01-01-0001-43', cantidad: 120 },
  { fecha: '02/02/2026', escuela: 'Escuela Oficial Urbana Mixta No. 5', codigo: '03-05-1244-43', cantidad: 30 },
  { fecha: '30/01/2026', escuela: 'Instituto Nacional de Educación Básica', codigo: '12-01-0045-43', cantidad: 15 },
])

const buscarData = () => {
  loading.value = true
  setTimeout(() => (loading.value = false), 1000)
}

const limpiarFiltros = () => {
  filters.value = { departamento: null, municipio: null, codigoEscuela: '' }
}

const descargar = (formato) => {
  console.log(`Exportando en ${formato}...`)
}
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


.custom-input :deep(.v-field__input) {
  font-size: 0.9rem;
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

.gap-3 {
  gap: 12px;
}

.elevation-sm {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
}
</style>