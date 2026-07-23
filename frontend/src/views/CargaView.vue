<template>
  <v-container
    fluid
    class="bg-img fill-height d-flex justify-center align-center"
  >
    <v-responsive max-width="500" width="100%">
      <v-card
        elevation="12"
        rounded="xl"
        class="pa-6 border-sm upload-card"
      >
        <div class="text-center mb-6">
          <v-avatar
            color="indigo-lighten-5"
            size="80"
            class="mb-4"
          >
            <v-icon
              icon="mdi-file-excel"
              color="indigo-darken-2"
              size="40"
            />
          </v-avatar>

          <h2 class="text-h4 font-weight-bold">
            Subir Reporte
          </h2>

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
          <template #selection="{ fileNames }">
            <template
              v-for="fileName in fileNames"
              :key="fileName"
            >
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

          <v-icon
            end
            icon="mdi-send-variant-outline"
          />
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

        <v-expand-transition>
          <v-card
            v-if="errores.length"
            variant="tonal"
            color="error"
            class="mt-3"
            rounded="lg"
          >
            <v-card-text class="py-2">
              <div class="text-caption font-weight-bold mb-1">
                Detalle de errores ({{ errores.length }})
              </div>
              <div class="errores-scroll">
                <div
                  v-for="(e, i) in errores.slice(0, 50)"
                  :key="i"
                  class="text-caption"
                >
                  <strong>Fila {{ e.fila ?? e.escuela }}:</strong> {{ e.error }}
                </div>
                <div v-if="errores.length > 50" class="text-caption mt-1 font-italic">
                  …y {{ errores.length - 50 }} más
                </div>
              </div>
            </v-card-text>
          </v-card>
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
const errores = ref([])

const uploadFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  statusMessage.value = ''

  const fileToUpload = Array.isArray(selectedFile.value)
    ? selectedFile.value[0]
    : selectedFile.value

  const formData = new FormData()

  formData.append('excel', fileToUpload)

  try {
    const { data } = await api.post('/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // El backend responde 200 aunque TODAS las filas fallen la validación;
    // hay que mirar filasExitosas / filasConError, no solo el status HTTP.
    const exitosas = data.filasExitosas ?? 0
    const conError = data.filasConError ?? 0
    const procesadas = data.filasProcesadas ?? 0

    errores.value = data.errores || []

    if (exitosas === 0) {
      statusError.value = true
      statusMessage.value =
        `No se importó ninguna fila (${procesadas} procesadas, ${conError} con error). ` +
        `Revisa que las columnas del Excel coincidan con la plantilla.`
    } else if (conError > 0) {
      statusError.value = false
      statusMessage.value =
        `Importación parcial: ${exitosas} fila(s) cargadas, ${conError} con error.`
      selectedFile.value = null
    } else {
      statusError.value = false
      statusMessage.value = `¡Listo! ${exitosas} fila(s) importadas correctamente.`
      selectedFile.value = null
    }

  } catch (error) {
    statusError.value = true
    errores.value = []

    statusMessage.value =
      error.response?.data?.message ||
      'Error al conectar con el servidor'

    console.error('Upload Error:', error)

  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.bg-img {
  min-height: 100vh;
  width: 100%;

  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 20px;

  background-image: url("/upload/img.png");
  background-repeat: no-repeat;
  background-position: center center;

  /* CAMBIA ENTRE cover o contain */
  background-size: cover;

  overflow: hidden;
}

/* Overlay oscuro elegante */
.bg-img::before {
  content: "";

  position: absolute;
  inset: 0;

  background: rgba(0, 0, 0, 0.35);

  z-index: 0;
}

.upload-card {
  position: relative;
  z-index: 1;

  transition: transform 0.25s ease;

  backdrop-filter: blur(10px);

  background: rgba(255, 255, 255, 0.92);
}

.upload-card:hover {
  transform: translateY(-4px);
}

.errores-scroll {
  max-height: 180px;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .bg-img {
    padding: 12px;

    background-position: center;
  }

  .upload-card {
    padding: 20px !important;
  }

  h2 {
    font-size: 1.7rem !important;
  }
}
</style>