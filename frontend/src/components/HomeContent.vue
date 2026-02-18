<template>
  <!-- 🌅 Carrusel principal -->
  <div class="hero-wrapper">
    <img src="/BANNER-33.png" class="hero-bg" alt="Fondo" />
  </div>


  <img src="/politica.png" style="width: 80%;  display: flex; justify-self: center;">


  <div style="
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: #0d3b5d;
  padding: 20px;
">

    <h1 style="
    font-weight: 800;
    text-align: center;
    margin: 0;
  ">
      Resultados de Nuestros Esfuerzos
    </h1>

    <p style="
    text-align: center;
    max-width: 1500px;
    line-height: 1.6;
    margin: 0;
    text-align: justify;
  ">
      Los resultados de nuestros esfuerzos se reflejan de manera concreta en las mejoras alcanzadas gracias a la
      donación y modernización de equipamiento proporcionada por el Ministerio de Educación (MINEDUC). Esta valiosa
      contribución ha permitido fortalecer los procesos educativos, optimizar los recursos disponibles y promover la
      innovación en los espacios de aprendizaje.

      A través de estas acciones, se evidencia el compromiso conjunto por elevar la calidad educativa y generar mayores
      oportunidades de desarrollo para la comunidad educativa, marcando un avance significativo hacia una educación más
      equitativa y acorde a los desafíos actuales.
    </p>

  </div>


  <!-- Contenido Principal -->
  <main style="display: flex; flex-direction: column; align-items: center; margin-top: 3rem;">
    <section style="width: 70%;">
      <Carrusel />
    </section>


    <section class="innovation">
      <div class="innovation-text">

        <h2>
          Juntos exploramos y descubrimos usos innovadores de la tecnología
          en la transformación de las experiencias de aprendizaje.
        </h2>

        <p>
          Somos un motor para la innovación educativa en UVG y estamos a la
          vanguardia en el uso de herramientas digitales para ayudar a estudiantes,
          docentes e investigadores a descubrir el potencial de la tecnología en la
          transformación de sus actividades académicas diarias.
        </p>

        <button>Más sobre DIGECADE</button>

      </div>

      <div class="innovation-image">
        <!-- PEGA TU IMAGEN AQUÍ -->
        <img src="/astro6.png" alt="">
      </div>
    </section>

    <section class="digecade-hero">

      <!-- Imagen izquierda -->
      <div class="digecade-media">
        <!-- pega tu imagen aquí -->
        <img src="/bg.png" alt="">
        <img src="/astro7.png" style="
      position: absolute; 
      top: 50; 
      width: 550px; 
      object-fit: contain;" alt="">
      </div>

      <!-- Contenido derecha -->
      <div class="digecade-panel">

        <h2>Innovación en Digecade</h2>

        <p style="text-align: justify; max-width: 80%;">
          La Inteligencia Artificial (IA) está revolucionando las experiencias
          de aprendizaje al ofrecer herramientas innovadoras que personalizan y
          potencian la educación. Desde plataformas de aprendizaje adaptativo
          hasta asistentes virtuales que simplifican el acceso al conocimiento,
          la IA transforma la manera en que se enseña y se aprende.

          En UVG impulsamos el uso ético de estas tecnologías para formar
          profesionales preparados para los desafíos del futuro.
        </p>

        <button class="digecade-btn">
          Más sobre DIGECADE
        </button>

      </div>

    </section>


    <section class="services-section bg-container">
      <div class="container" v-motion :visible-once="{
        opacity: 1,
        y: 0,
        transition: { duration: 800, delay: 100 }
      }" :initial="{ opacity: 0, y: 60 }">
        <h2 class="services-title"><span>Funciones Principales</span></h2>
        <div class="separator"></div>
        <p class="services-intro">
          La DITA está para servir a todos los miembros de la comunidad UVG. Ayudamos a nuestros estudiantes a tener
          éxito y a nuestros docentes diseñar nuevas y emocionantes experiencias de aprendizaje a través del uso
          innovador de la tecnología.
        </p>

        <CardOptions :cards="cards" />
      </div>
           <div style="background-color: #ebf1f5; width: 100vw;">

          <h2 class="platforms-title"><span>Principales plataformas académicas</span></h2>
          <div class="separator"></div>
          <p class="services-intro">
            La DITA está para servir a todos los miembros de la comunidad UVG. Ayudamos a nuestros estudiantes a tener
            éxito y a nuestros docentes diseñar nuevas y emocionantes experiencias de aprendizaje a través del uso
            innovador de la tecnología.
          </p>

          <CardOptions :cards="sistemas" />
        </div>
    </section>
  </main>

