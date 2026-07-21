<template>
  <div class="kpi-grid">
    <article v-for="kpi in tiles" :key="kpi.etiqueta" class="kpi-tile">
      <h3>{{ kpi.etiqueta }}</h3>
      <p class="kpi-valor">{{ kpi.valor }}</p>
      <span v-if="kpi.detalle" class="kpi-detalle">{{ kpi.detalle }}</span>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatearNumero } from '@/helpers/vizPalette.js'
import { useEstadisticasStore } from '@/stores/estadisticasStore'

const store = useEstadisticasStore()

// Números sueltos, sin gráfica: para un valor único la cifra ES la
// visualización. Cada tile lleva su unidad en el detalle para que se lea sola.
const tiles = computed(() => {
  const i = store.indicadores
  return [
    {
      etiqueta: 'Centros educativos dotados',
      valor: formatearNumero(i.establecimientos),
      detalle: `${formatearNumero(i.municipios)} municipios · ${i.departamentos} departamentos`,
    },
    {
      etiqueta: 'Equipos entregados',
      valor: formatearNumero(i.equipos),
      detalle: `${i.promedioEquiposPorCentro} equipos por centro en promedio`,
    },
    {
      etiqueta: 'Estudiantes beneficiados',
      valor: formatearNumero(i.beneficiados),
      detalle: `${i.promedioBeneficiadosPorCentro} por centro en promedio`,
    },
    {
      etiqueta: 'Centros con conectividad',
      valor: formatearNumero(i.conectividad),
      detalle: `${i.porcentajeConectividad}% de los centros dotados`,
    },
    {
      etiqueta: 'Beneficiados con formación',
      valor: formatearNumero(i.formacion),
      detalle: `${i.porcentajeFormacion}% de los estudiantes beneficiados`,
    },
    {
      etiqueta: 'Otro equipamiento',
      valor: formatearNumero(i.proyectores + i.impresoras),
      detalle: `${formatearNumero(i.proyectores)} proyectores · ${formatearNumero(i.impresoras)} impresoras`,
    },
  ]
})
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.kpi-tile {
  background: #ffffff;
  border: 1px solid rgba(11, 11, 11, 0.08);
  border-radius: 16px;
  padding: 18px 20px;
}

.kpi-tile h3 {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #52514e;
}

.kpi-valor {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  color: #0d3b5d;
}

.kpi-detalle {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #898781;
}
</style>
