<template>

  <v-container fluid class="fill-height bg-img py-10">
    <v-row justify="center">
      <v-col cols="8">
        <v-card elevation="6" class="rounded-xl border-top-gt" :style="step === 3 ? 'min-height: 80vh' : ''">
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
          <v-form ref="formRef">
            <v-stepper v-model="step" :items="['Establecimiento', 'Beneficiados', 'Hardware', 'Documentación']"
              hide-actions class="elevation-0">
              <template v-slot:item.1>
                <v-card variant="flat" class="pa-4">
                  <h3 class="text-h6 mb-4 text-[#003366]">1. Datos del Establecimiento</h3>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.codigoEscuela" label="Código UDI" placeholder="00-00-00000-00"
                        variant="outlined" color="#0094D3" :disabled="!!escuela" />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-btn :append-icon="escuela ? 'mdi-refresh' : 'mdi-magnify'"
                        @click="escuela ? resetEscuela() : buscarEscuela()" variant="elevated" elevation="5">
                        {{ escuela ? 'Reset' : 'Buscar' }}
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row class="mt-4">
                    <v-col cols="12">
                      <v-progress-linear v-if="loading" indeterminate color="#0094D3" height="4" rounded />

                      <v-expand-transition>
                        <div v-if="error || success">
                          <v-alert v-if="error" type="error" variant="tonal" closable icon="mdi-alert-circle"
                            class="mb-4 rounded-lg">
                            {{ error }}
                          </v-alert>
                          <v-alert v-if="success" type="success" variant="tonal" closable icon="mdi-check-circle"
                            class="mb-4 rounded-lg">
                            {{ success }}
                          </v-alert>
                        </div>
                      </v-expand-transition>

                      <v-card v-if="escuela" elevation="2" class="pa-0 overflow-hidden"
                        style="border-left: 8px solid #003366; border-radius: 12px;">
                        <v-card-text class="pa-6">
                          <v-row align="center">
                            <v-col cols="12" md="6" class="d-flex align-center">
                              <v-avatar color="#f0f4f8" size="80" class="mr-4 rounded-lg">
                                <v-icon size="48" color="#003366">mdi-school</v-icon>
                              </v-avatar>
                              <div>
                                <div class="text-overline text-grey-darken-1 mb-n1">Institución Educativa</div>
                                <h3 class="text-h5 font-weight-bold text-blue-darken-4">
                                  {{ escuela.nombreEscuela }}
                                </h3>
                                <v-chip size="x-small" color="#0094D3" variant="flat" class="mt-1">
                                  {{ escuela.codigoEscuela || 'Código N/A' }}
                                </v-chip>
                              </div>
                            </v-col>

                            <v-col cols="12" md="6">
                              <v-row dense>
                                <v-col cols="12" sm="6">
                                  <div class="d-flex align-center mb-2">
                                    <v-icon size="20" color="grey" class="mr-2">mdi-account-tie</v-icon>
                                    <span class="text-body-2 text-truncate">
                                      <strong>Director:</strong> {{ escuela.director || "No asignado" }}
                                    </span>
                                  </div>
                                  <div class="d-flex align-center">
                                    <v-icon size="20" color="grey" class="mr-2">mdi-map-marker</v-icon>
                                    <span class="text-body-2">
                                      <strong>Dirección:</strong> {{ escuela.direccion }}
                                    </span>
                                  </div>
                                </v-col>

                                <v-col cols="12" sm="6">
                                  <div class="d-flex align-center mb-2">
                                    <v-icon size="20" color="grey" class="mr-2">mdi-earth</v-icon>
                                    <span class="text-body-2">
                                      <strong>Depto:</strong> {{ escuela.departamento.nombre || 'N/A' }}
                                    </span>
                                  </div>
                                  <div class="d-flex align-center">
                                    <v-icon size="20" color="grey" class="mr-2">mdi-city</v-icon>
                                    <span class="text-body-2">
                                      <strong>Municipio:</strong> {{ escuela.municipio.nombre || 'N/A' }}
                                    </span>
                                  </div>
                                </v-col>
                              </v-row>
                            </v-col>
                          </v-row>
                        </v-card-text>
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
                      <v-number-input control-variant="split" min="0" v-model="form.estudiantesHombres"
                        label="Estudiantes Hombres" variant="outlined" prepend-inner-icon="mdi-face-man" color="#0094D3"
                        :rules="[numberMin1]" />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-number-input control-variant="split" min="0" v-model="form.estudiantesMujeres"
                        label="Estudiantes Mujeres" variant="outlined" prepend-inner-icon="mdi-face-woman"
                        color="#0094D3" :rules="[numberMin1]" />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-number-input control-variant="split" min="1" v-model="form.docentesBeneficiados"
                        label="Docentes Beneficiados" variant="outlined" prepend-inner-icon="mdi-school" color="#0094D3"
                        :rules="[numberMin1]" />
                    </v-col>

                    <v-col cols="12" md="6">
                      <!-- <v-select v-model="form.etnia" :items="['Maya', 'Ladina', 'Xinka', 'Garífuna', 'Otro']"
                        label="Etnia predominante" variant="outlined" prepend-inner-icon="mdi-account-group"
                        color="#0094D3" :rules="[required]" /> -->
                    </v-col>
                    <v-divider class="my-4 border-opacity-25" color="#003366"></v-divider>
                    <v-col cols="12">
                      <h3 class="text-h6 mb-4 text-[#003366]">2.2 Información del Director</h3>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.nombreDirector" label="Nombre del Director" variant="outlined"
                        prepend-inner-icon="mdi-account-star" color="#0094D3" :rules="[required, onlyLetters]" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.telefono" label="Teléfono" variant="outlined"
                        prepend-inner-icon="mdi-phone" color="#0094D3" :rules="[phone]" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.correo" label="Correo de contacto" type="email" variant="outlined"
                        prepend-inner-icon="mdi-email-outline" color="#0094D3" :rules="[email]" />
                    </v-col>
                  </v-row>
                </v-card>
              </template>

              <template v-slot:item.3>
                <v-row>

                  <v-col cols="3">
                    <v-card style="max-height: 70vh; overflow-y: auto;">
                      <v-list v-model:opened="open" open-strategy="single">

                        <v-list-group v-for="(categoria, i) in categorias" :key="i" :value="categoria.nombre">
                          <template #activator="{ props }">
                            <v-list-item v-bind="props" :prepend-icon="categoria.icono" :title="categoria.nombre" />
                          </template>

                          <v-list-item v-for="modelo in categoria.modelos" :key="modelo.id"
                            @click="seleccionarModelo(modelo)">
                            <v-list-item-title>
                              {{ modelo.nombre }}
                            </v-list-item-title>

                            <template #append>
                              <v-tooltip location="top">
                                <template #activator="{ props }">
                                  <v-icon v-bind="props" icon="mdi-information-outline" @click.stop />
                                </template>
                                <span>{{ modelo.descripcion }}</span>
                              </v-tooltip>
                            </template>
                          </v-list-item>

                        </v-list-group>

                      </v-list>
                    </v-card>
                  </v-col>

                  <v-col cols="5">
                    <v-card>
                      <v-text-field v-model="search" label="Buscar equipo por SICOIN y No. Serie"
                        prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" class="mb-2" />
                      <v-data-table :headers="headers" :items="equiposTabla" :search="search" :items-per-page="25"
                        class="elevation-1">
                        <template v-slot:item.index="{ index }">
                          {{ index + 1 }}
                        </template>

                        <template v-slot:item.seleccionar="{ item }">
                          <div class="d-flex justify-center">
                            <v-checkbox v-model="selectedIds" :value="item.id" :disabled="estaSeleccionado(item.id)"
                              hide-details color="primary" density="compact" class="justify-center" />
                          </div>
                        </template>
                      </v-data-table>

                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card class="mt-4 pa-2">
                      <h4 class="text-subtitle-1 mb-2">Equipos seleccionados</h4>
                      <v-text-field v-model="searchSeleccionados" label="Buscar en seleccionados"
                        prepend-inner-icon="mdi-magnify" density="compact" variant="outlined" clearable class="mb-2" />
                      <div style="max-height: 500px; overflow-y: auto;">
                        <v-list density="compact">

                          <v-list-item v-for="equipo in equiposSeleccionadosFiltrados" :key="equipo.id">
                            <v-list-item-title>
                              <p><b>No. Serie:</b> {{ equipo.numero_serie }}</p>
                              <p><b>SICOIN:</b> {{ equipo.codigo_sicoin }}</p>

                            </v-list-item-title>

                            <template #append>
                              <v-tooltip text="Eliminar equipo" location="top">
                                <template #activator="{ props }">
                                  <v-btn v-bind="props" icon="mdi-delete" color="red" variant="text"
                                    @click="quitarSeleccion(equipo.id)"></v-btn>
                                </template>
                              </v-tooltip>
                            </template>
                          </v-list-item>

                          <v-list-item v-if="equiposSeleccionados.length === 0">
                            <v-list-item-title class="text-grey">
                              No hay equipos seleccionados
                            </v-list-item-title>
                          </v-list-item>

                        </v-list>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </template>

              <template v-slot:item.4>
                <v-card variant="flat" class="pa-4">
                  <h3 class="text-h6 mb-4 text-[#003366]">4. Evidencia y Fecha</h3>

                  <v-row>


                    <v-col cols="6" class="d-flex justify-center">
                      <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y
                        min-width="auto">
                        <!-- Input -->
                        <template v-slot:activator="{ props }">
                          <v-text-field :model-value="fechaFormateada" label="Seleccionar fecha" readonly
                            prepend-inner-icon="mdi-calendar" v-bind="props" variant="outlined"></v-text-field>
                        </template>

                        <!-- Calendar -->
                        <v-date-picker v-model="form.fecha" color="primary"
                          @update:model-value="menu = false"></v-date-picker>
                      </v-menu>


                    </v-col>
                    <v-col cols="6" class="d-flex justify-center">

                      <v-select v-model="form.proyecto" :items="proyectos" item-title="nombre" item-value="id"
                        label="Tipo de proyecto" prepend-inner-icon="mdi-briefcase" variant="outlined" clearable
                        :rules="[required]"></v-select>
                    </v-col>



                    <v-col cols="12" md="6">
                      <v-file-input v-model="form.archivos" label="Subir Acta (PDF)" variant="outlined"
                        prepend-inner-icon="mdi-file-pdf-box" color="#003366" accept="application/pdf"
                        :rules="[validarPDF]" />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-file-input v-model="form.imagenes" label="Subir Fotografías" variant="outlined"
                        prepend-inner-icon="mdi-image-multiple" color="#0094D3" multiple accept="image/*"
                        :rules="[validarImagenes]" @change="previsualizarImagenes" />
                    </v-col>

                    <v-col cols="12">
                      <v-textarea v-model="form.descripcionEntrega" label="Descripción de la entrega" variant="outlined"
                        prepend-inner-icon="mdi-text" rows="3" auto-grow :rules="[required]" />
                    </v-col>

                    <v-col cols="12" v-if="urlsImagenes.length > 0">
                      <div class="text-subtitle-2 mb-2">Previsualización:</div>
                      <v-row>
                        <v-col v-for="(url, index) in urlsImagenes" :key="index" cols="3" md="2">
                          <v-img :src="url" aspect-ratio="1" cover class="img-uploaded" />
                        </v-col>
                      </v-row>
                    </v-col>

                    <!-- ALERTA -->
                    <v-col cols="12">
                      <v-alert border="start" color="#0094D3" variant="tonal" icon="mdi-shield-check"
                        class="text-body-2">
                        Certifico que la información ingresada coincide con los registros físicos del acta de entrega.
                      </v-alert>
                    </v-col>

                  </v-row>
                </v-card>
              </template>
            </v-stepper>
          </v-form>
          <v-divider></v-divider>
          <v-card-actions class="pa-6 bg-grey-lighten-5">
            <v-btn v-if="step > 1" variant="text" color="grey-darken-1" prepend-icon="mdi-chevron-left"
              @click="step--">Anterior</v-btn>
            <v-spacer></v-spacer>
            <v-btn v-if="step < 4" color="#003366" class="text-white px-8" append-icon="mdi-chevron-right"
              variant="flat" @click="step++" :disabled="!puedeAvanzar">Siguiente</v-btn>
            <v-btn v-else color="#0094D3" class="text-white px-8" append-icon="mdi-check-bold" variant="flat"
              @click="validarYEnviar" :disabled="!puedeAvanzar">
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
import axios from 'axios'
import { ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'
import { required, numberMin1, email, phone, onlyLetters, fileRequired } from '@/helpers/validators';

const formRef = ref(null)
const menu = ref(false)

const equiposTabla = ref([])
const selectedIds = ref([])
const seleccionadosGlobal = ref([])

const searchSeleccionados = ref('')
const step = ref(1)
const escuela = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const todosEquipos = ref([])

const form = ref({
  codigoEscuela: '',
  estudiantesHombres: null,
  estudiantesMujeres: null,
  docentesBeneficiados: null,
  nombreDirector: '',
  telefono: '',
  correo: '',
  fecha: null,
  proyecto: null,
  descripcionEntrega: '',
  archivos: [],
  imagenes: []
})

const fechaFormateada = computed(() => {
  if (!form.value.fecha) return ''

  const fecha = new Date(form.value.fecha)

  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const anio = fecha.getFullYear()

  return `${dia}/${mes}/${anio}`
})

const proyectos = ref([])

const obtenerProyectos = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/v1/proyectos')

    proyectos.value = res.data
    console.log(proyectos.value)

  } catch (error) {
    console.error('Error al obtener proyectos:', error)
  }
}

