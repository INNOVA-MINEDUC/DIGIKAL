<template>
  <v-container fluid class="pa-4 pa-sm-6 verificacion-serie">

    <!-- Cabecera -->
    <div class="mb-4">
      <h1 class="text-h5 text-sm-h4 font-weight-bold mb-1" style="color:#003366;">
        <v-icon size="30" class="mr-1" color="#003366">mdi-file-check-outline</v-icon>
        Verificación de números de serie
      </h1>
      <p class="text-body-2 text-grey-darken-1 mb-0">
        Solicitudes de corrección enviadas por los establecimientos. Compare el número de serie
        escrito con el que aparece en el documento firmado por el director antes de aprobar.
      </p>
    </div>

    <v-row>
      <!-- ── Bandeja ────────────────────────────────────────────────── -->
      <v-col cols="12" md="5" lg="4">
        <v-card rounded="xl" elevation="2" class="bandeja">
          <div class="bandeja__cab">
            <v-icon size="20" class="mr-2">mdi-inbox-multiple</v-icon>
            <span>Solicitudes</span>
            <v-spacer />
            <v-chip size="small" variant="flat" color="rgba(255,255,255,.2)" style="color:#fff;">
              {{ total }}
            </v-chip>
          </div>

          <div class="pa-3">
            <v-text-field
              v-model="busquedaSerie"
              label="Buscar por número de serie"
              placeholder="Ej. PRUEBA-EST-0001"
              variant="outlined" density="compact" rounded="lg" hide-details
              prepend-inner-icon="mdi-magnify"
              clearable
              class="mb-3"
              @click:clear="cargarLista(1)"
              @keyup.enter="cargarLista(1)"
            />
            <v-select
              v-model="filtroEstado"
              :items="OPCIONES_ESTADO"
              item-title="titulo"
              item-value="valor"
              label="Estado"
              variant="outlined" density="compact" rounded="lg" hide-details
              @update:model-value="cargarLista(1)"
            />
          </div>

          <v-divider />

          <div v-if="cargandoLista" class="d-flex justify-center pa-8">
            <v-progress-circular indeterminate color="#003366" />
          </div>

          <div v-else-if="!solicitudes.length" class="text-body-2 text-grey text-center pa-8">
            No hay solicitudes con este filtro.
          </div>

          <v-list v-else class="py-0 bandeja__lista">
            <v-list-item
              v-for="s in solicitudes" :key="s.id"
              :active="seleccionada?.id === s.id"
              class="bandeja__item"
              @click="abrir(s.id)"
            >
              <div class="d-flex align-center flex-wrap ga-2 mb-1">
                <strong class="text-body-2">#{{ s.id }}</strong>
                <v-chip :color="colorEstado(s.estado)" size="x-small" variant="flat" class="text-capitalize">
                  {{ s.noCoincide ? 'No coincide' : s.estado }}
                </v-chip>
                <v-icon v-if="s.verificado" size="14" color="success" title="Serie verificada">
                  mdi-check-decagram
                </v-icon>
                <v-icon v-if="s.noCoincide" size="14" color="warning" title="No coincide con el documento">
                  mdi-alert-outline
                </v-icon>
              </div>

              <div class="text-caption text-grey-darken-1 text-truncate">
                {{ s.nombreEstablecimiento || s.codigoEstablecimiento || '—' }}
              </div>

              <div class="text-caption mt-1">
                <span class="serie serie--chica">{{ s.serieAnterior }}</span>
                <v-icon size="12" class="mx-1">mdi-arrow-right</v-icon>
                <span class="serie serie--chica">{{ s.serieNueva }}</span>
              </div>
            </v-list-item>
          </v-list>

          <v-divider v-if="totalPaginas > 1" />
          <div v-if="totalPaginas > 1" class="pa-2">
            <v-pagination
              v-model="pagina"
              :length="totalPaginas"
              :total-visible="5"
              density="compact"
              @update:model-value="cargarLista"
            />
          </div>
        </v-card>
      </v-col>

      <!-- ── Detalle + verificación ─────────────────────────────────── -->
      <v-col cols="12" md="7" lg="8">
        <v-card
          v-if="!seleccionada"
          rounded="xl" elevation="2"
          class="pa-10 text-center text-grey"
        >
          <v-icon size="56" color="grey-lighten-1">mdi-gesture-tap</v-icon>
          <div class="mt-3 text-body-1">Elija una solicitud de la lista para revisarla.</div>
        </v-card>

        <template v-else>
          <!-- Comparación de series -->
          <v-card rounded="xl" elevation="2" class="mb-4">
            <div class="detalle__cab">
              <div>
                <div class="text-caption" style="opacity:.85;">Solicitud #{{ seleccionada.id }}</div>
                <div class="text-h6 font-weight-bold">
                  {{ capitalizar(seleccionada.nombreEstablecimiento) || seleccionada.codigoEstablecimiento || '—' }}
                </div>
                <div class="text-caption" style="opacity:.85;">
                  {{ seleccionada.codigoEstablecimiento }} ·
                  {{ capitalizar(seleccionada.departamento) }}
                  <span v-if="seleccionada.municipio">, {{ capitalizar(seleccionada.municipio) }}</span>
                </div>
              </div>
              <v-spacer />
              <v-chip :color="colorEstado(seleccionada.estado)" variant="flat" class="text-capitalize">
                {{ seleccionada.noCoincide ? 'No coincide' : seleccionada.estado }}
              </v-chip>
            </div>

            <v-card-text class="pa-4 pa-sm-6">
              <div class="comparacion">
                <div class="comparacion__lado">
                  <div class="comparacion__rotulo">Registrado actualmente</div>
                  <div class="comparacion__serie comparacion__serie--vieja">
                    {{ seleccionada.serieAnterior }}
                  </div>
                </div>

                <v-icon size="28" class="comparacion__flecha">mdi-arrow-right-bold</v-icon>

                <div class="comparacion__lado">
                  <div class="comparacion__rotulo">
                    Debe decir <span class="text-error">(verifique contra el documento)</span>
                  </div>
                  <div class="comparacion__serie comparacion__serie--nueva">
                    {{ seleccionada.serieNueva }}
                  </div>
                </div>
              </div>

              <v-row dense class="mt-4">
                <v-col cols="12" sm="6">
                  <div class="dato"><span>Tipo</span><strong class="text-capitalize">{{ seleccionada.tipoBeneficiario }}</strong></div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="dato">
                    <span>Tipo de cambio</span>
                    <strong class="text-capitalize">{{ etiquetaTipoCambio(seleccionada.tipoCambio) }}</strong>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="dato"><span>Enviada por</span><strong>{{ seleccionada.solicitanteNombre || '—' }}</strong></div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="dato"><span>Correo</span><strong>{{ seleccionada.solicitanteEmail || '—' }}</strong></div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="dato"><span>Teléfono</span><strong>{{ seleccionada.solicitanteTelefono || '—' }}</strong></div>
                </v-col>
                <v-col cols="12" v-if="seleccionada.motivo">
                  <div class="dato"><span>Motivo</span><strong>{{ seleccionada.motivo }}</strong></div>
                </v-col>
              </v-row>

              <v-alert
                v-if="seleccionada.verificado"
                type="success" variant="tonal" density="compact" class="mt-4"
                icon="mdi-check-decagram"
              >
                Serie verificada contra el documento
                <span v-if="seleccionada.verificadoPor">por {{ seleccionada.verificadoPor }}</span>.
                <div v-if="seleccionada.verificacionNota" class="text-body-2 mt-1">
                  {{ seleccionada.verificacionNota }}
                </div>
              </v-alert>

              <!-- El estado se queda en 'pendiente' cuando no coincide (ver el
                   comentario de `verificarSolicitud` en el backend), así que
                   sin esta alerta la solicitud se ve exactamente igual que una
                   que nadie ha revisado todavía. -->
              <v-alert
                v-if="seleccionada.noCoincide"
                type="warning" variant="tonal" density="compact" class="mt-4"
                icon="mdi-alert-outline"
              >
                La serie escrita <strong>no coincide</strong> con el documento
                <span v-if="seleccionada.verificadoPor">(revisado por {{ seleccionada.verificadoPor }})</span>.
                <div v-if="seleccionada.verificacionNota" class="text-body-2 mt-1">
                  {{ seleccionada.verificacionNota }}
                </div>
                <div class="text-body-2 mt-1">
                  Puede pedir un documento corregido, o rechazar la solicitud con el motivo.
                </div>
              </v-alert>

              <v-alert
                v-if="seleccionada.estado === 'aprobada'"
                type="info" variant="tonal" density="compact" class="mt-3"
                icon="mdi-history"
              >
                Cambio aplicado. Queda constancia de que antes decía
                <strong>{{ seleccionada.serieAnterior }}</strong>.
                <div v-if="seleccionada.revisadoPorNombre" class="text-body-2 mt-1">
                  Aprobó <strong>{{ seleccionada.revisadoPorNombre }}</strong>
                  <span v-if="formatearFecha(seleccionada.revisadoEn)"> el {{ formatearFecha(seleccionada.revisadoEn) }}</span>.
                </div>
              </v-alert>

              <v-alert
                v-if="seleccionada.estado === 'rechazada'"
                type="error" variant="tonal" density="compact" class="mt-3"
              >
                <strong>Rechazada:</strong> {{ seleccionada.motivoRechazo }}
                <div v-if="seleccionada.revisadoPorNombre" class="text-body-2 mt-1">
                  Rechazó <strong>{{ seleccionada.revisadoPorNombre }}</strong>
                  <span v-if="formatearFecha(seleccionada.revisadoEn)"> el {{ formatearFecha(seleccionada.revisadoEn) }}</span>.
                </div>
              </v-alert>
            </v-card-text>

            <!-- Acciones -->
            <v-divider />
            <v-card-actions class="pa-4 flex-wrap ga-2" v-if="!esFinal">
              <v-btn
                v-if="!seleccionada.verificado"
                color="#0094D3" variant="flat" class="text-none" style="color:#fff;"
                prepend-icon="mdi-check-decagram"
                :loading="accion === 'aprobar'"
                @click="aprobarDirecto"
              >
                Sí coincide: aplicar cambio
              </v-btn>

              <v-btn
                v-if="!seleccionada.verificado"
                color="warning" variant="tonal" class="text-none"
                prepend-icon="mdi-alert-outline"
                :loading="accion === 'no-coincide'"
                @click="verificar(false)"
              >
                No coincide
              </v-btn>

              <!-- Sólo puede llegar aquí una solicitud que ya estaba 'verificada'
                   de antes de este cambio: el flujo nuevo aprueba de una vez
                   con el botón de arriba, sin dejar nada esperando en este
                   estado. -->
              <v-btn
                v-if="seleccionada.verificado"
                color="#0094D3" variant="flat" class="text-none" style="color:#fff;"
                prepend-icon="mdi-content-save-check"
                :loading="accion === 'aprobar'"
                @click="aprobar"
              >
                Aprobar y aplicar el cambio
              </v-btn>

              <v-spacer />

              <v-btn
                color="error" variant="text" class="text-none"
                prepend-icon="mdi-close-circle-outline"
                :loading="accion === 'rechazar'"
                @click="rechazar"
              >
                Rechazar
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Documento — sólo el botón para abrirlo, sin visor embebido: un
               PDF servido desde el bucket no siempre se deja incrustar en un
               iframe (depende de sus cabeceras), así que abrirlo en pestaña
               nueva es lo único que funciona siempre, para PDF o imagen. -->
          <v-card rounded="xl" elevation="2">
            <div class="detalle__cab detalle__cab--doc">
              <v-icon size="20" class="mr-2">mdi-file-document-outline</v-icon>
              <span class="font-weight-bold">Documento firmado por el director</span>
            </div>

            <div class="visor pa-10 text-center">
              <template v-if="documentoUrl">
                <v-icon size="56" color="#0094D3">
                  {{ esImagen ? 'mdi-file-image-outline' : 'mdi-file-pdf-box' }}
                </v-icon>
                <p class="text-body-2 text-grey-darken-1 mt-2 mb-4">
                  {{ esImagen ? 'Imagen adjunta por quien envió la solicitud.' : 'Documento PDF adjunto por quien envió la solicitud.' }}
                </p>
                <v-btn
                  color="#0094D3" variant="flat" class="text-none"
                  style="color:#fff;"
                  prepend-icon="mdi-open-in-new"
                  :href="documentoUrl" target="_blank" rel="noopener noreferrer"
                >
                  Abrir documento
                </v-btn>
              </template>

              <div v-else class="text-grey">
                No se pudo resolver el documento de esta solicitud.
              </div>
            </div>
          </v-card>
        </template>
      </v-col>
    </v-row>

    <!-- Diálogo para pedir un comentario (ver el comentario de `pedirTexto`).
         Misma cabecera azul en degradado que el resto de tarjetas/modales de
         la vista (`detalle__cab`, `bandeja__cab`), para que no desentone. -->
    <v-dialog v-model="dialogoTexto.abierto" max-width="520" persistent>
      <v-card rounded="xl" class="dialogo-texto">
        <div class="detalle__cab">
          <v-icon size="20" class="mr-2">mdi-comment-edit-outline</v-icon>
          <span class="font-weight-bold">{{ dialogoTexto.titulo }}</span>
        </div>

        <v-card-text class="pa-5 pb-0">
          <v-textarea
            v-model="dialogoTexto.texto"
            :label="dialogoTexto.etiqueta"
            :placeholder="dialogoTexto.placeholder"
            :error-messages="dialogoTexto.error"
            variant="outlined"
            rounded="lg"
            rows="4"
            auto-grow
            autofocus
            counter="500"
            maxlength="500"
            @update:model-value="dialogoTexto.error = ''"
          />
        </v-card-text>

        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="cancelarTexto">Cancelar</v-btn>
          <v-btn
            color="#0094D3" variant="flat" class="text-none" style="color:#fff;"
            @click="confirmarTexto"
          >
            {{ dialogoTexto.confirmar }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
/**
 * Bandeja de verificación de solicitudes de cambio de número de serie
 * (Ciudadanía Digikal), para el personal con sesión.
 *
 * El punto de la vista es poder mirar, a la vez, la serie que escribió quien
 * envió la solicitud y el documento firmado por el director: aprobar sin haber
 * comparado esas dos cosas es justo lo que hay que evitar, porque al aprobar se
 * cambia la serie REAL del equipo en la base del servicio de tablets.
 *
 * Por eso "Aprobar" sólo aparece cuando la solicitud ya está marcada como
 * verificada; el backend además lo vuelve a exigir por su cuenta.
 */
import { ref, reactive, computed, onMounted, watch } from 'vue'
import api, { urlArchivo } from '@/helpers/api.js'
import Swal from 'sweetalert2'

/* 'verificada' ya no queda como filtro: con `aprobarDirecto` una solicitud
   pasa por ahí sólo un instante, encadenada con la aprobación, así que nunca
   hay nada esperando ese estado para mostrar (salvo alguna que ya hubiera
   quedado así con el flujo anterior; para esa sigue funcionando "Todas"). */
const OPCIONES_ESTADO = [
  { titulo: 'Pendientes', valor: 'pendiente' },
  { titulo: 'No coincide', valor: 'no_coincide' },
  { titulo: 'Aprobadas', valor: 'aprobada' },
  { titulo: 'Rechazadas', valor: 'rechazada' },
  { titulo: 'Todas', valor: '' },
]


const solicitudes = ref([])
const total = ref(0)
const pagina = ref(1)
const totalPaginas = ref(1)
const filtroEstado = ref('pendiente')
const busquedaSerie = ref('')

// Busca mientras se escribe, sin disparar una petición por cada tecla: espera
// una pausa corta. Enter o el botón de limpiar (ver el template) saltan la
// espera y consultan de inmediato.
let temporizadorBusqueda = null
watch(busquedaSerie, () => {
  clearTimeout(temporizadorBusqueda)
  temporizadorBusqueda = setTimeout(() => cargarLista(1), 400)
})
const cargandoLista = ref(false)

const seleccionada = ref(null)
const accion = ref(null)

/* ── Diálogo para pedir un comentario ─────────────────────────────────────
   Antes esto usaba `input: 'textarea'` de SweetAlert2 y el campo no se dejaba
   escribir. Eran los dos únicos `input:` de Swal en toda la aplicación (el
   resto de alertas no piden texto), así que en lugar de pelear con ese caso
   se usa un diálogo de Vuetify, que es lo que ya usa el resto del sistema.

   `pedirTexto()` devuelve una promesa: el texto escrito, o `null` si se
   canceló. Se distinguen a propósito — en la verificación un comentario vacío
   es válido, cancelar no. */
const dialogoTexto = reactive({
  abierto: false,
  titulo: '',
  etiqueta: '',
  placeholder: '',
  confirmar: 'Aceptar',
  obligatorio: false,
  texto: '',
  error: '',
  resolver: null,
})

const pedirTexto = (opciones) => new Promise((resolve) => {
  Object.assign(dialogoTexto, {
    titulo: '', etiqueta: '', placeholder: '', confirmar: 'Aceptar',
    obligatorio: false, texto: '', error: '',
    ...opciones,
    abierto: true,
    resolver: resolve,
  })
})

const confirmarTexto = () => {
  const texto = dialogoTexto.texto.trim()
  if (dialogoTexto.obligatorio && !texto) {
    dialogoTexto.error = 'Este campo es obligatorio'
    return
  }
  const resolver = dialogoTexto.resolver
  dialogoTexto.abierto = false
  dialogoTexto.resolver = null
  resolver?.(texto)
}

const cancelarTexto = () => {
  const resolver = dialogoTexto.resolver
  dialogoTexto.abierto = false
  dialogoTexto.resolver = null
  resolver?.(null)
}

/* Una vez aprobada o rechazada ya no hay nada que hacer con ella. */
const esFinal = computed(() =>
  ['aprobada', 'rechazada'].includes(seleccionada.value?.estado)
)

/* El backend devuelve la URL ya resuelta; si es del respaldo local
   (`/uploads/...`) hay que anteponerle la base del API. */
const documentoUrl = computed(() => urlArchivo(seleccionada.value?.documentoUrl))

const esImagen = computed(() => {
  const mime = seleccionada.value?.documentoMime || ''
  if (mime) return mime.startsWith('image/')
  return /\.(jpe?g|png|webp)$/i.test(documentoUrl.value || '')
})

/* En la base viaja el valor crudo (`correccion`, `garantia`); en pantalla se
   lee mejor escrito completo. */
const etiquetaTipoCambio = (tipo) => ({
  correccion: 'Corrección de error',
  garantia: 'Reemplazo por garantía',
  robo_extravio: 'Robo o extravío',
}[tipo] || tipo || '—')

const capitalizar = (texto) =>
  (texto ?? '').toString().trim().toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())