</template>

<script setup>
import CardOptions from './CardOptions.vue';
import { useRouter } from 'vue-router';
import Carrusel from './Carrusel.vue';

const router = useRouter()

function action(e) {
  if (e === "Comunidades") {
    router.push({ name: 'comunidades' })
  } else {
    alert(e)
  }
}

const sistemas = [
  {
    top: "Exposición online",
    title: "Sistema de Libros",
    img: "/dspace.png"
  },
  {
    top: "Exposición online",
    title: "Sistema de Ciudadania",
    img: "/ciudadania.png"
  },
  {
    top: "Expposición online",
    title: "Cosmos",
    img: "/astro4.png"
  },
  {
    top: "Monográfico",
    title: "Places",
    img: "https://i.imgur.com/QtHULf5.jpeg"
  }
]

const cards = [
  {
    top: "Exposición online",
    title: "Art Movements",
    img: "https://i.imgur.com/U0m8cEw.jpeg"
  },
  {
    top: "Monográfico",
    title: "Artists",
    img: "https://i.imgur.com/8088tB1.jpeg"
  },
  {
    top: "Pocket Gallery",
    title: "Artworks",
    img: "https://i.imgur.com/OaG8ldh.jpeg"
  },
  {
    top: "Monográfico",
    title: "Places",
    img: "https://i.imgur.com/QtHULf5.jpeg"
  }
]

const timelineItems = [
  {
    fecha: "2020",
    titulo: "Inicio del proyecto",
    descripcion: "Se plantearon los objetivos iniciales y el alcance del sistema."
  },
  {
    fecha: "2021",
    titulo: "Desarrollo del prototipo",
    descripcion: "Se construyó un prototipo funcional con las características principales."
  },
  {
    fecha: "2022",
    titulo: "Pruebas iniciales",
    descripcion: "El sistema fue probado con usuarios reales para detectar mejoras."
  },
  {
    fecha: "2023",
    titulo: "Optimización del rendimiento",
    descripcion: "Se mejoró la velocidad de carga y la experiencia de usuario."
  },
  {
    fecha: "2024",
    titulo: "Expansión regional",
    descripcion: "El proyecto se implementó en nuevas regiones del país."
  },
  {
    fecha: "2025",
    titulo: "Actualización global",
    descripcion: "El sistema fue adoptado a nivel internacional con nuevas funcionalidades."
  }
]

const images = [
  {
    src: "/img_c5.jpg",
    title: "Tutores de Guatemala",
    subtitle: "Infraestructura marítima moderna y activa",
  },
  {
    src: "/img_c4.jpg",
    title: "Educacion en crecimiento",
    subtitle: "Hoteles y destinos para todos los gustos",
  },
  {
    src: "/img_c3.jpg",
    title: "Naturaleza y aventura",
    subtitle: "Explora los paisajes más bellos del país",
  },
]

