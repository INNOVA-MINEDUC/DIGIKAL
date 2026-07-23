<template>
  <figure class="chart-figure">
    <figcaption>
      <h3>Avance por año</h3>
      <p>
        Cada métrica en su propio panel y su propia escala. Son magnitudes muy
        distintas (centros vs. estudiantes): compartir un eje las volvería ilegibles.
      </p>
    </figcaption>

    <div class="paneles">
      <section v-for="panel in paneles" :key="panel.clave" class="panel">
        <h4>{{ panel.etiqueta }}</h4>

        <div v-for="barra in panel.barras" :key="barra.anio" class="barra-fila">
          <span class="barra-anio">{{ barra.anio }}</span>
          <div class="barra-pista">
            <div
              class="barra-relleno"
              :style="{ width: barra.porcentaje + '%', background: barra.color }"
            ></div>
          </div>
          <span class="barra-valor">{{ formatearNumero(barra.valor) }}</span>
        </div>

        <p v-if="panel.variacion !== null" class="panel-variacion">
          {{ panel.variacion >= 0 ? '▲' : '▼' }}
          {{ Math.abs(panel.variacion) }}% respecto al año anterior
        </p>
      </section>
    </div>

    <ul class="chart-leyenda">
      <li v-for="(anio, i) in anios" :key="anio">
        <span class="swatch" :style="{ background: colorSerie(i) }"></span>{{ anio }}
      </li>
    </ul>
  </figure>
</template>

<script setup>
import { computed } from 'vue'
import { colorSerie, formatearNumero } from '@/helpers/vizPalette.js'
import { useEstadisticasStore } from '@/stores/estadisticasStore'

const store = useEstadisticasStore()

const METRICAS = [
  { clave: 'establecimientos', etiqueta: 'Establecimientos' },
  { clave: 'equipos', etiqueta: 'Equipos entregados' },
  { clave: 'beneficiados', etiqueta: 'Estudiantes beneficiados' },
  { clave: 'formacion', etiqueta: 'Beneficiados con formación' },
]

const anios = computed(() => store.porAnio.map((f) => f.anio))

const paneles = computed(() =>
  METRICAS.map(({ clave, etiqueta }) => {
    const valores = store.porAnio.map((f) => f[clave] ?? 0)
    const max = Math.max(...valores, 1)

    const barras = store.porAnio.map((fila, i) => ({
      anio: fila.anio,
      valor: fila[clave] ?? 0,
      // la barra se escala contra el máximo del panel, no contra otros paneles
      porcentaje: ((fila[clave] ?? 0) / max) * 100,
      color: colorSerie(i),
    }))

    // variación sólo tiene sentido con al menos dos años y una base distinta de 0
    const [previo, ultimo] = valores.slice(-2)
    const variacion =
      valores.length >= 2 && previo > 0
        ? Math.round(((ultimo - previo) / previo) * 1000) / 10
        : null

    return { clave, etiqueta, barras, variacion }
  })
)
</script>

<style scoped>
.chart-figure {
  margin: 0;
  background: #ffffff;
  border: 1px solid rgba(11, 11, 11, 0.08);
  border-radius: 16px;
  padding: 20px;
}

.chart-figure figcaption h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #0d3b5d;
}

.chart-figure figcaption p {
  margin: 0 0 16px;
  font-size: 12px;
  color: #898781;
  max-width: 60ch;
}

.paneles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.panel h4 {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #52514e;
}

.barra-fila {
  display: grid;
  grid-template-columns: 38px 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.barra-anio {
  font-size: 11px;
  color: #898781;
  font-variant-numeric: tabular-nums;
}

.barra-pista {
  background: #f3f3f1;
  border-radius: 4px;
  height: 14px;
  overflow: hidden;
}

.barra-relleno {
  height: 100%;
  border-radius: 0 4px 4px 0;
  min-width: 2px;
}

.barra-valor {
  font-size: 12px;
  font-weight: 600;
  color: #0d3b5d;
  font-variant-numeric: tabular-nums;
}

.panel-variacion {
  margin: 8px 0 0;
  font-size: 11px;
  color: #898781;
}

.chart-leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  font-size: 12px;
  color: #52514e;
}

.chart-leyenda li {
  display: flex;
  align-items: center;
  gap: 6px;
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}
</style>
