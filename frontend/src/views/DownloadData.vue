<template>
  <v-container fluid class="fill-height bg-main pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="3" lg="2" class="bg-white elevation-1 z-index-2">
        <div class="pa-6">
          <div class="d-flex align-center mb-8">
            <v-img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Escudo_de_Guatemala.svg" width="40" height="40" contain class="mr-3"></v-img>
            <div>
              <div class="text-caption font-weight-black text-blue-darken-4 line-height-1">GOBIERNO DE</div>
              <div class="text-subtitle-2 font-weight-black text-blue-darken-4">GUATEMALA</div>
            </div>
          </div>

          <h3 class="text-overline font-weight-bold text-grey-darken-1 mb-4">Filtros de Reporte</h3>
          
          <v-text-field
            v-model="filters.codigoEscuela"
            @input="aplicarFiltro"
            label="Código UDI"
            placeholder="00-00-0000"
            variant="solo-filled"
            flat
            density="comfortable"
            class="mb-6 custom-input"
          ></v-text-field>
<v-select
  v-model="filters.proyectoId"
  class="mb-6 custom-input"
  clearable
  label="Tipo de Proyecto"
  density="comfortable"
  variant="solo-filled"
  :items="proyectos"
  item-title="nombre"
  item-value="id"
></v-select>
          <v-btn
            block
            color="#003366"
            size="large"
            class="text-none font-weight-bold rounded-lg mb-2"
            elevation="0"
            @click="aplicarFiltro"
          >
            Aplicar Filtros
          </v-btn>
          
          <v-btn
            block
            variant="text"
            color="grey-darken-1"
            class="text-none"
            @click="limpiarFiltros"
          >
            Restablecer
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12" md="9" lg="10" class="pa-6 pa-lg-10">
        <div class="d-flex align-center justify-space-between mb-8">
          <div>
            <h1 class="text-h4 font-weight-bold text-blue-darken-4">Descargar Reportes y Actas</h1>
            <p class="text-body-1 text-grey-darken-1">Gestión y exportación de donaciones tecnológicas</p>
          </div>

          <div class="d-flex gap-3">
            <!-- <v-btn
              variant="outlined"
              color="#0094D3"
              prepend-icon="mdi-file-excel"
              class="text-none font-weight-bold rounded-lg px-6"
              size="large"
              @click="descargar('excel')"
            >
              Excel
            </v-btn> -->
<v-divider vertical class="mx-2"></v-divider>
                <v-btn color="#003366" prepend-icon="mdi-plus"
              class="text-none font-weight-bold rounded-lg px-6 text-white" size="large" elevation="4"
              @click="dialogRegistro = true">
              Agregar Nuevo Proyecto
            </v-btn>
          </div>
        </div>

        <v-card class="rounded-xl border-none elevation-sm">
          <v-data-table
            :headers="headers"
            :items="resultados"
            :loading="loading"
            hover
            class="custom-table"
          >
            <template v-slot:item.cantidad="{ value }">
              <v-chip variant="tonal" color="indigo" size="small" class="font-weight-bold">
                {{ value }} unidades
              </v-chip>
            </template>

            <template v-slot:item.estado="{ item }">
              <v-btn
                size="small"
                color="primary"
                variant="outlined"
                class="text-none"
                prepend-icon="mdi-file-pdf-box"
                @click="verActa(item)"
              >
                Ver Acta
              </v-btn>
            </template>

            <template v-slot:loading>
              <v-skeleton-loader type="table-row-divider@5"></v-skeleton-loader>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <v-dialog v-model="dialogRegistro" max-width="700px">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h5 font-weight-bold text-blue-darken-4">Gestión de Proyectos</span>
          <v-btn icon="mdi-close" variant="text" @click="dialogRegistro = false"></v-btn>
        </v-card-title>
        
        <v-card-text>
        <h3 class="text-subtitle-1 font-weight-bold mb-3">Crear Nuevo Proyecto</h3>
        <v-form ref="formRef">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="formNuevoProyecto.nombre"
              label="Nombre del Proyecto"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              :rules="[required, onlyLetters]"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="formNuevoProyecto.descripcion"
              label="Descripción"
              variant="outlined"
              density="comfortable"
              rows="2"
              :rules="[required]"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-form>
        <v-divider class="mb-6"></v-divider>
        <h3 class="text-subtitle-1 font-weight-bold mb-3">Proyectos Actuales</h3>
      <v-expansion-panels v-model="panel" variant="accordion" class="mb-6">
  <v-expansion-panel>
    <v-expansion-panel-title>
      <span class="font-weight-bold">
        Proyectos Actuales ({{ proyectos.length }})
      </span>
    </v-expansion-panel-title>

    <v-expansion-panel-text style="max-height: 300px; overflow-y: auto;">
      <v-table density="comfortable" class="border rounded-lg">
        <thead>
          <tr>
            <th class="text-left">Nombre</th>
            <th class="text-left">Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="proy in proyectos" :key="proy.id">
            <td>{{ proy.nombre }}</td>
            <td class="text-grey-darken-1">
              {{ proy.description || 'Sin descripción' }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-expansion-panel-text>
  </v-expansion-panel>
</v-expansion-panels>


      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn 
          color="grey-darken-1" 
          variant="text" 
          @click="dialogRegistro = false"
        >
          Cancelar
        </v-btn>
        <v-btn 
          color="#003366" 
          class="text-white px-6" 
          variant="elevated"
          :loading="loadingGuardar"
          @click="guardarNuevoProyecto"
        >
          Guardar Proyecto
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { required, onlyLetters } from '@/helpers/validators';
import Swal from 'sweetalert2'

const formRef = ref(null)
const resultados = ref([]);
const loading = ref(false)
const datosOriginales = ref([]);
const filters = ref({
  codigoEscuela: '',
  proyectoId: null
})

const panel = ref([1]) // abierto

const proyectos = ref([])

const headers = [
  { title: 'FECHA REGISTRO', key: 'fecha', align: 'start' },
  { title: 'PROYECTO', key: 'proyecto' },
  { title: 'CENTRO EDUCATIVO', key: 'escuela' },
  { title: 'CÓDIGO UDI', key: 'codigo' },
  { title: 'TIPO DE EQUIPO', key: 'tipos' },
  { title: 'MODELOS', key: 'modelos' },
  { title: 'CANTIDAD', key: 'cantidad', align: 'center' },
  { title: 'ACCIONES', key: 'estado', align: 'end' },
]

// ... tus refs existentes ...
const dialogRegistro = ref(false);
const loadingGuardar = ref(false);
const formNuevoProyecto = ref({
  nombre: '',
  descripcion: ''
});

const guardarNuevoProyecto = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()

  if (!valid) {
    Swal.fire({
      icon: 'error',
      title: 'Formulario inválido',
      text: 'Por favor completa correctamente los campos'
    })
    return
  }

  try {
    loadingGuardar.value = true;

    await axios.post('http://localhost:3000/api/v1/proyectos', {
      nombre: formNuevoProyecto.value.nombre,
      description: formNuevoProyecto.value.descripcion
    });

    formNuevoProyecto.value = { nombre: '', descripcion: '' };
    await buscarProyecto();

    dialogRegistro.value = false

    Swal.fire({
      icon: 'success',
      title: 'Proyecto creado',
      text: 'Se guardó correctamente',
      timer: 2000,
      showConfirmButton: false
    });

  } catch (error) {
    const mensaje = error.response?.data?.message || 'Error al guardar';

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });

  } finally {
    loadingGuardar.value = false;
  }
};

