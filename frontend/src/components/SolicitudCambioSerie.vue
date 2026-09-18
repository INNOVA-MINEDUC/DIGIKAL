<template>
  <v-card rounded="xl" elevation="2" class="solicitud-card">
    <div class="solicitud-cab">
      <v-icon size="22" class="mr-2">mdi-file-document-edit-outline</v-icon>
      <div>
        <h2 class="solicitud-cab__titulo">¿El número de serie registrado no coincide?</h2>
        <p class="solicitud-cab__sub">
          Solicite la corrección adjuntando el aval del director
        </p>
      </div>
    </div>

    <v-card-text class="pa-4 pa-sm-6">
      <p class="text-body-2 mb-4">
        Si la serie que aparece registrada para una tableta no es la del equipo físico, puede
        pedir que se corrija. La autoriza el <strong>director del establecimiento</strong>: hay que
        adjuntar el documento <strong>firmado y sellado</strong> donde consta el número correcto.
        El cambio no se aplica hasta que personal de DIGECADE lo verifique.
      </p>

      <!-- ── Botón que abre el modal ───────────────────────────────────── -->
      <v-btn
        color="#0094D3" variant="flat" class="text-none"
        style="color:#fff;" size="large"
        prepend-icon="mdi-file-document-edit-outline"
        @click="abrirModal"
      >
        Solicitar corrección de número de serie
      </v-btn>

      <!-- Comprobante del último envío -->
      <v-expand-transition>
        <v-alert
          v-if="enviada"
          type="success" variant="tonal" density="comfortable"
          class="mt-4" icon="mdi-check-decagram"
        >
          <div class="font-weight-bold mb-1">Solicitud enviada</div>
          <div class="text-body-2">
            Quedó registrada con el número <strong>#{{ enviada.id }}</strong>.
            Guarde ese número: con él, o con el número de serie, puede consultar en qué va el trámite.
          </div>
        </v-alert>
      </v-expand-transition>

      <!-- ── Consulta del estado (rápida, no necesita modal) ───────────── -->
      <v-divider class="my-6" />

      <div class="seccion-titulo mb-2">
        <v-icon size="18" class="mr-1">mdi-progress-clock</v-icon>
        Consultar el estado de una solicitud
      </div>
      <v-row dense align="center">
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="serieConsulta"
            placeholder="Número de serie (el anterior o el nuevo)"
            variant="outlined" density="comfortable" rounded="lg" hide-details
            prepend-inner-icon="mdi-magnify"
            :disabled="consultando"
            clearable
            @keyup.enter="consultarEstado"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-btn
            block color="#003366" variant="flat" class="text-none"
            style="color:#fff;" :loading="consultando"
            @click="consultarEstado"
          >
            Consultar
          </v-btn>
        </v-col>
      </v-row>

      <v-expand-transition>
        <div v-if="consulta" class="mt-4">
          <v-alert v-if="!consulta.length" type="info" variant="tonal" density="compact">
            No hay solicitudes registradas para ese número de serie.
          </v-alert>

          <v-card
            v-for="s in consulta" :key="s.id"
            variant="outlined" rounded="lg" class="mb-2 pa-3"
          >
            <div class="d-flex align-center flex-wrap ga-2">
              <strong>#{{ s.id }}</strong>
              <v-chip :color="colorEstado(s.estado)" size="small" variant="flat" class="text-capitalize">
                {{ s.noCoincide ? 'No coincide' : s.estado }}
              </v-chip>
              <span class="text-caption text-grey-darken-1">{{ formatFecha(s.creadoEn) }}</span>
            </div>
            <div class="text-body-2 mt-2">
              <span class="serie">{{ s.serieAnterior }}</span>
              <v-icon size="16" class="mx-1">mdi-arrow-right</v-icon>
              <span class="serie">{{ s.serieNueva }}</span>
            </div>
            <div v-if="s.estado === 'rechazada' && s.motivoRechazo" class="text-body-2 mt-2 text-error">
              <strong>Motivo del rechazo:</strong> {{ s.motivoRechazo }}
            </div>
            <div v-if="s.noCoincide" class="text-body-2 mt-2 text-warning-darken-2">
              <v-icon size="16">mdi-alert-outline</v-icon>
              El número de serie escrito no coincide con el documento adjunto.
              <span v-if="s.verificacionNota">{{ s.verificacionNota }}</span>
            </div>
            <div v-if="s.serieAplicada" class="text-body-2 mt-1 text-success">
              <v-icon size="16">mdi-check</v-icon> El cambio ya fue aplicado.
            </div>
          </v-card>
        </div>
      </v-expand-transition>
    </v-card-text>

    <!-- ══════════════════════════════════════════════════════════════════
         MODAL: formulario de la solicitud
         ══════════════════════════════════════════════════════════════════ -->
    <v-dialog
      v-model="modal"
      :fullscreen="movil"
      :max-width="movil ? undefined : 920"
      scrollable
      :persistent="enviando"
    >
      <v-card :rounded="movil ? '0' : 'xl'" class="modal-solicitud">
        <!-- Cabecera del modal -->
        <div class="modal-cab">
          <v-icon size="22" class="mr-2">mdi-file-document-edit-outline</v-icon>
          <div class="flex-grow-1">
            <h3 class="modal-cab__titulo">Solicitud de corrección del número de serie</h3>
            <p class="modal-cab__sub">Los campos con * son obligatorios</p>
          </div>
          <v-btn
            icon="mdi-close" variant="text" size="small"
            style="color:#fff;" :disabled="enviando"
            aria-label="Cerrar"
            @click="cerrarModal"
          />
        </div>

        <v-card-text class="pa-4 pa-sm-6">
          <v-alert
            type="info" variant="tonal" density="comfortable" class="mb-5"
            icon="mdi-information-outline"
          >
            <div class="text-body-2">
              El cambio no se aplica al enviarlo: personal de DIGECADE compara el número que
              escriba aquí con el que aparece en el documento firmado por el director.
            </div>
          </v-alert>

          <v-form ref="formRef" v-model="formValido" @submit.prevent="enviar">
            <v-row dense>
              <!-- El motivo decide qué pasa después con la serie vieja: si fue
                   un error nunca existió, pero si el equipo se cambió o se
                   perdió, esa serie queda retirada de circulación. -->
              <v-col cols="12">
                <label class="campo-label">
                  ¿Por qué se cambia el número de serie? <span class="req">*</span>
                </label>
                <v-radio-group
                  v-model="tipoCambio"
                  :rules="[reglaObligatoria]"
                  :disabled="enviando"
                  density="compact"
                  hide-details="auto"
                  class="tipo-cambio"
                >
                  <v-radio value="correccion" color="#0094D3">
                    <template #label>
                      <div>
                        <div class="tipo-cambio__titulo">Corrección de un error</div>
                        <div class="tipo-cambio__ayuda">
                          La serie registrada se escribió mal; el equipo es el mismo de siempre.
                        </div>
                      </div>
                    </template>
                  </v-radio>
                  <v-radio value="garantia" color="#0094D3">
                    <template #label>
                      <div>
                        <div class="tipo-cambio__titulo">Reemplazo por garantía</div>
                        <div class="tipo-cambio__ayuda">
                          El proveedor cambió el equipo por uno nuevo.
                        </div>
                      </div>
                    </template>
                  </v-radio>
                </v-radio-group>
              </v-col>

              <v-col cols="12"><v-divider class="my-2" /></v-col>

              <v-col cols="12" md="6">
                <label class="campo-label" for="serie-actual">
                  Número de serie registrado actualmente <span class="req">*</span>
                </label>
                <v-text-field
                  id="serie-actual"
                  v-model="serieAnterior"
                  placeholder="El que aparece hoy en el sistema"
                  variant="outlined" density="comfortable" rounded="lg"
                  prepend-inner-icon="mdi-barcode"
                  :rules="[reglaObligatoria]"
                  :disabled="enviando"
                />
              </v-col>

              <v-col cols="12" md="6">
                <label class="campo-label" for="serie-nueva">
                  Número de serie correcto <span class="req">*</span>
                </label>
                <v-text-field
                  id="serie-nueva"
                  v-model="serieNueva"
                  placeholder="El que trae el equipo / el documento"
                  variant="outlined" density="comfortable" rounded="lg"
                  prepend-inner-icon="mdi-barcode-scan"
                  :rules="[reglaObligatoria, reglaDistinta]"
                  :disabled="enviando"
                />
              </v-col>

              <!-- Sólo tiene sentido cuando el aparato se reemplazó. -->
              <template v-if="esReemplazo">
                <v-col cols="12" md="6">
                  <label class="campo-label" for="marca-nueva">
                    Marca del equipo nuevo <span class="opcional">(si cambió)</span>
                  </label>
                  <v-text-field
                    id="marca-nueva" v-model="marcaNueva"
                    variant="outlined" density="comfortable" rounded="lg"
                    :disabled="enviando"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <label class="campo-label" for="modelo-nuevo">
                    Modelo del equipo nuevo <span class="opcional">(si cambió)</span>
                  </label>
                  <v-text-field
                    id="modelo-nuevo" v-model="modeloNuevo"
                    variant="outlined" density="comfortable" rounded="lg"
                    :disabled="enviando"
                  />
                </v-col>
              </template>

              <v-col cols="12">
                <label class="campo-label" for="motivo">Detalle de la solicitud</label>
                <v-textarea
                  id="motivo"
                  v-model="motivo"
                  placeholder="Explique brevemente lo ocurrido (error de digitación, número de caso de la garantía, denuncia, etc.)"
                  variant="outlined" density="comfortable" rounded="lg"
                  rows="2" auto-grow counter="500" :maxlength="500"
                  :disabled="enviando"
                />
              </v-col>

              <v-col cols="12">
                <v-divider class="my-2" />
                <div class="seccion-titulo">
                  <v-icon size="18" class="mr-1">mdi-account-outline</v-icon>
                  Datos de contacto del director del establecimiento
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <label class="campo-label" for="sol-nombre">Nombre completo</label>
                <v-text-field
                  id="sol-nombre" v-model="solicitanteNombre"
                  variant="outlined" density="comfortable" rounded="lg"
                  :disabled="enviando"
                />
              </v-col>
              <v-col cols="12" md="4">
                <label class="campo-label" for="sol-email">Correo electrónico</label>
                <v-text-field
                  id="sol-email" v-model="solicitanteEmail" type="email"
                  variant="outlined" density="comfortable" rounded="lg"
                  :rules="[reglaCorreoOpcional]"
                  :disabled="enviando"
                />
              </v-col>
              <v-col cols="12" md="4">
                <label class="campo-label" for="sol-tel">Teléfono</label>
                <v-text-field
                  id="sol-tel" v-model="solicitanteTelefono"
                  variant="outlined" density="comfortable" rounded="lg"
                  :disabled="enviando"
                />
              </v-col>

              <v-col cols="12">
                <v-divider class="my-2" />
                <div class="seccion-titulo">
                  <v-icon size="18" class="mr-1">mdi-paperclip</v-icon>
                  Documento firmado y sellado por el director <span class="req ml-1">*</span>
                </div>
                <v-file-input
                  v-model="documento"
                  accept=".pdf,.jpg,.jpeg,.png"
                  placeholder="Seleccione el archivo (PDF o foto del documento)"
                  variant="outlined" density="comfortable" rounded="lg"
                  prepend-icon=""
                  prepend-inner-icon="mdi-file-upload-outline"
                  show-size
                  :rules="[reglaDocumento]"
                  :disabled="enviando"
                  hint="PDF, JPG o PNG. Máximo 15 MB."
                  persistent-hint
                />

                <!-- Vista previa: para comprobar que se adjuntó el documento
                     correcto y que la serie se lee bien antes de enviar. -->
                <v-expand-transition>
                  <div v-if="vistaPrevia" class="previa mt-4">
                    <div class="previa__barra">
                      <v-icon size="18" class="mr-2">
                        {{ esPdf ? 'mdi-file-pdf-box' : 'mdi-file-image-outline' }}
                      </v-icon>
                      <span class="previa__nombre">{{ archivoElegido?.name }}</span>
                      <span class="previa__peso">{{ tamanoLegible(archivoElegido?.size) }}</span>
                      <v-spacer />
                      <v-btn
                        size="small" variant="text" class="text-none"
                        prepend-icon="mdi-open-in-new"
                        :href="vistaPrevia" target="_blank" rel="noopener noreferrer"
                      >
                        Abrir aparte
                      </v-btn>
                    </div>

                    <div class="previa__visor">
                      <img
                        v-if="esImagen"
                        :src="vistaPrevia"
                        alt="Vista previa del documento adjunto"
                        class="previa__img"
                      />
                      <iframe
                        v-else-if="esPdf"
                        :src="vistaPrevia"
                        class="previa__pdf"
                        title="Vista previa del documento adjunto"
                      ></iframe>
                      <div v-else class="pa-6 text-center text-grey text-body-2">
                        No se puede previsualizar este tipo de archivo.
                      </div>
                    </div>

                    <p class="previa__nota">
                      Revise que el documento esté completo, legible, y que tenga la firma y el
                      sello del director.
                    </p>
                  </div>
                </v-expand-transition>
              </v-col>

            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 flex-wrap ga-2">
          <v-btn
            variant="text" class="text-none"
            :disabled="enviando"
            @click="cerrarModal"
          >
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn
            variant="text" class="text-none"
            prepend-icon="mdi-refresh"
            :disabled="enviando"
            @click="limpiarCampos"
          >
            Limpiar
          </v-btn>

          <v-btn
            color="#0094D3" variant="flat" class="text-none"
            style="color:#fff;"
            prepend-icon="mdi-send"
            :loading="enviando"
            @click="enviar"
          >
            Enviar solicitud
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
/**
 * Solicitud PÚBLICA para pedir la corrección del número de serie de una
 * tableta de Ciudadanía Digikal.
 *
 * El formulario vive en un modal para que la tarjeta no ocupe media página en
 * una vista que ya es larga: lo que se ve de entrada es el botón y la consulta
 * de estado, que es lo que la mayoría necesita.
 *
 * Es público a propósito: quien detecta el error es la dirección o la OPF del
 * centro educativo, y no tienen usuario en DIGIKAL. Lo que respalda el trámite
 * no es una contraseña sino el acta firmada y sellada por el director, y que
 * nada se aplica hasta que alguien del personal la verifica y aprueba.
 */
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useDisplay } from 'vuetify'
import api from '@/helpers/api.js'
import Swal from 'sweetalert2'

