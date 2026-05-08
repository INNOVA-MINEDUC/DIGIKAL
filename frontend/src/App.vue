<template>
  <v-app class="bg-container" style="user-select: none;">
    <v-app-bar app color="white" height="90">
      <div class="navigation">

        <img src="/icono2.png" class="navigation-icon" />

        <div class="navigation-right">

          <v-btn to="/" text>Inicio</v-btn>
          <!-- <v-btn to="/comunities" text>Novedades</v-btn> -->
          <v-btn to="/about" text>Sobre Nosotros</v-btn>

          <v-btn to="/dashboard" text>
            Estadísticas
          </v-btn>

          <!-- SOLO ADMIN -->
          <v-btn v-if="logged && isAdmin" to="/upload-data" text>
            Crear Dotación
          </v-btn>

          <!-- ADMIN Y USER -->
          <v-btn v-if="logged && (isAdmin || isUser)" to="/catalogos" text>
            Catálogo de Equipos
          </v-btn>

          <!-- ADMIN Y USER -->
          <v-btn v-if="logged && (isAdmin || isUser)" to="/download-data" text>
            Dotaciones
          </v-btn>

          <!-- SOLO ADMIN -->
          <v-btn v-if="logged && isAdmin" to="/usuarios" text>
            Usuarios
          </v-btn>
          <!-- Si NO está logueado -->
          <v-btn v-if="!logged" to="/login" text>
            Iniciar sesión
          </v-btn>

          <v-tooltip text="Cerrar sesión" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-if="logged" v-bind="props" icon="mdi-logout" @click="logout">
              </v-btn>
            </template>
          </v-tooltip>

        </div>

      </div>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { getUser, isAuthenticated, removeToken } from '../utils/auth'



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

.navigation {
  width: 100%;
  display: flex;
  align-items: center;
}

.navigation-icon {
  margin-left: 50px;
  height: 80px;
  object-fit: contain;
}

.navigation-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
}
</style>