const colorEstado = (estado) => ({
  pendiente: 'warning',
  no_coincide: 'deep-orange',
  verificada: 'info',
  aprobada: 'success',
  rechazada: 'error',
}[estado] || 'grey')

/* Quién aprobó o rechazó, para las dos alertas de resultado. El backend ya
   guarda `revisado_por_nombre` y `revisado_en` (columnas separadas de
   `verificado_por`, que es quien comparó la serie contra el documento: puede
   ser otra persona distinta de quien decide al final). */
const formatearFecha = (iso) => {
  if (!iso) return null
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return null
  return fecha.toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' })
}

/* ── Carga ──────────────────────────────────────────────────────────────── */
const cargarLista = async (nuevaPagina = pagina.value) => {
  cargandoLista.value = true
  try {
    const { data } = await api.get('/api/v1/ciudadania/solicitudes', {
      params: {
        pagina: nuevaPagina,
        tamanoPagina: 20,
        ...(filtroEstado.value ? { estado: filtroEstado.value } : {}),
        ...(busquedaSerie.value.trim() ? { serie: busquedaSerie.value.trim() } : {}),
      },
    })
    solicitudes.value = data.data || []
    total.value = data.total || 0
    pagina.value = data.pagina || 1
    totalPaginas.value = data.totalPaginas || 1
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudieron cargar las solicitudes', 'error')
  } finally {
    cargandoLista.value = false
  }
}