const buscarProyecto = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/proyectos');
    proyectos.value = response.data;
  } catch (error) {
    console.error('❌ Error al obtener proyectos:', error);
  }
};

const buscarData = async () => {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:3000/api/v1/dotacion');
    datosOriginales.value = response.data;
    aplicarFiltro();
  } catch (error) {
    console.error('❌ Error al obtener datos:', error);
  } finally {
    loading.value = false;
  }
};

const aplicarFiltro = () => {
  let data = [...datosOriginales.value];

  if (filters.value.proyectoId) {
  data = data.filter(d => d.id_proyecto === filters.value.proyectoId);
}

  // Filtro por UDI
  if (filters.value.codigoEscuela) {
    data = data.filter(d =>
      d.escuela?.codigoEscuela?.toLowerCase().includes(filters.value.codigoEscuela.toLowerCase())
    );
  }

  // Mapeo y formateo de datos para la tabla
  resultados.value = data.map(d => {
    // Obtenemos nombres únicos de tipos y los unimos con coma
    const tiposUnicos = [...new Set(d.equipos?.map(e => e.modelo?.tipo?.nombre).filter(t => t))];
    
    // Obtenemos nombres únicos de modelos y los unimos con coma
    const modelosUnicos = [...new Set(d.equipos?.map(e => e.modelo?.nombre_modelo).filter(m => m))];

    return {
      fecha: new Date(d.fecha_entrega).toLocaleDateString(),
      escuela: d.escuela?.nombreEscuela || 'Sin nombre',
      codigo: d.escuela?.codigoEscuela || 'N/A',
      tipos: tiposUnicos.join(', '), // <--- CORREGIDO: Ahora es un string separado por comas
      modelos: modelosUnicos.join(', '), 
      cantidad: d.equipos?.length || 0,
      acta: d.acta?.acta_pdf || null,
      proyecto: d.proyecto?.nombre || 'Sin proyecto',
    };
  });
};

const verActa = (item) => {
  if (!item.acta) {
    alert('No hay acta disponible');
    return;
  }
  const url = `http://localhost:3000/uploads/actas/${item.acta}`;
  window.open(url, '_blank');
};

const limpiarFiltros = () => {
  filters.value = { departamento: null, municipio: null, codigoEscuela: '' };
  aplicarFiltro();
}

const descargar = (formato) => {
  console.log(`Exportando en ${formato}...`)
}

onMounted(() => {
  buscarData();
  buscarProyecto();
});
</script>

<style scoped>
.bg-main {
  background-color: #F8FAFC !important;
}

.line-height-1 {
  line-height: 1.1;
}

.z-index-2 {
  z-index: 2;
}

.custom-input :deep(.v-field) {
  border-radius: 12px !important;
  background-color: #f1f5f9 !important;
}

.custom-table {
  border-radius: 16px !important;
}

.custom-table :deep(thead) {
  background-color: #fcfcfc !important;
}

.custom-table :deep(th) {
  text-transform: uppercase;
  font-size: 0.75rem !important;
  letter-spacing: 0.5px;
  font-weight: 700 !important;
  color: #64748b !important;
}

.gap-3 {
  gap: 12px;
}

.elevation-sm {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
}
</style>