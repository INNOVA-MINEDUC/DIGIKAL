<template>
  <div id="chartdivmap"></div>
</template>

<script setup>
import { useMapStore } from "@/stores/mapStore"

import * as am5 from "@amcharts/amcharts5"
import * as am5map from "@amcharts/amcharts5/map"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { onMounted, onBeforeUnmount } from "vue"
import { useEstablecimientosStore } from '@/stores/escuelasStore'

import guatemalaDepartamentos from "../helpers/Departamentos2.json"
import guatemalaMunicipios from "../helpers/Municipios2.json"

const mapStore = useMapStore()

// Helpers para comparar nombres del GeoJSON sin depender de mayúsculas/espacios.
const norm = (s) => (s ?? "").toString().trim().toLowerCase()
const nombreDep = (dc) => dc?.departamen || dc?.properties?.departamen || ""
const nombreMun = (dc) => dc?.municipio || dc?.properties?.municipio || ""

let root

onMounted(() => {
  root = am5.Root.new("chartdivmap")
  root._logo.dispose()
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: "translateX",
      panY: "translateY",
      // La rueda NO hace zoom: así capturarla no bloquea el scroll de la
      // página cuando el cursor está sobre el mapa. El zoom queda en los
      // botones +/- y en el clic sobre cada departamento.
      wheelX: "none",
      wheelY: "none",
      projection: am5map.geoMercator()
    })
  )

  // Botones de zoom, en reemplazo del zoom con rueda.
  chart.set("zoomControl", am5map.ZoomControl.new(root, {}))

  const establecimientosStore = useEstablecimientosStore()

  const handleSelection = async (type = "all", data = {}) => {
    // Al cambiar el filtro se vuelve a la primera página. La llamada y la
    // paginación las maneja el store (server-side).
    await establecimientosStore.fetchDashboard({
      dept: type === "all" ? null : data.departamen,
      muni: type === "all" ? null : data.municipio,
      pagina: 1,
    })

    mapStore.setSelection({
      type,
      departamento: data.departamen,
      municipio: data.municipio
    })
  }

  // Sólo carga la primera vez. Al volver del detalle de una escuela, el filtro,
  // la página y los datos siguen vivos en el store: no se resetea nada.
  establecimientosStore.iniciar()


  const departamentosSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: guatemalaDepartamentos
    })
  )

  departamentosSeries.mapPolygons.template.setAll({
    tooltipText: "{departamen}",
    interactive: true,
    fill: am5.color("#0d3b5d")
  })

  departamentosSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color("#03bfcb")
  })

  const municipiosSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, { visible: false })
  )

  municipiosSeries.mapPolygons.template.setAll({
    tooltipText: "{municipio}",
    interactive: true,
    fill: am5.color("#0d3b5d")
  })

  municipiosSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color("#03bfcb")
  })

  const municipioSeleccionadoSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, { visible: false })
  )

  municipioSeleccionadoSeries.mapPolygons.template.setAll({
    tooltipText: "{municipio}",
    interactive: true,
    fill: am5.color("#0d3b5d")
  })

  municipioSeleccionadoSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color("#03bfcb")
  })

  const backContainer = chart.children.push(
    am5.Container.new(root, {
      x: am5.p100,
      centerX: am5.p100,
      dx: -10,
      y: 30,
      layout: root.horizontalLayout,
      cursorOverStyle: "pointer",
      background: am5.RoundedRectangle.new(root, {
        fill: am5.color(0xffffff),
        fillOpacity: 0.2
      }),
      visible: false
    })
  )


  backContainer.children.push(
    am5.Label.new(root, {
      text: "🔙 Regresar",
      centerY: am5.p50
    })
  )

  let lastDepartamentoDataItem = null

  // Zoom a un departamento + mostrar sus municipios. `cargarDatos` distingue el
  // clic del usuario (pide datos, resetea a página 1) de la restauración al
  // volver del detalle (sólo visual: los datos y la página ya están en el store).
  const mostrarDepartamento = (dataItem, { cargarDatos = false } = {}) => {
    const data = dataItem.dataContext
    if (cargarDatos) handleSelection("departamento", data)

    lastDepartamentoDataItem = dataItem

    const depData = norm(nombreDep(data))
    const filtered = guatemalaMunicipios.features.filter(
      (f) => norm(f?.properties?.departamen) === depData
    )

    if (filtered.length === 0) {
      console.warn("No se encontraron municipios para este departamento")
      return
    }

    const filteredMunicipios = { type: "FeatureCollection", features: filtered }
    const zoomAnimation = departamentosSeries.zoomToDataItem(dataItem)

    Promise.all([zoomAnimation.waitForStop()]).then(() => {
      municipiosSeries.set("geoJSON", filteredMunicipios)
      municipiosSeries.show()
      departamentosSeries.hide(100)
      backContainer.show()
    })
  }

  // Zoom a un municipio concreto (mismo esquema cargarDatos que arriba).
  const mostrarMunicipio = (dataItem, { cargarDatos = false } = {}) => {
    const data = dataItem.dataContext
    if (cargarDatos) handleSelection("municipio", data)

    const munData = norm(nombreMun(data))
    const filtered = guatemalaMunicipios.features.filter(
      (f) => norm(f?.properties?.municipio) === munData
    )

    const municipioUnico = { type: "FeatureCollection", features: filtered }
    const zoomAnimation = municipiosSeries.zoomToDataItem(dataItem)

    Promise.all([zoomAnimation.waitForStop()]).then(() => {
      municipioSeleccionadoSeries.set("geoJSON", municipioUnico)
      municipioSeleccionadoSeries.show()
      municipiosSeries.hide(100)
      backContainer.show()
    })
  }

  departamentosSeries.mapPolygons.template.events.on("click", (ev) => {
    mostrarDepartamento(ev.target.dataItem, { cargarDatos: true })
  })

  municipiosSeries.mapPolygons.template.events.on("click", (ev) => {
    mostrarMunicipio(ev.target.dataItem, { cargarDatos: true })
  })


  backContainer.events.on("click", () => {
    if (municipioSeleccionadoSeries.get("visible")) {
      municipioSeleccionadoSeries.hide()
      municipiosSeries.show()

      if (lastDepartamentoDataItem) {
        departamentosSeries.zoomToDataItem(lastDepartamentoDataItem)
        handleSelection("departamento", {
          departamen: lastDepartamentoDataItem.dataContext.departamen
        })
      }
    } else {
      chart.goHome()
      departamentosSeries.show()
      municipiosSeries.hide()
      backContainer.hide()

      mapStore.reset()

      handleSelection("all")

    }
  })

  // ── Restauración de la vista del mapa ────────────────────────────────────
  // Al volver del detalle (o tras un F5) se reconstruye el mapa desde cero. Si
  // había un departamento/municipio seleccionado, se vuelve a hacer el zoom sin
  // pedir datos (los datos y la página ya están en el store), para que el mapa
  // aparezca donde el usuario lo dejó y no en la vista completa.
  let yaRestaurado = false
  departamentosSeries.events.on("datavalidated", () => {
    if (yaRestaurado) return
    yaRestaurado = true

    const tipo = mapStore.type
    if ((tipo !== "departamento" && tipo !== "municipio") || !mapStore.departamento) return

    const diDep = departamentosSeries.dataItems.find(
      (di) => norm(nombreDep(di.dataContext)) === norm(mapStore.departamento)
    )
    if (!diDep) return

    // Si además había un municipio seleccionado, se engancha para cuando la
    // serie de municipios de ese departamento termine de cargar.
    if (tipo === "municipio" && mapStore.municipio) {
      const disposer = municipiosSeries.events.on("datavalidated", () => {
        disposer.dispose()
        const diMun = municipiosSeries.dataItems.find(
          (di) => norm(nombreMun(di.dataContext)) === norm(mapStore.municipio)
        )
        if (diMun) mostrarMunicipio(diMun, { cargarDatos: false })
      })
    }

    mostrarDepartamento(diDep, { cargarDatos: false })
  })
})

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
#chartdivmap {
  width: 100%;
  height: 650px;
  filter: drop-shadow(2px 20px 12px);
}
</style>