const MAX_BYTES = 15 * 1024 * 1024

// En teléfono el modal va a pantalla completa: con el formulario entero
// dentro, una ventana flotante deja los campos demasiado estrechos.
const { smAndDown: movil } = useDisplay()

const modal = ref(false)

const formRef = ref(null)
const formValido = ref(false)

const serieAnterior = ref('')
const serieNueva = ref('')
/* correccion | garantia — obligatorio: decide qué pasa con la serie vieja (un
   error nunca existió; un reemplazo por garantía la retira de circulación). */
const tipoCambio = ref('')
const marcaNueva = ref('')
const modeloNuevo = ref('')
const motivo = ref('')
const solicitanteNombre = ref('')
const solicitanteEmail = ref('')
const solicitanteTelefono = ref('')
const documento = ref(null)

const enviando = ref(false)
const enviada = ref(null)

const serieConsulta = ref('')
const consultando = ref(false)
const consulta = ref(null)

/* ── Reglas ─────────────────────────────────────────────────────────────── */
const reglaObligatoria = (v) => (String(v ?? '').trim().length > 0) || 'Este campo es obligatorio'

const reglaDistinta = (v) =>
  String(v ?? '').trim().toLowerCase() !== String(serieAnterior.value ?? '').trim().toLowerCase()
  || 'Debe ser distinto al número de serie registrado'

