<template>
  <v-container fluid class="fill-height bg-img py-10">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="7">
        <v-card elevation="6" class="rounded-xl overflow-hidden border-top-gt">
          <v-sheet color="#003366" class="pa-6 text-white">
            <div class="d-flex align-center">
              <v-avatar size="60" class="bg-white pa-2 mr-4" elevation="2">
                <v-img src="digecade.png"></v-img>
              </v-avatar>
              <div>
                <h1 class="text-h5 font-weight-bold mb-0">Ministerio de Educación</h1>
                <p class="text-caption text-uppercase mb-0 opacity-80">Registro Nacional de Donaciones Tecnológicas</p>
              </div>
            </div>
          </v-sheet>

          <v-stepper v-model="step" :items="['Establecimiento', 'Beneficiados', 'Hardware', 'Documentación']" hide-actions class="elevation-0">
            <template v-slot:item.1>
              <v-card variant="flat" class="pa-4">
                <h3 class="text-h6 mb-4 text-[#003366]">1. Datos del Establecimiento</h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="form.codigoEscuela" label="Código UDI" placeholder="00-00-00000-00" variant="outlined" color="#0094D3" :disabled="!!escuela" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-btn :append-icon="escuela ? 'mdi-refresh' : 'mdi-magnify'" @click="escuela ? resetEscuela() : buscarEscuela()" variant="elevated" elevation="5">
                      {{ escuela ? 'Reset' : 'Buscar' }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row class="mt-2">
                  <v-col cols="12">
                    <v-progress-linear v-if="loading" indeterminate color="#0094D3" />
                    <v-alert v-if="error" type="error" variant="tonal" class="mb-2">{{ error }}</v-alert>
                    <v-alert v-if="success" type="success" variant="tonal" class="mb-2">{{ success }}</v-alert>
                    <v-card v-if="escuela" class="pa-4" variant="outlined">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-h6">{{ escuela.nombreEscuela }}</div>
                          <div>Director: {{ escuela.director || "No se encontró" }}</div>
                          <div>Dirección: {{ escuela.direccion }}</div>
                        </div>
                        <v-icon size="60" color="#003366">mdi-school</v-icon>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </template>

            <template v-slot:item.2>
              <v-card variant="flat" class="pa-4">
                <h3 class="text-h6 mb-4 text-[#003366]">2. Información de los Beneficiados</h3>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-number-input control-variant="split" min="1" v-model="form.estudiantesHombres" label="Estudiantes Hombres" variant="outlined" prepend-inner-icon="mdi-face-man" color="#0094D3" :rules="[numberMin1]" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-number-input control-variant="split" min="1" v-model="form.estudiantesMujeres" label="Estudiantes Mujeres" variant="outlined" prepend-inner-icon="mdi-face-woman" color="#0094D3" :rules="[numberMin1]" />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-number-input control-variant="split" min="1" v-model="form.docentesBeneficiados" label="Docentes Beneficiados" variant="outlined" prepend-inner-icon="mdi-school" color="#0094D3" :rules="[numberMin1]" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select v-model="form.etnia" :items="['Maya', 'Ladina', 'Xinka', 'Garífuna', 'Otro']" label="Etnia predominante" variant="outlined" prepend-inner-icon="mdi-account-group" color="#0094D3" :rules="[required]" />
                  </v-col>
                  <v-divider class="my-4 border-opacity-25" color="#003366"></v-divider>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="form.nombreDirector" label="Nombre del Director" variant="outlined" prepend-inner-icon="mdi-account-star" color="#0094D3" :rules="[required, onlyLetters]" />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field v-model="form.telefono" label="Teléfono" variant="outlined" prepend-inner-icon="mdi-phone" color="#0094D3" :rules="[phone]" />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field v-model="form.correo" label="Correo de contacto" type="email" variant="outlined" prepend-inner-icon="mdi-email-outline" color="#0094D3" :rules="[email]" />
                  </v-col>
                </v-row>
              </v-card>
            </template>

            <template v-slot:item.3>
              <v-card variant="flat" class="pa-4">
                <h3 class="text-h6 mb-4 text-[#003366]">3. Información del Equipo</h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select v-model="form.tipo" :items="tiposEquipo" label="Seleccione el tipo de Equipo" variant="outlined" prepend-inner-icon="mdi-desktop-classic" color="#0094D3" :rules="[required]" />
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col cols="12" md="3">
                    <v-number-input control-variant="split" v-model="form.cantidad" label="Cantidad de equipo" color="#0094D3" min="1" variant="outlined" append-inner-icon="mdi-calculator-variant" :rules="[numberMin1]" />
                  </v-col>
                </v-row>
              </v-card>
            </template>

            <template v-slot:item.4>
              <v-card variant="flat" class="pa-4">
                <h3 class="text-h6 mb-4 text-[#003366]">4. Respaldo y Fecha</h3>
                <v-row>
                  <v-col cols="12">
                    <v-menu :close-on-content-click="false">
                      <template v-slot:activator="{ props }">
                        <v-text-field v-model="formattedDate" label="Fecha Oficial de Entrega" :rules="[required]" v-bind="props" variant="outlined" prepend-inner-icon="mdi-calendar" color="#0094D3" readonly />
                      </template>
                      <v-date-picker v-model="form.fecha" color="#0094D3" />
                    </v-menu>
                  </v-col>
                  <v-col cols="12">
                    <v-file-input v-model="form.archivos" label="Subir Acta Certificada (PDF o Imagen)" variant="filled" bg-color="blue-lighten-5" prepend-inner-icon="mdi-cloud-upload" multiple color="#003366" :rules="[fileRequired]" />
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
            <v-btn v-if="step > 1" variant="text" color="grey-darken-1" prepend-icon="mdi-chevron-left" @click="step--">Anterior</v-btn>
            <v-spacer></v-spacer>
            <v-btn v-if="step < 4" color="#003366" class="text-white px-8" append-icon="mdi-chevron-right" variant="flat" @click="step++" :disabled="!puedeAvanzar">Siguiente</v-btn>
            <v-btn v-else color="#0094D3" class="text-white px-8" append-icon="mdi-check-bold" variant="flat" @click="submit" :disabled="!puedeAvanzar">Finalizar Registro</v-btn>
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
import axios from 'axios'
import { ref, computed } from 'vue'
import { required, numberMin1, email, phone, onlyLetters, fileRequired } from '@/helpers/validators'

import Swal from 'sweetalert2'

const step = ref(1)
const escuela = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const tiposEquipo = ['Laptop', 'Desktop']

const form = ref({
  codigoEscuela: '',
  estudiantesHombres: null,
  estudiantesMujeres: null,
  docentesBeneficiados: null,
  etnia: null,
  nombreDirector: '',
  telefono: '',
  correo: '',
  tipo: '',
  cantidad: null,
  fecha: new Date(),
  archivos: []
})

const puedeAvanzar = computed(() => {
  if (step.value === 1) return !!escuela.value && !loading.value
  if (step.value === 2) return !!form.value.etnia && !!form.value.nombreDirector && !!form.value.correo
  if (step.value === 3) return !!form.value.tipo && !!form.value.cantidad
  if (step.value === 4) return form.value.archivos.length > 0
  return true
})

const formattedDate = computed(() => {
  if (!form.value.fecha) return ''
  return new Date(form.value.fecha).toLocaleDateString('es-GT', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
})

const buscarEscuela = async () => {
  const udi = form.value.codigoEscuela?.trim()
  if (!udi) {
    error.value = 'Ingresa un código UDI'
    return
  }
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await axios.post("http://localhost:3000/api/v1/escuelas/udi", { CodigoEscuela: udi })
    escuela.value = res.data
    success.value = 'Escuela encontrada'
  } catch (err) {
    escuela.value = null
    error.value = err.response?.data?.message || 'Error de conexión'
  } finally {
    loading.value = false
  }
}


const resetEscuela = () => {
  escuela.value = null
  form.value.codigoEscuela = ''
  error.value = ''
  success.value = ''
}

const submit = async () => {
  const payload = { 
    ...form.value, 
    fecha: new Date(form.value.fecha).toISOString() 
  }
  
  loading.value = true

  try {
    const res = await axios.post("http://localhost:3000/api/v1/escuelas", payload)

    console.log(res.data)
    
    await Swal.fire({
      title: '¡Registro Exitoso!',
      text: 'La donación tecnológica se ha guardado correctamente.',
      icon: 'success',
      confirmButtonColor: '#003366',
      confirmButtonText: 'Aceptar'
    })

  
    resetEscuela() 
    step.value = 1

  } catch (err) {
  
    Swal.fire({
      title: 'Error en el registro',
      text: err.response?.data?.message || 'No se pudo conectar con el servidor.',
      icon: 'error',
      confirmButtonColor: '#0094D3',
      confirmButtonText: 'Intentar de nuevo'
    })
    
    console.error('Error al enviar:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-img {
  background-image: url("/upload/img.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
.border-top-gt { border-top: 8px solid #0094D3 !important; }
:deep(.v-stepper-header) { box-shadow: none !important; border-bottom: 1px solid #e0e0e0; }
:deep(.v-stepper-item--selected .v-stepper-item__avatar) { background-color: #0094D3 !important; }
.opacity-80 { opacity: 0.8; }
</style>