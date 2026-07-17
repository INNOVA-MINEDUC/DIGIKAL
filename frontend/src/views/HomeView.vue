<template>
  <!-- HERO -->
  <section class="hero">
    <img src="/banner-30.png" class="hero-bg" />

    <div class="hero-content">
      <div class="hero-container">
        <img src="/logos/LOGOS-02.webp" class="hero-img" />
        <img src="/logos/LOGOS-03.webp" class="hero-img" />
        <img src="/logos/LOGOS-04.webp" class="hero-img" />
      </div>

      <h1>Política de Transformación Digital DIGIKAL</h1>

      <p>
        La Política de Transformación Digital DIGIKAL busca promover un sistema educativo inclusivo, equitativo
        y de calidad en Guatemala mediante la integración de tecnologías digitales, reduciendo la brecha digital
        y fortaleciendo las competencias tecnológicas de estudiantes y docentes en todo el país.
      </p>
    </div>
    <section class="carousel">
      <Carrusel />
    </section>


    <section class="innovation">
      <div class="innovation-text">
        <h2>Hacia una educación digital inclusiva y sostenible para Guatemala 2025–2035</h2>
        <p>Desde la Dirección General de Calidad Educativa (DIGECADE), impulsamos la transformación del sistema
          educativo guatemalteco garantizando que todos los establecimientos cuenten con infraestructura tecnológica,
          conectividad confiable y recursos digitales adaptados a la diversidad cultural y lingüística del país,
          alineados con los Objetivos de Desarrollo Sostenible ODS 4 y ODS 10.</p>

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
        <h2>Cinco Ejes de la Transformación Digital</h2>

        <p>
          La política DIGIKAL articula cinco ejes estratégicos: <strong>Conectividad</strong> en el 100% de los
          establecimientos para 2035; <strong>Dotación tecnológica</strong> con equipo actualizado y accesible;
          <strong>Contenido digital</strong> en español e idiomas nacionales; <strong>Formación docente</strong>
          continua en competencias digitales; y un <strong>Sistema de Información</strong> para la gestión
          educativa (SIGE) que permita una toma de decisiones basada en datos.
        </p>

        <button>Más sobre DIGECADE</button>
      </div>
    </section>


    <section class="principios">
      <h2>Principios Rectores de DIGIKAL</h2>
      <div class="separator"></div>
      <p class="intro">
        La Política de Transformación Digital se rige por cinco principios fundamentales que garantizan una
        implementación ética, inclusiva y sostenible en todo el sistema educativo nacional.
      </p>
      <div class="principios-grid">
        <div class="principio-card" v-for="p in principios" :key="p.titulo">
          <div class="principio-numero">{{ p.num }}</div>
          <h3 class="principio-titulo">{{ p.titulo }}</h3>
          <p class="principio-texto">{{ p.texto }}</p>
        </div>
      </div>
    </section>

    <section class="services">
      <div class="platforms">
        <h2>Plataformas Educativas MINEDUC</h2>
        <div class="separator"></div>
        <p class="intro">
          Como parte del eje de contenido digital educativo de la política DIGIKAL, el Ministerio de Educación
          pone a disposición plataformas educativas gratuitas con certificación para fortalecer las competencias
          digitales de toda la comunidad educativa guatemalteca.
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

const principios = [
  {
    num: '01',
    titulo: 'Ética',
    texto: 'Fomentar el uso responsable de las tecnologías, respetando los derechos y la privacidad de todos los actores educativos.'
  },
  {
    num: '02',
    titulo: 'Sostenibilidad',
    texto: 'Implementar estrategias que garanticen el uso continuo y efectivo de las tecnologías a lo largo del tiempo.'
  },
  {
    num: '03',
    titulo: 'Derechos Humanos',
    texto: 'Promover la equidad, la libertad de expresión y la protección de datos en el ámbito digital.'
  },
  {
    num: '04',
    titulo: 'Inclusión',
    texto: 'Asegurar que estudiantes y docentes, especialmente en comunidades rurales y marginadas, tengan acceso a recursos tecnológicos.'
  },
  {
    num: '05',
    titulo: 'Transparencia',
    texto: 'Diseñar procesos claros y accesibles en la gestión de recursos tecnológicos y educativos.'
  },
]

const sistemas = [
  {
    title: "AVi",
    img: "/logo-avi.png",
    url: "https://avi.mineduc.edu.gt/"
  },
  {
    title: "Ciudadanía",
    img: "/ciudadania.png",
    url: "https://ciudadania.mineduc.edu.gt/"
  },
  {
    title: "Cosmo",
    img: "/astro4.png",
    url: "https://cosmo.mineduc.edu.gt/"
  },
  {
    title: "Salud Escolar",
    img: "/logo_salud_escolar.png",
    url: "https://saludescolar.mineduc.edu.gt/"
  },
  {
    title: "SIRCE",
    img: "/logo_sirce.png",
    url: "https://sigec-dev.mineduc.edu.gt/"
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

.hero-container{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5rem;
  margin-block: 5rem;
}

.hero-img {
  width: 15rem;
  padding: 0;
}


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
  bottom: -25px;
  /* aquí está el truco */
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

/* PRINCIPIOS RECTORES */
.principios {
  padding: 60px 20px;
  text-align: center;
  background: #f0f7ff;
}

.principios h2 {
  font-size: 28px;
  color: #0d3b5d;
  font-weight: 700;
}

.principios-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 36px;
  max-width: 1100px;
  margin-inline: auto;
}

.principio-card {
  background: white;
  border-radius: 16px;
  padding: 28px 20px;
  flex: 1 1 170px;
  max-width: 210px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #27b6c8;
  text-align: center;
}

.principio-numero {
  font-size: 2rem;
  font-weight: 900;
  color: #27b6c8;
  margin-bottom: 8px;
  line-height: 1;
}

.principio-titulo {
  color: #0d3b5d;
  font-size: 1rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.principio-texto {
  color: #555;
  font-size: 0.82rem;
  line-height: 1.5;
}
</style>