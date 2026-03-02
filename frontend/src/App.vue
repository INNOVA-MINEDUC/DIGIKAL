<template>
  <v-app class="bg-container" style="user-select: none;">
    <v-app-bar app color="white" height="90">
      <div class="navigation">

        <img src="/icono.png" class="navigation-icon" />

        <div class="navigation-right">

          <v-btn to="/" text>Inicio</v-btn>
          <v-btn to="/comunities" text>Novedades</v-btn>
          <v-btn to="/about" text>Sobre Nosotros</v-btn>

          <!-- Solo si está logueado -->
          <v-btn 
            to="/dashboard" 
            text>
            Estadísticas
          </v-btn>

          <!-- Solo admin -->
          <v-btn 
            v-if="user?.role === 'admin'"
            to="/upload-data" 
            text>
            Upload Data
          </v-btn>

          <!-- Solo si está logueado -->
          <v-btn 
            v-if="logged"
            to="/download-data" 
            text>
            Download Data
          </v-btn>

          <!-- Si NO está logueado -->
          <v-tooltip 
            v-if="!logged"
            text="Iniciar Sesión"
            location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn to="/login" v-bind="props" icon="mdi-account"></v-btn>
            </template>
          </v-tooltip>

          <!-- Si está logueado -->
          <v-btn 
            v-if="logged"
            icon="mdi-logout"
            @click="logout">
          </v-btn>

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
import { useRouter } from 'vue-router'

const router = useRouter()

const user = computed(() => getUser())
const logged = computed(() => isAuthenticated())

function logout() {
  removeToken()
  router.push('/login')
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

/* Icono izquierda */
.navigation-icon {
  margin-left: 50px;
  height: 80px;
  object-fit: contain;
}

/* Todo lo demás a la derecha */
.navigation-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
}
</style>
