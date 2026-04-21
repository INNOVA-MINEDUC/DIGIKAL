<template>

  <v-container fluid class="fill-height bg-main pa-0">

    <v-row no-gutters class="fill-height">

      <v-col cols="12" md="3" lg="2" class="bg-white elevation-1 z-index-2">

        <div class="pa-6">

          <div class="d-flex align-center mb-8">

            <v-img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Escudo_de_Guatemala.svg" width="40"

              height="40" contain class="mr-3"></v-img>

            <div>

              <div class="text-caption font-weight-black text-blue-darken-4 line-height-1">GOBIERNO DE</div>

              <div class="text-subtitle-2 font-weight-black text-blue-darken-4">GUATEMALA</div>

            </div>

          </div>



<v-slide-x-transition mode="out-in">

  <!-- 🔹 FILTROS PRINCIPALES -->
  <v-sheet v-if="!mostrarDetalle" key="filtros-principal" color="transparent">

    <h3 class="text-overline font-weight-bold text-grey-darken-1 mb-4">
      Filtros de Reporte
    </h3>

    <v-select
      v-model="filters.tipo"
      :items="tiposEquipo"
      label="Tipo de Equipo"
      variant="solo-filled"
      flat
      density="comfortable"
      class="mb-6 custom-input"
      clearable
    />

    <v-text-field
      v-model="filters.busqueda"
      label="Descripción o Modelo"
      variant="solo-filled"
      flat
      density="comfortable"
      class="mb-6 custom-input"
      clearable
    />

  </v-sheet>

  <!-- 🔹 FILTROS DETALLE -->
  <v-sheet v-else key="filtros-detalle" color="transparent">

    <h3 class="text-overline font-weight-bold text-grey-darken-1 mb-4">
      Filtros de Equipos
    </h3>

    <v-text-field
      v-model="filtersDetalle.serie"
      label="No. Serie"
      variant="solo-filled"
      flat
      density="comfortable"
      class="mb-6 custom-input"
      clearable
    />

    <v-text-field
      v-model="filtersDetalle.sicoin"
      label="Código SICOIN"
      variant="solo-filled"
      flat
      density="comfortable"
      class="mb-6 custom-input"
      clearable
    />

  </v-sheet>

</v-slide-x-transition>



          <v-btn block color="#003366" size="large" class="text-none font-weight-bold rounded-lg mb-2" elevation="0"

            @click="buscarData">

            Aplicar Filtros

          </v-btn>



          <v-btn block variant="text" color="grey-darken-1" class="text-none" @click="limpiarFiltros">

            Restablecer

          </v-btn>

        </div>

      </v-col>


<v-col cols="12" md="9" lg="10" class="pa-6 pa-lg-10">

<v-slide-x-transition mode="out-in">

  <!-- 🔹 TABLA PRINCIPAL -->
  <v-sheet v-if="!mostrarDetalle" key="principal" color="transparent">

    <div class="d-flex align-center justify-space-between mb-8">
     <div>
            <h1 class="text-h4 font-weight-bold text-blue-darken-4">Catálogo de Equipo</h1>
            <p class="text-body-1 text-grey-darken-1">Gestión y exportación de donaciones tecnológicas</p>
          </div>
    </div>

    <v-card class="rounded-xl elevation-sm">
      <v-data-table
        :headers="headers"
        :items="resultados"
        hover
        class="custom-table"
      >

        <template v-slot:item.cantidad="{ item, value }">
          <v-chip
            variant="tonal"
            color="indigo"
            size="small"
            class="font-weight-bold"
            @click.stop="verDetalle(item)"
          >
            {{ value }} unidades
          </v-chip>
        </template>

        <template v-slot:item.valor_unitario="{ value }">
          <span class="font-weight-bold text-blue-darken-3">
            Q {{ value.toLocaleString() }}
          </span>
        </template>

      </v-data-table>
    </v-card>

  </v-sheet>

  <!-- 🔹 TABLA DETALLE -->
  <v-sheet v-else key="detalle" color="transparent">

    <div class="d-flex justify-space-between align-center mb-4">

   <div>
            <h1 class="text-h4 font-weight-bold text-blue-darken-4">Cantidad  de Equipo</h1>
            <p class="text-body-1 text-grey-darken-1">Gestión y exportación de donaciones tecnológicas</p>
          </div>

      <v-btn
        color="primary"
        variant="elevated"
        class="font-weight-bold"
        prepend-icon="mdi-plus"
        @click="volverTabla"
      >
        Nuevo Equipo
      </v-btn>



    </div>
      <v-btn
        color="primary"
        variant="tonal"
        class="font-weight-bold"
        prepend-icon="mdi-arrow-left"
        @click="volverTabla"
      >
        Volver
      </v-btn>
    <v-card class="rounded-xl elevation-sm" style="width: 50%; display: flex; justify-self: center;">
      <v-data-table
        :headers="headersDetalle"
        :items="detalleFiltrado"
        class="custom-table"
      >

        <template v-slot:item.no="{ value }">
          <span class="font-weight-black">{{ value }}</span>
        </template>

        <template v-slot:item.serie="{ value }">
          <span class="font-weight-black">{{ value }}</span>
        </template>

        <template v-slot:item.sicoin="{ value }">
          <span class="font-weight-black">{{ value }}</span>
        </template>

        <template v-slot:item.valor="{ value }">
          <span class="font-weight-black text-blue-darken-3">
            Q {{ value.toLocaleString() }}
          </span>
        </template>

      </v-data-table>
    </v-card>

  </v-sheet>