const abrir = async (id) => {
  try {
    const { data } = await api.get(`/api/v1/ciudadania/solicitudes/${id}`)
    seleccionada.value = data.solicitud
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo abrir la solicitud', 'error')
  }
}

/* ── Acciones ───────────────────────────────────────────────────────────── */
const verificar = async (coincide) => {
  const id = seleccionada.value.id

  const nota = await pedirTexto({
    titulo: coincide ? 'Confirmar verificación' : 'Registrar que no coincide',
    etiqueta: coincide
      ? 'Observación (opcional)'
      : 'Explique qué no coincide (quedará registrado)',
    placeholder: coincide
      ? 'Ej. La serie del documento es la misma que se escribió.'
      : 'Ej. El documento dice otra serie / no trae sello.',
    confirmar: coincide ? 'Sí, coincide' : 'Registrar',
    // Si NO coincide, explicar por qué es lo único que queda registrado del
    // caso: se exige. Si coincide, la observación es opcional.
    obligatorio: !coincide,
  })
  if (nota === null) return   // canceló (una nota vacía sí es válida)

  accion.value = coincide ? 'verificar' : 'no-coincide'
  try {
    const { data } = await api.patch(`/api/v1/ciudadania/solicitudes/${id}/verificar`, {
      coincide,
      nota,
    })
    await abrir(id)
    await cargarLista()
    Swal.fire(
      coincide ? 'Verificada' : 'Registrado',
      data.message || (coincide
        ? 'La serie coincide con el documento.'
        : 'Se registró que la serie no coincide.'),
      coincide ? 'success' : 'info'
    )
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo verificar', 'error')
  } finally {
    accion.value = null
  }
}

