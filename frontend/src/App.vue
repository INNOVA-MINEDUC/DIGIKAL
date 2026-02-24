<template>
  <v-app class="bg-container" style="user-select: none;">
    <v-app-bar app color="white" height="90">
      <div class="navigation">

        <!-- Icono (izquierda) -->
        <img src="/icono.png" class="navigation-icon" />

        <!-- Menús + acciones (derecha) -->
        <div class="navigation-right">
          <v-btn to="/" text>Inicio</v-btn>
          <v-btn to="/comunidades" text>Novedades</v-btn>
          <v-btn to="/dashboard" text>Estadísticas</v-btn>
          <v-btn to="/about" text>Sobre Nosotros</v-btn>
          <v-btn to="/upload-data" text>Upload Data</v-btn>
          <v-btn to="/download-data" text>Download Data</v-btn>

          <v-tooltip text="Iniciar Sesión" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn to="/login" v-bind="props" icon="mdi-account"></v-btn>
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
