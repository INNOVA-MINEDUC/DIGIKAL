<template>
  <div class="hero-wrapper">
    <img src="/about/img_1.webp" class="hero-bg" alt="Fondo" />
  </div>

  <!-- Mismos logos, mismo orden y mismos tamaños que la portada (HomeView). -->
  <div class="hero-container">
    <img src="/logos/LOGOS-02.webp" class="hero-img" alt="Ministerio de Educación" />
    <img src="/logos/LOGOS-03.webp" class="hero-img" alt="DIGECADE" />
    <img src="/logos/LOGOS-04.webp" class="hero-img" alt="Política DIGIKAL" />
  </div>

  <div class="home">

    <section class="top-section">
      <div class="card large">
        <img src="/about/img_9.webp" class="image-placeholder" />
        <div class="content">
          <h2>Misión de DIGIKAL:</h2>
          <p>
            Promover un sistema educativo inclusivo, equitativo y de calidad en Guatemala mediante la integración
            de tecnologías digitales, reduciendo la brecha digital y fortaleciendo las competencias tecnológicas
            de estudiantes y docentes, alineándose con los principios de sostenibilidad, ética y derechos
            humanos establecidos por la UNESCO.
          </p>
        </div>
      </div>

      <div class="card large">
        <img src="/img_7.webp" class="image-placeholder" />
        <div class="content">
          <h2>Visión 2035:</h2>
          <p>
            Para el año 2035, el sistema educativo guatemalteco habrá alcanzado una transformación digital
            inclusiva y sostenible, garantizando el ejercicio del derecho a una educación de calidad mediante
            el uso ético, seguro y protegido, con acceso equitativo a tecnologías digitales, conectividad
            confiable, contenidos pedagógicos culturalmente relevantes y sistemas de gestión eficientes.
          </p>
        </div>
      </div>
    </section>


    <section class="innovation-section">
      <h2>Diagnóstico Nacional — ¿Por qué DIGIKAL?</h2>
      <p class="innovation-texto">
        Actualmente menos del 75% de los establecimientos educativos tienen acceso a conectividad. Los recursos e
        infraestructura tecnológica básica continúan siendo un reto, incluyendo acceso estable a energía eléctrica y
        redes confiables. Persisten disparidades significativas entre áreas urbanas y rurales, siendo las comunidades
        en situación de vulnerabilidad las más afectadas. DIGIKAL nace como respuesta a esta realidad para garantizar
        igualdad de oportunidades digitales en todo el territorio nacional.
      </p>
    </section>


    <section class="cards-section">
     <div style="width: 68%;">
       <InfoCards :cards="cards" />
     </div>
    </section>
      <HomeFooter />
  </div>
</template>

<script setup>
import HomeFooter from '@/components/HomeFooter.vue';
import InfoCards from '@/components/InfoCards.vue';

const cards = [
  {
    img: "/about/img_6.webp",
    title: "Marco Internacional",
    text: "La política se alinea con el Marco de Competencias Digitales de la UNESCO, el Marco de Transformación Digital del Banco Mundial y el Marco de Competencia Digital de la Unión Europea, adaptando estándares globales al contexto guatemalteco.",
    gradientColor: "0,50,120",
    gradientOpacity: 0.9
  },
  {
    img: "/about/img_5.webp",
    title: "Diagnóstico Nacional",
    text: "Menos del 75% de los establecimientos tienen acceso a conectividad. Persisten brechas digitales, sociales, económicas y de género que limitan el desarrollo de competencias tecnológicas, especialmente en comunidades rurales e indígenas.",
    gradientColor: "0,50,120",
    gradientOpacity: 0.9
  },
  {
    img: "/about/img_10.webp",
    title: "Marco Normativo",
    text: "La política se sustenta en el Decreto 39-2022 (Ciberdelincuencia), el Decreto 57-2008 (Acceso a la Información Pública), la Constitución Política de Guatemala y estándares internacionales como el GDPR y la Ley Modelo de Protección de Datos de la OEA.",
    gradientColor: "0,50,120",
    gradientOpacity: 0.9
  },
  {
    img: "/img_6.webp",
    title: "Visión 2035",
    text: "Para 2035: conectividad en el 100% de establecimientos, docentes capacitados en competencias digitales, contenidos educativos en español e idiomas nacionales, estándares robustos de ciberseguridad y uso ético de la inteligencia artificial.",
    gradientColor: "0,50,120",
    gradientOpacity: 0.9
  }
]
</script>