const validarYEnviar = async () => {
  const { valid } = await formRef.value.validate()

  if (!valid) {
    Swal.fire({
      icon: 'warning',
      title: 'Formulario incompleto',
      text: 'Por favor completa todos los campos correctamente'
    })
    return
  }

  if (seleccionadosGlobal.value.length === 0) {
    Swal.fire('Error', 'Debes seleccionar al menos un equipo', 'error')
    return
  }

  if (!form.value.archivos) {
    Swal.fire('Error', 'Debes subir un PDF', 'error')
    return
  }

  submit()
}

const validarPDF = (files) => {
  if (!files) return 'Debe subir un archivo PDF'

  const archivos = Array.isArray(files) ? files : [files]

  const esValido = archivos.every(file => file?.type === 'application/pdf')

  return esValido || 'Solo se permiten archivos PDF'
}

const validarImagenes = (files) => {
  if (!files) return true
  const archivos = Array.isArray(files) ? files : [files]
  if (archivos.length > 3) {
    return 'Solo puedes subir un máximo de 3 imágenes'
  }
  const esValido = archivos.every(file => file?.type?.startsWith('image/'))
  return esValido || 'Solo se permiten imágenes (jpg, png, etc.)'
}


const urlsImagenes = ref([])



const previsualizarImagenes = (event) => {
  urlsImagenes.value.forEach(url => URL.revokeObjectURL(url))
  urlsImagenes.value = []

  if (form.value.imagenes) {
    urlsImagenes.value = form.value.imagenes.map(file => URL.createObjectURL(file))
  }
}