const reglaCorreoOpcional = (v) =>
  !String(v ?? '').trim() || /.+@.+\..+/.test(v) || 'Correo no válido'

/* v-file-input devuelve un File o un arreglo según la versión/configuración:
   se normaliza antes de validar para no depender de eso. */
const archivoDe = (v) => (Array.isArray(v) ? v[0] : v) || null

const reglaDocumento = (v) => {
  const f = archivoDe(v)
  if (!f) return 'Adjunte el documento firmado por el director'
  if (f.size > MAX_BYTES) return 'El documento no puede pesar más de 15 MB'
  return true
}

/* Marca/modelo sólo aplican cuando el aparato se cambió de verdad (garantía),
   no cuando fue un error de tipeo. */
const esReemplazo = computed(() => tipoCambio.value === 'garantia')

/* ── Vista previa del documento ──────────────────────────────────────────
   Se genera una URL temporal del archivo que el usuario acaba de elegir para
   que pueda comprobar, antes de enviar, que adjuntó el documento correcto y
   que el número de serie se lee bien.

   `URL.createObjectURL` reserva memoria hasta que se libera a mano: por eso
   cada vez que cambia el archivo se revoca la URL anterior, y también al
   destruir el componente. */
const vistaPrevia = ref(null)
const archivoElegido = ref(null)