<style scoped>
/* ===== Báner =====
   Mismas reglas que el hero de la portada (HomeView), para que las tres vistas
   tengan el báner del mismo tamaño y se comporten igual.

   Antes el `.hero-bg` iba `position: absolute; inset: 0`, lo que lo obligaba a
   rellenar una caja de alto fijo y recortaba la imagen. En la portada va en
   flujo normal y por debajo de 960 px pasa a `height: auto`, así que se ve la
   imagen entera y el báner ocupa lo que le corresponde por su proporción. */
.hero-wrapper {
  position: relative;
  width: 100%;
  height: 70vh;
}

.hero-bg {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* ===== Fila de logos =====
   Mismas reglas que la portada. Antes aquí iba `politica.png` con
   `width:80%; display:flex; justify-self:center` en estilo inline: además de
   no centrarse (justify-self no aplica fuera de una grilla), era una franja de
   proporción 7:1 que no casaba con los logos del resto del sitio. */
.hero-container {
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

.footer {

}

.home {
  width: 100%;
  justify-self: center;
  font-family: 'Segoe UI', sans-serif;
  background: #f5f7fa;
    background-image: url("/fondo.webp");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}


.top-section {
  display: flex;
  gap: 20px;
  padding: 40px 12%;
  flex-wrap: wrap;
  width: 100%;
  justify-self: center;
  background-color: white;
}

.card.large {
  flex: 1;
  background: #e9f0f5;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.image-placeholder {
  height: 400px;
  background: #cfd8dc;
  object-fit: cover;
}

.content {
  padding: 20px;
}

.content h2 {
  color: #0c3b66;
  margin-bottom: 10px;
}



.innovation-section {
  background-image: url("/about/img_3.webp");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 150px 20px;
  /* 100vw provocaba scroll horizontal (incluye la barra de scroll). */
  width: 100%;
  background-color: white;
}

.innovation-section h2 {
  font-size: 32px;
  margin-bottom: 20px;
}

/* El párrafo llevaba `max-width:70%; justify-self:center` en estilo inline.
   Igual que el logo, `justify-self` no aplica aquí: la caja quedaba anclada a
   la izquierda y solo el texto de dentro salía centrado. `margin-inline:auto`
   sí la centra. */
.innovation-texto {
  max-width: 70ch;
  margin-inline: auto;
}



.cards-section {
  display: flex;
  gap: 20px;
  padding: 40px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  justify-self: center;
  background-color: white;
}

.info-card {
  background: #0c3b66;
  color: white;
  border-radius: 15px;
  width: 260px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.image-placeholder.small {
  height: 140px;
  background: #b0bec5;
}

.info-content {
  padding: 15px;
}

.info-content h3 {
  margin-bottom: 10px;
}




@media (max-width: 960px) {
  /* Igual que en la portada: el báner deja de tener alto fijo y adopta la
     proporción de la imagen, así se ve completa y no recortada. */
  .hero-wrapper {
    height: auto;
  }
  .hero-bg {
    height: auto;
  }
  .hero-container {
    flex-wrap: wrap;
    gap: 2rem;
    margin-block: 2.5rem;
  }
  .hero-img {
    width: 9rem;
  }
  .top-section {
    padding: 32px 20px;
  }
  .image-placeholder {
    height: 260px;
  }
  .innovation-section {
    padding: 80px 18px;
  }
  .innovation-section h2 {
    font-size: 24px;
  }
  /* El párrafo con max-width inline se ensancha en pantallas chicas */
  .innovation-section p {
    max-width: 100% !important;
  }
}

@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
  }

  .cards-section {
    flex-direction: column;
    align-items: center;
    padding: 32px 16px;
  }

  /* El contenedor de InfoCards con width inline 68% queda muy angosto en móvil */
  .cards-section > div {
    width: 100% !important;
  }
}

@media (max-width: 600px) {
  .hero-container {
    gap: 1.25rem;
    margin-block: 1.5rem;
  }
  .hero-img {
    width: 6.5rem;
  }
  .image-placeholder {
    height: 200px;
  }
  .innovation-section {
    padding: 48px 16px;
  }
}

/* Teléfono en horizontal: la pantalla es muy baja y un báner de 70vh se comía
   la vista entera antes de llegar al contenido. Como la portada ya usa
   `height:auto` por debajo de 960 px, aquí sólo hace falta cubrir el caso de
   pantalla ancha pero muy baja. */
@media (orientation: landscape) and (max-height: 500px) {
  .hero-wrapper {
    height: auto;
  }
  .hero-bg {
    height: auto;
  }
}
</style>