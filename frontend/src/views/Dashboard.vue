<template>

  <div class="hero-wrapper">
    <img src="/dashboard/img_3.png" class="hero-bg" alt="Fondo" />
  </div>

  <v-container fluid style="width: 100%; padding-inline: 0; ">

    <img src="/politica.png" style="width: 80%;  display: flex; justify-self: center; z-index: 0;">

    <section class="innovation-section">
      <h2>IAvances en la Educacion de Guatemala</h2>
      <p style="max-width: 70%; justify-self: center;">
        Guatemala avanza hacia una educación más conectada e inclusiva mediante la incorporación de tecnología y
        conectividad en los establecimientos del nivel diversificado. La implementación de laboratorios equipados y
        acceso a
        internet fortalece los procesos de enseñanza y aprendizaje, reduciendo la brecha digital y ampliando las
        oportunidades
        para estudiantes y docentes. Un paso firme hacia entornos educativos modernos que promueven la innovación, el
        acceso

        al conocimiento y el desarrollo de competencias necesarias para el futuro.
      </p>
    </section>

    <div class="dashboard">

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Establecimientos</h3>
          <p class="value">{{ formatNumber(totalEstablecimientos) }}</p>
        </div>

        <div class="stat-card">
          <h3>Numero de Equipos Dotados</h3>
          <p class="value">{{ formatNumber(totalEquipos) }}</p>
        </div>
        <div class="stat-card">
          <h3>Numero de Estudiantes Beneficiados</h3>
          <p class="value">{{ formatNumber(totalEstudiantes) }}</p>
        </div>
        <div class="stat-card">
          <h3>Estudiantes Restantes</h3>
          <p class="value">100%</p>
        </div>
      </div>


      <div class="section">
        <h2>Trending</h2>
        <div class="charts-grid">
          <div class="chart-placeholder">
            <GuateMap2 />

          </div>
          <div class="chart-placeholder" style="background-color: white;">
            <TableView />
          </div>
        </div>
      </div>






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



const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}
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

.innovation-section {
  background-image: url("/dashboard/img_4.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 150px 20px;
  width: 100vw;
  background-color: white;
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
</style>