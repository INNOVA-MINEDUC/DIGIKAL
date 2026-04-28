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
    <section class="carousel">
      <Carrusel />
    </section>


      <section class="innovation">
    <div class="innovation-text">
      <h2>
        Juntos exploramos y descubrimos usos innovadores de la tecnología
        en la transformación de las experiencias de aprendizaje.
      </h2>

      <p>
        Somos un motor para la innovación educativa en UVG y estamos a la vanguardia
        en el uso de herramientas digitales para ayudar a estudiantes, docentes e investigadores.
      </p>

      <button>Mas sobre DIGECADE</button>
    </div>

    <div class="innovation-image">
      <img src="/astro8.png" alt="astronauta" />
    </div>
  </section>

    <section class="digecade">
  <div class="digecade-media">
    <img src="/astro7.png" />
  </div>

  <div class="digecade-panel">
    <h2>Innovación en Digecade</h2>

    <p>
      La innovación de DIGECADE impulsa el desarrollo educativo mediante la implementación de laboratorios tecnológicos equipados con herramientas de última generación, garantizando así una formación más práctica y efectiva para los estudiantes. Además, ofrece cursos diseñados para fortalecer el aprendizaje y un plan de estudios innovador que responde a las demandas actuales. Como complemento, se asegura el acceso a internet en todos los establecimientos, facilitando el uso de recursos digitales y promoviendo una educación más conectada, dinámica y de calidad.
    </p>

    <button>Más sobre DIGECADE</button>
  </div>
</section>


    <section class="services">
      <!-- <h2>Funciones Principales</h2>
      <div class="separator"></div>

      <p class="intro">
        La Dirección General de Gestión de Calidad Educativa impulsa la innovación educativa.
      </p> -->


      <div class="platforms">
        <h2>Principales plataformas académicas</h2>
<div class="separator"></div> 
   <p class="intro">
   La Dirección General de Gestión de Calidad Educativa impulsa la innovación en el ámbito educativo mediante plataformas educativas gratuitas con certificación. Además, ofrece diversos sistemas de apoyo tanto para docentes como para estudiantes, fortaleciendo el proceso de enseñanza y aprendizaje.
      </p>
        <CardOptions :cards="sistemas" />
      </div>
    </section>
    <HomeFooter />
  </section>


</template>

<script setup>
import CardOptions from '@/components/CardOptions.vue'
import Carrusel from '@/components/Carrusel.vue'
import HomeFooter from '@/components/HomeFooter.vue'

const sistemas = [
  {
    title: "AVi",
    img: "/logo-avi.png",
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
  height: 70vh;

}

.hero-bg {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  position: relative;
  text-align: center;
  color: #0d3b5d;
  padding: 20px;
  max-width: 50%;
  justify-self: center;
  font-weight: 500;
}

.hero-img {
  width: 100rem;
  margin-bottom: 20px;
  padding: 0;
  transform: translateX(-25%);
}

/* MAIN */


/* CAROUSEL */
.carousel {
  width: 85%;
  display: flex;
  justify-content: center;
  justify-self: center;
  margin-top: 20px;
}

/* INNOVATION */
.innovation {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #d9e0e6;
  padding: 40px;
  border-radius: 20px;
  width: 70%;
  justify-self: center;
  margin-bottom: 5rem;
}

/* TEXTO */
.innovation-text {
  max-width: 55%;
}

.innovation-text h2 {
  font-size: 28px;
  color: #0f3b57;
  margin-bottom: 16px;
}

.innovation-text p {
  color: #4a6a7f;
  margin-bottom: 20px;
  font-weight: 800;
}

.innovation-text button {
  background: #00a8b5;
  color: #0d3b5d;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

/* IMAGEN */
.innovation-image {
  position: relative;
  width: 300px;
  height: 300px;

  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateX(-30%) translateY(5%);
}

/* 🔥 EFECTO COMO TU DISEÑO */
.innovation-image img {
  position: absolute;
  bottom: -25px; /* aquí está el truco */
  width: 120%;
}

/* DIGECADE */
.digecade {
  display: flex;
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  justify-content: center;
  background: #0c3c60;
}

/* LADO IZQUIERDO */
.digecade-media {
  width: 25%;
  background: linear-gradient(135deg, #28c0c7, #0f6c7a);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* IMAGEN */
.digecade-media img {
  width: 120%;
  object-fit: contain;
  /* transform: translateX(-10%); */
}

/* LADO DERECHO */
.digecade-panel {
  width: 70%;
  background: #0c3c60;
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* TEXTO */
.digecade-panel h2 {
  font-size: 28px;
  margin-bottom: 16px;
}

.digecade-panel p {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #cfe3f1;
}

/* BOTÓN */
.digecade-panel button {
  background: #00b4c6;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  color: #0c3c60;
  width: fit-content;
  cursor: pointer;
  font-weight: bold;
}

/* SERVICES */
.services {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 60px 20px;
  justify-content: center;
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
  width: 100%;
}
</style>