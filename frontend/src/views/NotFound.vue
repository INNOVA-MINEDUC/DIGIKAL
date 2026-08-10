<template>
  <v-container class="notfound d-flex flex-column align-center justify-center text-center">
    <div class="notfound__code">404</div>

    <v-icon size="64" class="notfound__icon mb-4">mdi-map-marker-question-outline</v-icon>

    <h1 class="text-h5 font-weight-bold mb-2">Página no encontrada</h1>

    <p class="text-body-1 text-medium-emphasis mb-6" style="max-width: 480px;">
      La dirección que ingresaste no existe o la página fue movida. Verifica el enlace
      o vuelve al inicio.
    </p>

    <div class="d-flex flex-wrap justify-center" style="gap: 12px;">
      <v-btn color="primary" variant="flat" prepend-icon="mdi-home" to="/">
        Ir al inicio
      </v-btn>
      <v-btn variant="tonal" prepend-icon="mdi-arrow-left" @click="volver">
        Volver atrás
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function volver() {
  // Si no hay historial previo (se entró directo a la URL rota), va al inicio.
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.notfound {
  min-height: 70vh;
  padding: 40px 20px;
}

.notfound__code {
  font-size: clamp(80px, 18vw, 160px);
  font-weight: 800;
  line-height: 1;
  color: #0d3b5d;
  letter-spacing: 4px;
}

.notfound__icon {
  color: #03bfcb;
}
</style>
