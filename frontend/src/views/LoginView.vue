<template>
  <div class="login-root">
    <div class="login-split">

        <!-- ── PANEL INSTITUCIONAL ─────────────────────────────── -->
        <aside class="panel-inst d-none d-md-flex">
          <div class="panel-inner">
            <img src="/icono2.png" alt="Ministerio de Educación de Guatemala" class="panel-logo" />

            <h1 class="panel-title">DIGIKAL</h1>
            <p class="panel-subtitle">Política de Transformación Digital Educativa</p>

            <div class="panel-rule"></div>

            <p class="panel-text">
              Plataforma oficial de registro y seguimiento de la dotación tecnológica
              y conectividad en los establecimientos educativos del país.
            </p>
          </div>

          <footer class="panel-footer">
            <p>Ministerio de Educación de Guatemala</p>
            <p class="panel-footer-sub">Dirección General de Currículo &mdash; DIGECADE</p>
          </footer>
        </aside>

        <!-- ── FORMULARIO ──────────────────────────────────────── -->
        <section class="panel-form">
          <div class="form-inner">

            <!-- Logo para móvil, donde el panel institucional no se muestra -->
            <img src="/logo.png" alt="Ministerio de Educación" class="form-logo d-md-none" />

            <h2 class="form-title">Iniciar sesión</h2>
            <p class="form-hint">Ingrese sus credenciales institucionales para continuar.</p>

            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-5"
              :text="error"
            />

            <v-form ref="form" v-model="valid" @submit.prevent="login">
              <label class="field-label" for="campo-usuario">Usuario o correo institucional</label>
              <v-text-field
                id="campo-usuario"
                v-model="user"
                :rules="emailRules"
                placeholder="usuario@mineduc.edu.gt"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-outline"
                autocomplete="username"
                color="#142957"
                class="mb-2"
              />

              <label class="field-label" for="campo-clave">Contraseña</label>
              <v-text-field
                id="campo-clave"
                v-model="password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                placeholder="Ingrese su contraseña"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-outline"
                autocomplete="current-password"
                color="#142957"
                @click:append-inner="showPassword = !showPassword"
              />

              <v-checkbox
                v-model="remember"
                label="Mantener sesión iniciada en este equipo"
                density="compact"
                color="#142957"
                hide-details
                class="mb-4 ml-n1"
              />

              <v-btn
                type="submit"
                block
                size="large"
                elevation="0"
                :loading="loading"
                class="btn-acceder"
              >
                Acceder al sistema
              </v-btn>
            </v-form>

            <div class="form-support">
              <v-icon size="14" class="mr-1">mdi-help-circle-outline</v-icon>
              ¿Problemas para ingresar? Contacte a soporte técnico
            </div>

            <p class="form-legal">
              El acceso a este sistema está restringido a personal autorizado.
              Toda actividad queda registrada en la bitácora institucional.
            </p>
          </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/helpers/api.js'

const form = ref(null)
const valid = ref(false)

const user = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

const emailRules = [
  (v) => !!v || 'El correo es obligatorio',
  (v) => /.+@.+\..+/.test(v) || 'Debe ser un correo válido',
]

const passwordRules = [
  (v) => !!v || 'La contraseña es obligatoria',
  (v) => v.length >= 6 || 'Mínimo 6 caracteres',
]

async function login() {
  // validate() de Vuetify 3 devuelve { valid, errors }, no un booleano.
  const { valid: ok } = await form.value.validate()
  if (!ok) return

  try {
    loading.value = true
    error.value = ''

    const response = await api.post('/api/v1/auth', {
      email: user.value,
      password: password.value,
    })

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }

    window.location.href = '/upload-data'
  } catch (err) {
    error.value = err.response?.data?.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Paleta extraída de los logos institucionales (public/logo.png, public/icono2.png) */
.login-root {
  --navy: #142957;
  --navy-deep: #002B5D;
  --azul: #308ABE;
  --celeste: #75C1D5;
  background: #f4f6f9;
}

/* App.vue muestra un v-app-bar de 80px también en el login: se descuenta
   para que la pantalla encaje sin provocar scroll vertical. */
.login-split {
  display: grid;
  grid-template-columns: 1fr;
  min-height: calc(100vh - 80px);
}

@media (min-width: 960px) {
  .login-split {
    grid-template-columns: 1.15fr 1fr;
  }
}

/* ── Panel institucional ─────────────────────────────────────── */
.panel-inst {
  position: relative;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px 64px;
  background: linear-gradient(160deg, var(--navy) 0%, var(--navy-deep) 55%, #06203f 100%);
  color: #fff;
  overflow: hidden;
}

/* Franja de acento institucional */
.panel-inst::after {
  content: '';
  position: absolute;
  inset: 0 0 0 auto;
  width: 4px;
  background: linear-gradient(180deg, var(--celeste), var(--azul));
}

.panel-inner {
  position: relative;
  max-width: 460px;
  margin-top: auto;
}

/* Se usa icono2.png y no logo.png: éste último trae un fondo blanco opaco
   (85% de sus píxeles) y al invertirlo se convierte en un bloque blanco.
   icono2.png sí es transparente, así que el filtro lo deja en blanco limpio. */
.panel-logo {
  width: 320px;
  max-width: 100%;
  margin-bottom: 44px;
  filter: brightness(0) invert(1);
}

.panel-title {
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 3px;
  line-height: 1.1;
  margin: 0;
}

.panel-subtitle {
  margin: 8px 0 0;
  font-size: 15px;
  font-weight: 300;
  letter-spacing: 0.5px;
  color: var(--celeste);
}

.panel-rule {
  width: 64px;
  height: 3px;
  margin: 28px 0;
  background: var(--celeste);
}

.panel-text {
  margin: 0;
  font-size: 15px;
  font-weight: 300;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
}

.panel-footer {
  position: relative;
  margin-top: auto;
  padding-top: 40px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.panel-footer p { margin: 0; }

.panel-footer-sub {
  margin-top: 2px !important;
  color: rgba(255, 255, 255, 0.45);
}

/* ── Formulario ──────────────────────────────────────────────── */
.panel-form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: #fff;
}

.form-inner {
  width: 100%;
  max-width: 400px;
}

.form-logo {
  display: block;
  width: 200px;
  margin: 0 auto 32px;
}

.form-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--navy);
}

.form-hint {
  margin: 6px 0 32px;
  font-size: 14px;
  color: #6b7280;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #374151;
}

.btn-acceder {
  background: var(--navy);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 4px;
  text-transform: none;
}

.btn-acceder:hover {
  background: var(--navy-deep);
}

.form-support {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 28px;
  font-size: 12px;
  color: #6b7280;
}

.form-legal {
  margin: 24px 0 0;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  font-size: 11px;
  line-height: 1.6;
  color: #9ca3af;
  text-align: center;
}
</style>
