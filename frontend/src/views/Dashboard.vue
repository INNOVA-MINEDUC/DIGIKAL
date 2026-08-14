<template>

  <div class="hero-wrapper">
    <img src="/dashboard/img_3.png" class="hero-bg" alt="Fondo" />
  </div>

  <v-container fluid style="width: 100%; padding-inline: 0; ">

    <!-- Mismos logos, mismo orden y mismos tamaños que la portada (HomeView). -->
    <div class="hero-container">
      <img src="/logos/LOGOS-02.webp" class="hero-img" alt="Ministerio de Educación" />
      <img src="/logos/LOGOS-03.webp" class="hero-img" alt="DIGECADE" />
      <img src="/logos/LOGOS-04.webp" class="hero-img" alt="Política DIGIKAL" />
    </div>

    <section class="innovation-section">
      <h2>Avances en la Transformación Digital Educativa de Guatemala</h2>
      <p class="innovation-texto">
        La Política DIGIKAL 2025-2035 impulsa la transformación del sistema educativo guatemalteco garantizando
        conectividad en el 100% de los establecimientos para 2035. Actualmente menos del 75% de los establecimientos
        cuentan con acceso a internet, siendo las comunidades rurales y vulnerables las más afectadas por la brecha
        digital. Estos indicadores reflejan el avance acumulado del programa de dotación tecnológica de DIGECADE.
      </p>
    </section>

    <div class="dashboard">

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Establecimientos beneficiados</h3>
          <p class="value">{{ formatNumber(totalEstablecimientos) }}</p>
        </div>

        <div class="stat-card">
          <h3>Con Dotación de Equipos</h3>
          <p class="value">{{ formatNumber(establecimientosDotados) }}</p>
          <!-- <span class="sub">{{ formatNumber(totalEquipos) }} equipos entregados</span> -->
        </div>

        <div class="stat-card">
          <h3>Estudiantes Beneficiados</h3>
          <p class="value">{{ formatNumber(totalEstudiantes) }}</p>
          <!-- <span class="sub">{{ formatNumber(estudiantesDotados) }} con equipo dotado</span> -->
        </div>

        <div class="stat-card">
          <h3>Centros educativos conectados</h3>
          <p class="value">{{ formatNumber(totalInternet) }}</p>
        </div>
      </div>

      <div class="section" v-if="modelosEquipos.length">
        <h2>Modelos de Equipo Dotados</h2>
        <div class="modelos-grid">
          <div class="modelo-card" v-for="m in modelosEquipos" :key="m.tipo + m.modelo">
            <span class="modelo-tipo">{{ m.tipo }}</span>
            <span class="modelo-nombre">{{ m.modelo }}</span>
            <span class="modelo-cantidad">{{ formatNumber(m.cantidad) }}</span>
          </div>
        </div>
      </div>


      <div class="section">
        <h2>Distribución por Departamento</h2>
        <GuateMap2 />
        <TableView />
      </div>

          <!-- <div class="section">
        <h2>Evolución del Programa de Dotación</h2>
        <div class="charts-grid">
          <div class="chart-placeholder">
            <LineChart2 />

          </div>
          <div class="chart-placeholder chart-nivel" style="background-color: white;">
            <h3 class="chart-title">Establecimientos por Nivel Educativo</h3>
            <PieChart />
          </div>
        </div>
      </div> -->







    </div>







  </v-container>
  <HomeFooter />
</template>

<script setup>
import DonaChart from "../components/DonaChart.vue";
import BarChart from "../components/BarChart.vue";
import GuateMap from "../components/GuateMap.vue"
import PieChart from "../components/PieChart.vue";
import TableView from "../components/TableView.vue";
import LineChart from "../components/LineChart.vue";
import LineChart2 from "../components/LineChart2.vue";
import HomeFooter from "@/components/HomeFooter.vue";

import { useEstablecimientosStore } from '@/stores/escuelasStore'
import { computed } from 'vue'
import GuateMap2 from "@/components/GuateMap2.vue";

const store = useEstablecimientosStore()

const totalEstablecimientos = computed(() => store.totalEstablecimientos)
const totalEstudiantes = computed(() => store.totalEstudiantes)
const totalEquipos = computed(() => store.totalEquipos)
const totalInternet = computed(() => store.totalInternet)
const establecimientosDotados = computed(() => store.establecimientosDotados)
const estudiantesDotados = computed(() => store.estudiantesDotados)
const modelosEquipos = computed(() => store.modelosEquipos)



const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}
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

.innovation-section {
  background-image: url("/dashboard/img_4.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 150px 20px;
  /* 100vw incluía el ancho de la barra de scroll y provocaba scroll horizontal;
     100% respeta el ancho real del contenedor. */
  width: 100%;
  background-color: white;
}

/* El párrafo llevaba `max-width:70%; justify-self:center` en estilo inline.
   Igual que el logo, `justify-self` no aplica aquí: la caja quedaba anclada a
   la izquierda y solo el texto de dentro salía centrado. `margin-inline:auto`
   sí la centra. */
.innovation-texto {
  max-width: 70ch;
  margin-inline: auto;
}

.dashboard {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}


.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}


.stat-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}


.stat-card h3 {
  color: #666;
  font-size: 14px;
  margin: 0 0 6px;
}


.stat-card .value {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.stat-card .sub {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #888;
}

.modelos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.modelo-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modelo-tipo {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #03bfcb;
  font-weight: 600;
}

.modelo-nombre {
  font-size: 14px;
  color: #333;
}

.modelo-cantidad {
  font-size: 22px;
  font-weight: bold;
  color: #0d3b5d;
}


.section h2 {
  font-size: 20px;
  margin-bottom: 12px;
  font-weight: 600;
}


.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}


.chart-placeholder {
  height: auto;
  background: #eaeaea;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 16px;
}

.chart-nivel {
  flex-direction: column;
  padding: 16px;
}

.chart-title {
  width: 100%;
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #0d3b5d;
  text-align: center;
}

/* ── RESPONSIVE ─────────────────────────────────────────────────── */
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
  .innovation-section {
    padding: 80px 18px;
  }
  .innovation-section h2 {
    font-size: 22px;
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
  .innovation-section {
    padding: 48px 16px;
  }
  .innovation-section p {
    max-width: 100% !important;
  }
  .dashboard {
    padding: 16px;
    gap: 24px;
  }
  .stat-card .value {
    font-size: 20px;
  }
  .section h2 {
    font-size: 18px;
  }
}

/* Teléfono en horizontal: la pantalla es muy baja y un báner de 70vh se comía
   la vista entera antes de llegar a los indicadores. Como la portada ya usa
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