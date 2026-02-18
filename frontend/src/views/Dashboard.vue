<template>
  <v-container fluid style="width: 100%; padding-inline: 0; ">



<div class="dashboard">

  <!-- Top Stats -->
<div class="stats-grid">
<div class="stat-card">
<h3>Establecimientos</h3>
<p class="value">200</p>
</div>
<div class="stat-card">
<h3>Establecimientos Pendientes</h3>
<p class="value">0</p>
</div>
<div class="stat-card">
<h3>Numero de Estudiantes Beneficiados</h3>
<p class="value">1,000</p>
</div>
<div class="stat-card">
<h3>Estudiantes Restantes</h3>
<p class="value">100%</p>
</div>
</div>

<!-- Trending Section -->
<div class="section">
<h2>Trending</h2>
<div class="charts-grid">
<div class="chart-placeholder">
   <GuateMap />
  
</div>
<div class="chart-placeholder" style="background-color: white;">
  <TableView />
</div>
</div>
</div>




<!-- Trending Section -->
<div class="section">
<h2>Trending</h2>
<div class="charts-grid">
<div class="chart-placeholder">
  <LineChart2 />
  
</div>
<div class="chart-placeholder">
  <DonaChart />
</div>
</div>
</div>




<!-- Product Breakdown -->
<div class="section">
<h2>Product Breakdown</h2>
<div class="chart-placeholder" style="margin-top: 20rem;">
 
  
</div>
</div>
</div>





    <!-- <h1 class="text-center font-weight-bold">Estadisticas de Escuelas de Guatemala</h1>
    <v-card style="padding-inline: 10px; width: 110%; display: flex; gap: 10px;">
      <div style="flex: 0 0 40%;">
        <GuateMap />
      </div>

      <div style="flex: 0 0 50%;">
        <br>
        <br>
        <TableView />
      </div>
    </v-card>
    <div style="padding-inline: 10px; width: 100%; display: flex;">
      <DonaChart /> -->
      <!-- <div style="flex: 0 0 60%;">
        <LineChart2 />
      </div>

      <div style="flex: 0 0 40%;">
        <DonaChart />
      </div>  -->


      <!-- <BarChart />
         -->
    <!-- </div>
    <br>
    <br>
    <hr>
    <br>
    <br> -->


  </v-container>
</template>

<script setup>
import DonaChart from "../components/DonaChart.vue";
import BarChart from "../components/BarChart.vue";
import GuateMap from "../components/GuateMap.vue"
import PieChart from "../components/PieChart.vue";
import TableView from "../components/TableView.vue";
import LineChart from "../components/LineChart.vue";
import LineChart2 from "../components/LineChart2.vue";
</script>



<style scoped>
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