<template>
  <div class="hero-wrapper">
    <img src="/about/img_1.png" class="hero-bg" alt="Fondo" />
  </div>

  <img src="/politica.png" style="width: 80%;  display: flex; justify-self: center; z-index: 0;">

  <div class="home">

    <section class="top-section">
      <div class="card large">
        <img src="/about/img_9.png" class="image-placeholder" />
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
      <p style="max-width: 70%; justify-self: center;">
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
    img: "/about/img_6.png",
    title: "Marco Internacional",
    text: "La política se alinea con el Marco de Competencias Digitales de la UNESCO, el Marco de Transformación Digital del Banco Mundial y el Marco de Competencia Digital de la Unión Europea, adaptando estándares globales al contexto guatemalteco.",
    gradientColor: "0,50,120",
    gradientOpacity: 0.9
  },
  {
    img: "/about/img_5.png",
    title: "Diagnóstico Nacional",
    text: "Menos del 75% de los establecimientos tienen acceso a conectividad. Persisten brechas digitales, sociales, económicas y de género que limitan el desarrollo de competencias tecnológicas, especialmente en comunidades rurales e indígenas.",
    gradientColor: "0,50,120",
    gradientOpacity: 0.9
  },
  {
    img: "/about/img_10.png",
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

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  /* filter: brightness(0.65); */
}

.footer {

}

.home {
  width: 100%;
  justify-self: center;
  font-family: 'Segoe UI', sans-serif;
  background: #f5f7fa;
    background-image: url("/fondo.png");
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
  background-image: url("/about/img_3.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 150px 20px;
  width: 100vw;
  background-color: white;
}

.innovation-section h2 {
  font-size: 32px;
  margin-bottom: 20px;
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




@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
  }

  .cards-section {
    flex-direction: column;
    align-items: center;
  }
}
</style>