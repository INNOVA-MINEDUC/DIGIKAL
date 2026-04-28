<template>
  <div id="chartdivdona"></div>
</template>

<script setup>
import * as am5 from "@amcharts/amcharts5"
import * as am5percent from "@amcharts/amcharts5/percent"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { onMounted, onBeforeUnmount } from "vue"

let root

onMounted(() => {
 
  root = am5.Root.new("chartdivdona")
  root._logo.dispose()

  root.setThemes([am5themes_Animated.new(root)])


  const chart = root.container.children.push(am5percent.PieChart.new(root, {
    radius: am5.percent(100),
    innerRadius: am5.percent(50),
    layout: root.horizontalLayout
  }))

  const series = chart.series.push(am5percent.PieSeries.new(root, {
    name: "Series",
    valueField: "sales",
    categoryField: "country"
  }))

  series.get("colors").set("colors", [
    am5.color("#6794DC"),
    am5.color("#4F7CC4"),
    am5.color("#3A64A8"),
    am5.color("#2883D1"),
    am5.color("#CCCCCC"),
  ])

  series.data.setAll([
    { country: "Donación de Equipo", sales: 501.9 },
    { country: "Conección a Internet", sales: 301.9 },
    { country: "Tutorias", sales: 201.1 },
    { country: "Sitemas y Licencias", sales: 165.8 },
    { country: "faltantes", sales: 400 },
  ])

  series.labels.template.set("visible", false)
  series.ticks.template.set("visible", false)

  series.slices.template.setAll({
    strokeOpacity: 0,
    fillGradient: am5.RadialGradient.new(root, {
      stops: [
        { brighten: -0.8 },
        { brighten: -0.8 },
        { brighten: -0.5 },
        { brighten: 0 },
        { brighten: -0 }
      ]
    })
  })

  const legend = chart.children.push(am5.Legend.new(root, {
    centerY: am5.percent(50),
    y: am5.percent(50),
    layout: root.verticalLayout
  }))

  legend.valueLabels.template.setAll({ textAlign: "right" })
  legend.labels.template.setAll({
    maxWidth: 140,
    width: 140,
    oversizedBehavior: "wrap"
  })

  legend.data.setAll(series.dataItems)

  series.appear(1000, 100)
})

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
#chartdivdona {
  width: 60%;
  height: 400px;
  /* filter: drop-shadow(2px 2px 12px); */
}
</style>