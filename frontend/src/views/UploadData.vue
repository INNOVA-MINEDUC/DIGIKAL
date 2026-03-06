<template>
  <v-container fluid class="fill-height bg-img py-10">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="7">

        <v-card elevation="6" class="rounded-xl overflow-hidden border-top-gt">

          <v-sheet color="#003366" class="pa-6 text-white">
            <div class="d-flex align-center">
              <v-avatar size="60" class="bg-white pa-2 mr-4" elevation="2">
                <v-img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Escudo_de_Guatemala.svg"></v-img>
              </v-avatar>
              <div>
                <h1 class="text-h5 font-weight-bold mb-0">Ministerio de Educación</h1>
                <p class="text-caption text-uppercase mb-0 opacity-80">Registro Nacional de Donaciones Tecnológicas</p>
              </div>
            </div>
          </v-sheet>

          <v-stepper v-model="step" :items="['Ubicación', 'Hardware', 'Documentación']" hide-actions
            class="elevation-0">
            <template v-slot:item.1>
              <v-card variant="flat" class="pa-4">
                <h3 class="text-h6 mb-4 text-[#003366]">1. Datos del Establecimiento</h3>
                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field v-model="form.ubicacion" label="Ubicación / Municipio" variant="outlined"
                      prepend-inner-icon="mdi-map-marker" color="#0094D3" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="form.codigoEscuela" label="Código UDI" placeholder="00-00-0000"
                      variant="outlined" color="#0094D3" />
                  </v-col>
                </v-row>
              </v-card>
            </template>

            <template v-slot:item.2>
              <v-card variant="flat" class="pa-4">
                <h3 class="text-h6 mb-4 text-[#003366]">
                  2. Información del Equipo
                </h3>

                <v-row>
                  <!-- Tipo -->
                  <v-col cols="12">
                    <v-select v-model="form.tipo" :items="tiposEquipo" label="Seleccione el tipo de Equipo" variant="outlined"
                      prepend-inner-icon="mdi-desktop-classic" color="#0094D3" />
                  </v-col>

                  <!-- SICOIN -->
                  <v-col cols="12" sm="6" v-if="form.tipo">
                    <v-text-field v-model="form.sicoin" label="Código SICOIN" variant="outlined"
                      prepend-inner-icon="mdi-barcode" color="#0094D3" />
                  </v-col>

                  <!-- Valor -->
                  <v-col cols="12" sm="6" v-if="form.tipo">
                    <v-text-field v-model="form.valor" label="Valor (Q)" type="number" variant="outlined"
                      prepend-inner-icon="mdi-cash" color="#0094D3" />
                  </v-col>

                  <!-- 🔹 Laptop -->
                  <template v-if="form.tipo === 'Laptop'">
                    <v-col cols="12">
                      <v-text-field v-model="form.serialLaptop" label="Número de Serie Laptop" variant="outlined"
                        prepend-inner-icon="mdi-laptop" color="#0094D3" />
                    </v-col>
                  </template>

                  <!-- 🔹 Desktop -->
                  <template v-if="form.tipo === 'Desktop'">
                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.serialCPU" label="Número de Serie CPU" variant="outlined"
                        prepend-inner-icon="mdi-cpu-64-bit" color="#0094D3" />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.serialMonitor" label="Número de Serie Monitor" variant="outlined"
                        prepend-inner-icon="mdi-monitor" color="#0094D3" />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.serialTeclado" label="Número de Serie Teclado" variant="outlined"
                        prepend-inner-icon="mdi-keyboard" color="#0094D3" />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field v-model="form.serialMouse" label="Número de Serie Mouse" variant="outlined"
                        prepend-inner-icon="mdi-mouse" color="#0094D3" />
                    </v-col>
                  </template>

                </v-row>
              </v-card>
            </template>


            <template v-slot:item.3>
              <v-card variant="flat" class="pa-4">
                <h3 class="text-h6 mb-4 text-[#003366]">3. Respaldo y Fecha</h3>
                <v-row>
                  <v-col cols="12">
                    <v-menu :close-on-content-click="false">
                      <template v-slot:activator="{ props }">
                        <v-text-field v-model="formattedDate" label="Fecha Oficial de Entrega" readonly v-bind="props"
                          variant="outlined" prepend-inner-icon="mdi-calendar" color="#0094D3" />
                      </template>
                      <v-date-picker v-model="form.fecha" color="#0094D3" />
                    </v-menu>
                  </v-col>
                  <v-col cols="12">
                    <v-file-input v-model="form.archivos" label="Subir Acta Certificada (PDF o Imagen)" variant="filled"
                      bg-color="blue-lighten-5" prepend-icon="" prepend-inner-icon="mdi-cloud-upload" multiple
                      color="#003366" />
                  </v-col>
                  <v-col cols="12">
                    <v-alert border="start" color="#0094D3" variant="tonal" icon="mdi-shield-check" class="text-body-2">
                      Certifico que la información ingresada coincide con los registros físicos del acta de entrega.
                    </v-alert>
                  </v-col>
                </v-row>
              </v-card>
            </template>
          </v-stepper>

          <v-divider></v-divider>
          <v-card-actions class="pa-6 bg-grey-lighten-5">
            <v-btn v-if="step > 1" variant="text" color="grey-darken-1" prepend-icon="mdi-chevron-left" @click="step--">
              Anterior
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn v-if="step < 3" color="#003366" class="text-white px-8" append-icon="mdi-chevron-right"
              variant="flat" @click="step++">
              Siguiente
            </v-btn>
            <v-btn v-else color="#0094D3" class="text-white px-8" append-icon="mdi-check-bold" variant="flat"
              @click="submit">
              Finalizar Registro
            </v-btn>
          </v-card-actions>

          <v-footer class="bg-white border-top justify-center py-3">
            <span class="text-caption font-weight-medium text-grey">Gobierno de Guatemala • 2026</span>
          </v-footer>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const step = ref(1)

