<template>
  <div style="width: 100%;">
    <h1 class="text-h5 mb-4">📊 Tabla con búsqueda y filtro</h1>

    <!-- Filtros -->
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" md="7">
        <v-text-field
          clearable
          v-model="search"
          label="Buscar (Departamento o Municipio)"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
        />
      </v-col>

      <v-col cols="12" md="5">
        <v-select
          clearable
          label="Filtrar por grado"
          :items="grades"
          v-model="selectedGrade"
        />
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-data-table
      :headers="headers"
      :items="filteredItems"
      class="elevation-2"
      :items-per-page="10"
    >

      <!-- 🔹 Porcentaje clickeable -->
  <template #item.process="{ item }">
  <div
    class="clickable-progress"
    @click="showDetails(item)"
  >
    <v-progress-circular
      :model-value="item.process"
      :size="45"
      :width="5"
      color="#2883D1"
    >
      {{ item.process }}%
    </v-progress-circular>
  </div>
</template>


    </v-data-table>

  </div>
</template>



<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()


// 👉 Función que se dispara al hacer clic en el porcentaje
function showDetails(item) {
  // router.push({
  //   name: 'details',
  //   state: { item }   // ← aquí viaja el objeto completo
  // })

  router.push("/details")
}



// Función para sacar porcentajes aleatorios
function randomPercent() {
  const values = [25, 50, 75, 100]
  return values[Math.floor(Math.random() * values.length)]
}


const search = ref('')
const selectedGrade = ref(null)

const headers = [
  { title: 'Escuela', key: 'school' },
  { title: 'Jornada', key: 'shift' },
  { title: 'Grado', key: 'grade' },
  { title: '', key: 'process' }
]

const types = ['Escuela', 'Instituto', 'Colegio'];
const shifts = ['Matutina', 'Vespertina', 'Jornada Completa'];
const grades = ['Primaria', 'Básico', 'Diversificado'];

function generateItems(count = 100) {
  const list = [];
  
  for (let i = 1; i <= count; i++) {
    list.push({
      school: `${types[i % 3]} ${i}`,     // Escuela 1, Instituto 2, Colegio 3, Escuela 4...
      shift: shifts[i % shifts.length],   // rota turnos
      grade: grades[i % grades.length],   // rota grados
      process: randomPercent(),
    });
  }

  return list;
}

const items = ref(generateItems(100));



// Filtrar por texto y grado
const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchesSearch =
      item.school.toLowerCase().includes(search.value.toLowerCase()) ||
      item.shift.toLowerCase().includes(search.value.toLowerCase()) ||
      item.grade.toLowerCase().includes(search.value.toLowerCase())

    const matchesGrade =
      !selectedGrade.value || item.grade === selectedGrade.value

    return matchesSearch && matchesGrade
  })
})
</script>

<style scoped>
.clickable-progress {
  cursor: pointer;
  display: flex;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

/* Hover: ligeramente más grande + sombra */
.clickable-progress:hover {
  transform: scale(1.12);
  box-shadow: 0 4px 12px rgba(103, 148, 220, 0.3);
}

/* Click: animación “pop” */
.clickable-progress:active {
  transform: scale(0.92);
  box-shadow: 0 2px 6px rgba(0, 150, 0, 0.4);
}
</style>

