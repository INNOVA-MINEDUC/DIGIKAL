<template>
  <div id="chartdivline"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

let root;

onMounted(() => {
  root = am5.Root.new("chartdivline");
  root._logo.dispose()

  root.setThemes([am5themes_Animated.new(root)]);

  let chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0,
      paddingRight: 1
    })
  );

  let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
  cursor.lineY.set("visible", false);

  let xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 30,
    minorGridEnabled: true
  });

  xRenderer.labels.template.setAll({
    rotation: -90,
    centerY: am5.p50,
    centerX: am5.p100,
    paddingRight: 15
  });

  xRenderer.grid.template.setAll({ location: 1 });

  let xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "month",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    })
  );

  let yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 })
    })
  );


  let series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Series 1",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      categoryXField: "month",
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
    })
  );

  series.columns.template.setAll({
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
    strokeOpacity: 0,
    fill: am5.color("#0d3b5d"),  
    stroke: am5.color("#6794DC")
  });

let data = [
  { month: "Enero", value: 120 },
  { month: "Febrero", value: 150 },
  { month: "Marzo", value: 180 },
  { month: "Abril", value: 160 },
  { month: "Mayo", value: 200 },
  { month: "Junio", value: 175 },
  { month: "Julio", value: 190 },
  { month: "Agosto", value: 210 },
  { month: "Septiembre", value: 170 },
  { month: "Octubre", value: 185 },
  { month: "Noviembre", value: 140 },
  { month: "Diciembre", value: 195 }
];


  xAxis.data.setAll(data);
  series.data.setAll(data);

  series.appear(1000);
  chart.appear(1000, 100);
});

onBeforeUnmount(() => {
  if (root) root.dispose();
});
</script>

<style scoped>
#chartdivline {
  width: 100%;
  height: 400px;
}
</style>