</v-slide-x-transition>

</v-col>
</v-row>



    <v-dialog v-model="dialogRegistro" max-width="700" persistent transition="dialog-bottom-transition">

      <v-card class="rounded-xl">

        <v-toolbar color="#003366" dark>

          <v-toolbar-title class="font-weight-bold text-white">Nuevo Registro de Equipo</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon="mdi-close" color="white" variant="text" @click="cerrarModal"></v-btn>

        </v-toolbar>



        <v-card-text class="pa-0">

          <v-stepper v-model="step" elevation="0">

            <v-stepper-header>

              <v-stepper-item title="Tipo de Equipo" :value="1" :complete="step > 1"></v-stepper-item>

          
           

              <v-stepper-item title="Detalles" :value="2" :complete="step > 2"></v-stepper-item>

            </v-stepper-header>



            <v-stepper-window>

              <v-stepper-window-item :value="1">

                <v-card flat class="pa-4">

                  <div class="text-subtitle-1 font-weight-bold mb-4 text-blue-darken-4">¿Qué tipo de equipo desea registrar?</div>

                  

                  <v-select

                    v-model="form.tipo"

                    :items="tiposEquipo"

                    label="Seleccione un tipo existente"

                    variant="outlined"

                    class="mb-2"

                    prepend-inner-icon="mdi-devices"

                    placeholder="Seleccione uno de la lista"

                  ></v-select>





                  <v-btn 

                    v-if="!modoNuevoTipo"

                    variant="tonal" 

                    color="#0094D3" 

                    block 

                    prepend-icon="mdi-plus-circle-outline"

                    @click="modoNuevoTipo = true"

                    class="text-none font-weight-bold"

                  >

                    El tipo de equipo no está en la lista

                  </v-btn>



                  <div v-else class="bg-blue-lighten-5 pa-4 rounded-lg border-dashed">

                    <v-text-field

                      v-model="nuevoTipoNombre"

                      label="Escriba el nombre del nuevo tipo"

                      placeholder="Ej: Tablet, Servidor, UPS..."

                      variant="filled"

                      bg-color="white"

                      density="comfortable"

                      hide-details

                      class="mb-3"

                      autofocus

                      @keyup.enter="guardarNuevoTipo"

                    ></v-text-field>

                    <div class="d-flex gap-2">

                      <v-btn color="success" size="small" class="text-none" @click="guardarNuevoTipo" :disabled="!nuevoTipoNombre">

                        Validar y Guardar

                      </v-btn>

                      <v-btn variant="text" size="small" class="text-none" @click="modoNuevoTipo = false; nuevoTipoNombre = ''">

                        Cancelar

                      </v-btn>

                    </div>

                  </div>

                </v-card>

              </v-stepper-window-item>



              <v-stepper-window-item :value="2">

              <v-card flat class="pa-4">
                <v-row>
                  <div class="text-subtitle-1 font-weight-bold mb-4">¿Qué Modelo de equipo desea registrar?</div>
                  <v-col cols="12">
                    <v-text-field v-model="form.modelo" label="Modelo" variant="outlined"
                      prepend-inner-icon="mdi-tag-outline"></v-text-field>

                    <div class="text-subtitle-1 font-weight-bold mb-4">¿Descripciónes Técnicas?</div>
                    <v-col cols="12">
                      <v-textarea v-model="form.descripcion" label="Descripción Detallada" variant="outlined" rows="5"
                        prepend-inner-icon="mdi-text"></v-textarea>
                    </v-col>
                  </v-col>
                </v-row>
              </v-card>


              </v-stepper-window-item>

            </v-stepper-window>

          </v-stepper>

        </v-card-text>



        <v-divider></v-divider>



        <v-card-actions class="pa-4 bg-grey-lighten-4">

          <v-btn v-if="step > 1" variant="text" class="text-none font-weight-bold" @click="step--">Regresar</v-btn>

          <v-spacer></v-spacer>

          <v-btn 

            color="#003366" 

            variant="elevated" 

            class="text-white px-8 text-none font-weight-bold"

            @click="avanzarStep"

            :disabled="step === 1 && !form.tipo"

          >

            {{ step === 2 ? 'Finalizar y Guardar' : 'Continuar' }}

          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>



    <v-snackbar v-model="snackbar" :color="snackColor" elevation="24">

      <div class="d-flex align-center">

        <v-icon class="mr-2">{{ snackColor === 'success' ? 'mdi-check-circle' : 'mdi-alert' }}</v-icon>

        {{ snackText }}

      </div>

    </v-snackbar>

  </v-container>

