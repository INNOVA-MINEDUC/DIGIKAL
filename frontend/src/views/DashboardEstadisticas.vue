<template>
  <v-container fluid class="estadisticas">
    <header class="estadisticas-encabezado">
      <h1>Estadísticas de dotación, conectividad y formación</h1>
      <p>
        Avance del programa de dotación tecnológica de DIGECADE en el marco de la
        Política DIGIKAL 2025-2035.
      </p>
    </header>

    <!-- Los filtros van en una sola fila arriba de todo: aplican al tablero completo -->
    <div class="filtros" role="group" aria-label="Filtros del tablero">
      <label>
        Año
        <select :value="store.filtros.anio ?? ''" @change="store.setFiltro('anio', $event.target.value)">
          <option value="">Todos</option>
          <option v-for="anio in store.opciones.anios" :key="anio" :value="anio">{{ anio }}</option>
        </select>
      </label>

      <label>
        Ciclo
        <select :value="store.filtros.ciclo ?? ''" @change="store.setFiltro('ciclo', $event.target.value)">
          <option value="">Todos</option>
          <option v-for="ciclo in store.opciones.ciclos" :key="ciclo.valor" :value="ciclo.valor">
            {{ ciclo.etiqueta }}
          </option>
        </select>
      </label>

      <label>
        Departamento
        <select
          :value="store.filtros.departamento ?? ''"
          @change="store.setFiltro('departamento', $event.target.value)"
        >
          <option value="">Todos</option>
          <option v-for="depto in store.opciones.departamentos" :key="depto" :value="depto">
            {{ depto }}
          </option>
        </select>
      </label>

      <button v-if="store.hayFiltros" type="button" class="filtros-limpiar" @click="store.limpiarFiltros()">
        Limpiar filtros
      </button>

      <span v-if="store.loading" class="filtros-estado">Cargando…</span>
    </div>

    <p v-if="store.error" class="estadisticas-error">{{ store.error }}</p>

    <section class="bloque">
      <KpiTiles />
    </section>

    <!-- Mapa y tabla van encimados: la tarjeta del mapa traslapa el borde
         superior de la tabla para que se lean como un solo bloque territorial -->
    <section class="bloque bloque--capas">
      <div class="capa-mapa">
        <MapaEstadisticas />
      </div>

      <div class="capa-tabla">
        <TablaEstadisticas />
      </div>
    </section>

    <section class="bloque bloque--dos">
      <CicloAnioChart />
      <AnioComparativo />
    </section>

    <p class="estadisticas-nota">
      Datos de prueba: las cifras provienen de la semilla del backend
      (<code>services/estadisticasData.js</code>), no del API MDM.
    </p>
  </v-container>

  <HomeFooter />
</template>

<script setup>
import { onMounted } from 'vue'

import KpiTiles from '@/components/estadisticas/KpiTiles.vue'
import MapaEstadisticas from '@/components/estadisticas/MapaEstadisticas.vue'
import TablaEstadisticas from '@/components/estadisticas/TablaEstadisticas.vue'
import CicloAnioChart from '@/components/estadisticas/CicloAnioChart.vue'
import AnioComparativo from '@/components/estadisticas/AnioComparativo.vue'
import HomeFooter from '@/components/HomeFooter.vue'

import { useEstadisticasStore } from '@/stores/estadisticasStore'

const store = useEstadisticasStore()

onMounted(() => store.cargar())
</script>

<style scoped>
.estadisticas {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 32px 24px 48px;
  background: #f9f9f7;
}

.estadisticas-encabezado h1 {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  color: #0d3b5d;
}

.estadisticas-encabezado p {
  margin: 0;
  font-size: 14px;
  color: #52514e;
  max-width: 75ch;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
  background: #ffffff;
  border: 1px solid rgba(11, 11, 11, 0.08);
  border-radius: 16px;
  padding: 14px 18px;
}

.filtros label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #898781;
}

.filtros select {
  padding: 7px 12px;
  border: 1px solid #c3c2b7;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  background: #ffffff;
  color: #0d3b5d;
  min-width: 150px;
}

.filtros-limpiar {
  padding: 8px 14px;
  border: 1px solid #c3c2b7;
  border-radius: 999px;
  background: #ffffff;
  font-size: 12px;
  color: #0d3b5d;
  cursor: pointer;
}

.filtros-estado {
  font-size: 12px;
  color: #898781;
}

/* Efecto de capas: el mapa flota sobre la tabla y la tabla asoma por debajo */
.bloque--capas {
  position: relative;
}

.capa-mapa {
  position: relative;
  z-index: 2;
  box-shadow: 0 12px 28px rgba(13, 59, 93, 0.14);
  border-radius: 16px;
}

.capa-tabla {
  position: relative;
  z-index: 1;
  margin-top: -40px;
}

/* El borde superior de la tabla queda tapado por el mapa: se le da padding
   extra por dentro para que su encabezado no caiga bajo la otra tarjeta */
.capa-tabla :deep(.tabla-bloque) {
  padding-top: 60px;
}

/* En pantallas angostas el traslape aprieta demasiado: se apilan normal */
@media (max-width: 720px) {
  .capa-tabla {
    margin-top: 16px;
  }

  .capa-tabla :deep(.tabla-bloque) {
    padding-top: 20px;
  }
}

.bloque--dos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}

.estadisticas-error {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fdecec;
  color: #d03b3b;
  font-size: 13px;
}

.estadisticas-nota {
  margin: 0;
  font-size: 12px;
  color: #898781;
}

.estadisticas-nota code {
  background: #f0efec;
  padding: 1px 5px;
  border-radius: 4px;
}
</style>