const esPdf = computed(() => archivoElegido.value?.type === 'application/pdf')
const esImagen = computed(() => Boolean(archivoElegido.value?.type?.startsWith('image/')))

const liberarVistaPrevia = () => {
  if (vistaPrevia.value) URL.revokeObjectURL(vistaPrevia.value)
  vistaPrevia.value = null
  archivoElegido.value = null
}

watch(documento, (valor) => {
  liberarVistaPrevia()

  const f = archivoDe(valor)
  // Sólo se previsualiza lo que además pasa la validación de tamaño: si el
  // archivo es enorme, cargarlo en un visor sólo empeora las cosas.
  if (!f || f.size > MAX_BYTES) return

  archivoElegido.value = f
  vistaPrevia.value = URL.createObjectURL(f)
})

onBeforeUnmount(liberarVistaPrevia)

/** Tamaño legible para mostrarlo junto al nombre del archivo. */
const tamanoLegible = (bytes) => {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
const abrirModal = () => {
  enviada.value = null       // se oculta el comprobante del envío anterior
  modal.value = true
}

const cerrarModal = () => {
  if (enviando.value) return  // no se cierra a medio envío
  modal.value = false
}

/* ── Envío ──────────────────────────────────────────────────────────────── */
const enviar = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const archivo = archivoDe(documento.value)
  if (!archivo) return

  enviando.value = true
  try {
    const datos = new FormData()
    datos.append('serieAnterior', serieAnterior.value.trim())
    datos.append('serieNueva', serieNueva.value.trim())
    datos.append('tipoCambio', tipoCambio.value)
    datos.append('motivo', motivo.value.trim())
    datos.append('solicitanteNombre', solicitanteNombre.value.trim())
    datos.append('solicitanteEmail', solicitanteEmail.value.trim())
    datos.append('solicitanteTelefono', solicitanteTelefono.value.trim())
    datos.append('documento', archivo)

    // Sólo tienen sentido en un reemplazo: si fue corrección se omiten.
    if (esReemplazo.value) {
      datos.append('marcaNueva', marcaNueva.value.trim())
      datos.append('modeloNuevo', modeloNuevo.value.trim())
    }

    const { data } = await api.post('/api/v1/ciudadania/solicitudes', datos)

    enviada.value = data.solicitud
    limpiarCampos()
    modal.value = false        // el comprobante queda visible en la tarjeta
    Swal.fire('Solicitud enviada', data.message || 'Será revisada por el personal de DIGECADE.', 'success')
  } catch (error) {
    Swal.fire(
      'No se pudo enviar',
      error.response?.data?.message || 'Ocurrió un error al enviar la solicitud.',
      'error'
    )
  } finally {
    enviando.value = false
  }
}

