<template>
  <v-container v-if="escuela" class="py-8">
    <v-btn variant="text" class="text-weight-bold mb-4" prepend-icon="mdi-arrow-left" @click="goBack">
      Regresar
    </v-btn>

    <v-card class="pa-6 mb-8 overflow-hidden" elevation="4" style="border-radius: 20px; border-top: 8px solid #1976D2;"
      v-motion :initial="{ opacity: 0, y: -50 }" :enter="{ opacity: 1, y: 0 }">
      <v-row align="center">
        <v-col cols="12" md="auto" class="text-center">
          <v-avatar size="120" color="primary">
            <v-icon size="64" color="white">mdi-school</v-icon>
          </v-avatar>
        </v-col>

        <v-col>
          <div class="d-flex align-center flex-wrap mb-2">
            <h2 class="text-h4 font-weight-bold mr-4 text-blue-darken-3">
              {{ escuela.nombreEscuela }}
            </h2>
            <v-chip color="primary" label variant="flat" size="small">
              ID: {{ escuela.codigoEscuela }}
            </v-chip>
          </div>

          <v-row dense>
            <v-col cols="6">
              <div class="text-subtitle-1"><v-icon color="grey" class="mr-2">mdi-map-marker</v-icon> {{ escuela.direccion }}</div>
            </v-col>
            <v-col cols="6">
              <v-img src="politica.png" style="position: relative; top: ;"/>
        </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>

    <v-row class="mb-8">
      <v-col cols="12" sm="4" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1, transition: { delay: 200 } }">
        <v-card class="pa-4 text-center bg-primary text-white" rounded="lg">
          <div class="text-h3 font-weight-black">{{ escuela.cantidadEquipoEntregado }}</div>
          <div class="text-uppercase text-caption font-weight-bold">Total Equipos Histórico</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1, transition: { delay: 300 } }">
        <v-card class="pa-4 text-center bg-white text-primary" rounded="lg" style="border: 2px solid #1976D2;">
          <div class="text-h3 font-weight-black">{{ escuela.cantidadEstudiantesBeneficiados }}</div>
          <div class="text-uppercase text-caption font-weight-bold">Estudiantes Beneficiados</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1, transition: { delay: 400 } }">
        <v-card class="pa-4 text-center bg-primary text-white" rounded="lg">
          <div class="text-h3 font-weight-black">{{ escuela.beneficiarios.length }}</div>
          <div class="text-uppercase text-caption font-weight-bold">Ciclos Registrados</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="4">
        <h3 class="text-h5 font-weight-bold mb-4">Resumen de Beneficiarios</h3>
        <v-card v-for="b in escuela.beneficiarios" :key="b.id" class="mb-4 pa-4" variant="outlined" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-h6 font-weight-bold text-primary italic">Ciclo {{ b.ciclo_educativo }}</span>
            <v-chip size="x-small">ID #{{ b.id }}</v-chip>
          </div>
          <v-divider class="mb-3"></v-divider>
          <div class="d-flex justify-space-around text-center">
            <div><div class="text-h6">{{ b.hombres }}</div><div class="text-caption">Hombres</div></div>
            <div><div class="text-h6">{{ b.mujeres }}</div><div class="text-caption">Mujeres</div></div>
            <div><div class="text-h6">{{ b.docentes }}</div><div class="text-caption">Docentes</div></div>
            <div class="text-blue-darken-2"><div class="text-h6 font-weight-bold">{{ b.total }}</div><div class="text-caption font-weight-bold">Total</div></div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <h3 class="text-h5 font-weight-bold mb-4">Línea de Tiempo de Entregas</h3>
        <v-card class="pa-1 pa-sm-6" elevation="2" rounded="xl">
          <v-timeline align="start" side="end">
            <v-timeline-item v-for="(dotacion, index) in escuela.dotaciones" :key="dotacion.id"
              :dot-color="index === 0 ? 'blue' : 'grey-lighten-1'" size="small">
              
              <template #opposite>
                <div class="text-caption font-weight-bold text-grey">{{ formatDate(dotacion.fecha_entrega) }}</div>
              </template>

              <v-card class="pa-4 mb-4" variant="flat" color="grey-lighten-4" v-motion 
                :visible-once="{ opacity: 1, x: 0 }" :initial="{ opacity: 0, x: 50 }">
                
                <div class="text-h6 font-weight-bold text-blue-darken-2">{{ dotacion.descripcion }}</div>
                
                <div class="mt-4">
                  <v-table density="compact" class="bg-transparent rounded-lg border">
                    <thead class="bg-grey-lighten-3">
                      <tr>
                        <th class="text-left font-weight-bold">Descripción del Equipo</th>
                        <th class="text-center font-weight-bold" style="width: 100px;">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="grupo in agruparEquipos(dotacion.equipos)" :key="grupo.modelo_id">
                        <td class="py-3">
                          <div class="d-flex align-center">
                            <v-icon :icon="getIconType(grupo.tipo)" size="small" class="mr-3" color="primary"></v-icon>
                            <div>
                              <div class="text-body-2 font-weight-bold text-uppercase">
                                {{ grupo.tipo }} - {{ grupo.modelo }}
                              </div>
                              <div class="text-caption text-grey-darken-1">
                                {{ grupo.especificaciones }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="text-center">
                          <v-chip size="small" font-weight-bold color="primary" variant="flat">
                            {{ grupo.cantidad }}
                          </v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>

                <v-row v-if="dotacion.imagenes.length > 0" class="mt-4" dense>
                  <v-col v-for="img in dotacion.imagenes" :key="img.id" cols="4">
                    <v-img :src="`http://localhost:3000/uploads/imgs/${img.url}`" cover aspect-ratio="1"
                      class="rounded-lg bg-grey-lighten-2 hover-zoom" />
                  </v-col>
                </v-row>

              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const escuela = ref(null)
const loading = ref(false)
const codigoMineduc = route.query.codigoMineduc

function goBack() {
  router.back()
}

/**
 * Función lógica para agrupar equipos por modelo
 * y contar cuántos hay de cada uno.
 */
function agruparEquipos(equipos) {
  const grupos = {}

  equipos.forEach(item => {
    const id = item.modelo_id
    if (!grupos[id]) {
      grupos[id] = {
        modelo_id: id,
        modelo: item.modelo.nombre_modelo,
        tipo: item.modelo.tipo.nombre,
        especificaciones: item.modelo.descripcion_tecnica,
        cantidad: 0
      }
    }
    grupos[id].cantidad++
  })

  return Object.values(grupos)
}

function formatDate(date) {
  return new Intl.DateTimeFormat('es-GT', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(date))
}

function getIconType(tipo) {
  const t = tipo.toLowerCase()
  if (t.includes('laptop')) return 'mdi-laptop'
  if (t.includes('desktop') || t.includes('computadora')) return 'mdi-desktop-tower'
  if (t.includes('ups')) return 'mdi-battery-charging'
  if (t.includes('tablet')) return 'mdi-tablet-android'
  return 'mdi-devices'
}

onMounted(async () => {
  if (!codigoMineduc) {
    await Swal.fire({ icon: 'warning', title: 'Código no encontrado', text: 'No se recibió el código del MINEDUC', confirmButtonText: 'Volver' })
    router.back(); return
  }

  loading.value = true
  try {
    const url = `http://localhost:3000/api/v1/escuelas/${codigoMineduc}`
    const { data } = await axios.get(url)
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
.hover-zoom { transition: transform 0.3s; cursor: pointer; }
.hover-zoom:hover { transform: scale(1.05); }

:deep(.v-table) { background: transparent !important; }
:deep(.v-table__wrapper) { border-radius: 8px; }

/* Estilo para que la tabla no se vea tan apretada */
.v-table th {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
}
</style>