const equiposSeleccionadosFiltrados = computed(() => {
  if (!searchSeleccionados.value) return seleccionadosGlobal.value

  const texto = searchSeleccionados.value.toLowerCase()

  return seleccionadosGlobal.value.filter(e =>
    String(e.numero_serie).toLowerCase().includes(texto) ||
    String(e.codigo_sicoin).toLowerCase().includes(texto)
  )
})

const estaSeleccionado = (id) => {
  return seleccionadosGlobal.value.some(e => e.id === id)
}

selectedIds.value = seleccionadosGlobal.value
  .map(e => e.id)
  .filter(id => equiposTabla.value.some(e => e.id === id))

watch(equiposTabla, () => {
  selectedIds.value = seleccionadosGlobal.value
    .map(e => e.id)
    .filter(id => equiposTabla.value.some(e => e.id === id))
})

watch(
  [form, step, escuela],
  ([formVal, stepVal, escuelaVal]) => {
    localStorage.setItem('registroDonacion', JSON.stringify({
      form: formVal,
      step: stepVal,
      escuela: escuelaVal
    }))
  },
  { deep: true }
)

watch(selectedIds, (newVal) => {
  const nuevos = equiposTabla.value.filter(e =>
    newVal.includes(e.id)
  )

  nuevos.forEach(e => {
    const existe = seleccionadosGlobal.value.find(x => x.id === e.id)
    if (!existe) {
      seleccionadosGlobal.value.push(e)
    }
  })
})

