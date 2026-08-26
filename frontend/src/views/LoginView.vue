<template>
  <div class="login-root">
    <div class="login-split">

        <!-- ── PANEL INSTITUCIONAL ─────────────────────────────── -->
        <aside class="panel-inst d-none d-md-flex">
          <!-- Fotografía institucional a sangre. Va como <img> y no como
               background-image para poder controlar el encuadre con
               object-position y que el navegador la trate como imagen. -->
          <img src="/about/img_9.webp" alt="" aria-hidden="true" class="panel-photo" />
          <div class="panel-veil" aria-hidden="true"></div>

          <div class="panel-inner">
            <!-- Los tres logos institucionales, en el mismo orden que en el
                 resto del sitio (portada, dashboard y "sobre nosotros"). -->
            <div class="panel-logos">
              <img src="/logos/LOGOS-02.webp" alt="Ministerio de Educación de Guatemala" />
              <img src="/logos/LOGOS-03.webp" alt="DIGECADE" />
              <img src="/logos/LOGOS-04.webp" alt="Política DIGIKAL" />
            </div>

            <div class="panel-claim">
              <h1 class="panel-title">DIGIKAL</h1>
              <div class="panel-rule"></div>
              <p class="panel-subtitle">Transformación digital educativa</p>
            </div>
          </div>

          <footer class="panel-footer">
            <p>Ministerio de Educación de Guatemala</p>
            <p class="panel-footer-sub">Dirección General de Currículo &mdash; DIGECADE</p>
          </footer>
        </aside>

        <!-- ── FORMULARIO ──────────────────────────────────────── -->
        <section class="panel-form">
          <div class="form-inner">

            <!-- En escritorio los logos viven sobre la foto del panel; aquí
                 sólo aparecen cuando ese panel está oculto (móvil y tablet),
                 y a color, porque el fondo es blanco. -->
            <div class="form-logos d-md-none">
              <img src="/logos/LOGOS-02.webp" alt="Ministerio de Educación de Guatemala" />
              <img src="/logos/LOGOS-03.webp" alt="DIGECADE" />
              <img src="/logos/LOGOS-04.webp" alt="Política DIGIKAL" />
            </div>

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
import { useAuthStore } from '@/stores/authStore'

const form = ref(null)
const valid = ref(false)

const user = ref('')
const password = ref('')
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
      // Vía el store, no localStorage a pelo: así el nav se entera al momento
      // y queda programado el cierre automático al caducar el token.
      useAuthStore().iniciarSesion(response.data.token)
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

/* ── Panel institucional ─────────────────────────────────────────
   Fotografía a sangre con un velo encima. El azul plano con destellos se
   sustituye por imagen real: da profundidad sin recurrir a decoración. */
.panel-inst {
  position: relative;
  flex-direction: column;
  padding: 60px 64px;
  color: #fff;
  overflow: hidden;
}

.panel-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* La foto es apaisada (1.5) y la columna es vertical: encuadrar algo por
     encima del centro conserva mejor el motivo al recortar. */
  object-position: 50% 40%;
}

/* El velo hace dos cosas: garantiza contraste para el texto blanco —una foto
   sola no lo asegura en ninguna zona— y oscurece hacia abajo para anclar el
   pie. El tinte azul lo amarra a la paleta institucional. */
.panel-veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(4, 22, 46, 0.62) 0%,
      rgba(4, 22, 46, 0.72) 45%,
      rgba(2, 14, 32, 0.94) 100%
    ),
    radial-gradient(85% 65% at 18% 12%, rgba(48, 138, 190, 0.38) 0%, transparent 62%);
}

/* Franja de acento institucional en el borde derecho */
.panel-inst::after {
  content: '';
  position: absolute;
  inset: 0 0 0 auto;
  z-index: 2;
  width: 4px;
  background: linear-gradient(180deg, var(--celeste), var(--azul));
}

/* El contenido ocupa el espacio disponible y se centra verticalmente;
   el footer queda abajo. */
.panel-inner {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 460px;
  padding-block: 8px 56px;
}

