<template>
  <v-container class="fill-height justify-center">
    <v-responsive max-width="500">
      <v-card 
        elevation="12" 
        rounded="xl" 
        class="pa-6 border-sm"
      >
        <div class="text-center mb-6">
          <v-avatar color="indigo-lighten-5" size="80" class="mb-4">
            <v-icon icon="mdi-file-excel" color="indigo-darken-2" size="40"></v-icon>
          </v-avatar>
          <h2 class="text-h4 font-weight-bold">Subir Reporte</h2>
          <p class="text-subtitle-1 text-medium-emphasis">
            Selecciona tu archivo Excel para procesar
          </p>
        </div>

        <v-file-input
          v-model="selectedFile"
          label="Haz clic o arrastra un archivo"
          variant="outlined"
          prepend-icon=""
          prepend-inner-icon="mdi-cloud-upload"
          accept=".xlsx, .xls"
          color="indigo"
          class="mb-4"
          :loading="uploading"
          :disabled="uploading"
          show-size
          persistent-hint
          hint="Solo archivos .xlsx o .xls"
          @click:clear="statusMessage = ''"
        >
          <template v-slot:selection="{ fileNames }">
            <template v-for="fileName in fileNames" :key="fileName">
              <v-chip
                size="small"
                label
                color="indigo"
                class="me-2"
              >
                {{ fileName }}
              </v-chip>
            </template>
          </template>
        </v-file-input>

        <v-btn
          block
          size="large"
          color="indigo-darken-1"
          class="text-none"
          rounded="lg"
          elevation="2"
          :loading="uploading"
          :disabled="!selectedFile"
          @click="uploadFile"
        >
          Enviar al servidor
          <v-icon end icon="mdi-send-variant-outline"></v-icon>
        </v-btn>

        <v-expand-transition>
          <v-alert
            v-if="statusMessage"
            :type="statusError ? 'error' : 'success'"
            variant="tonal"
            class="mt-4"
            density="compact"
            rounded="lg"
          >
            {{ statusMessage }}
          </v-alert>
        </v-expand-transition>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/helpers/api.js'

const selectedFile = ref(null)
const uploading = ref(false)
const statusMessage = ref('')
const statusError = ref(false)

const uploadFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  statusMessage.value = ''
  
  // Vuetify v-file-input devuelve un array o un objeto dependiendo de la config
  // Normalmente es un objeto File directo en Vue 3
  const fileToUpload = Array.isArray(selectedFile.value) 
    ? selectedFile.value[0] 
    : selectedFile.value

  const formData = new FormData()
  formData.append('excel', fileToUpload)

  try {
    const response = await api.post('/api/v1/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    statusError.value = false
    statusMessage.value = '¡Archivo procesado con éxito!'
    selectedFile.value = null // Limpiar el input
  } catch (error) {
    statusError.value = true
    statusMessage.value = error.response?.data?.message || 'Error al conectar con el servidor'
    console.error('Upload Error:', error)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
/* Un pequeño toque de animación para que no se vea estático */
.v-card {
  transition: transform 0.2s ease-in-out;
}
.v-card:hover {
  transform: translateY(-4px);
}
</style>