watch(seleccionadosGlobal, (val) => {
  localStorage.setItem('equiposSeleccionados', JSON.stringify(val))
}, { deep: true })

watch(() => form.value.imagenes, (newVal) => {
  // limpiar URLs anteriores
  urlsImagenes.value.forEach(url => URL.revokeObjectURL(url))
  urlsImagenes.value = []

  if (!newVal || newVal.length === 0) {
    return // 🔥 aquí se limpia todo correctamente
  }

  urlsImagenes.value = newVal.map(file => URL.createObjectURL(file))
})

const search = ref('')

const open = ref([])

const equiposSeleccionados = computed(() => {
  return seleccionadosGlobal.value
})

const quitarSeleccion = (id) => {

  selectedIds.value = selectedIds.value.filter(i => i !== id)

  seleccionadosGlobal.value = seleccionadosGlobal.value.filter(e => e.id !== id)
}

const seleccionarModelo = async (modelo) => {
  try {
    const filtrados = todosEquipos.value.filter(
      e => e.modelo === modelo.nombre
    )

    const ids = filtrados.map(e => e.id)

    console.log('IDs:', ids)

    const respuestas = await Promise.all(
      ids.map(id =>
        axios.get(`http://localhost:3000/api/v1/equipos/${id}`)
      )
    )

    const equipos = respuestas.flatMap(r => r.data)

    equiposTabla.value = equipos.map(e => ({
      id: e.id,
      numero_serie: e.numero_serie,
      codigo_sicoin: e.codigo_sicoin
    }))

    selectedIds.value = []

  } catch (error) {
    console.error('Error cargando equipos:', error)
  }
}



