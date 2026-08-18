<template>
  <v-app class="bg-container" style="user-select: none;">
    <v-app-bar color="white" height="80" elevation="2">
      <v-container fluid class="d-flex align-center fill-height px-0">
        <v-app-bar-nav-icon
          class="d-lg-none ml-2"
          @click="drawer = !drawer"
        />

        <img src="/icono2.png" class="navigation-icon ml-2" />

        <v-spacer />

        <div class="navigation-right d-none d-lg-flex">
          <v-btn to="/" variant="text">Inicio</v-btn>
          <v-btn to="/about" variant="text">Sobre Nosotros</v-btn>
          <v-btn to="/dashboard" variant="text">Estadísticas</v-btn>
          <!-- <v-btn to="/dashboard/estadisticas" variant="text">Indicadores</v-btn> -->

          <!-- <v-btn
            v-if="logged && puedeDotaciones"
            to="/cargar-datos"
            variant="text"
          >
            Cargar Datos
          </v-btn> -->

          <v-btn
            v-if="logged && puedeDotaciones"
            to="/upload-data"
            variant="text"
          >
            Crear Dotación
          </v-btn>

          <!-- <v-btn
            v-if="logged && puedeDotaciones"
            to="/catalogos"
            variant="text"
          >
            Catálogo
          </v-btn> -->

          <v-btn
            v-if="logged && puedeDotaciones"
            to="/download-data"
            variant="text"
          >
            Dotaciones
          </v-btn>

          <v-btn
            v-if="logged && isAdmin"
            to="/usuarios"
            variant="text"
          >
            Usuarios
          </v-btn>

          <v-btn
            v-if="logged && isAdmin"
            to="/auditoria"
            variant="text"
          >
            Auditoría
          </v-btn>

          <v-btn
            v-if="!logged"
            to="/login"
            variant="elevated"
            color="primary"
            class="ml-2"
          >
            Iniciar sesión
          </v-btn>

          <v-tooltip v-if="logged" text="Cerrar sesión" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-logout"
                color="error"
                variant="text"
                @click="logout"
                class="mr-2"
              />
            </template>
          </v-tooltip>
        </div>
      </v-container>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      width="300"
    >
      <v-list-item
        prepend-avatar="/icono2.png"
        title="Menú"
        class="pa-4"
      />

      <v-divider />

      <v-list nav density="compact">
        <v-list-item prepend-icon="mdi-home" to="/" title="Inicio" />
        <v-list-item prepend-icon="mdi-information" to="/about" title="Sobre Nosotros" />
        <v-list-item prepend-icon="mdi-chart-bar" to="/dashboard" title="Estadísticas" />
        <!-- <v-list-item prepend-icon="mdi-chart-box" to="/dashboard/estadisticas" title="Indicadores" /> -->

        <v-divider class="my-2" v-if="logged" />

        <!-- <v-list-item
          v-if="logged && puedeDotaciones"
          prepend-icon="mdi-database-import"
          to="/cargar-datos"
          title="Cargar Datos"
        /> -->
        <v-list-item
          v-if="logged && puedeDotaciones"
          prepend-icon="mdi-plus-box"
          to="/upload-data"
          title="Crear Dotación"
        />
        <!-- <v-list-item
          v-if="logged && puedeDotaciones"
          prepend-icon="mdi-format-list-bulleted"
          to="/catalogos"
          title="Catálogo de Equipos"
        /> -->
        <v-list-item
          v-if="logged && puedeDotaciones"
          prepend-icon="mdi-download"
          to="/download-data"
          title="Dotaciones"
        />
        <v-list-item
          v-if="logged && isAdmin"
          prepend-icon="mdi-account-group"
          to="/usuarios"
          title="Usuarios"
        />
        <v-list-item
          v-if="logged && isAdmin"
          prepend-icon="mdi-clipboard-text-clock"
          to="/auditoria"
          title="Auditoría"
        />

        <v-divider class="my-2" />

        <v-list-item
          v-if="!logged"
          prepend-icon="mdi-login"
          to="/login"
          title="Iniciar sesión"
          color="primary"
        />
        <v-list-item
          v-if="logged"
          prepend-icon="mdi-logout"
          @click="logout"
          title="Cerrar sesión"
          color="error"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-0">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/authStore'
import api from './helpers/api'

const drawer = ref(false)

/**
 * El estado de sesión sale del store, no de localStorage.
 *
 * Antes era `computed(() => isAuthenticated())`, que leía localStorage: eso no
 * es una fuente reactiva, así que Vue no reevaluaba nunca y el menú seguía
 * mostrando las vistas de usuario logueado aunque el token ya no valiera.
 * Y `isAuthenticated()` tampoco comprobaba la caducidad.
 */
const auth = useAuthStore()
const { autenticado: logged, usuario: user, rol: role } = storeToRefs(auth)

/**
 * Permisos del menú. Deben coincidir con lo que aplica el backend:
 * `requireAdmin` y `ROLES_DOTACION` en backend/config/env.js.
 *
 * Antes "Crear Dotación" era sólo para admin y "Dotaciones" para admin y user:
 * ni el rol `auditor` veía nada, ni los dos elementos coincidían entre sí
 * aunque las rutas del router permitieran lo mismo.
 */
const isAdmin = computed(() => role.value === 'admin')

/** admin, user y auditor: las dos vistas de dotaciones. */
const puedeDotaciones = computed(() => ['admin', 'user', 'auditor'].includes(role.value))

// Si el token ya venía caducado al abrir la página, se limpia; si no, se
// programa el cierre para el momento exacto de la caducidad.
auth.programarCaducidad()

/**
 * Cerrar sesión en una pestaña tiene que reflejarse en las demás: el evento
 * `storage` sólo lo reciben las OTRAS pestañas del mismo origen.
 */
const alCambiarAlmacenamiento = (e) => {
  if (e.key === 'token' || e.key === null) auth.sincronizar()
}

onMounted(() => window.addEventListener('storage', alCambiarAlmacenamiento))
onUnmounted(() => {
  window.removeEventListener('storage', alCambiarAlmacenamiento)
  auth.cancelarTemporizador()
})

async function logout() {
  // Se avisa al backend para que suba `tokenVersion`: así el token deja de
  // valer de verdad. Borrarlo solo del navegador no lo invalidaba, y una copia
  // seguía sirviendo hasta que expirara sola.
  try {
    await api.post('/api/v1/auth/logout')
  } catch {
    // Si la llamada falla (sin red, sesión ya caducada) se cierra igual en local.
  }

  auth.cerrarSesion('manual')
  window.location.href = '/login'
}
</script>

<style scoped>
.bg-container {
  overflow-x: hidden;
}

.navigation-icon {
  height: 50px;
  width: auto;
  object-fit: contain;
  display: block;
}

.navigation-right {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding-right: 4px;
}

.v-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: normal;
  font-size: 0.85rem;
}

:deep(.v-toolbar__content) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

@media (max-width: 1264px) {
  .navigation-icon {
    height: 40px;
  }
}

@media (max-width: 600px) {
  .navigation-icon {
    height: 36px;
  }
}
</style>