/* ── Fila de logos del panel oscuro ──────────────────────────────
   Se dimensionan por ALTO y no por ancho. Los tres tienen proporciones muy
   distintas (2.46, 1.95 y 5.22), así que darles el mismo ancho —como hace la
   portada— deja uno el triple de alto que otro. Igualando la altura quedan
   ópticamente alineados, que es como se compone un lockup de logos. */
.panel-logos {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 26px;
}

.panel-logos img {
  height: 42px;
  width: auto;
  /* Los archivos son a color; sobre la foto se unifican en blanco para que se
     lean con cualquier encuadre. Funciona porque los .webp tienen fondo
     transparente: con logo.png, que lleva fondo blanco opaco, el filtro lo
     convertiría en un bloque sólido.
     La sombra los despega de las zonas claras de la fotografía. */
  filter: brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
}

/* El reclamo se apoya en la parte baja del panel, sobre la zona más oscura
   del velo, que es donde el texto blanco tiene mejor contraste. */
.panel-claim {
  max-width: 420px;
}

.panel-title {
  font-size: 56px;
  font-weight: 700;
  letter-spacing: 7px;
  line-height: 1;
  margin: 0;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.4);
}

.panel-rule {
  width: 72px;
  height: 3px;
  margin: 22px 0;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--celeste), var(--azul));
}

.panel-subtitle {
  margin: 0;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--celeste);
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.45);
}

.panel-footer {
  position: relative;
  z-index: 1;
  padding-top: 32px;
  font-size: 12px;
  letter-spacing: 0.2px;
  color: rgba(255, 255, 255, 0.7);
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
  padding: 48px 32px;
  background: #fff;
}

/* Algo más ancho y con más aire que antes: el formulario es ahora lo único
   que hay en esta columna, así que puede respirar. */
.form-inner {
  width: 100%;
  max-width: 420px;
}

/* ── Fila de logos sobre el formulario ───────────────────────────
   A color, sin filtro: el fondo aquí es blanco. Igual que en el panel, se
   igualan por altura. La línea inferior los separa del título. */
.form-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 22px;
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid #e6e9ef;
}

.form-logos img {
  height: 38px;
  width: auto;
}

.form-title {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--navy);
}

.form-hint {
  margin: 8px 0 36px;
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
}

.field-label {
  display: block;
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: #374151;
}

/* Botón con algo más de presencia: es la única acción de la pantalla. */
.btn-acceder {
  height: 52px;
  margin-top: 8px;
  background: var(--navy);
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.5px;
  border-radius: 8px;
  text-transform: none;
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.btn-acceder:hover {
  background: var(--navy-deep);
  box-shadow: 0 8px 20px rgba(20, 41, 87, 0.28);
  transform: translateY(-1px);
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

/* ── Responsive ──────────────────────────────────────────────────── */

/* Entre 960 y 1200 px el panel ya se muestra pero la columna es estrecha:
   los tres logos a 42 px se salían, y el título de 56 px no cabía. */
@media (min-width: 960px) and (max-width: 1200px) {
  .panel-inst {
    padding: 44px 40px;
  }

  .panel-logos {
    gap: 18px;
  }

  .panel-logos img {
    height: 34px;
  }

  .panel-title {
    font-size: 42px;
    letter-spacing: 5px;
  }

  .panel-subtitle {
    font-size: 13.5px;
    letter-spacing: 2px;
  }
}

/* Pantallas bajas (portátiles de 768 px de alto o menos): se recorta el aire
   vertical para que el formulario no quede por debajo del pliegue. */
@media (min-width: 960px) and (max-height: 780px) {
  .panel-inner {
    padding-block: 4px 28px;
  }

  .panel-title {
    font-size: 42px;
  }

  .panel-rule {
    margin: 16px 0;
  }

  .panel-footer {
    padding-top: 20px;
  }
}

@media (max-width: 600px) {
  .panel-form {
    padding: 32px 20px;
  }

  .form-logos {
    gap: 16px;
    padding-bottom: 18px;
    margin-bottom: 22px;
  }

  .form-logos img {
    height: 30px;
  }

  .form-title {
    font-size: 25px;
  }

  .form-hint {
    margin-bottom: 28px;
  }
}
</style>
