<template>
  <div id="chartdivbar"  style="width: 110%; height: 400px"></div>
</template>

<script setup>
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { onMounted, onBeforeUnmount } from "vue"
import data from "@/helpers/data.json"

let root

onMounted(() => {
  root = am5.Root.new("chartdivbar")

  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      focusable: true,
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0,
    })
  )

  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      maxDeviation: 0.1,
      groupData: false,
      baseInterval: { timeUnit: "day", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {
        minorGridEnabled: true,
        minGridDistance: 70,
      }),
      tooltip: am5.Tooltip.new(root, {}),
    })
  )

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0.2,
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  )

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      minBulletDistance: 10,
      connect: false,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        pointerOrientation: "horizontal",
        labelText: "{valueY}",
      }),
    })
  )

  series.fills.template.setAll({
    fillOpacity: 0.2,
    visible: true,
  })

  series.strokes.template.setAll({
    strokeWidth: 2,
  })

  series.data.processor = am5.DataProcessor.new(root, {
    dateFormat: "yyyy-MM-dd",
    dateFields: ["date"],
  })


  series.data.setAll(data)


  series.bullets.push(() => {
    const circle = am5.Circle.new(root, {
      radius: 4,
      fill: root.interfaceColors.get("background"),
      stroke: series.get("fill"),
      strokeWidth: 2,
    })
    return am5.Bullet.new(root, { sprite: circle })
  })

  
  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      xAxis: xAxis,
      behavior: "none",
    })
  )
  cursor.lineY.set("visible", false)

 
  chart.set(
    "scrollbarX",
    am5.Scrollbar.new(root, { orientation: "horizontal" })
  )

  chart.appear(1000, 100)

  root._logo?.dispose()
})

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
#chartdivbar {
  width: 100%;
  height: 500px;
}
</style>
