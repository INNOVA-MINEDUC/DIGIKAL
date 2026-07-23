<template>
  <figure class="mapa-figure">
    <figcaption>
      <h3>Distribución territorial</h3>
      <p>
        Intensidad del color = magnitud de la métrica. Un solo tono, de claro a
        oscuro. Clic en un departamento para filtrar todo el tablero.
      </p>
    </figcaption>

    <!-- El mapa es el lienzo; los paneles van superpuestos encima -->
    <div class="mapa-marco">
      <div ref="contenedor" class="mapa-lienzo"></div>

      <div class="mapa-overlay mapa-overlay--controles">
        <label for="metrica-mapa">Métrica</label>
        <select id="metrica-mapa" v-model="metrica">
          <option v-for="(etiqueta, clave) in ETIQUETAS_METRICA" :key="clave" :value="clave">
            {{ etiqueta }}
          </option>
        </select>

        <div class="leyenda-rampa">
          <span class="leyenda-tope">{{ formatearNumero(rango.min) }}</span>
          <div class="rampa">
            <span v-for="paso in RAMPA_SECUENCIAL" :key="paso" :style="{ background: paso }"></span>
          </div>
          <span class="leyenda-tope">{{ formatearNumero(rango.max) }}</span>
        </div>
      </div>

      <div class="mapa-overlay mapa-overlay--detalle">
        <template v-if="detalle">
          <h4>{{ detalle.departamento }}</h4>
          <dl>
            <div><dt>Establecimientos</dt><dd>{{ formatearNumero(detalle.establecimientos) }}</dd></div>
            <div><dt>Equipos</dt><dd>{{ formatearNumero(detalle.equipos) }}</dd></div>
            <div><dt>Beneficiados</dt><dd>{{ formatearNumero(detalle.beneficiados) }}</dd></div>
            <div><dt>Con conectividad</dt><dd>{{ formatearNumero(detalle.conectividad) }}</dd></div>
            <div><dt>Con formación</dt><dd>{{ formatearNumero(detalle.formacion) }}</dd></div>
            <div><dt>Municipios</dt><dd>{{ formatearNumero(detalle.municipios) }}</dd></div>
          </dl>
        </template>
        <p v-else class="detalle-vacio">Pasá el cursor sobre un departamento para ver su detalle.</p>
      </div>

      <button
        v-if="store.filtros.departamento"
        class="mapa-overlay mapa-overlay--reset"
        type="button"
        @click="store.setFiltro('departamento', null)"
      >
        Ver todo el país
      </button>
    </div>
  </figure>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import * as am5 from '@amcharts/amcharts5'
import * as am5map from '@amcharts/amcharts5/map'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

import geoDepartamentos from '@/helpers/Departamentos2.json'
import { CROMO, RAMPA_SECUENCIAL, colorSecuencial, formatearNumero } from '@/helpers/vizPalette.js'
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
const metrica = ref('establecimientos')
const detalle = ref(null)

let root
let serie

