<template>
  <v-container class="py-8">
    <v-btn variant="text" class="mb-4" prepend-icon="mdi-arrow-left" @click="goBack">
      Regresar al listado
    </v-btn>

    <!-- Cargando -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
      <div class="mt-3 text-grey">Cargando establecimiento…</div>
    </div>

    <template v-else-if="establecimiento">
      <!-- Encabezado -->
      <v-card class="pa-6 mb-6 overflow-hidden" elevation="3"
        style="border-radius: 16px; border-top: 8px solid #142957;">
        <v-row align="center">
          <v-col cols="12" md="auto" class="text-center">
            <v-avatar size="90" color="blue-lighten-5">
              <v-icon size="52" color="#142957">mdi-school</v-icon>
            </v-avatar>
          </v-col>
          <v-col>
            <div class="d-flex align-center flex-wrap mb-2">
              <h1 class="text-h4 font-weight-black mr-4 uppercase school-title" style="color: #142957;">
                {{ establecimiento.nombre || 'Sin nombre' }}
              </h1>
              <v-chip color="#142957" label variant="flat" size="small" class="font-weight-bold">
                CÓDIGO: {{ establecimiento.codigoMineduc || '—' }}
              </v-chip>
            </div>
            <div class="text-subtitle-2 text-grey-darken-1">
              <!-- <v-icon size="small" class="mr-1">mdi-identifier</v-icon>ID: {{ establecimiento.id }} -->
              <span v-if="tieneCoords" class="ml-4">
                <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                {{ establecimiento.latitud?.toFixed(5) }}, {{ establecimiento.longitud?.toFixed(5) }}
              </span>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- Aviso: el API configurado no expone inventario -->
      <v-alert v-if="sinInventario" type="info" variant="tonal" density="compact" class="mb-6">
        El API configurado no expone el inventario de equipos. Se muestran solo los datos del establecimiento.
        Para ver el inventario, configura <code>MDM_GRAPHQL_URL</code> hacia el backend que lo provee.
      </v-alert>

      <!-- Tarjetas resumen -->
      <v-row class="mb-6">
        <v-col cols="12" sm="4">
          <v-card class="pa-5 text-center text-white" elevation="4" rounded="xl" style="background:#142957;">
            <div class="text-h3 font-weight-black">{{ totalInventario }}</div>
            <div class="text-uppercase text-caption font-weight-bold">Equipos dotados</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-5 text-center" elevation="4" rounded="xl"
            style="border: 2px solid #142957; color:#142957;">
            <div class="text-h3 font-weight-black">{{ estudiantes }}</div>
            <div class="text-uppercase text-caption font-weight-bold">Estudiantes beneficiados</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-5 text-center"
            :class="establecimiento.poseeConectividad ? 'text-white' : 'text-grey'"
            :style="establecimiento.poseeConectividad ? 'background:#1b7a43;' : 'background:#eceff1;'"
            elevation="4" rounded="xl">
            <v-icon size="30" class="mb-1">{{ establecimiento.poseeConectividad ? 'mdi-wifi' : 'mdi-wifi-off' }}</v-icon>
            <div class="text-h6 font-weight-bold">
              {{ establecimiento.poseeConectividad ? 'CONECTADO' : 'SIN INTERNET' }}
            </div>
            <div v-if="establecimiento.velocidadConectividad" class="text-caption">
              {{ establecimiento.velocidadConectividad }} Mbps
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <!-- Datos del establecimiento -->
        <v-col cols="12" lg="4">
          <h3 class="text-h6 font-weight-bold mb-4" style="color:#142957;">
            <v-icon class="mr-2">mdi-information-outline</v-icon>Datos del Establecimiento
          </h3>
          <v-card variant="outlined" rounded="xl" class="pa-2">
            <v-list density="compact">
              <v-list-item v-for="d in datosEstablecimiento" :key="d.label">
                <template #prepend>
                  <v-icon size="small" color="#142957" class="mr-3">{{ d.icon }}</v-icon>
                </template>
                <div class="text-caption text-grey-darken-1">{{ d.label }}</div>
                <div class="text-body-2 font-weight-medium" style="color:#1a1a1a;">{{ d.value }}</div>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Inventario -->
        <v-col cols="12" lg="8">
          <h3 class="text-h6 font-weight-bold mb-4" style="color:#142957;">
            <v-icon class="mr-2">mdi-devices</v-icon>Equipos dotados ({{ totalInventario }})
          </h3>

          <v-card v-if="totalInventario === 0" variant="tonal" color="grey" rounded="xl" class="pa-6 text-center text-grey">
            No hay equipos registrados en el inventario de este establecimiento.
          </v-card>

          <v-card v-else variant="outlined" rounded="xl" class="overflow-hidden">
            <v-table density="compact">
              <thead style="background:#eef2f8;">
                <tr>
                  <th class="text-left text-caption font-weight-bold">EQUIPO</th>
                  <th class="text-left text-caption font-weight-bold">MARCA / MODELO</th>
                  <th class="text-left text-caption font-weight-bold">SERIE</th>
                  <th class="text-left text-caption font-weight-bold">SICOIN</th>
                  <th class="text-left text-caption font-weight-bold">ESTADO</th>
                  <th class="text-right text-caption font-weight-bold">VALOR</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="eq in establecimiento.inventario" :key="eq.id">
                  <td class="py-2">
                    <div class="d-flex align-start">
                      <v-icon size="small" class="mr-2 mt-1" color="#142957">{{ iconoTipo(eq) }}</v-icon>
                      <div>
                        <div class="text-body-2 font-weight-bold">{{ eq.nombre || 'Equipo' }}</div>
                        <div v-if="atributos(eq).length" class="mt-1">
                          <v-chip v-for="a in atributos(eq)" :key="a" size="x-small" variant="tonal"
                            color="indigo" class="mr-1">{{ a }}</v-chip>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="text-body-2">
                    <div>{{ eq.marca || '—' }}</div>
                    <div class="text-caption text-grey-darken-1">{{ eq.modelo || '' }}</div>
                  </td>
                  <td class="text-body-2">{{ eq.serie || '—' }}</td>
                  <td class="text-body-2">{{ eq.sicoin || '—' }}</td>
                  <td>
                    <v-chip size="x-small" :color="colorEstado(eq.estado)" variant="flat">
                      {{ eq.estado || '—' }}
                    </v-chip>
                  </td>
                  <td class="text-right text-body-2">{{ formatValor(eq.valor) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Evidencia de la entrega ───────────────────────────────────────
           Fotos y actas registradas en este sistema (no vienen del API del
           MINEDUC). Antes sólo se veían desde la vista de Dotaciones. -->
      <template v-if="dotaciones.length">
        <h3 class="text-h6 font-weight-bold mb-4" style="color:#142957;">
          <v-icon class="mr-2">mdi-camera-outline</v-icon>
          Evidencia de la entrega ({{ totalImagenes }})
        </h3>

        <v-card v-for="(d, i) in dotaciones" :key="d.id" variant="outlined" rounded="xl"
          class="mb-4 overflow-hidden">

          <div class="d-flex align-center flex-wrap ga-2 pa-4" style="background:#eef2f8;">
            <v-chip size="small" color="#142957" variant="flat" class="font-weight-bold">
              Dotación {{ i + 1 }}
            </v-chip>
            <v-chip size="small" variant="tonal" prepend-icon="mdi-calendar">
              {{ formatFecha(d.fecha_entrega) }}
            </v-chip>
            <v-chip size="small" variant="tonal"
              :color="d.origen === 'COMPRA' ? 'deep-purple' : 'teal'"
              prepend-icon="mdi-source-branch">
              {{ d.origen === 'COMPRA' ? 'Compra' : 'Donación' }}
            </v-chip>
            <v-spacer />
            <!-- Sólo las actas que tienen archivo: sin filtrar aquí se
                 renderizaban botones ocultos que no llevan a ninguna parte. -->
            <v-btn v-for="acta in d.actas.filter((a) => a.url)" :key="acta.id"
              size="small" variant="tonal" color="#142957" class="text-none"
              prepend-icon="mdi-file-pdf-box" :href="acta.url" target="_blank" rel="noopener">
              Acta {{ acta.no_acta || '' }}
            </v-btn>
          </div>

    <div v-if="d.imagenes.length" class="pa-4">
  <v-row dense justify="center">
    <v-col
      v-for="(img, idx) in d.imagenes"
      :key="img.id"
      cols="6"
      sm="4"
      md="3"
      lg="2"
    >
      <div class="foto" @click="abrirVisor(d.imagenes, idx)">
        <v-img
          :src="img.url"
          aspect-ratio="1"
          cover
          class="foto__img"
        />

        <div class="foto__velo">
          <v-icon color="white" size="26">
            mdi-magnify-plus-outline
          </v-icon>
        </div>
      </div>
    </v-col>
  </v-row>
</div>

          <div v-else class="pa-4 text-center text-grey text-body-2">
            Esta dotación no tiene fotos de evidencia.
          </div>
        </v-card>
      </template>
    </template>

    <!-- Visor a pantalla grande -->
    <v-dialog v-model="visor" max-width="900">
      <v-card class="rounded-lg">
        <v-toolbar density="compact" color="#142957">
          <v-toolbar-title class="text-body-2">
            Foto {{ indice + 1 }} de {{ galeria.length }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-chevron-left" :disabled="indice === 0" @click="indice--" />
          <v-btn icon="mdi-chevron-right" :disabled="indice >= galeria.length - 1" @click="indice++" />
          <v-btn icon="mdi-close" @click="visor = false" />
        </v-toolbar>
        <v-img :src="galeria[indice]?.url" max-height="70vh" contain />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { urlArchivo } from '@/helpers/api.js'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const establecimiento = ref(null)
const sinInventario = ref(false)
const loading = ref(false)

const id = route.query.id

const totalInventario = computed(() => establecimiento.value?.inventario?.length || 0)

/* ── Evidencia de la entrega ────────────────────────────────────────────────
   El backend adjunta las dotaciones registradas en este sistema (fotos y
   actas), enlazadas por código MINEDUC. No vienen del API del ministerio. */

/* `urlArchivo` convierte las rutas relativas (/uploads/... del respaldo local)
   en absolutas: el front corre en otro puerto y solas no resuelven. Las URL del
   bucket, que ya son absolutas, las deja intactas. */
const dotaciones = computed(() =>
  (establecimiento.value?.dotaciones || []).map((d) => ({
    ...d,
    imagenes: (d.imagenes || [])
      .map((i) => ({ ...i, url: urlArchivo(i.url) }))
      .filter((i) => i.url),
    actas: (d.actas || []).map((a) => ({ ...a, url: urlArchivo(a.url) })),
  }))
)

const totalImagenes = computed(() =>
  dotaciones.value.reduce((t, d) => t + (d.imagenes?.length || 0), 0)
)

const visor = ref(false)
const galeria = ref([])
const indice = ref(0)

/** Se abre el visor sobre las fotos de ESA dotación, no sobre todas juntas. */
const abrirVisor = (imagenes, idx) => {
  galeria.value = imagenes
  indice.value = idx
  visor.value = true
}

const formatFecha = (valor) => {
  if (!valor) return 'Sin fecha'
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? 'Sin fecha' : d.toLocaleDateString('es-GT')
}

const estudiantes = computed(() => {
  const e = establecimiento.value
  if (!e) return 0
  return e.inscritos2026 ?? e.estudiantesInscritos ?? 0
})

const tieneCoords = computed(() =>
  establecimiento.value?.latitud != null && establecimiento.value?.longitud != null
)

// OPF llega como texto ('SI' / 'NO' / null). Se muestra como Sí/No: "tiene OPF"
// es cuando el valor es SI.
const tieneOpf = computed(() =>
  String(establecimiento.value?.opf ?? '').trim().toUpperCase() === 'SI'
)

const datosEstablecimiento = computed(() => {
  const e = establecimiento.value
  if (!e) return []
  const fecha = (f) => (f ? new Date(f).toLocaleDateString('es-GT') : '—')
  const num = (v) => (v ?? '—')
  return [
    { label: 'OPF', value: tieneOpf.value ? 'Sí' : 'No', icon: 'mdi-tag-check-outline' },
    { label: 'Estudiantes beneficiados', value: num(estudiantes.value), icon: 'mdi-account-group-outline' },
    { label: 'Hombres', value: num(e.cantidadHombres), icon: 'mdi-human-male' },
    { label: 'Mujeres', value: num(e.cantidadMujeres), icon: 'mdi-human-female' },
    { label: 'Correo electrónico', value: e.correoElectronico || '—', icon: 'mdi-email-outline' },
    { label: 'Teléfono', value: e.telefono || '—', icon: 'mdi-phone-outline' },
    { label: 'Conectividad', value: e.poseeConectividad ? `Sí${e.velocidadConectividad ? ' · ' + e.velocidadConectividad + ' Mbps' : ''}` : 'No', icon: 'mdi-wifi' },
    { label: 'Fecha de conexión', value: fecha(e.fechaConexion), icon: 'mdi-calendar-check' },
    { label: 'Fecha de dotación', value: fecha(e.fechaDatacion), icon: 'mdi-calendar-clock' }
  ]
})

function goBack() {
  router.back()
}

function atributos(eq) {
  const extra = eq?.atributosExtra
  if (!extra || typeof extra !== 'object') return []
  return Object.entries(extra).map(([k, v]) => `${k}: ${v}`)
}

function iconoTipo(eq) {
  const t = `${eq?.nombre || ''} ${eq?.modelo || ''} ${eq?.marca || ''}`.toLowerCase()
  if (t.includes('laptop') || t.includes('portátil')) return 'mdi-laptop'
  if (t.includes('tomi') || t.includes('proyector')) return 'mdi-projector'
  if (t.includes('tablet')) return 'mdi-tablet'
  if (t.includes('impresora') || t.includes('printer')) return 'mdi-printer'
  if (t.includes('comp') || t.includes('desktop') || t.includes('dell')) return 'mdi-desktop-tower'
  return 'mdi-devices'
}

function colorEstado(estado) {
  const e = (estado || '').toUpperCase()
  if (e === 'ASIGNADO') return 'success'
  if (e === 'DISPONIBLE') return 'primary'
  if (e === 'BAJA' || e === 'DAÑADO') return 'error'
  return 'grey'
}

function formatValor(v) {
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  return `Q ${n.toLocaleString('es-GT')}`
}

onMounted(async () => {
  if (!id) {
    Swal.fire('Error', 'No se recibió el id del establecimiento', 'error')
    router.back()
    return
  }

  loading.value = true
  try {
    const { data } = await api.get(`/api/v1/dashboard/establecimiento/${id}`)
    establecimiento.value = data.establecimiento
    sinInventario.value = !!data._sinInventario
  } catch (error) {
    console.error('ERROR API detalle:', error)
    Swal.fire('Error', error.response?.data?.message || 'No se pudo cargar el establecimiento', 'error')
    router.back()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ── Fotos de evidencia ─────────────────────────────────────────────────── */
.foto {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: zoom-in;
  border: 1px solid rgba(20, 41, 87, 0.12);
}

.foto__img {
  display: block;
}

/* El velo sólo aparece al pasar por encima: en táctil no hay hover, así que la
   foto se ve limpia y el toque abre el visor igual. */
.foto__velo {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 41, 87, 0.45);
  opacity: 0;
  transition: opacity 0.18s ease;
}

.foto:hover .foto__velo {
  opacity: 1;
}

.uppercase { text-transform: uppercase; }
:deep(.v-table) { background: transparent !important; }
:deep(.v-table th) {
  font-size: 0.7rem !important;
  letter-spacing: 0.5px;
  color: #455A64 !important;
}

/* La tabla de inventario (6 columnas) hace scroll horizontal dentro de su
   tarjeta en pantallas chicas, en vez de desbordar la página. */
:deep(.v-table__wrapper) {
  overflow-x: auto;
}

/* ── RESPONSIVE ─────────────────────────────────────────────────── */
@media (max-width: 600px) {
  /* El nombre del establecimiento (text-h4) es muy grande en teléfono */
  .school-title {
    font-size: 1.4rem !important;
    line-height: 1.25;
    margin-right: 0 !important;
  }
}
</style>
