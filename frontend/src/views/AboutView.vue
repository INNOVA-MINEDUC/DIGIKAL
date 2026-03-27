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
          <h2>Nuestra misión:</h2>
          <p>
            Proveer soluciones tecnológicas innovadoras que impulsen el
            crecimiento de nuestros clientes, manteniendo la excelencia
            técnica y el compromiso humano.
          </p>
        </div>
      </div>

      <div class="card large">
        <img src="/about/img_8.png" class="image-placeholder" />
        <div class="content">
          <h2>Nuestra Visión:</h2>
          <p>
            Ser referentes globales en el desarrollo de software,
            reconocidos por nuestra ética de trabajo y la capacidad
            de resolver problemas complejos.
          </p>
        </div>
      </div>
    </section>


    <section class="innovation-section">
      <h2>Innovación en Digecade</h2>
      <p style="max-width: 70%; justify-self: center;">
        Guatemala avanza hacia una educación más conectada e inclusiva mediante la incorporación de tecnología y
        conectividad en los establecimientos del nivel diversificado. La implementación de laboratorios equipados y
        acceso a
        internet fortalece los procesos de enseñanza y aprendizaje, reduciendo la brecha digital y ampliando las
        oportunidades
        para estudiantes y docentes. Un paso firme hacia entornos educativos modernos que promueven la innovación, el

        acceso al conocimiento y el desarrollo de competencias necesarias para el futuro.
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
    title: "Origen Académico",
    text: "iniciativa estudiantil dentro del ámbito universitario, donde durante más de una década se han desarrollado soluciones enfocadas en resolver problemáticas reales mediante tecnología, investigación aplicada y aprendizaje colaborativo.",
    gradientColor: "0,50,120",
    gradientOpacity: 0.9
  },
  {
    img: "/about/img_5.png",
    title: "Cultura de Innovación",
    text: "La innovación estudiantil ha sido el motor principal del crecimiento, fomentando la creatividad, el pensamiento crítico y la experimentación constante como parte del proceso de formación profesional.",
    gradientColor: "0,50,120",
    gradientOpacity: 0.9
  },
  {
    img: "/about/img_10.png",
    title: "Impacto y Evolución",
    text: "Muchos proyectos estudiantiles evolucionaron hacia productos reales, emprendimientos tecnológicos, startups y soluciones adoptadas por comunidades educativas y organizaciones.",
    gradientColor: "0,50,120",
    gradientOpacity: 0.9
  },
  {
    img: "/about/img_8.png",
    title: "Trabajo Colaborativo",
    text: "Equipos multidisciplinarios integrados por estudiantes, docentes y profesionales, replicando dinámicas reales de la industria tecnológica.",
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