</template>



<script setup>

import { ref, computed } from 'vue'

const mostrarDetalle = ref(false)
const detalleItems = ref([])

const filtersDetalle = ref({
  serie: '',
  sicoin: ''
})

const detalleFiltrado = computed(() => {
  return detalleItems.value.filter(item => {
    const serie = filtersDetalle.value.serie.toLowerCase()
    const sicoin = filtersDetalle.value.sicoin.toLowerCase()

    return (
      (!serie || item.serie.toLowerCase().includes(serie)) &&
      (!sicoin || item.sicoin.toLowerCase().includes(sicoin))
    )
  })
})

const verDetalle = (item) => {
  detalleItems.value = [
    { no: 1, serie: 'SN001', sicoin: 'SC001', valor: 4500 },
    { no: 2, serie: 'SN002', sicoin: 'SC002', valor: 4500 },
  ]

  mostrarDetalle.value = true
}

const volverTabla = () => {
  mostrarDetalle.value = false

  filtersDetalle.value = {
    serie: '',
    sicoin: ''
  }
}

const headersDetalle = [
  { title: 'No.', key: 'no' },
  { title: 'No. Serie', key: 'serie' },
  { title: 'Código SICOIN', key: 'sicoin' },
  { title: 'Valor (Q)', key: 'valor' },
]



const loading = ref(false)

const dialogRegistro = ref(false)

const step = ref(1)



// 🔹 ESTADO DEL FORMULARIO

const modoNuevoTipo = ref(false)

const nuevoTipoNombre = ref('')

const form = ref({

  tipo: null,

  descripcion: '',

  modelo: '',

  cantidad: 1,

  valor_unitario: 0

})



// 🔹 FEEDBACK UI

const snackbar = ref(false)

const snackText = ref('')

const snackColor = ref('success')



// 🔹 DATOS Y FILTROS

const filters = ref({

  tipo: null,

  busqueda: ''

})



const tiposEquipo = ref(['Laptop', 'Desktop', 'Impresora', 'Router'])



const headers = [

  { title: 'DESCRIPCIÓN', key: 'descripcion', align: 'start' },

  { title: 'TIPO DE EQUIPO', key: 'tipo' },

  { title: 'MODELO', key: 'modelo' },

  { title: 'CANTIDAD', key: 'cantidad', align: 'center' },

  { title: 'VALOR TOTAL (Q)', key: 'valor_unitario', align: 'end' },

]



