<template>
  <div id="linechart" class="linechart"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";

/* Imports */
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";

let root;

onMounted(() => {
  root = am5.Root.new("linechart");

  root._logo.dispose()

  const myTheme = am5.Theme.new(root);
  myTheme.rule("AxisLabel", ["minor"]).setAll({
    dy: 1
  });

  // Aplicar temas
  root.setThemes([
    am5themes_Animated.new(root),
    myTheme,
    am5themes_Responsive.new(root)
  ]);

  // Crear chart
  let chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      paddingLeft: 0
    })
  );

  // Cursor
  let cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "zoomX" })
  );
  cursor.lineY.set("visible", false);

  // DATA
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  let value = 100;

  function generateData() {
    value = Math.round(Math.random() * 10 - 5 + value);
    am5.time.add(date, "day", 1);
    return {
      date: date.getTime(),
      value: value
    };
  }

  function generateDatas(count) {
    let data = [];
    for (let i = 0; i < count; i++) data.push(generateData());
    return data;
  }

  // Ejes
  let xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      maxDeviation: 0,
      baseInterval: { timeUnit: "day", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {
        minorGridEnabled: true,
        minorLabelsEnabled: true
      }),
      tooltip: am5.Tooltip.new(root, {})
    })
  );

  xAxis.set("minorDateFormats", {
    day: "dd",
    month: "MM"
  });

  let yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    })
  );

  // Serie
  let series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
    })
  );

  series.columns.template.setAll({
  fill: am5.color("#6794DC"),   // color de las barras
  stroke: am5.color("#f00") // borde del mismo color
});


  series.columns.template.setAll({ strokeOpacity: 0 });

  // Scrollbar
  chart.set(
    "scrollbarX",
    am5.Scrollbar.new(root, { orientation: "horizontal" })
  );

  // Set data
  let data = generateDatas(30);
  series.data.setAll(data);

  // Animaciones
  series.appear(1000);
  chart.appear(1000, 100);
});

// Destruir root al desmontar componente
onBeforeUnmount(() => {
  if (root) {
    root.dispose();
  }
});
</script>

<style>
#linechart {
  width: 100%;
  height: 400px;
  /* filter: drop-shadow(2px 2px 12px); */
}
</style>
