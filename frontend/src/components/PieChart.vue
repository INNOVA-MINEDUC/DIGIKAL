<template>
  <div id="chartdivpie" style="width: 100%; height: 300px;"></div>
</template>

<script setup>
import * as am5 from "@amcharts/amcharts5"
import * as am5percent from "@amcharts/amcharts5/percent"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { onMounted, onBeforeUnmount } from "vue"

let root

onMounted(() => {
  
  root = am5.Root.new("chartdivpie")

  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
    })
  )

  root._logo.dispose(); 

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: "percent",
      categoryField: "type",
      fillField: "color",
      alignLabels: false,
    })
  )


  series.slices.template.set("templateField", "sliceSettings")
  series.labels.template.set("radius", 30)

  let selected

console.log(series.get("colors").getIndex(0))


  const types = [
    {
      type: "estudiando",
      percent: 70,
      color: series.get("colors").getIndex(0),
      subs: [
        { type: "Oil", percent: 15 },
        { type: "Coal", percent: 35 },
        { type: "Nuclear", percent: 20 },
      ],
    },
    {
      type: "No estudiando",
      percent: 30,
      color: series.get("colors").getIndex(1),
      subs: [
        { type: "Hydro", percent: 15 },
        { type: "Wind", percent: 10 },
        { type: "Other", percent: 5 },
      ],
    },
  ]

  
  function generateChartData() {
    const chartData = []
    for (let i = 0; i < types.length; i++) {
      if (i === selected) {
        for (let x = 0; x < types[i].subs.length; x++) {
          chartData.push({
            type: types[i].subs[x].type,
            percent: types[i].subs[x].percent,
            color: types[i].color,
            pulled: true,
            sliceSettings: { active: true },
          })
        }
      } else {
        chartData.push({
          type: types[i].type,
          percent: types[i].percent,
          color: types[i].color,
          id: i,
        })
      }
    }
    return chartData
  }


  series.data.setAll(generateChartData())


  series.slices.template.events.on("click", (event) => {
    const dataContext = event.target.dataItem.dataContext
    if (dataContext.id !== undefined) {
      selected = dataContext.id
    } else {
      selected = undefined
    }
    series.data.setAll(generateChartData())
  })
})

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
#chartdiv {
  width: 100%;
  height: 500px;
}
</style>