/* Cuando la serie SÍ coincide, ya no se pide una observación aparte: alcanza
   con confirmar una vez (el mismo aviso de siempre) y de ahí se encadenan
   verificar + aprobar como una sola acción para quien usa la pantalla. Por
   dentro siguen siendo dos peticiones — el backend exige que una solicitud
   pase por 'verificada' antes de aprobar, y ese resguardo no se toca — pero
   ya no queda nada esperando entre medio: o se aplica el cambio, o no pasó
   nada. */
const aprobarDirecto = async () => {
  const s = seleccionada.value

  const { isConfirmed } = await Swal.fire({
    title: '¿Aplicar el cambio?',
    html: `La serie escrita coincide con el documento. Se cambiará el número de serie del equipo de
           <b>${s.serieAnterior}</b> a <b>${s.serieNueva}</b>.<br><br>
           Esta acción modifica el registro real de la tableta. Queda constancia de la serie anterior.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, aplicar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#0094D3',
  })
  if (!isConfirmed) return

  accion.value = 'aprobar'
  try {
    await api.patch(`/api/v1/ciudadania/solicitudes/${s.id}/verificar`, { coincide: true, nota: '' })
    const { data } = await api.patch(`/api/v1/ciudadania/solicitudes/${s.id}/aprobar`)
    await abrir(s.id)
    await cargarLista()
    Swal.fire('Cambio aplicado', data.message || 'El número de serie fue actualizado.', 'success')
  } catch (error) {
    Swal.fire('No se pudo aplicar el cambio', error.response?.data?.message || 'Ocurrió un error', 'error')
  } finally {
    accion.value = null
  }
}

/* Se conserva para una solicitud que ya hubiera quedado 'verificada' con el
   flujo anterior (ver el comentario junto al botón, en el template). */
const aprobar = async () => {
  const s = seleccionada.value

  const { isConfirmed } = await Swal.fire({
    title: '¿Aplicar el cambio?',
    html: `Se cambiará el número de serie del equipo de <b>${s.serieAnterior}</b> a <b>${s.serieNueva}</b>.<br><br>
           Esta acción modifica el registro real de la tableta. Queda constancia de la serie anterior.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, aplicar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#0094D3',
  })
  if (!isConfirmed) return

  accion.value = 'aprobar'
  try {
    const { data } = await api.patch(`/api/v1/ciudadania/solicitudes/${s.id}/aprobar`)
    await abrir(s.id)
    await cargarLista()
    Swal.fire('Cambio aplicado', data.message || 'El número de serie fue actualizado.', 'success')
  } catch (error) {
    Swal.fire('No se pudo aprobar', error.response?.data?.message || 'Ocurrió un error', 'error')
  } finally {
    accion.value = null
  }
}