const data = ref([

  { descripcion: 'Laptop educativa 8GB RAM SSD', tipo: 'Laptop', modelo: 'Dell Inspiron 15', cantidad: 25, valor_unitario: 4500 },

  { descripcion: 'Computadora de escritorio laboratorio', tipo: 'Desktop', modelo: 'Lenovo ThinkCentre', cantidad: 15, valor_unitario: 5200 },

])



// 🔹 FILTRADO DINÁMICO

const resultados = computed(() => {

  return data.value.filter(item => {

    const coincideTipo = !filters.value.tipo || item.tipo === filters.value.tipo

    const busquedaLower = filters.value.busqueda?.toLowerCase() || ''

    const coincideBusqueda =

      item.descripcion.toLowerCase().includes(busquedaLower) ||

      item.modelo.toLowerCase().includes(busquedaLower)

    return coincideTipo && coincideBusqueda

  })

})



// 🔹 LÓGICA DE VALIDACIÓN Y AGREGADO (CORREGIDA)

const guardarNuevoTipo = () => {

  const nombreLimpio = nuevoTipoNombre.value.trim()

  

  if (!nombreLimpio) return



  // Validar si ya existe (ignorando mayúsculas/minúsculas)

  const existe = tiposEquipo.value.some(

    t => t.toLowerCase() === nombreLimpio.toLowerCase()

  )



  if (existe) {

    mostrarAlerta('Este tipo de equipo ya existe en el catálogo.', 'error')

    return

  }



  // Agregar al array reactivo

  tiposEquipo.value.push(nombreLimpio)

  // Seleccionarlo automáticamente en el form

  form.value.tipo = nombreLimpio

  // Resetear UI de creación

  modoNuevoTipo.value = false

  nuevoTipoNombre.value = ''

  mostrarAlerta('Nuevo tipo registrado y seleccionado.', 'success')

}



const avanzarStep = () => {

  if (step.value === 1) {

    if (!form.value.tipo) {

      mostrarAlerta('Por favor seleccione o cree un tipo de equipo.', 'error')

      return

    }

    step.value = 2

  } else {

    // Guardar equipo completo

    data.value.unshift({ ...form.value })

    mostrarAlerta('Equipo registrado exitosamente en el catálogo.', 'success')

    cerrarModal()

  }

}



const cerrarModal = () => {

  dialogRegistro.value = false

  // Resetear todo al estado inicial tras un pequeño delay para la animación

  setTimeout(() => {

    step.value = 1

    modoNuevoTipo.value = false

    nuevoTipoNombre.value = ''

    form.value = { tipo: null, descripcion: '', modelo: '', cantidad: 1, valor_unitario: 0 }

  }, 300)

}



const mostrarAlerta = (msj, color) => {

  snackText.value = msj

  snackColor.value = color

  snackbar.value = true

}



const buscarData = () => {
  if (!mostrarDetalle.value) {
    // tabla principal
    loading.value = true
    setTimeout(() => (loading.value = false), 500)
  } else {
    // tabla detalle (no necesita loading, ya es reactivo)
    console.log('Filtrando detalle...')
  }
}


const limpiarFiltros = () => {
  if (!mostrarDetalle.value) {
    // 🔹 limpiar filtros principales
    filters.value.tipo = null
    filters.value.busqueda = ''
  } else {
    // 🔹 limpiar filtros detalle
    filtersDetalle.value = {
      serie: '',
      sicoin: ''
    }
  }
}



const descargar = (formato) => {

  console.log(`Exportando en ${formato}...`)

}

</script>



<style scoped>

.bg-main { background-color: #F8FAFC !important; }

.line-height-1 { line-height: 1.1; }

.z-index-2 { z-index: 2; }

.custom-input :deep(.v-field) { border-radius: 12px !important; background-color: #f1f5f9 !important; }

.custom-table { border-radius: 16px !important; }

.custom-table :deep(th) { font-weight: 700 !important; color: #64748b !important; text-transform: uppercase; font-size: 0.75rem !important; }

.gap-2 { gap: 8px; }

.gap-3 { gap: 12px; }

.elevation-sm { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important; }

.border-dashed { border: 2px dashed #0094D3 !important; }

</style>