const limpiarCampos = () => {
  serieAnterior.value = ''
  serieNueva.value = ''
  tipoCambio.value = ''
  marcaNueva.value = ''
  modeloNuevo.value = ''
  motivo.value = ''
  solicitanteNombre.value = ''
  solicitanteEmail.value = ''
  solicitanteTelefono.value = ''
  documento.value = null
  formRef.value?.resetValidation()
}

/* ── Consulta de estado ─────────────────────────────────────────────────── */
const consultarEstado = async () => {
  const serie = serieConsulta.value.trim()
  if (!serie) return

  consultando.value = true
  try {
    const { data } = await api.get(
      `/api/v1/ciudadania/solicitudes/estado/${encodeURIComponent(serie)}`
    )
    consulta.value = data.solicitudes || []
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo consultar el estado', 'error')
  } finally {
    consultando.value = false
  }
}

const colorEstado = (estado) => ({
  pendiente: 'warning',
  no_coincide: 'deep-orange',
  verificada: 'info',
  aprobada: 'success',
  rechazada: 'error',
}[estado] || 'grey')

const formatFecha = (f) => {
  if (!f) return '—'
  const d = new Date(f)
  return Number.isNaN(d.getTime()) ? String(f) : d.toLocaleDateString('es-GT')
}
</script>