const temas = [
  {
    title: "Equipo técnico",
    text: "Contamos con un equipo de más de 20 técnicos a nivel nacional encargados de brindar soporte tanto a las computadoras como a los servicios de internet provistos.",
  },
  {
    title: "Equipo de cómputo",
    text: "Se ha donado una gran cantidad de equipos de última generación para que los estudiantes tengan acceso a tecnología moderna y mejoren su experiencia de aprendizaje.",
  },
  {
    title: "Acceso a internet",
    text: "Se ha provisto internet en distintas escuelas, utilizando conexiones satelitales en zonas remotas y fibra óptica en áreas urbanas, garantizando conectividad para todos.",
  },
  {
    title: "Política digital",
    text: "Se han implementado diversas políticas para fortalecer el desarrollo tecnológico en las instituciones, aumentando los recursos disponibles y el número de beneficiarios.",
  },
  {
    title: "Implementación de tutores",
    text: "Se ha creado un programa de tutores capacitados que brindan clases dinámicas y de calidad, mejorando el proceso de enseñanza y aprendizaje de los estudiantes.",
  },
  {
    title: "Sistemas de libros digitales",
    text: "Se han abierto nuevos sistemas para el acceso a libros digitales, permitiendo a los estudiantes leer y obtener materiales educativos de forma más accesible y moderna.",
  },
];


const options = [
  // { icon: "mdi-briefcase-account", title: "Empleo y Vacantes" },
  // { icon: "mdi-clipboard-list-outline", title: "Bolsa de Trabajo" },
  // { icon: "mdi-account-tie", title: "Reclutamiento y Selección" },
  // { icon: "mdi-account-cash", title: "Salarios y Prestaciones" },
  // { icon: "mdi-scale-balance", title: "Derechos Laborales" },
  // { icon: "mdi-gavel", title: "Conciliación y Arbitraje" },
  // { icon: "mdi-clipboard-text-search", title: "Inspección Laboral" },
  { icon: "mdi-shield-account", title: "Seguridad Ocupacional", action },
  { icon: "mdi-school", title: "Capacitación y Formación", action },
  { icon: "mdi-file-document", title: "Trámites y Documentos", action },
  { icon: "mdi-account-group", title: "Comunidades", action },
  { icon: "mdi-chart-bar", title: "Estadísticas", action },
  { icon: "mdi-map-marker", title: "Mapa Interactivo", action },
  { icon: "mdi-domain", title: "Delegaciones Departamentales", action },
  { icon: "mdi-lifebuoy", title: "Asistencia al Trabajador", action },
]

</script>

<style scoped>
.ia-img {
  float: left;
  width: 180px;
  /* ajusta el tamaño */
  margin: 0 20px 10px 0;
  /* espacio alrededor */
}




/* === Reset & Base === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.hero-wrapper {
  position: relative;
  width: 100%;
  height: 70vh;
  min-height: 400px;
  overflow: hidden;
  display: flex;
  justify-self: center;
  align-items: center;
}

/* Fondo */
.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  /* filter: brightness(0.65); */
}

/* Imagen superpuesta */
.hero-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  height: 110%;
  object-fit: contain;
  z-index: 3;
  pointer-events: none;
}

/* Texto */
.hero-content {
  position: relative;
  z-index: 4;
  color: white;
  padding-left: 5%;
  max-width: 520px;
}

.hero-content h1 {
  font-size: clamp(28px, 4vw, 48px);
  line-height: 1.1;
  margin-bottom: 16px;
  font-weight: 700;
}

.badge {
  display: inline-block;
  background: #25c6da;
  color: white;
  padding: 10px 10px;
  border-radius: 10px;
  font-weight: 400;
  font-size: 40px;
}

@media (max-width: 768px) {
  .hero-overlay {
    opacity: 0.4;
    height: 100%;
  }

  .hero-content h1 {
    font-size: 28px;
  }
}

.innovation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 40px;

  background: #ebf1f5;
  padding: 20px 50px;
  border-radius: 20px;
  margin: 40px auto;
  width: 70%;
}

.innovation-text {
  color: #0d3b5d;
}

.innovation-text h2 {
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 16px;
}

.innovation-text p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.innovation-text button {
  background: #27b6c8;
  border: none;
  padding: 12px 22px;
  border-radius: 10px;
  font-weight: 700;
  color: #0d3b5d;
  cursor: pointer;
  transition: 0.2s;
}

.innovation-text button:hover {
  background: #1aa3b4;
}

.innovation-image {
  display: flex;
  justify-content: center;
}