const rechazar = async () => {
  const id = seleccionada.value.id

  const motivo = await pedirTexto({
    titulo: 'Rechazar solicitud',
    etiqueta: 'Motivo del rechazo (se le mostrará a quien consulte)',
    placeholder: 'Ej. El documento no viene sellado por la dirección.',
    confirmar: 'Rechazar',
    // El backend también lo exige: sin motivo devuelve 400.
    obligatorio: true,
  })
  if (!motivo) return

  accion.value = 'rechazar'
  try {
    const { data } = await api.patch(`/api/v1/ciudadania/solicitudes/${id}/rechazar`, { motivo })
    await abrir(id)
    await cargarLista()
    Swal.fire('Solicitud rechazada', data.message || 'Se registró el rechazo.', 'success')
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo rechazar', 'error')
  } finally {
    accion.value = null
  }
}


onMounted(() => cargarLista(1))
</script>

<style scoped>
.bandeja { overflow: hidden; }

.bandeja__cab,
.detalle__cab {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(120deg, #003366 0%, #0094D3 100%);
  color: #fff;
  font-weight: 600;
}

.detalle__cab { align-items: flex-start; gap: 8px; }
.detalle__cab--doc { align-items: center; }

.bandeja__cab :deep(.v-icon),
.detalle__cab :deep(.v-icon) { color: #fff; }

.bandeja__lista {
  max-height: 60vh;
  overflow-y: auto;
}

.bandeja__item {
  border-bottom: 1px solid #eef2f7;
  cursor: pointer;
}

/* Comparación de las dos series: es el corazón de la vista */
.comparacion {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.comparacion__lado { flex: 1 1 200px; min-width: 0; }

.comparacion__rotulo {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #64748b;
  margin-bottom: 6px;
  text-align: center;
}

.comparacion__serie {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 1.15rem;
  font-weight: 700;
  text-align: center;
  padding: 12px 10px;
  border-radius: 12px;
  word-break: break-all;
}

.comparacion__serie--vieja {
  background: #fef3c7;
  border: 2px solid #fcd34d;
  color: #78350f;
  text-decoration: line-through;
}

.comparacion__serie--nueva {
  background: #dcfce7;
  border: 2px solid #86efac;
  color: #14532d;
}

.comparacion__flecha { color: #94a3b8; flex: none; }

.dato {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.dato span {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #64748b;
  font-weight: 700;
}

.dato strong { font-size: 0.9rem; color: #0f172a; font-weight: 600; }

.serie {
  font-family: ui-monospace, Consolas, monospace;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 1px 6px;
}

.serie--chica { font-size: 0.72rem; }

/* Documento: sólo el botón de abrir, sin visor embebido (ver el comentario
   del template). */
.visor { background: #f8fafc; }

/* Sin esto la cabecera azul, que no tiene esquinas redondeadas propias, se
   sale del borde curvo de la tarjeta del dialogo. */
.dialogo-texto { overflow: hidden; }

@media (max-width: 600px) {
  .comparacion__flecha { transform: rotate(90deg); }
  .bandeja__lista { max-height: 40vh; }
}
</style>
