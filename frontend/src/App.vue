<template>
  <v-app class="bg-container" style="user-select: none;">


    <v-app-bar app color="white" height="90">
      <div class="navigation">

        <!-- IZQUIERDA: Icono + Menús -->
        <div class="navigation-left">
          <img src="/icono.png" class="navigation-icon" />
          <v-toolbar-title class="title">
            RESULTADOS INNOVACIÓN
            <b class="year">2025</b>
          </v-toolbar-title>
          <div class="navigation-menus">
            <v-btn to="/" text>Inicio</v-btn>
            <v-btn to="/comunidades" text>Novedades</v-btn>
            <v-btn to="/dashboard" text>Estadísticas</v-btn>
            <v-btn to="/about" text>Sobre Nosotros</v-btn>
            <v-btn to="/upload-data" text>Upload Data</v-btn>
            <v-btn to="/download-data" text>DownLoad Data</v-btn>
          </div>
        </div>

        <!-- DERECHA: Acciones -->
        <div class="navigation-actions">
          <v-tooltip text="Iniciar Sección" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn to="/login" v-bind="props" icon="mdi-account"></v-btn>
            </template>
          </v-tooltip>


        </div>

      </div>
    </v-app-bar>

    <v-main>
      <router-view></router-view> <!-- 👈 Aquí se renderizan las páginas -->
    </v-main>
  </v-app>
</template>

<script setup>
import axios from "axios";

axios.get("http://localhost:3000/api/v1/entregas")
  .then((response) => {
    const entregas = response.data;

    console.log("Entregas:", entregas);

    entregas.forEach(entrega => {
      console.log(`
        ID: ${entrega.id}
        Detalle: ${entrega.detalle}
        Imagen: ${entrega.img}
      `);
    });
  })
  .catch((error) => {
    console.error("Error al obtener entregas:", error);
  });

</script>

<style>

.bg-static {
  background-image: url('/fondo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  /* 🔥 Esto la deja estática */
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Montserrat", sans-serif;
}

.navigation {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* IZQUIERDA */
.navigation-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  /* espacio entre icono y menús */
}

.navigation-icon {
  height: 60px;
  object-fit: contain;
  background-color: #1282B0;
}

/* MENÚS */
.navigation-menus {
  display: flex;
  gap: 0.5rem;
}

/* DERECHA */
.navigation-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 1rem;
}

.title {
  font-weight: bold;
  font-size: 16px;
}

.year {
  color: #1282B0;
}
</style>