const headers = [
  { title: 'No.', key: 'index', sortable: false },
  { title: 'No. Serie', key: 'numero_serie', sortable: true },
  { title: 'Código SICOIN', key: 'codigo_sicoin', sortable: true },
  { title: 'Seleccionar', key: 'seleccionar', sortable: false, align: 'center' },
]


const getIcono = (tipo) => {
  if (tipo.toLowerCase().includes('laptop')) return 'mdi-laptop'
  if (tipo.toLowerCase().includes('impresora')) return 'mdi-printer'
  return 'mdi-desktop-classic'
}



const categorias = ref([])

const obtenerEquipos = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/v1/equipos')

    todosEquipos.value = res.data

    const agrupado = {}

    res.data.forEach(e => {
      const tipo = e.tipo || 'Sin categoría'
      const modeloNombre = e.modelo

      if (!agrupado[tipo]) {
        agrupado[tipo] = {
          nombre: tipo,
          icono: getIcono(tipo),
          modelos: []
        }
      }

      const existeModelo = agrupado[tipo].modelos.find(
        m => m.nombre === modeloNombre
      )

      if (!existeModelo) {
        agrupado[tipo].modelos.push({
          id: modeloNombre, // temporal
          nombre: modeloNombre,
          descripcion: e.descripcion
        })
      }
    })

    categorias.value = Object.values(agrupado)

  } catch (error) {
    console.error('Error:', error)
  }
}




