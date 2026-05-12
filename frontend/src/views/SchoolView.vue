<template>
  <v-container v-if="escuela" class="py-8">
    <v-btn variant="text" class="text-weight-bold mb-4" prepend-icon="mdi-arrow-left" @click="goBack">
      Regresar al listado
    </v-btn>

    <v-card class="pa-6 mb-8 overflow-hidden" elevation="3" style="border-radius: 16px; border-top: 8px solid #0D47A1;">
      <v-row align="center">
        <v-col cols="12" md="auto" class="text-center">
          <v-avatar size="100" color="blue-lighten-5" class="border-secondary">
            <v-icon size="60" color="primary">mdi-school</v-icon>
          </v-avatar>
        </v-col>

        <v-col>
          <div class="d-flex align-center flex-wrap mb-2">
            <h1 class="text-h4 font-weight-black mr-4 text-blue-darken-4 uppercase">
              {{ escuela.nombreEscuela }}
            </h1>
            <v-chip color="blue-darken-3" label variant="flat" size="small" class="font-weight-bold">
              CÓDIGO: {{ escuela.codigoEscuela }}
            </v-chip>
          </div>

          <v-row dense>
            <v-col cols="12" md="8">
              <div class="text-subtitle-1 mb-1 font-weight-medium text-grey-darken-3">
                <v-icon color="primary" class="mr-2" size="small">mdi-map-marker</v-icon> 
                {{ escuela.direccion || 'Dirección no disponible' }}
              </div>
    
            </v-col>
            <v-col cols="12" md="4" class="text-right d-none d-md-block">
              <v-img src="politica.png" max-width="150" class="ml-auto" opacity="0.8" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>

    <v-row class="mb-8">
      <v-col cols="12" sm="4">
        <v-card class="pa-5 text-center bg-blue-darken-4 text-white" elevation="4" rounded="xl">
          <div class="text-h3 font-weight-black">{{ totalEquiposContados }}</div>
          <div class="text-uppercase text-caption font-weight-bold">Equipos en esta consulta</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-5 text-center bg-white text-blue-darken-4" elevation="4" rounded="xl" style="border: 2px solid #0D47A1;">
          <div class="text-h3 font-weight-black">{{ totalEstudiantes }}</div>
          <div class="text-uppercase text-caption font-weight-bold">Alumnos Beneficiados</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-5 text-center" :class="tieneInternet ? 'bg-green-darken-4 text-white' : 'bg-grey-lighten-3 text-grey'" elevation="4" rounded="xl">
          <v-icon size="32" class="mb-1">{{ tieneInternet ? 'mdi-wifi' : 'mdi-wifi-off' }}</v-icon>
          <div class="text-h5 font-weight-bold">{{ tieneInternet ? 'CONECTADO' : 'SIN INTERNET' }}</div>
          <div class="text-uppercase text-caption font-weight-bold">Estado de Red</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="4">
        <h3 class="text-h6 font-weight-bold mb-4 text-blue-darken-4">
          <v-icon class="mr-2">mdi-account-group</v-icon>Desglose de Población
        </h3>
        
        <v-alert v-if="escuela.beneficiarios?.length === 0" type="info" variant="tonal" text="No hay registros de beneficiarios." />

        <v-card v-for="b in escuela.beneficiarios" :key="b.id" class="mb-6 pa-4" variant="outlined" border rounded="xl">
          <div class="d-flex justify-space-between align-center mb-4">
            <span class="text-h6 font-weight-bold text-primary">Ciclo {{ b.ciclo_educativo }}</span>
            <v-chip size="x-small" color="grey-darken-3">REF-{{ b.id }}</v-chip>
          </div>

          <v-row no-gutters class="text-center mb-4 bg-blue-lighten-5 pa-2 rounded-lg">
            <v-col cols="4">
              <div class="text-subtitle-2 font-weight-bold">{{ b.hombres }}</div>
              <div class="text-caption">Hombres</div>
            </v-col>
            <v-col cols="4" class="border-x">
              <div class="text-subtitle-2 font-weight-bold">{{ b.mujeres }}</div>
              <div class="text-caption">Mujeres</div>
            </v-col>
            <v-col cols="4">
              <div class="text-subtitle-2 font-weight-bold">{{ b.docentes }}</div>
              <div class="text-caption">Docentes</div>
            </v-col>
          </v-row>

          <div class="text-caption font-weight-bold mb-2 text-grey-darken-2">PERTENENCIA CULTURAL:</div>
          <v-row dense>
            <v-col cols="6">
              <v-chip size="x-small" block variant="outlined" class="w-100 justify-start">
                <v-icon start size="14" color="brown">mdi-account</v-icon> Mayas: <b>{{ b.mayas }}</b>
              </v-chip>
            </v-col>
            <v-col cols="6">
              <v-chip size="x-small" block variant="outlined" class="w-100 justify-start">
                <v-icon start size="14" color="orange">mdi-account</v-icon> Xincas: <b>{{ b.xincas }}</b>
              </v-chip>
            </v-col>
            <v-col cols="6">
              <v-chip size="x-small" block variant="outlined" class="w-100 justify-start">
                <v-icon start size="14" color="blue">mdi-account</v-icon> Garífunas: <b>{{ b.garifunas }}</b>
              </v-chip>
            </v-col>
            <v-col cols="6">
              <v-chip size="x-small" block variant="outlined" class="w-100 justify-start">
                <v-icon start size="14" color="grey">mdi-account</v-icon> Otros: <b>{{ b.otros }}</b>
              </v-chip>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <h3 class="text-h6 font-weight-bold mb-4 text-blue-darken-4">
          <v-icon class="mr-2">mdi-history</v-icon>Línea de Tiempo de Dotaciones
        </h3>
        
        <v-card class="pa-6" elevation="2" rounded="xl">
          <v-timeline align="start" side="end" density="compact">
            <v-timeline-item
              v-for="dotacion in escuela.dotaciones"
              :key="dotacion.id"
              :dot-color="dotacion.internet ? 'green-darken-2' : 'blue-darken-2'"
              size="small"
            >
              <template #opposite>
                <div class="text-caption font-weight-bold text-grey">{{ formatDate(dotacion.fecha_entrega) }}</div>
              </template>

              <v-card class="pa-4 mb-4 border" variant="flat" color="grey-lighten-5" rounded="lg">
                <div class="d-flex justify-space-between align-center mb-3">
                  <div class="text-subtitle-1 font-weight-bold text-blue-darken-3">
                    {{ dotacion.descripcion }}
                  </div>
                  <v-chip size="x-small" variant="tonal">{{ formatDate(dotacion.fecha_entrega) }}</v-chip>
                </div>

                <v-alert
                  v-if="dotacion.internet"
                  icon="mdi-wifi"
                  color="green-darken-4"
                  variant="tonal"
                  class="mb-2"
                >
                  <div class="text-body-2">
                    <b>Proveedor:</b> {{ dotacion.internet.empresa?.toUpperCase() }}<br>
                    <b>Instalación:</b> {{ dotacion.internet.fecha_instalacion }}
                  </div>
                </v-alert>

                <div v-if="dotacion.equipos?.length > 0">
                  <v-table density="compact" class="bg-transparent rounded-lg border overflow-hidden">
                    <thead class="bg-blue-grey-lighten-5">
                      <tr>
                        <th class="text-left text-caption font-weight-bold">EQUIPO / ESPECIFICACIONES</th>
                        <th class="text-center text-caption font-weight-bold" style="width: 80px;">CANT.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="grupo in agruparEquipos(dotacion.equipos)" :key="grupo.modelo_id">
                        <td class="py-2">
                          <div class="d-flex align-start">
                            <v-icon size="small" class="mr-2 mt-1" color="primary">{{ getIconType(grupo.tipo) }}</v-icon>
                            <div>
                              <div class="text-body-2 font-weight-bold">{{ grupo.modelo }}</div>
                              <div class="text-caption text-grey-darken-1 line-height-1" style="font-size: 0.7rem !important;">
                                {{ grupo.especificaciones }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="text-center">
                          <v-chip size="x-small" color="primary" variant="flat">{{ grupo.cantidad }}</v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>

                <v-row v-if="dotacion.imagenes?.length > 0" class="mt-3" dense>
                  <v-col v-for="img in dotacion.imagenes" :key="img.id" cols="4" sm="3">
                    <v-img :src="img.signedUrl" cover aspect-ratio="1" class="rounded-lg hover-zoom border" />
                  </v-col>
                </v-row>
                
                <div v-if="!dotacion.internet && dotacion.equipos?.length === 0" class="text-caption italic text-grey">
                  No se detallaron equipos o servicios en este registro.
                </div>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/helpers/api.js'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const escuela = ref(null)
const loading = ref(false)
const codigoMineduc = route.query.codigoMineduc

// --- COMPUTED PROPERTIES ---

const tieneInternet = computed(() => {
  return escuela.value?.dotaciones?.some(d => d.internet !== null) || false
})

const totalEstudiantes = computed(() => {
  if (!escuela.value?.beneficiarios) return 0
  return escuela.value.beneficiarios.reduce((acc, curr) => acc + (curr.hombres + curr.mujeres), 0)
})

const totalEquiposContados = computed(() => {
  if (!escuela.value?.dotaciones) return 0
  return escuela.value.dotaciones.reduce((acc, dot) => acc + (dot.equipos?.length || 0), 0)
})

// --- MÉTODOS ---

function goBack() {
  router.back()
}

function agruparEquipos(equipos) {
  if (!equipos) return []
  const grupos = {}

  equipos.forEach(item => {
    // Manejo de seguridad por si el objeto modelo viene nulo
    const mod = item.modelo || {}
    const id = item.modelo_id || 'sin-id'
    
    if (!grupos[id]) {
      grupos[id] = {
        modelo_id: id,
        modelo: mod.nombre_modelo || 'Equipo Genérico',
        tipo: mod.tipo?.nombre || 'Dispositivo',
        especificaciones: mod.descripcion_tecnica || 'Sin descripción técnica',
        cantidad: 0
      }
    }
    grupos[id].cantidad++
  })

  return Object.values(grupos)
}

function formatDate(date) {
  if (!date) return 'S/F'
  return new Intl.DateTimeFormat('es-GT', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(date))
}

function getIconType(tipo) {
  const t = tipo?.toLowerCase() || ''
  if (t.includes('laptop')) return 'mdi-laptop'
  if (t.includes('desktop') || t.includes('computadora')) return 'mdi-desktop-tower'
  if (t.includes('impresora')) return 'mdi-printer'
  if (t.includes('ups')) return 'mdi-battery-charging'
  if (t.includes('tablet')) return 'mdi-tablet-android'
  return 'mdi-devices'
}

onMounted(async () => {
  if (!codigoMineduc) {
    Swal.fire('Error', 'Código Mineduc no recibido', 'error')
    router.back()
    return
  }

  loading.value = true
  try {
    const url = `/api/v1/escuelas/${codigoMineduc}`
    const { data } = await api.get(url)
    escuela.value = data.data
  } catch (error) {
    console.error("ERROR API:", error)
    Swal.fire('Error', 'No se pudieron cargar los datos', 'error')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.italic { font-style: italic; }
.uppercase { text-transform: uppercase; }
.hover-zoom { transition: transform 0.3s; cursor: pointer; }
.hover-zoom:hover { transform: scale(1.1); z-index: 10; }
.line-height-1 { line-height: 1.2; }

:deep(.v-table) { background: transparent !important; }
:deep(.v-table th) {
  font-size: 0.7rem !important;
  letter-spacing: 0.5px;
  color: #455A64 !important;
}

/* Timeline adjustment for mobile */
@media (max-width: 600px) {
  :deep(.v-timeline-item__opposite) {
    display: none;
  }
}
</style>