.innovation-image img {
  width: 100%;
  max-width: 500px;
  border-radius: 18px;
}

/* Responsive */

@media (max-width: 900px) {
  .innovation {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .innovation-image img {
    max-width: 300px;
  }
}


.digecade-hero {
  display: grid;
  grid-template-columns: 1fr 2fr;
  height: 500px;
}

/* Imagen */

.digecade-media {
  background: #1fb6c9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.digecade-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Panel derecho */

.digecade-panel {
  background: #0d3b5d;
  color: white;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.digecade-panel h2 {
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 800;
}

.digecade-panel p {
  line-height: 1.6;
  opacity: 0.95;
}

/* Botón */

.digecade-btn {
  align-self: flex-start;
  margin-top: 10px;
  background: #27b6c8;
  color: #0d3b5d;
  border: none;
  padding: 12px 22px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s;
  font-weight: 900;
}

.digecade-btn:hover {
  background: #1aa3b4;
}

/* Responsive */

@media (max-width: 900px) {
  .digecade-hero {
    grid-template-columns: 1fr;
  }

  .digecade-media {
    height: 300px;
  }

  .digecade-panel {
    text-align: center;
  }

  .digecade-btn {
    align-self: center;
  }
}


.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-lg-8,
.col-lg-4,
.col-md-4 {
  padding: 0 15px;
}

.col-lg-8 {
  flex: 0 0 66.666%;
}

.col-lg-4 {
  flex: 0 0 33.333%;
}

.col-md-4 {
  flex: 0 0 33.333%;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-end {
  justify-content: flex-end;
}


/* === Secciones === */
.hero-section {
  padding: 4rem 0;
  background: #fff;
}

.hero-title {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 1.5rem;
  color: #222;
}

.hero-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #555;
}



/* IA Section */
.ia-section {
  background: var(--gray-bg);
  padding: 4rem 0;
  color: #333;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.section-text {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 2rem;
}

/* Services & Platforms */
.services-section {
  /* background: var(--bg-dark); */
  color: white;
  padding: 5rem 0;
  text-align: center;
  color: #0d3b5d;
}

.services-title,
.platforms-title {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.services-title span,
.platforms-title span {
  color: #0d3b5d;
  font-weight: 800;
}

.separator {
  width: 100px;
  height: 4px;
  background: var(--primary);
  margin: 2rem auto;
  border-radius: 2px;
}

.services-intro {
  max-width: 800px;
  margin: 0 auto 3rem;
  font-size: 1.1rem;
  line-height: 1.7;
  color: #0d3b5d;
  font-weight: 500;
  text-align: initial;
}

.services-grid,
.platforms-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
}

.service-item,
.platform-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 8px;
  transition: var(--transition);
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-item:hover,
.platform-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-8px);
}

.service-item h3,
.platform-item h3 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  line-height: 1.4;
}

.service-item a,
.platform-item a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.service-item a:hover,
.platform-item a:hover {
  color: var(--primary);
}

/* Footer */
.footer {
  background: #111;
  color: #aaa;
  padding: 3rem 0;
  position: relative;
  z-index: 1;
}

.footer-logo {
  max-width: 120px;
  margin-bottom: 2rem;
  border-radius: 5px;
}

.contact-info h4 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.contact-info ul {
  list-style: none;
}

.contact-info li {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.contact-info a {
  color: #aaa;
  text-decoration: none;
}

.contact-info a:hover {
  color: var(--primary);
}

.icon-office::before,
.icon-location::before,
.icon-phone::before,
.icon-envelope::before {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  margin-right: 0.5rem;
  color: var(--primary);
}

.icon-office::before {
  content: "\f19c";
}

.icon-location::before {
  content: "\f3c5";
}

.icon-phone::before {
  content: "\f095";
}

.icon-envelope::before {
  content: "\f0e0";
}



/*---------------------------------------------------------------------*/
.v-carousel-item img {
  object-fit: cover;
}

.optionscube {
  width: 200px;
  height: 200px;
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.transition-ease {
  transition: all 0.3s ease;
}
</style>