// El GeoJSON trae artefactos ("­", "º") en algunos nombres: se comparan normalizados.
const norm = (valor) =>
  String(valor ?? '')
    .replace(/[­º]/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

const porDepartamento = computed(() => {
  const mapa = new Map()
  for (const fila of store.porDepartamento) mapa.set(norm(fila.departamento), fila)
  return mapa
})

const rango = computed(() => {
  const valores = store.porDepartamento.map((f) => f[metrica.value] ?? 0)
  return valores.length
    ? { min: Math.min(...valores), max: Math.max(...valores) }
    : { min: 0, max: 0 }
})

/** Pinta cada polígono según su valor en la métrica activa. */
const pintar = () => {
  if (!serie) return
  const { min, max } = rango.value

  serie.mapPolygons.each((poligono) => {
    const fila = porDepartamento.value.get(norm(poligono.dataItem?.dataContext?.departamen))
    poligono.set(
      'fill',
      am5.color(fila ? colorSecuencial(fila[metrica.value] ?? 0, min, max) : CROMO.sinDato)
    )
  })
}

onMounted(() => {
  root = am5.Root.new(contenedor.value)
  root._logo?.dispose()
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: 'translateX',
      panY: 'translateY',
      wheelX: 'none',
      wheelY: 'none',
      projection: am5map.geoMercator(),
    })
  )

  serie = chart.series.push(
    am5map.MapPolygonSeries.new(root, { geoJSON: geoDepartamentos })
  )

  serie.mapPolygons.template.setAll({
    interactive: true,
    // anillo de 1px del color de la superficie: separa polígonos vecinos del
    // mismo paso de la rampa, que si no se leerían como una sola mancha
    stroke: am5.color(CROMO.superficie),
    strokeWidth: 1,
    tooltipText: '{departamen}',
  })

  serie.mapPolygons.template.states.create('hover', { fillOpacity: 0.75 })

  serie.mapPolygons.template.events.on('pointerover', (ev) => {
    detalle.value = porDepartamento.value.get(norm(ev.target.dataItem?.dataContext?.departamen)) ?? null
  })

  serie.mapPolygons.template.events.on('click', (ev) => {
    const nombre = ev.target.dataItem?.dataContext?.departamen
    const fila = porDepartamento.value.get(norm(nombre))
    if (fila) store.setFiltro('departamento', fila.departamento)
  })

  serie.events.on('datavalidated', pintar)
  pintar()
})

watch([() => store.porDepartamento, metrica], pintar, { deep: true })

onBeforeUnmount(() => {
  root?.dispose()
})
</script>

<style scoped>
.mapa-figure {
  margin: 0;
  background: #ffffff;
  border: 1px solid rgba(11, 11, 11, 0.08);
  border-radius: 16px;
  padding: 20px;
}

.mapa-figure figcaption h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #0d3b5d;
}

.mapa-figure figcaption p {
  margin: 0 0 12px;
  font-size: 12px;
  color: #898781;
  max-width: 60ch;
}

/* El marco es el contexto de apilamiento: todo .mapa-overlay flota sobre el mapa */
.mapa-marco {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f9f9f7;
}

.mapa-lienzo {
  width: 100%;
  height: 560px;
}

.mapa-overlay {
  position: absolute;
  z-index: 2;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(11, 11, 11, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  backdrop-filter: blur(4px);
}

.mapa-overlay--controles {
  top: 14px;
  left: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 12px;
  color: #52514e;
}

.mapa-overlay--controles select {
  padding: 6px 10px;
  border: 1px solid #c3c2b7;
  border-radius: 8px;
  font-size: 12px;
  background: #ffffff;
  color: #0d3b5d;
}

.leyenda-rampa {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rampa {
  display: flex;
  height: 10px;
  width: 130px;
  border-radius: 3px;
  overflow: hidden;
}

.rampa span {
  flex: 1;
}

.leyenda-tope {
  font-size: 10px;
  color: #898781;
  font-variant-numeric: tabular-nums;
}

.mapa-overlay--detalle {
  top: 14px;
  right: 14px;
  min-width: 210px;
  max-width: 260px;
}

.mapa-overlay--detalle h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0d3b5d;
}

.mapa-overlay--detalle dl {
  margin: 0;
  display: grid;
  gap: 4px;
}

.mapa-overlay--detalle dl > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
}

.mapa-overlay--detalle dt {
  color: #898781;
}

.mapa-overlay--detalle dd {
  margin: 0;
  font-weight: 600;
  color: #0d3b5d;
  font-variant-numeric: tabular-nums;
}

.detalle-vacio {
  margin: 0;
  font-size: 12px;
  color: #898781;
}

.mapa-overlay--reset {
  bottom: 14px;
  left: 14px;
  font-size: 12px;
  font-weight: 600;
  color: #0d3b5d;
  cursor: pointer;
}

@media (max-width: 720px) {
  .mapa-overlay--detalle {
    position: static;
    margin-top: 12px;
    max-width: none;
  }
}
</style>
