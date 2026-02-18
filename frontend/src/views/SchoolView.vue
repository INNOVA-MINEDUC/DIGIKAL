<template>
  <v-container>

    <v-btn variant="text" class="text-weight-bold text-h5" prepend-icon="mdi-arrow-left"
      style="position: fixed; top: 7rem; left: 0;" @click="goBack">
      Regresar
    </v-btn>

    <!-- Encabezado bonito con los datos recibidos -->
    <v-card class="pa-6 mb-6" elevation="3" style="border-radius: 16px; margin-top: 3rem;">
      <div class="d-flex flex-column flex-md-row align-center justify-space-between">
        <div class="d-flex">

          <!-- Imagen de la escuela -->
          <img src="/logo_school.jfif" alt="logo del establecimiento" style="width: 100px; height: 100px;">

          <!-- Datos -->
          <div class="ml-md-6">
            <h2 class="text-h4 font-weight-bold mb-2">
              {{ item.school }}
            </h2>

            <div class="text-body-1">
              <strong>Jornada:</strong> {{ item.shift }}
            </div>

            <div class="text-body-1">
              <strong>Grado:</strong> {{ item.grade }}
            </div>
          </div>

        </div>
        <div class="ml-md-6">
          <p class="font-weight-bold mb-2">
            {{ "Codigo: 22-46810-44" }}
          </p>

          <div class="text-body-1">
            <strong>Dirección:</strong> 6ta calle zona 6, Guatemala, Mixco
          </div>
        </div>
      </div>
    </v-card>


    <!-- Timeline original -->
    <v-card style="margin: 2rem; padding: 2rem;">
      <v-timeline align="start">
        <v-timeline-item v-for="(itemData, index) in timelineItems" :key="index">
          <template #opposite>
            <img src="/img.png" style="width: 450px;" alt=""
             v-motion 
             :visible-once="{
              opacity: 1,
              x: 0,
              transition: { duration: 800, delay: index * 100 }
            }"
            :initial="{ opacity: 0, x: 60 }"
            >
          </template>

          <div 
          v-motion 
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { duration: 800, delay: index * 100 }
          }" 
          :initial="{ opacity: 0, y: 60 }"
          >
            <div class="text-h6">{{ itemData.titulo }}</div>
            <p>{{ itemData.descripcion }}</p>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card>

  </v-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function goBack() {
  router.push("/dashboard")
}



const item = route?.state?.item || {
  school: 'Escuela Los Angeles de Charlie',
  shift: 'No definido',
  grade: 'No definido'
}


const img = ""

const timelineItems = [
  { titulo: "Inicio del proyecto", descripcion: "Se plantearon los objetivos iniciales y el alcance del sistema." },
  { titulo: "Desarrollo del prototipo", descripcion: "Se construyó un prototipo funcional con las características principales." },
  { titulo: "Pruebas iniciales", descripcion: "El sistema fue probado con usuarios reales para detectar mejoras." },
  { titulo: "Optimización del rendimiento", descripcion: "Se mejoró la velocidad de carga y la experiencia de usuario." },
  { titulo: "Expansión regional", descripcion: "El proyecto se implementó en nuevas regiones del país." },
  { titulo: "Actualización global", descripcion: "El sistema fue adoptado a nivel internacional con nuevas funcionalidades." }
]
</script>

<style scoped>
h2 {
  color: #2c3e50;
}
</style>
