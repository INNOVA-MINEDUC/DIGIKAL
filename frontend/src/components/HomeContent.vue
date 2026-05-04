<template>
  <!-- HERO -->
  <section class="hero">
    <img src="/banner-30.png" class="hero-bg" />

    <div class="hero-content">
      <img src="/politica.png" class="hero-img" />

      <h1>Resultados de Nuestros Esfuerzos</h1>

      <p>
        Los resultados de nuestros esfuerzos se reflejan de manera concreta en las mejoras alcanzadas gracias a la
        donación y modernización de equipamiento proporcionada por el Ministerio de Educación (MINEDUC).
        Esta contribución ha permitido fortalecer los procesos educativos.
      </p>
    </div>
  </section>

  <!-- MAIN -->
  <main class="main">
    <!-- CARRUSEL -->
    <section class="carousel">
      <Carrusel />
    </section>

    <!-- INNOVATION -->
    <section class="innovation">
      <div class="innovation-text">
        <h2>
          Juntos exploramos y descubrimos usos innovadores de la tecnología
        </h2>

        <p>
          Somos un motor para la innovación educativa en UVG.
        </p>

        <button>Más sobre DIGECADE</button>
      </div>

      <div class="innovation-image">
        <img src="/astro6.png" />
      </div>
    </section>

    <!-- DIGECADE -->
    <section class="digecade">
      <div class="digecade-media">
        <img src="/astro7.png" />
      </div>

      <div class="digecade-panel">
        <h2>Innovación en Digecade</h2>

        <p>
          La Inteligencia Artificial está revolucionando la educación.
        </p>

        <button>Más sobre DIGECADE</button>
      </div>
    </section>

    <!-- SERVICES -->
    <section class="services">
      <h2>Funciones Principales</h2>
      <div class="separator"></div>

      <p class="intro">
        La Dirección General de Gestión de Calidad Educativa impulsa la innovación educativa.
      </p>

      <!-- PLATAFORMAS -->
      <div class="platforms">
        <h2>Principales plataformas académicas</h2>

        <CardOptions :cards="sistemas" />
      </div>
    </section>
  </main>

  <HomeFooter />
</template>

<script setup>
import CardOptions from './CardOptions.vue'
import Carrusel from './Carrusel.vue'
import HomeFooter from './HomeFooter.vue'

const sistemas = [
  {
    title: "AVi",
    img: "/logo-digeduca.png",
    url: "https://avi.mineduc.edu.gt/s2/"
  },
  {
    title: "Ciudadania",
    img: "/ciudadania.png",
    url: "https://ciudadania.mineduc.edu.gt/"
  },
  {
    title: "Cosmos",
    img: "/astro4.png",
    url: "https://www.mineduc.edu.gt/"
  }
]
</script>

<style scoped>
/* RESET */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* HERO */
.hero {
  position: relative;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  position: relative;
  text-align: center;
  color: #0d3b5d;
  padding: 20px;
}

.hero-img {
  width: 70%;
  margin-bottom: 20px;
}

/* MAIN */
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
  margin-top: 40px;
}

/* CAROUSEL */
.carousel {
  width: 70%;
}

/* INNOVATION */
.innovation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 70%;
  gap: 40px;
  background: #ebf1f5;
  padding: 30px;
  border-radius: 20px;
}

/* DIGECADE */
.digecade {
  display: grid;
  grid-template-columns: 1fr 2fr;
  width: 100%;
}

.digecade-media {
  background: #1fb6c9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.digecade-media img {
  width: 80%;
}

.digecade-panel {
  background: #0d3b5d;
  color: white;
  padding: 50px;
}

/* SERVICES */
.services {
  text-align: center;
  padding: 60px 20px;
}

.separator {
  width: 100px;
  height: 4px;
  background: #27b6c8;
  margin: 20px auto;
}

.intro {
  max-width: 700px;
  margin: auto;
}

/* PLATFORMS */
.platforms {
  margin-top: 40px;
  width: 70%;
}
</style>