const puedeAvanzar = computed(() => {
  if (step.value === 1) return !!escuela.value && !loading.value
  if (step.value === 2) return !!form.value.nombreDirector && !!form.value.correo
  if (step.value === 3) return seleccionadosGlobal.value.length > 0
  if (step.value === 4) {
    if (!form.value.proyecto) return false
    if (!form.value.fecha) return false

    const archivos = form.value.archivos
    const imagenes = form.value.imagenes

    if (!archivos || archivos.length === 0) return false
    if (validarPDF(archivos) !== true) return false

    if (!imagenes || imagenes.length === 0) return false
    if (validarImagenes(imagenes) !== true) return false

    return true
  }
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
    escuela.value = res.data.data
    success.value = 'Escuela encontrada'
    console.log(res.data)
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

  resetFormularioCompleto()
}

const submit = async () => {

  const payloadPreview = {
    ...form.value,
    fecha: form.value.fecha ? new Date(form.value.fecha).toISOString() : null,
    equipos: seleccionadosGlobal.value,
  };

  const confirmacion = await Swal.fire({
    title: 'Confirmar Datos de Envío',
    html: `
      <p class="text-caption text-left mb-2">Revisa la estructura del JSON antes de finalizar:</p>
      <pre style="text-align:left; max-height:300px; overflow:auto; font-size: 11px; background: #f4f4f4; padding: 10px; border-radius: 5px;">
${JSON.stringify(payloadPreview, null, 2)}
      </pre>
    `,
    width: 700,
    showCancelButton: true,
    confirmButtonColor: '#003366',
    cancelButtonColor: '#cfd8dc',
    confirmButtonText: 'Sí, registrar todo',
    cancelButtonText: 'Regresar y editar',
  });

  if (confirmacion.isConfirmed) {
    loading.value = true;

    try {

      const formData = new FormData();

      formData.append('codigoEscuela', form.value.codigoEscuela);
      formData.append('departamento', escuela.value?.departamento?.nombre || '');
      formData.append('municipio', escuela.value?.municipio?.nombre || '');
      formData.append('nombreEscuela', escuela.value?.nombre || escuela.value.nombreEscuela);
      formData.append('direccion', escuela.value?.direccion || '');
      formData.append('estudiantesHombres', form.value.estudiantesHombres || 0);
      formData.append('estudiantesMujeres', form.value.estudiantesMujeres || 0);
      formData.append('docentesBeneficiados', form.value.docentesBeneficiados || 0);
      formData.append('nombreDirector', form.value.nombreDirector);
      formData.append('telefono', form.value.telefono);
      formData.append('correo', form.value.correo);
      formData.append('proyectoId', form.value.proyecto)
      formData.append('fecha', payloadPreview.fecha);
formData.append('descripcionEntrega', form.value.descripcionEntrega);
      formData.append('equipos', JSON.stringify(seleccionadosGlobal.value));

      if (form.value.archivos) {
        formData.append('acta_pdf', form.value.archivos)
      }

      if (form.value.imagenes && form.value.imagenes.length > 0) {
        form.value.imagenes.forEach((foto) => {
          formData.append('imagenes_entrega', foto);
        });
      }

      
      // const data = {}

      // for (let [key, value] of formData.entries()) {
      //   data[key] = value
      // }

      // return console.log(data)


      const res = await axios.post("http://localhost:3000/api/v1/dotacion", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Respuesta del servidor:', res.data);

      await Swal.fire({
        title: '¡Registro Exitoso!',
        text: 'La donación tecnológica se ha guardado correctamente.',
        icon: 'success',
        confirmButtonColor: '#003366'
      });

      resetEscuela();
      step.value = 1;
      window.location.reload();

    } catch (err) {
      console.error('Error al enviar:', err);
      Swal.fire({
        title: 'Error en el registro',
        text: err.response?.data?.message || 'No se pudo conectar con el servidor.',
        icon: 'error',
        confirmButtonColor: '#0094D3'
      });
    } finally {
      loading.value = false;
      resetFormularioCompleto();
    }
  }
};


const resetFormularioCompleto = () => {
  form.value = {
    codigoEscuela: '',
    estudiantesHombres: null,
    estudiantesMujeres: null,
    docentesBeneficiados: null,
    nombreDirector: '',
    telefono: '',
    correo: '',
    descripcionEntrega: '',
    fecha: null,
    archivos: [],
    imagenes: []
  }


  step.value = 1

  escuela.value = null

  seleccionadosGlobal.value = []
  selectedIds.value = []
  equiposTabla.value = []

  urlsImagenes.value = []

  error.value = ''
  success.value = ''
  loading.value = false

  localStorage.removeItem('registroDonacion')
  localStorage.removeItem('equiposSeleccionados')
}

onMounted(() => {
  obtenerEquipos();
  obtenerProyectos();

  const dataEquipos = localStorage.getItem('equiposSeleccionados')
  if (dataEquipos) {
    seleccionadosGlobal.value = JSON.parse(dataEquipos)
  }

  const data = localStorage.getItem('registroDonacion')
  if (data) {
    const parsed = JSON.parse(data)

    form.value = parsed.form || form.value
    step.value = parsed.step || 1
    escuela.value = parsed.escuela || null
  }
})

</script>

<style scoped>
.bg-img {
  background-image: url("/upload/img.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.border-top-gt {
  border-top: 8px solid #0094D3 !important;
}

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

.img-uploaded {
  border-radius: 10px;
}
</style>