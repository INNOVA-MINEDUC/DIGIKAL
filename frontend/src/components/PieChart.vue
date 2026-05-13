<template>
  <div id="chartdivpie"></div>
</template>

<script setup>
import * as am5 from "@amcharts/amcharts5"
import * as am5percent from "@amcharts/amcharts5/percent"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"

import { onMounted, onBeforeUnmount, watch } from "vue"
import { useEstablecimientosStore } from "@/stores/escuelasStore"

const store = useEstablecimientosStore()

let root
let series

onMounted(() => {

  root = am5.Root.new("chartdivpie")

  root._logo.dispose()

  root.setThemes([
    am5themes_Animated.new(root)
  ])

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout
    })
  )

  series = chart.series.push(
    am5percent.PieSeries.new(root, {

      valueField: "value",

      categoryField: "category",

      alignLabels: true

    })
  )

  /* =========================================
     COLORES INSTITUCIONALES
  ========================================= */

  series.get("colors").set("colors", [

    am5.color("#0d3b5d"), // azul institucional
    am5.color("#117a8b"), // turquesa
    am5.color("#1d4e89"), // azul medio
    am5.color("#6c757d")  // gris institucional

  ])

  series.labels.template.setAll({

    text: "{category}: {value}",

    fontSize: 13,

    fill: am5.color("#0d3b5d")

  })

  series.ticks.template.setAll({
    visible: true,
    stroke: am5.color("#0d3b5d")
  })

  series.slices.template.setAll({

    strokeWidth: 2,

    stroke: am5.color("#ffffff"),

    tooltipText: "{category}: {value}"

  })

  loadData()

})

/* =========================================
   CARGAR DATA DESDE EL STORE
========================================= */

const loadData = () => {

  const data = [

    {
      category: "Mayas",
      value: store.totalMayas
    },

    {
      category: "Xincas",
      value: store.totalXincas
    },

    {
      category: "Garífunas",
      value: store.totalGarifunas
    },

    {
      category: "Otros",
      value: store.totalOtros
    }

  ]

  series.data.setAll(data)

}

/* =========================================
   ACTUALIZAR AUTOMÁTICAMENTE
========================================= */

watch(

  () => [
    store.totalMayas,
    store.totalXincas,
    store.totalGarifunas,
    store.totalOtros
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
#chartdivpie {
  width: 100%;
  height: 300px;
   filter: drop-shadow(2px 20px 12px);
}
</style>