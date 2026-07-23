<template>
  <div id="chartdivline"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue"

import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"

import { useEstablecimientosStore } from "@/stores/escuelasStore"

const store = useEstablecimientosStore()

let root
let chart
let xAxis
let series

onMounted(() => {

  root = am5.Root.new("chartdivline")

  root._logo.dispose()

  root.setThemes([
    am5themes_Animated.new(root)
  ])

  chart = root.container.children.push(
    am5xy.XYChart.new(root, {

      panX: true,
      panY: true,

      wheelX: "panX",
      wheelY: "zoomX",

      pinchZoomX: true,

      paddingLeft: 0,
      paddingRight: 1

    })
  )

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {})
  )

  cursor.lineY.set("visible", false)

  const xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 30,
    minorGridEnabled: true
  })

  xRenderer.labels.template.setAll({
    rotation: 0,
    centerY: am5.p50,
    centerX: am5.p50,
    paddingTop: 10
  })

  xRenderer.grid.template.setAll({
    location: 1
  })

  xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {

      maxDeviation: 0.3,

      categoryField: "category",

      renderer: xRenderer,

      tooltip: am5.Tooltip.new(root, {})

    })
  )

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {

      maxDeviation: 0.3,

      renderer: am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1
      })

    })
  )

  series = chart.series.push(
    am5xy.ColumnSeries.new(root, {

      name: "Edades",

      xAxis,
      yAxis,

      valueYField: "value",

      categoryXField: "category",

      sequencedInterpolation: true,

      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })

    })
  )

  series.columns.template.setAll({

    cornerRadiusTL: 5,
    cornerRadiusTR: 5,

    strokeOpacity: 0,

    fill: am5.color("#0d3b5d"),

    width: am5.percent(70)

  })

  loadData()

  series.appear(1000)

  chart.appear(1000, 100)

})

/* =========================================
   CARGAR DATA
========================================= */

const loadData = () => {

  const data = [

    {
      category: "0-13 años",
      value: store.totalEdad013
    },

    {
      category: "13-30 años",
      value: store.totalEdad1330
    },

    {
      category: "30-60 años",
      value: store.totalEdad3060
    },

    {
      category: "60+ años",
      value: store.totalEdadMas60
    }

  ]

  xAxis.data.setAll(data)

  series.data.setAll(data)

}

/* =========================================
   WATCH STORE
========================================= */

watch(

  () => [
    store.totalEdad013,
    store.totalEdad1330,
    store.totalEdad3060,
    store.totalEdadMas60
  ],

  () => {

    if (series) {
      loadData()
    }

  }

)

onBeforeUnmount(() => {

  if (root) {
    root.dispose()
  }

})
</script>

<style scoped>
#chartdivline {
  width: 100%;
  height: 400px;
 filter: drop-shadow(2px 20px 12px);
}
</style>