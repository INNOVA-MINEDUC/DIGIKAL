<template>
  <div class="mapa-ciudadania">
    <div id="chartdiv-ciudadania" class="mapa-ciudadania__lienzo"></div>

    <!-- Leyenda de intensidad. Se dibuja en HTML/CSS y no con amCharts: para
         un simple degradado de dos colores no hace falta añadir más superficie
         de la librería de mapas, y así es trivial de leer y mantener. -->
    <div class="mapa-ciudadania__leyenda">
      <span class="mapa-ciudadania__leyenda-etiqueta">Menos tabletas</span>
      <div class="mapa-ciudadania__leyenda-barra"></div>
      <span class="mapa-ciudadania__leyenda-etiqueta">Más tabletas</span>
    </div>
  </div>
</template>

<script setup>
/**
 * Mapa de Guatemala coloreado por cantidad de tablets de Ciudadanía Digikal
 * por departamento (choropleth).
 *
 * Deliberadamente NO reutiliza GuateMap2.vue: ese componente está enganchado a
 * mapStore/escuelasStore para pilotar el filtro de la tabla de dotaciones, y
 * aquí el color de cada departamento depende de un dato completamente distinto
 * (tablets, no escuelas dotadas). Comparten sólo la base de amCharts5 + el
 * mismo GeoJSON de departamentos, que sí es apropiado reutilizar.
 *
 * El color se calcula con un `adapter` sobre `fill`, no con `heatRules` +
 * `series.data.setAll()`: ese mecanismo de amCharts5 enlaza los datos con los
 * polígonos por el `id` de nivel superior del GeoJSON, y este archivo
 * (Departamentos2.json) no lo trae — sólo `properties.departamen`. Con un
 * adapter se lee directamente esa propiedad, que es justo lo que ya hace
 * GuateMap2 para todo lo demás, así que es el camino ya probado en este
 * proyecto.
 */
import { onMounted, onBeforeUnmount } from 'vue'
import * as am5 from '@amcharts/amcharts5'
import * as am5map from '@amcharts/amcharts5/map'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import guatemalaDepartamentos from '../helpers/Departamentos2.json'

const props = defineProps({
  /** [{ departamento: string, cantidad: number }] */
  datos: { type: Array, default: () => [] },
})

// Mismo criterio de normalización que el backend (controllers/CiudadaniaController.js)
// y que GuateMap2: minúsculas, sin tildes. Sin esto, "Sacatepéquez" (GeoJSON) y
// "sacatepequez" o "Sacatepéquez " (como haya quedado guardado el dato) no
// emparejan y ese departamento se ve siempre vacío aunque tenga tablets.
const norm = (s) => (s ?? '').toString()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^\w\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const COLOR_SIN_DATOS = 0xe2e8f0   // gris muy claro: departamento sin tablets
const COLOR_MIN = 0xdbe9f4        // azul claro: el que menos tiene (de los que sí tienen)
const COLOR_MAX = 0x003366        // azul marino institucional: el que más tiene

let root

onMounted(() => {
  const mapaCantidades = new Map(
    props.datos.map((d) => [norm(d.departamento), Number(d.cantidad) || 0])
  )
  const maximo = Math.max(1, ...props.datos.map((d) => Number(d.cantidad) || 0));

  root = am5.Root.new('chartdiv-ciudadania')
  root._logo?.dispose()
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: 'translateX',
      panY: 'translateY',
      // Igual que en GuateMap2: la rueda no hace zoom, para no capturar el
      // scroll de la página cuando el cursor pasa sobre el mapa.
      wheelX: 'none',
      wheelY: 'none',
      projection: am5map.geoMercator(),
    })
  )

  chart.set('zoomControl', am5map.ZoomControl.new(root, {}))

  const series = chart.series.push(
    am5map.MapPolygonSeries.new(root, { geoJSON: guatemalaDepartamentos })
  )

  series.mapPolygons.template.setAll({
    interactive: true,
    strokeWidth: 1,
    stroke: am5.color(0xffffff),
  })

  series.mapPolygons.template.states.create('hover', {
    fill: am5.color(0x03bfcb),
  })

  // El color se calcula al vuelo a partir del nombre del departamento que trae
  // cada polígono del GeoJSON — no depende de un enlace de datos externo.
  series.mapPolygons.template.adapters.add('fill', (fill, target) => {
    const nombre = target.dataItem?.dataContext?.departamen
    const cantidad = mapaCantidades.get(norm(nombre)) ?? 0
    if (cantidad === 0) return am5.color(COLOR_SIN_DATOS)

    const ratio = Math.min(1, cantidad / maximo)
    return am5.Color.interpolate(ratio, am5.color(COLOR_MIN), am5.color(COLOR_MAX))
  })

  series.mapPolygons.template.adapters.add('tooltipText', (_texto, target) => {
    const nombre = target.dataItem?.dataContext?.departamen ?? 'Departamento'
    const cantidad = mapaCantidades.get(norm(nombre)) ?? 0
    return cantidad === 1
      ? `${nombre}\n1 tableta registrada`
      : `${nombre}\n${cantidad} tabletas registradas`
  })
})

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
.mapa-ciudadania {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mapa-ciudadania__lienzo {
  width: 100%;
  flex: 1;
  min-height: 360px;
}

.mapa-ciudadania__leyenda {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 12px 4px;
}

.mapa-ciudadania__leyenda-etiqueta {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.mapa-ciudadania__leyenda-barra {
  width: 140px;
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #dbe9f4 0%, #003366 100%);
}
</style>