<style scoped>
.solicitud-card {
  overflow: hidden;
  background: #fff;
}

.solicitud-cab,
.modal-cab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 18px;
  background: linear-gradient(120deg, #003366 0%, #0094D3 100%);
  color: #fff;
}

.solicitud-cab :deep(.v-icon),
.modal-cab :deep(.v-icon) { color: #fff; }

.solicitud-cab__titulo,
.modal-cab__titulo {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.25;
}

.solicitud-cab__sub,
.modal-cab__sub {
  margin: 2px 0 0;
  font-size: 0.78rem;
  opacity: 0.9;
}

.modal-solicitud { overflow: hidden; }

.campo-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}

.req { color: #d32f2f; }

.opcional {
  font-weight: 500;
  color: #94a3b8;
  font-size: 0.72rem;
}

/* Cada opción del motivo lleva su propia explicación debajo: "garantía" es la
   que retira la serie vieja de circulación, y conviene que no se elija a la
   ligera. */
.tipo-cambio :deep(.v-selection-control) {
  align-items: flex-start;
  margin-bottom: 6px;
}

.tipo-cambio__titulo {
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.tipo-cambio__ayuda {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.35;
}

.seccion-titulo {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #003366;
  margin: 8px 0;
}

.serie {
  font-family: ui-monospace, Consolas, monospace;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 2px 8px;
}

/* ── Vista previa del documento adjunto ─────────────────────────────────── */
.previa {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.previa__barra {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f6f8fb;
  border-bottom: 1px solid #e2e8f0;
  min-width: 0;
}

.previa__nombre {
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 45%;
}

.previa__peso {
  font-size: 0.72rem;
  color: #64748b;
  margin-left: 8px;
  flex: none;
}

.previa__visor { background: #f1f5f9; }

.previa__img {
  display: block;
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  background: #fff;
}

.previa__pdf {
  display: block;
  width: 100%;
  height: 420px;
  border: 0;
  background: #fff;
}

.previa__nota {
  margin: 0;
  padding: 8px 12px;
  font-size: 0.74rem;
  color: #64748b;
  background: #f6f8fb;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 600px) {
  .solicitud-cab,
  .modal-cab { padding: 12px 14px; }

  .solicitud-cab__titulo,
  .modal-cab__titulo { font-size: 0.92rem; }

  /* En teléfono el visor se achica para no empujar los botones fuera de vista */
  .previa__pdf { height: 300px; }
  .previa__img { max-height: 300px; }
  .previa__nombre { max-width: 100%; }
}
</style>
