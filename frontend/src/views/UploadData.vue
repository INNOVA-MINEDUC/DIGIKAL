<template>

  <v-container fluid class="fill-height bg-img py-10">
    <v-row justify="center">
      <!-- El ancho era `cols="8"` fijo en todos los tamaños: en un teléfono el
           formulario ocupaba dos tercios de la pantalla y dejaba los campos
           apretados entre dos márgenes enormes. Ahora escala por breakpoint. -->
      <v-col cols="12" sm="11" md="10" lg="9" xl="8">
        <!-- El min-height sólo servía para el paso de Equipos (deshabilitado):
             :style="step === 3 ? 'min-height: 80vh' : ''" -->
        <v-card elevation="6" class="rounded-xl border-top-gt">
          <v-sheet color="#003366" class="pa-4 pa-sm-6 text-white">
            <div class="d-flex align-center encabezado">
              <v-avatar size="60" class="bg-white pa-2 mr-3 mr-sm-4 encabezado__logo" elevation="2">
                <v-img src="digecade.png"></v-img>
              </v-avatar>
              <div class="encabezado__texto">
                <h1 class="text-subtitle-1 text-sm-h5 font-weight-bold mb-0">Ministerio de Educación</h1>
                <p class="text-caption text-uppercase mb-0 opacity-80">Registro Nacional de Donaciones Tecnológicas</p>
              </div>
            </div>
          </v-sheet>
          <v-form ref="formRef">
            <v-stepper v-model="step" :items="['Establecimiento', /* 'Beneficiados', 'Equipos', */ 'Documentación']"
              hide-actions class="elevation-0">
              <template v-slot:item.1>
                <v-card variant="flat" class="pa-4">
                  <h3 class="text-h6 mb-4 text-[#003366]">1. Datos del Establecimiento</h3>
                  <v-row align="center">
                    <v-col cols="12" sm="7" md="6">
                      <v-text-field v-model="form.codigoEscuela" label="Código UDI" placeholder="00-00-00000-00"
                        variant="outlined" color="#0094D3" :disabled="!!escuela" hide-details="auto" />
                    </v-col>
                    <!-- En móvil el botón ocupa el ancho completo: suelto y a la
                         izquierda quedaba como un elemento perdido bajo el campo. -->
                    <v-col cols="12" sm="5" md="4">
                      <v-btn :append-icon="escuela ? 'mdi-refresh' : 'mdi-magnify'"
                        @click="escuela ? resetEscuela() : buscarEscuela()" variant="elevated" elevation="5"
                        class="btn-buscar" size="large">
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
                        <v-card-text class="pa-4 pa-sm-6">
                          <v-row align="center">
                            <v-col cols="12" md="6" class="d-flex align-center">
                              <v-avatar color="#f0f4f8" size="80" class="mr-4 rounded-lg ficha__avatar">
                                <v-icon size="48" color="#003366">mdi-school</v-icon>
                              </v-avatar>
                              <div class="ficha__datos">
                                <div class="text-overline text-grey-darken-1 mb-n1">Institución Educativa</div>
                                <h3 class="text-h6 text-sm-h5 font-weight-bold text-blue-darken-4">
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

              <!-- ==========================================================
                   PASO "BENEFICIADOS" — DESHABILITADO
                   Comentado, no eliminado, para poder reactivarlo. Igual que
                   con Equipos, si se reactiva hay que revertir el :items del
                   v-stepper, la numeracion de los slots, `puedeAvanzar`, el
                   `step < 2` de los botones y el clamp en onMounted.
              ===========================================================

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
                      [ Aqui iba el v-select de "Etnia predominante", ya deshabilitado.
                        Se quita el comentario HTML porque no se pueden anidar. ]
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

              ========================================================== -->

              <!-- ==========================================================
                   PASO "EQUIPOS" — DESHABILITADO
                   Se comenta completo, no se elimina, para poder reactivarlo.
                   Si se reactiva hay que revertir también:
                     · el item 'Equipos' del :items del v-stepper
                     · renombrar el slot item.3 de Documentación a item.4
                     · el paso 3/4 de `puedeAvanzar`
                     · el `step < 3` de los botones
                     · la validación de equipos en `validarYEnviar`
                     · el clamp de `step` en onMounted
              ===========================================================

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

              ========================================================== -->

              <template v-slot:item.2>
                <v-card variant="flat" class="pa-4">
                  <h3 class="text-h6 mb-4 text-[#003366]">2. Evidencia y Fecha</h3>

                  <v-row>


                    <!-- ACTAS: una tarjeta por acta, se agregan y quitan a demanda.
                         Cada acta lleva su propia fecha de entrega y su origen. -->
                    <v-col cols="12">
                      <div class="seccion-titulo">
                        <v-icon color="#003366" size="22" class="mr-2">mdi-file-document-multiple</v-icon>
                        <span class="seccion-titulo__texto">Actas de entrega</span>
                        <v-chip size="small" color="#003366" variant="tonal" class="ml-2 font-weight-bold">
                          {{ form.actas.length }}
                        </v-chip>
                        <v-spacer />
                      </div>

                      <v-card v-for="(acta, index) in form.actas" :key="acta.uid"
                        class="acta-card mb-4" elevation="0">

                        <!-- Cabecera: número de acta, estado y acciones -->
                        <div class="acta-card__head">
                          <div class="d-flex align-center">
                            <v-avatar size="28" color="#003366" class="mr-3">
                              <span class="text-caption font-weight-bold text-white">{{ index + 1 }}</span>
                            </v-avatar>

                            <span class="text-subtitle-2 font-weight-bold text-blue-darken-4">
                              {{ acta.numero?.trim() || `Acta ${index + 1}` }}
                            </span>

                            <v-chip size="x-small" class="ml-3 font-weight-medium"
                              :color="archivoDeActa(acta) ? 'success' : 'grey'" variant="tonal"
                              :prepend-icon="archivoDeActa(acta) ? 'mdi-check-circle' : 'mdi-alert-circle-outline'">
                              {{ archivoDeActa(acta) ? 'PDF adjunto' : 'Sin PDF' }}
                            </v-chip>
                          </div>

                          <div class="d-flex align-center">
                            <v-tooltip location="top"
                              :text="archivoDeActa(acta) ? 'Ver acta' : 'Adjunta el PDF para verlo'">
                              <template #activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-eye-outline" variant="text" size="small"
                                  color="#0094D3" :disabled="!archivoDeActa(acta)" @click="verActa(acta)" />
                              </template>
                            </v-tooltip>

                            <v-tooltip location="top"
                              :text="form.actas.length === 1 ? 'Debe quedar al menos un acta' : 'Eliminar acta'">
                              <template #activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small"
                                  color="red-darken-1" :disabled="form.actas.length === 1"
                                  @click="eliminarActa(index)" />
                              </template>
                            </v-tooltip>
                          </div>
                        </div>

                        <v-divider />

                        <!-- Campos -->
                        <div class="acta-card__body">
                          <v-row dense>
                            <v-col cols="12" md="4">
                              <v-text-field v-model="acta.numero" label="No. de acta"
                                placeholder="Ej. 015-2026" variant="outlined" density="comfortable"
                                hide-details="auto" prepend-inner-icon="mdi-pound" color="#003366"
                                :rules="[required]" />
                            </v-col>

                            <v-col cols="12" md="4">
                              <!-- El menú del calendario vive en la propia acta: con un
                                   solo ref compartido se abrirían todos a la vez. -->
                              <v-menu v-model="acta.menuFecha" :close-on-content-click="false"
                                transition="scale-transition" offset-y min-width="auto">
                                <template v-slot:activator="{ props }">
                                  <v-text-field :model-value="formatearFecha(acta.fecha)"
                                    label="Fecha de entrega" placeholder="dd/mm/aaaa" readonly
                                    prepend-inner-icon="mdi-calendar-check" v-bind="props"
                                    variant="outlined" density="comfortable" hide-details="auto"
                                    color="#003366" :rules="[required]" />
                                </template>

                                <v-date-picker v-model="acta.fecha" color="#003366"
                                  @update:model-value="acta.menuFecha = false" />
                              </v-menu>
                            </v-col>

                            <v-col cols="12" md="4">
                              <v-select v-model="acta.origen" :items="ORIGENES" item-title="titulo"
                                item-value="valor" label="Origen" prepend-inner-icon="mdi-source-branch"
                                variant="outlined" density="comfortable" hide-details="auto"
                                color="#003366" :rules="[required]" />
                            </v-col>

                            <v-col cols="12">
                              <v-file-input v-model="acta.archivo" label="Archivo del acta (PDF)"
                                variant="outlined" density="comfortable" hide-details="auto"
                                prepend-inner-icon="mdi-file-pdf-box" color="#003366"
                                accept="application/pdf" show-size :rules="[validarPDF]" />
                            </v-col>
                          </v-row>
                        </div>
                      </v-card>

                      <!-- Agregar: acción principal de la sección, a lo ancho -->
                      <v-btn block variant="outlined" color="#003366" size="large"
                        prepend-icon="mdi-plus-circle-outline" class="text-none btn-agregar-acta"
                        @click="agregarActa">
                        Agregar otra acta
                      </v-btn>
                    </v-col>

                    <v-col cols="12">
                      <v-divider class="my-2" />
                    </v-col>

                    <v-col cols="12">
                      <div class="seccion-titulo">
                        <v-icon color="#0094D3" size="22" class="mr-2">mdi-image-multiple</v-icon>
                        <span class="seccion-titulo__texto">Fotos de evidencia</span>
                        <v-chip v-if="urlsImagenes.length" size="small" color="#0094D3" variant="tonal"
                          class="ml-2 font-weight-bold">
                          {{ urlsImagenes.length }}
                        </v-chip>
                      </div>

                      <v-file-input v-model="form.imagenes" label="Subir fotografías" variant="outlined"
                        density="comfortable" prepend-inner-icon="mdi-camera-plus-outline" color="#0094D3"
                        multiple accept="image/*" show-size counter :rules="[validarImagenes]"
                        @change="previsualizarImagenes" />
                    </v-col>

                    <!-- <v-col cols="12">
                      <v-textarea v-model="form.descripcionEntrega" label="Descripción de la entrega" variant="outlined"
                        prepend-inner-icon="mdi-text" rows="3" auto-grow :rules="[required]" />
                    </v-col> -->

                    <v-col cols="12" v-if="urlsImagenes.length > 0">
                      <p class="text-caption text-grey-darken-1 mb-2">
                        Clic en una foto para ampliarla.
                      </p>
                      <v-row dense>
                        <v-col v-for="(url, index) in urlsImagenes" :key="url" cols="4" sm="3" md="2">
                          <div class="foto-evidencia">
                            <v-img :src="url" aspect-ratio="1" cover class="foto-evidencia__img"
                              @click="verImagen(index)" />

                            <div class="foto-evidencia__velo">
                              <v-icon color="white" size="26">mdi-magnify-plus-outline</v-icon>
                            </div>

                            <v-btn icon="mdi-close" size="x-small" color="error" variant="flat"
                              class="foto-evidencia__quitar" @click.stop="eliminarImagen(index)" />
                          </div>
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
          <!-- En móvil los botones se apilan y ocupan todo el ancho: son la
               acción principal del paso y con `px-8` quedaban estrechos y
               difíciles de acertar con el dedo. -->
          <v-card-actions class="pa-4 pa-sm-6 bg-grey-lighten-5 acciones-paso">
            <v-btn v-if="step > 1" variant="text" color="grey-darken-1" prepend-icon="mdi-chevron-left"
              @click="step--">Anterior</v-btn>
            <v-spacer class="d-none d-sm-flex"></v-spacer>
            <v-btn v-if="step < 2" color="#003366" class="text-white px-8" append-icon="mdi-chevron-right"
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

    <!-- Visor de las fotos de evidencia -->
    <v-dialog v-model="visorImagen" max-width="900">
      <v-card class="rounded-lg">
        <v-toolbar density="compact" color="#003366">
          <v-toolbar-title class="text-body-2">
            Foto {{ indiceImagen + 1 }} de {{ urlsImagenes.length }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-chevron-left" :disabled="indiceImagen === 0"
            @click="indiceImagen--" />
          <v-btn icon="mdi-chevron-right" :disabled="indiceImagen >= urlsImagenes.length - 1"
            @click="indiceImagen++" />
          <v-btn icon="mdi-close" @click="visorImagen = false" />
        </v-toolbar>
        <v-img :src="urlsImagenes[indiceImagen]" max-height="70vh" contain />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import api from '@/helpers/api.js'
import { ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'
import { required, numberMin1, email, phone, onlyLetters, fileRequired } from '@/helpers/validators';

const formRef = ref(null)

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

// `uid` sirve de :key estable en el v-for: con el índice, borrar una fila
// intermedia hace que Vue reutilice el input equivocado y el PDF se ve movido
// de acta.
let contadorActa = 0
function nuevaActa() {
  return {
    uid: `acta-${++contadorActa}`,
    numero: '',
    archivo: null,
    fecha: null,
    origen: null,
    menuFecha: false,
  }
}

// v-file-input devuelve File o File[] según la versión de Vuetify.
const archivoDeActa = (acta) =>
  Array.isArray(acta.archivo) ? acta.archivo[0] : acta.archivo

const agregarActa = () => {
  form.value.actas.push(nuevaActa())
}

const eliminarActa = (index) => {
  if (form.value.actas.length === 1) return
  form.value.actas.splice(index, 1)
}

const verActa = (acta) => {
  const archivo = archivoDeActa(acta)
  if (!archivo) return

  // El PDF todavía no se ha subido: se abre el File que está en memoria.
  const url = URL.createObjectURL(archivo)
  window.open(url, '_blank')

  // No se revoca de inmediato porque la pestaña aún lo está leyendo.
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

const form = ref({
  codigoEscuela: '',
  estudiantesHombres: null,
  estudiantesMujeres: null,
  docentesBeneficiados: null,
  nombreDirector: '',
  telefono: '',
  correo: '',
  descripcionEntrega: '',
  // Una fila por acta. Arranca con una; el usuario agrega las que necesite.
  // La fecha y el origen viven dentro de cada acta, no aquí.
  actas: [nuevaActa()],
  imagenes: []
})

const formatearFecha = (valor) => {
  if (!valor) return ''

  const fecha = new Date(valor)

  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const anio = fecha.getFullYear()

  return `${dia}/${mes}/${anio}`
}

// `actas.fecha_entrega` es DATEONLY: se manda YYYY-MM-DD armado con los
// componentes LOCALES. Con toISOString() la fecha se convierte a UTC y en
// Guatemala (GMT-6) el día seleccionado se guardaba corrido uno hacia atrás.
const fechaParaBackend = (valor) => {
  if (!valor) return null

  const fecha = new Date(valor)

  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

// Refleja el ENUM de actas.origen en la base. Al ser dos valores fijos
// ya no se piden al backend: antes esto era un GET /api/v1/proyectos.
const ORIGENES = [
  { valor: 'DONACION', titulo: 'Donación' },
  { valor: 'COMPRA', titulo: 'Compra' },
]

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

  // Paso "Equipos" deshabilitado: ya no se exige selección de equipos.
  // if (seleccionadosGlobal.value.length === 0) {
  //   Swal.fire('Error', 'Debes seleccionar al menos un equipo', 'error')
  //   return
  // }

  const incompletas = form.value.actas.filter(
    a => !a.numero?.trim() || !archivoDeActa(a) || !a.fecha || !a.origen
  )

  if (incompletas.length > 0) {
    Swal.fire(
      'Error',
      'Cada acta necesita su número, su PDF, su fecha de entrega y su origen',
      'error'
    )
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

/* --- Visor de fotos de evidencia --- */

const visorImagen = ref(false)
const indiceImagen = ref(0)

const verImagen = (index) => {
  indiceImagen.value = index
  visorImagen.value = true
}

const eliminarImagen = (index) => {
  // Quitar el File dispara el watch de form.imagenes, que regenera las URLs.
  form.value.imagenes = form.value.imagenes.filter((_, i) => i !== index)

  if (indiceImagen.value >= form.value.imagenes.length) {
    indiceImagen.value = Math.max(0, form.value.imagenes.length - 1)
  }

  if (form.value.imagenes.length === 0) visorImagen.value = false
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
    // Un File no sobrevive a JSON.stringify (queda como {}), así que se
    // guardan sólo los números de acta y se descartan los archivos: al
    // recuperar el borrador hay que volver a adjuntarlos.
    localStorage.setItem('registroDonacion', JSON.stringify({
      form: {
        ...formVal,
        actas: formVal.actas?.map(a => ({
          numero: a.numero,
          fecha: a.fecha,
          origen: a.origen,
        })) || [],
        imagenes: [],
      },
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
    return 
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

    // console.log('IDs:', ids)

    const respuestas = await Promise.all(
      ids.map(id =>
        api.get(`/api/v1/equipos/${id}`)
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
    const res = await api.get(`/api/v1/equipos`)

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
  // Pasos "Beneficiados" y "Equipos" deshabilitados:
  // if (step.value === 2) return !!form.value.nombreDirector && !!form.value.correo
  // if (step.value === 3) return seleccionadosGlobal.value.length > 0
  if (step.value === 2) {
    // `descripcionEntrega` ya no se valida: su textarea está comentado en el
    // template, así que nunca se llena y dejaba el botón Finalizar desactivado.

    const imagenes = form.value.imagenes

    // Toda acta necesita número, PDF válido, fecha y origen.
    if (form.value.actas.length === 0) return false

    for (const acta of form.value.actas) {
      if (!acta.numero?.trim()) return false
      if (!acta.fecha) return false
      if (!acta.origen) return false

      const archivo = archivoDeActa(acta)
      if (!archivo) return false
      if (validarPDF(archivo) !== true) return false
    }

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
    const res = await api.post(`/api/v1/escuelas/udi`, { CodigoEscuela: udi })
    escuela.value = res.data.data
    success.value = 'Escuela encontrada'
    // console.log(res.data)
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

  // Confirmación con un resumen legible (antes se mostraba el JSON crudo).
  const nombreEscuela = escuela.value?.nombreEscuela || escuela.value?.nombre || 'el establecimiento'
  const confirmacion = await Swal.fire({
    title: '¿Registrar la dotación?',
    html: `
      <div style="text-align:left; font-size:14px; line-height:1.9;">
        <div><strong>Establecimiento:</strong> ${nombreEscuela}</div>
        <div><strong>Actas:</strong> ${form.value.actas.length}</div>
        <div><strong>Fotos de evidencia:</strong> ${form.value.imagenes?.length || 0}</div>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#003366',
    cancelButtonColor: '#cfd8dc',
    confirmButtonText: 'Sí, registrar',
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
      formData.append('descripcionEntrega', form.value.descripcionEntrega);
      formData.append('equipos', JSON.stringify(seleccionadosGlobal.value));

      // Los PDFs van en `acta_pdf` y el resto de datos de cada acta en el JSON
      // `actas`, EN EL MISMO ORDEN: el backend los empareja por índice.
      // La fecha y el origen de la dotación los deriva el backend de la
      // primera acta, por eso ya no se mandan sueltos.
      formData.append(
        'actas',
        JSON.stringify(form.value.actas.map(a => ({
          numero: a.numero.trim(),
          fecha: fechaParaBackend(a.fecha),
          origen: a.origen,
        })))
      )

      form.value.actas.forEach((acta) => {
        formData.append('acta_pdf', archivoDeActa(acta))
      })

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


      await api.post(`/api/v1/dotacion`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Sólo si el POST fue exitoso: se avisa y se limpia todo el formulario.
      // resetFormularioCompleto() también pone loading en false y vuelve al paso 1.
      resetFormularioCompleto();

      await Swal.fire({
        title: '¡Registro exitoso!',
        text: 'La dotación tecnológica se guardó correctamente.',
        icon: 'success',
        confirmButtonColor: '#003366'
      });

    } catch (err) {
      console.error('Error al enviar:', err);
      // En error NO se limpia el formulario, para que el usuario reintente.
      loading.value = false;
      Swal.fire({
        title: 'Error en el registro',
        text: err.response?.data?.message || 'No se pudo conectar con el servidor.',
        icon: 'error',
        confirmButtonColor: '#0094D3'
      });
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
    actas: [nuevaActa()],
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
  // Sólo alimenta el paso "Equipos" (deshabilitado):
  // obtenerEquipos();

  const dataEquipos = localStorage.getItem('equiposSeleccionados')
  if (dataEquipos) {
    seleccionadosGlobal.value = JSON.parse(dataEquipos)
  }

  const data = localStorage.getItem('registroDonacion')
  if (data) {
    const parsed = JSON.parse(data)

    form.value = parsed.form || form.value

    // Se rehidratan las actas con uid nuevo y sin archivo (los File no se
    // persisten). Un borrador viejo puede no traer `actas`: se deja una vacía.
    const actasGuardadas = Array.isArray(parsed.form?.actas) ? parsed.form.actas : []
    form.value.actas = actasGuardadas.length > 0
      ? actasGuardadas.map(a => ({
          ...nuevaActa(),
          numero: a.numero || '',
          fecha: a.fecha || null,
          origen: a.origen || null,
        }))
      : [nuevaActa()]

    form.value.imagenes = []

    // Se acota a 2: un borrador viejo pudo quedar guardado en un paso ya
    // deshabilitado (Beneficiados / Equipos / el antiguo paso 4).
    step.value = Math.min(parsed.step || 1, 2)
    escuela.value = parsed.escuela || null
  }
})

</script>

<style scoped>
.bg-img {
  min-height: 100vh;
  width: 100%;

  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  padding-top: 40px;
  padding-bottom: 40px;
  padding-left: 16px;
  padding-right: 16px;

  background-image: url("/upload/img.png");

  background-repeat: no-repeat;

  /* IMPORTANTE */
  background-size: cover;

  /* CENTRADO PERFECTO */
  background-position: center center;

  overflow: hidden;
}

/* Overlay elegante */
.bg-img::before {
  content: "";

  position: absolute;
  inset: 0;

  background: rgba(0, 0, 0, 0.35);

  z-index: 0;
}

/* TODO el contenido encima del overlay */
.bg-img > * {
  position: relative;
  z-index: 1;
}

/* CARD PRINCIPAL */
.border-top-gt {
  border-top: 8px solid #0094D3 !important;

  backdrop-filter: blur(8px);

  background: rgba(255, 255, 255, 0.96);

  overflow: hidden;
}

/* Stepper */
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

/* ===== Encabezado de sección (Actas / Fotos) ===== */
.seccion-titulo {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 51, 102, 0.12);
}

.seccion-titulo__texto {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #003366;
}

/* ===== Tarjeta de acta ===== */
.acta-card {
  border: 1px solid rgba(0, 51, 102, 0.16);
  border-left: 5px solid #003366;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.acta-card:hover {
  border-color: rgba(0, 148, 211, 0.55);
  box-shadow: 0 3px 12px rgba(0, 51, 102, 0.1);
}

/* La franja superior separa la identidad del acta de sus campos. */
.acta-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background-color: #f5f8fb;
}

.acta-card__body {
  padding: 18px 16px 16px;
}

.btn-agregar-acta {
  border-style: dashed;
  border-width: 2px;
  letter-spacing: 0.01em;
}

/* ===== Miniatura de evidencia ===== */
.foto-evidencia {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}

.foto-evidencia__img {
  border-radius: 10px;
  cursor: zoom-in;
}

/* Velo con lupa: aparece al pasar el cursor sobre la miniatura. */
.foto-evidencia__velo {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 51, 102, 0.45);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.foto-evidencia:hover .foto-evidencia__velo {
  opacity: 1;
}

.foto-evidencia__quitar {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
}

/* TABLAS */
:deep(.v-table) {
  border-radius: 12px;
}

/* El nombre del establecimiento puede ser muy largo ("Escuela Oficial Rural
   Mixta Aldea..."): sin esto desborda la ficha en pantallas estrechas. */
.ficha__datos {
  min-width: 0;
}

.ficha__datos h3 {
  overflow-wrap: anywhere;
}

/* El texto del encabezado no debe empujar al logo fuera de la tarjeta. */
.encabezado__texto {
  min-width: 0;
}

/* RESPONSIVE */
@media (max-width: 1264px) {
  .bg-img {
    padding-top: 24px;
    padding-bottom: 24px;
  }
}

/* TABLETS */
@media (max-width: 960px) {
  .bg-img {
    padding: 16px;
  }

  :deep(.v-card) {
    border-radius: 16px !important;
  }
}

/* El botón de búsqueda acompaña al campo: a lo ancho cuando el campo también
   lo está, y ajustado a su contenido cuando van uno al lado del otro. */
.btn-buscar {
  width: 100%;
}

@media (min-width: 600px) {
  .btn-buscar {
    width: auto;
  }
}

/* MOBILE */
@media (max-width: 600px) {
  .bg-img {
    padding: 10px;

    background-position: center;
  }

  :deep(.v-card) {
    border-radius: 14px !important;
  }

  :deep(.v-stepper-header) {
    overflow-x: auto;
  }

  :deep(.v-stepper-item__title) {
    font-size: 0.75rem !important;
  }

  :deep(.v-btn) {
    font-size: 0.75rem;
  }

  .foto-evidencia,
  .foto-evidencia__img {
    border-radius: 8px;
  }

  /* En móvil la cabecera del acta se apila para que no se apriete. */
  .acta-card__head {
    flex-wrap: wrap;
    gap: 6px;
  }

  .acta-card__body {
    padding: 14px 12px 12px;
  }

  /* Logo más pequeño: a 60 px se comía el ancho útil del título. */
  .encabezado__logo {
    width: 44px !important;
    height: 44px !important;
  }

  /* Lo mismo en la ficha del establecimiento, donde el avatar de 80 px
     dejaba el nombre en una columna de texto de dos palabras por línea. */
  .ficha__avatar {
    width: 56px !important;
    height: 56px !important;
    margin-right: 12px !important;
  }

  .ficha__avatar :deep(.v-icon) {
    font-size: 32px !important;
  }

  /* Los botones de paso se apilan y ocupan el ancho completo. */
  .acciones-paso {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 8px;
  }

  .acciones-paso :deep(.v-btn) {
    width: 100%;
    margin-inline: 0 !important;
  }
}
</style>