/* =========================
   CATÁLOGOS
========================= */

const tiposEquipo = [
  'Laptop',
  'Desktop'
]

/* =========================
   FORMULARIO
========================= */
const form = ref({
  // Datos generales
  donante: '',
  ubicacion: '',
  codigoEscuela: '',
  fecha: new Date(),
  cantidad: null,
  marca: null,
  archivos: [],

  // Datos del equipo (comunes)
  tipo: '',
  sicoin: '',
  valor: null,

  // Laptop
  serialLaptop: '',

  // Desktop
  serialCPU: '',
  serialMonitor: '',
  serialTeclado: '',
  serialMouse: ''
})

/* =========================
   COMPUTED
========================= */
const formattedDate = computed(() => {
  if (!form.value.fecha) return ''
  return new Date(form.value.fecha).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

/* =========================
   WATCHERS
   Limpia campos que no aplican
========================= */
watch(
  () => form.value.tipo,
  (tipo) => {
    if (tipo !== 'Laptop') {
      form.value.serialLaptop = ''
    }

    if (tipo !== 'Desktop') {
      form.value.serialCPU = ''
      form.value.serialMonitor = ''
      form.value.serialTeclado = ''
      form.value.serialMouse = ''
    }
  }
)

/* =========================
   SUBMIT
========================= */
const submit = () => {
  const payload = {
    ...form.value,
    fecha: new Date(form.value.fecha).toISOString()
  }

  console.log('Procesando Donación Final:', payload)

  // Aquí puedes:
  // - enviar a API (axios / fetch)
  // - mostrar snackbar
  // - avanzar step
}
</script>



<style scoped>
.bg-img{
  background-image: url("/upload/img.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.border-top-gt {
  border-top: 8px solid #0094D3 !important;
}

/* Personalización para que el stepper se vea más limpio */
:deep(.v-stepper-header) {
  box-shadow: none !important;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.v-stepper-item--selected .v-stepper-item__avatar) {
  background-color: #0094D3 !important;
}

.opacity-80 {
  opacity: 0.8;
}
</style>