<template>
  <v-app class="bg-container" style="user-select: none;">

    <!-- NAVBAR -->
    <v-app-bar app color="white" height="80" elevation="2">

      <!-- BOTON MOBILE -->
      <v-app-bar-nav-icon
        class="d-flex d-md-none"
        @click="drawer = !drawer"
      />

      <!-- LOGO -->
      <img src="/icono2.png" class="navigation-icon" />

      <!-- MENU DESKTOP -->
      <div class="navigation-right d-none d-md-flex">

        <v-btn to="/" text>Inicio</v-btn>

        <v-btn to="/about" text>
          Sobre Nosotros
        </v-btn>

        <v-btn to="/dashboard" text>
          Estadísticas
        </v-btn>

        <v-btn
          v-if="logged && (isAdmin || isUser)"
          to="/cargar-datos"
          text
        >
          Cargar Datos
        </v-btn>

        <v-btn
          v-if="logged && isAdmin"
          to="/upload-data"
          text
        >
          Crear Dotación
        </v-btn>

        <v-btn
          v-if="logged && (isAdmin || isUser)"
          to="/catalogos"
          text
        >
          Catálogo de Equipos
        </v-btn>

        <v-btn
          v-if="logged && (isAdmin || isUser)"
          to="/download-data"
          text
        >
          Dotaciones
        </v-btn>

        <v-btn
          v-if="logged && isAdmin"
          to="/usuarios"
          text
        >
          Usuarios
        </v-btn>

        <v-btn
          v-if="!logged"
          to="/login"
          text
        >
          Iniciar sesión
        </v-btn>

        <v-tooltip text="Cerrar sesión" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-if="logged"
              v-bind="props"
              icon="mdi-logout"
              @click="logout"
            />
          </template>
        </v-tooltip>

      </div>
    </v-app-bar>

    <!-- DRAWER MOBILE -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
    >

      <v-list>

        <v-list-item to="/" title="Inicio" />

        <v-list-item
          to="/about"
          title="Sobre Nosotros"
        />

        <v-list-item
          to="/dashboard"
          title="Estadísticas"
        />

        <v-list-item
          v-if="logged && (isAdmin || isUser)"
          to="/cargar-datos"
          title="Cargar Datos"
        />

        <v-list-item
          v-if="logged && isAdmin"
          to="/upload-data"
          title="Crear Dotación"
        />

        <v-list-item
          v-if="logged && (isAdmin || isUser)"
          to="/catalogos"
          title="Catálogo de Equipos"
        />

        <v-list-item
          v-if="logged && (isAdmin || isUser)"
          to="/download-data"
          title="Dotaciones"
        />

        <v-list-item
          v-if="logged && isAdmin"
          to="/usuarios"
          title="Usuarios"
        />

        <v-list-item
          v-if="!logged"
          to="/login"
          title="Iniciar sesión"
        />

        <v-list-item
          v-if="logged"
          @click="logout"
          title="Cerrar sesión"
        />

      </v-list>

    </v-navigation-drawer>

    <!-- CONTENIDO -->
    <v-main>
      <router-view />
    </v-main>

  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getUser, isAuthenticated, removeToken } from '../utils/auth'

const drawer = ref(false)

const user = computed(() => getUser())
const logged = computed(() => isAuthenticated())

const role = computed(() => user.value?.role)

const isAdmin = computed(() => role.value === 'admin')
const isUser = computed(() => role.value === 'user')

function logout() {
  removeToken()
  window.location.href = '/login'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Montserrat", sans-serif;
}

.navigation-icon {
  margin-left: 10px;
  height: 60px;
  object-fit: contain;
}

.navigation-right {
  margin-left: auto;
  align-items: center;
  gap: 0.3rem;
  margin-right: 1rem;
}

@media (max-width: 768px) {
  .navigation-icon {
    height: 50px;
  }
}
</style>