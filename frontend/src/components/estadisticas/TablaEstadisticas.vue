<template>
  <section class="tabla-bloque">
    <header class="tabla-encabezado">
      <div>
        <h3>Tabla estadística</h3>
        <p>
          Los mismos datos de las gráficas en forma de tabla. Es también la vista
          accesible: ningún dato del tablero existe sólo como color.
        </p>
      </div>

      <div class="tabla-tabs" role="tablist">
        <button
          v-for="vista in VISTAS"
          :key="vista.clave"
          type="button"
          role="tab"
          :aria-selected="vistaActiva === vista.clave"
          :class="['tab', { 'tab--activa': vistaActiva === vista.clave }]"
          @click="cambiarVista(vista.clave)"
        >
          {{ vista.etiqueta }}
        </button>
      </div>
    </header>

    <div class="tabla-scroll">
      <table>
        <thead>
          <tr>
            <th
              v-for="col in columnas"
              :key="col.clave"
              :class="{ 'col-num': col.numerica, 'col-orden': ordenPor === col.clave }"
              :aria-sort="ordenPor === col.clave ? (ordenAsc ? 'ascending' : 'descending') : 'none'"
            >
              <button type="button" @click="ordenar(col.clave)">
                {{ col.etiqueta }}
                <span v-if="ordenPor === col.clave" aria-hidden="true">{{ ordenAsc ? '▲' : '▼' }}</span>
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(fila, i) in filasOrdenadas" :key="i">
            <td
              v-for="col in columnas"
              :key="col.clave"
              :class="{ 'col-num': col.numerica }"
            >
              {{ col.numerica ? formatearNumero(fila[col.clave]) : fila[col.clave] }}
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td v-for="(col, i) in columnas" :key="col.clave" :class="{ 'col-num': col.numerica }">
              <template v-if="i === 0">Total</template>
              <template v-else-if="col.numerica">{{ formatearNumero(totales[col.clave]) }}</template>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p v-if="!filasOrdenadas.length" class="tabla-vacia">
      No hay registros para los filtros seleccionados.
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatearNumero } from '@/helpers/vizPalette.js'
import { useEstadisticasStore } from '@/stores/estadisticasStore'

const store = useEstadisticasStore()

const METRICAS = [
  { clave: 'establecimientos', etiqueta: 'Establecimientos', numerica: true },
  { clave: 'equipos', etiqueta: 'Equipos', numerica: true },
  { clave: 'beneficiados', etiqueta: 'Beneficiados', numerica: true },
  { clave: 'conectividad', etiqueta: 'Conectividad', numerica: true },
  { clave: 'formacion', etiqueta: 'Formación', numerica: true },
  { clave: 'proyectores', etiqueta: 'Proyectores', numerica: true },
  { clave: 'impresoras', etiqueta: 'Impresoras', numerica: true },
]

const VISTAS = [
  {
    clave: 'departamento',
    etiqueta: 'Por departamento',
    columnas: [
      { clave: 'departamento', etiqueta: 'Departamento', numerica: false },
      ...METRICAS,
      { clave: 'municipios', etiqueta: 'Municipios', numerica: true },
    ],
    filas: () => store.porDepartamento,
    ordenInicial: 'establecimientos',
  },
  {
    clave: 'cicloAnio',
    etiqueta: 'Por ciclo y año',
    columnas: [
      { clave: 'cicloEtiqueta', etiqueta: 'Ciclo', numerica: false },
      { clave: 'anio', etiqueta: 'Año', numerica: false },
      ...METRICAS,
    ],
    filas: () => store.porCicloAnio,
    ordenInicial: 'anio',
  },
  {
    clave: 'anio',
    etiqueta: 'Por año',
    columnas: [
      { clave: 'anio', etiqueta: 'Año', numerica: false },
      ...METRICAS,
    ],
    filas: () => store.porAnio,
    ordenInicial: 'anio',
  },
]

const vistaActiva = ref('departamento')
const ordenPor = ref('establecimientos')
const ordenAsc = ref(false)

const vista = computed(() => VISTAS.find((v) => v.clave === vistaActiva.value))
const columnas = computed(() => vista.value.columnas)
const filas = computed(() => vista.value.filas() ?? [])

const filasOrdenadas = computed(() => {
  const clave = ordenPor.value
  const factor = ordenAsc.value ? 1 : -1

  return [...filas.value].sort((a, b) => {
    const x = a[clave]
    const y = b[clave]
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor
    return String(x ?? '').localeCompare(String(y ?? ''), 'es') * factor
  })
})

/** Fila de totales: se suma lo que está en pantalla, no se pide aparte. */
const totales = computed(() => {
  const acumulado = {}
  for (const col of columnas.value) {
    if (!col.numerica) continue
    acumulado[col.clave] = filas.value.reduce((a, f) => a + (f[col.clave] ?? 0), 0)
  }
  // Municipios no es sumable entre departamentos repetidos, pero en esta vista
  // cada fila es un departamento distinto, así que la suma sí es correcta.
  return acumulado
})

const cambiarVista = (clave) => {
  vistaActiva.value = clave
  ordenPor.value = VISTAS.find((v) => v.clave === clave).ordenInicial
  ordenAsc.value = false
}

const ordenar = (clave) => {
  if (ordenPor.value === clave) ordenAsc.value = !ordenAsc.value
  else {
    ordenPor.value = clave
    ordenAsc.value = false
  }
}
</script>

<style scoped>
.tabla-bloque {
  background: #ffffff;
  border: 1px solid rgba(11, 11, 11, 0.08);
  border-radius: 16px;
  padding: 20px;
}

.tabla-encabezado {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.tabla-encabezado h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #0d3b5d;
}

.tabla-encabezado p {
  margin: 0;
  font-size: 12px;
  color: #898781;
  max-width: 60ch;
}

.tabla-tabs {
  display: flex;
  gap: 6px;
}

.tab {
  padding: 7px 14px;
  border: 1px solid #c3c2b7;
  border-radius: 999px;
  background: #ffffff;
  font-size: 12px;
  color: #52514e;
  cursor: pointer;
}

.tab--activa {
  background: #0d3b5d;
  border-color: #0d3b5d;
  color: #ffffff;
  font-weight: 600;
}

/* La tabla desborda dentro de su propio contenedor: la página nunca scrollea en horizontal */
.tabla-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th,
td {
  padding: 9px 12px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid #e1e0d9;
}

th {
  padding: 0;
}

th button {
  width: 100%;
  padding: 9px 12px;
  background: none;
  border: 0;
  font: inherit;
  font-weight: 600;
  color: #52514e;
  text-align: inherit;
  cursor: pointer;
}

.col-num,
.col-num button {
  text-align: right;
}

td.col-num {
  font-variant-numeric: tabular-nums;
  color: #0d3b5d;
}

tbody tr:hover {
  background: #f9f9f7;
}

tfoot td {
  font-weight: 700;
  color: #0d3b5d;
  border-bottom: 0;
  border-top: 2px solid #c3c2b7;
  font-variant-numeric: tabular-nums;
}

.tabla-vacia {
  margin: 16px 0 0;
  font-size: 13px;
  color: #898781;
}
</style>
