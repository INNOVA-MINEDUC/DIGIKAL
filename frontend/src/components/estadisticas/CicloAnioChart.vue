<template>
  <figure class="chart-figure">
    <figcaption>
      <h3>{{ ETIQUETAS_METRICA[metrica] }} por ciclo educativo</h3>
      <p>Comparación entre años. Una métrica a la vez: mezclar escalas distintas en un mismo eje falsea la lectura.</p>
    </figcaption>

    <div class="chart-controles">
      <label for="metrica-ciclo">Métrica</label>
      <select id="metrica-ciclo" v-model="metrica">
        <option v-for="(etiqueta, clave) in ETIQUETAS_METRICA" :key="clave" :value="clave">
          {{ etiqueta }}
        </option>
      </select>
    </div>

    <div ref="contenedor" class="chart-lienzo"></div>

    <ul class="chart-leyenda">
      <li v-for="(anio, i) in anios" :key="anio">
        <span class="swatch" :style="{ background: colorSerie(i) }"></span>{{ anio }}
      </li>
    </ul>
  </figure>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

import { CROMO, colorSerie, formatearNumero } from '@/helpers/vizPalette.js'
import { useEstadisticasStore } from '@/stores/estadisticasStore'

const ETIQUETAS_METRICA = {
  establecimientos: 'Establecimientos',
  equipos: 'Equipos entregados',
  beneficiados: 'Estudiantes beneficiados',
  conectividad: 'Centros con conectividad',
  formacion: 'Beneficiados con formación',
}

const store = useEstadisticasStore()
const contenedor = ref(null)
const metrica = ref('beneficiados')

let root
let chart
let xAxis
const seriesPorAnio = new Map()

const anios = computed(() =>
  [...new Set(store.porCicloAnio.map((f) => f.anio))].sort()
)

/** Una fila por ciclo, una columna por año: { ciclo, '2025': n, '2026': n }. */
const datos = computed(() => {
  const porCiclo = new Map()

  for (const fila of store.porCicloAnio) {
    let entrada = porCiclo.get(fila.ciclo)
    if (!entrada) {
      entrada = { ciclo: fila.cicloEtiqueta ?? fila.ciclo }
      porCiclo.set(fila.ciclo, entrada)
    }
    entrada[String(fila.anio)] = fila[metrica.value] ?? 0
  }

  return [...porCiclo.values()]
})

const construirSeries = () => {
  // Un año que desaparece del corte no debe repintar a los que quedan: las
  // series se reconstruyen, pero el color sigue al año por su índice fijo.
  for (const serie of seriesPorAnio.values()) chart.series.removeValue(serie)
  seriesPorAnio.clear()

  anios.value.forEach((anio, indice) => {
    const serie = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: String(anio),
        xAxis,
        yAxis: chart.yAxes.getIndex(0),
        valueYField: String(anio),
        categoryXField: 'ciclo',
        tooltip: am5.Tooltip.new(root, { labelText: '{name}: {valueY}' }),
      })
    )

    serie.columns.template.setAll({
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      strokeOpacity: 0,
      fill: am5.color(colorSerie(indice)),
      width: am5.percent(85),
      // 2px de superficie entre barras vecinas para que no se toquen
      marginLeft: 1,
      marginRight: 1,
    })

    // Etiqueta directa sobre cada barra: la identidad no depende sólo del color.
    serie.bullets.push(() =>
      am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: '{valueY}',
          centerX: am5.p50,
          centerY: am5.p100,
          dy: -6,
          fontSize: 11,
          fill: am5.color(CROMO.tintaSecundaria),
          populateText: true,
        }),
      })
    )

    serie.data.setAll(datos.value)
    serie.appear(600)
    seriesPorAnio.set(anio, serie)
  })
}

const refrescar = () => {
  if (!chart) return
  xAxis.data.setAll(datos.value)
  construirSeries()
}

onMounted(() => {
  root = am5.Root.new(contenedor.value)
  root._logo?.dispose()
  root.setThemes([am5themes_Animated.new(root)])

  chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: 'none',
      wheelY: 'none',
      layout: root.verticalLayout,
      paddingLeft: 0,
    })
  )

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 })
  xRenderer.grid.template.setAll({ visible: false })
  xRenderer.labels.template.setAll({ fontSize: 12, fill: am5.color(CROMO.tintaSecundaria) })

  xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'ciclo',
      renderer: xRenderer,
    })
  )

  const yRenderer = am5xy.AxisRendererY.new(root, { strokeOpacity: 0 })
  yRenderer.grid.template.setAll({ stroke: am5.color(CROMO.rejilla), strokeOpacity: 1 })
  yRenderer.labels.template.setAll({ fontSize: 11, fill: am5.color(CROMO.tintaTenue) })

  chart.yAxes.push(
    am5xy.ValueAxis.new(root, { renderer: yRenderer, min: 0 })
  )

  chart.set('cursor', am5xy.XYCursor.new(root, { behavior: 'none' }))

  refrescar()
  chart.appear(600, 100)
})

watch([() => store.porCicloAnio, metrica], refrescar, { deep: true })

onBeforeUnmount(() => {
  root?.dispose()
})
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
  margin: 0 0 12px;
  font-size: 12px;
  color: #898781;
  max-width: 60ch;
}

.chart-controles {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #52514e;
}

.chart-controles select {
  padding: 6px 10px;
  border: 1px solid #c3c2b7;
  border-radius: 8px;
  font-size: 12px;
  background: #ffffff;
  color: #0d3b5d;
}

.chart-lienzo {
  width: 100%;
  height: 340px;
}

.chart-leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  list-style: none;
  margin: 12px 0 0;
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
