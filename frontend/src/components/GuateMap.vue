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

import guatemalaDepartamentos from "../helpers/Departamentos.json"
import guatemalaMunicipios from "../helpers/Municipios.json"
import axios from "axios"

const mapStore = useMapStore()

let root

onMounted(() => {
  root = am5.Root.new("chartdivmap")
  root._logo.dispose()
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: "translateX",
      panY: "translateY",
      wheelX: "zoomX",
      wheelY: "zoomY",
      projection: am5map.geoMercator()
    })
  )

const establecimientosStore = useEstablecimientosStore()

const handleSelection = async (type, data = {}) => {

  try {
    establecimientosStore.setLoading(true)

    const res = await axios.post(
      "http://localhost:3000/api/v1/dashboard",
      { id: data.ID }
    )

    // 🔥 Aquí llenas el store con la response
    establecimientosStore.setEstablecimientos(
      res.data.establecimientos || res.data
    )

  } catch (error) {
    console.error("Error cargando dashboard:", error)
  } finally {
    establecimientosStore.setLoading(false)
  }

  mapStore.setSelection({
    type,
    departamento: data.NAME_1 || null,
    municipio: data.NAME_2 || null
  })
}

  const departamentosSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: guatemalaDepartamentos
    })
  )

  departamentosSeries.mapPolygons.template.setAll({
    tooltipText: "{NAME_1}",
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
    tooltipText: "{NAME_2}",
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
    tooltipText: "{NAME_2}",
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

  // 📍 CLICK DEPARTAMENTO
  departamentosSeries.mapPolygons.template.events.on("click", (ev) => {
    const dataItem = ev.target.dataItem
    const data = dataItem.dataContext

    handleSelection("departamento", data)

    lastDepartamentoDataItem = dataItem

    const filteredMunicipios = {
      type: "FeatureCollection",
      features: guatemalaMunicipios.features.filter(
        (f) => f.properties.NAME_1 === data.NAME_1
      )
    }

    const zoomAnimation = departamentosSeries.zoomToDataItem(dataItem)

    Promise.all([zoomAnimation.waitForStop()]).then(() => {
      municipiosSeries.set("geoJSON", filteredMunicipios)
      municipiosSeries.show()
      departamentosSeries.hide(100)
      backContainer.show()
    })
  })

  // 📍 CLICK MUNICIPIO
  municipiosSeries.mapPolygons.template.events.on("click", (ev) => {
    const dataItem = ev.target.dataItem
    const data = dataItem.dataContext

    handleSelection("municipio", data)

    const municipioUnico = {
      type: "FeatureCollection",
      features: guatemalaMunicipios.features.filter(
        (f) => f.properties.NAME_2 === data.NAME_2
      )
    }

    const zoomAnimation = municipiosSeries.zoomToDataItem(dataItem)

    Promise.all([zoomAnimation.waitForStop()]).then(() => {
      municipioSeleccionadoSeries.set("geoJSON", municipioUnico)
      municipioSeleccionadoSeries.show()
      municipiosSeries.hide(100)
      backContainer.show()
    })
  })

  // 🔙 REGRESAR
  backContainer.events.on("click", () => {
    if (municipioSeleccionadoSeries.get("visible")) {
      municipioSeleccionadoSeries.hide()
      municipiosSeries.show()

      if (lastDepartamentoDataItem) {
        departamentosSeries.zoomToDataItem(lastDepartamentoDataItem)
        handleSelection("departamento", {
          NAME_1: lastDepartamentoDataItem.dataContext.NAME_1
        })
      }
    } else {
      chart.goHome()
      departamentosSeries.show()
      municipiosSeries.hide()
      backContainer.hide()

      mapStore.reset()
    }
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