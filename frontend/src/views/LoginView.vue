<template>
  <v-container fluid class="pa-0 fill-height grey lighten-5">
    <v-row no-gutters class="fill-height">
      
      <!-- PANEL IZQUIERDO -->
      <v-col md="7" lg="8"
        class="d-none d-md-flex flex-column justify-center align-center primary darken-2 white--text pa-12"
        style="background-color: #2883D1; color: #fff;">
        
        <div style="max-width: 500px">
          <v-img src="logo.png" max-width="80" class="mb-6"></v-img>

          <h1 class="text-h3 font-weight-light mb-4">
            Sistema de Gestión Institucional
          </h1>

          <div class="text-h6 font-weight-thin mb-8" style="line-height: 1.6">
            Bienvenido al portal oficial. Por favor, acceda con sus credenciales
            autorizadas para gestionar sus servicios y procesos administrativos.
          </div>

          <v-divider dark class="mb-8"></v-divider>

          <p class="caption">
            © 2025 Todos los derechos reservados | Departamento de IT
          </p>
        </div>
      </v-col>

      <!-- LOGIN -->
      <v-col cols="12" md="4" lg="4" class="d-flex align-center justify-center bg-white">
        <v-card elevation="5" width="600" class="pa-4">
          <v-card-text>

            <div class="d-md-none text-center mb-8">
              <v-icon size="64" color="primary">mdi-shield-check</v-icon>
              <h2 class="text-h5 font-weight-bold mt-2">Portal Institucional</h2>
            </div>

            <h2 class="text-h5 font-weight-bold grey--text text--darken-3 mb-1">
              Iniciar Sesión
            </h2>

            <p class="body-2 grey--text mb-8">
              Ingrese su usuario y contraseña del dominio.
            </p>

            <!-- ALERTA ERROR -->
            <v-alert
              v-if="error"
              type="error"
              dense
              class="mb-4"
            >
              {{ error }}
            </v-alert>

            <v-form ref="form" v-model="valid">
              
              <!-- EMAIL -->
              <v-label class="text-caption font-weight-bold">
                Usuario o Correo
              </v-label>

              <v-text-field
                v-model="user"
                :rules="emailRules"
                placeholder="ej: jgarcia@institucion.gob"
                outlined
                dense
                prepend-inner-icon="mdi-account"
                class="mt-1 mb-2"
                required
              ></v-text-field>

              <!-- PASSWORD -->
              <v-label class="text-caption font-weight-bold">
                Contraseña
              </v-label>

              <v-text-field
                v-model="password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                outlined
                dense
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                class="mt-1"
                required
              ></v-text-field>

              <v-row class="mt-n2">
                <v-col>
                  <v-checkbox
                    label="Recordar equipo"
                    dense
                    class="mt-0"
                    hide-details
                  ></v-checkbox>
                </v-col>
              </v-row>

              <!-- BOTÓN -->
              <v-btn
                block
                color="primary darken-1"
                elevation="0"
                large
                class="mt-6 font-weight-bold white--text"
                :disabled="!valid || loading"
                @click="login"
              >
                {{ loading ? 'Ingresando...' : 'ACCEDER AL SISTEMA' }}
              </v-btn>

            </v-form>

            <div class="text-center mt-8">
              <a href="#" class="text-caption text-decoration-none grey--text">
                ¿Problemas para ingresar? Contacte a soporte técnico
              </a>
            </div>

          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// FORM
const form = ref(null)
const valid = ref(false)

// DATA
const user = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

// VALIDACIONES
const emailRules = [
  v => !!v || 'El correo es obligatorio',
  v => /.+@.+\..+/.test(v) || 'Debe ser un correo válido'
]

const passwordRules = [
  v => !!v || 'La contraseña es obligatoria',
  v => v.length >= 6 || 'Mínimo 6 caracteres'
]

// LOGIN
async function login() {
  const isValid = await form.value.validate()

  if (!isValid) return

  try {
    loading.value = true
    error.value = ""

    const response = await axios.post(
      "http://localhost:3000/api/v1/auth",
      {
        email: user.value,
        password: password.value
      }
    )

    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
    }

    window.location.href = '/upload-data'

  } catch (err) {
    error.value =
      err.response?.data?.error ||
      "Credenciales incorrectas"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-white {
  background-color: #ffffff;
}

.v-application {
  font-family: 'Roboto', sans-serif !important;
}

.v-btn {
  border-radius: 4px;
}

.v-text-field--outlined >>> fieldset {
  border-color: #e0e0e0;
}
</style>