<template>
  <v-container class="py-10" fluid>
    <!-- Cabecera -->
    <v-card class="mb-6 px-4 py-2" elevation="2" border>
      <v-row align="center">
        <v-col cols="12" md="6">
          <div class="d-flex align-center">
            <v-icon size="40" color="indigo-darken-4" class="mr-3">mdi-clipboard-text-clock</v-icon>
            <div>
              <h1 class="text-h5 font-weight-bold text-indigo-darken-4 mb-0">
                BITÁCORA DE AUDITORÍA
              </h1>
              <span class="text-caption text-uppercase text-grey-darken-1">
                Gobierno de Guatemala | Registro de Actividad del Sistema
              </span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Filtros -->
    <v-card class="mb-6 px-4 py-4" elevation="1" border>
      <v-row dense>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.startDate"
            label="Desde"
            type="date"
            variant="filled"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.endDate"
            label="Hasta"
            type="date"
            variant="filled"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.module"
            :items="modules"
            label="Módulo"
            variant="filled"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.action"
            :items="actions"
            label="Acción"
            variant="filled"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn color="indigo-darken-4" block @click="applyFilters">
            Filtrar
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabla -->
    <v-card elevation="1" border class="table-size">
      <v-table hover class="admin-table">
        <thead>
          <tr class="bg-indigo-darken-4">
            <th class="text-white font-weight-bold">Fecha/Hora</th>
            <th class="text-white font-weight-bold">Usuario</th>
            <th class="text-white font-weight-bold">Acción</th>
            <th class="text-white font-weight-bold">Módulo</th>
            <th class="text-white font-weight-bold">Descripción</th>
            <th class="text-white font-weight-bold">IP</th>
            <th class="text-white font-weight-bold text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ formatDate(log.createdAt) }}</td>
            <td class="font-weight-medium">{{ log.userName || log.userEmail || 'Desconocido' }}</td>
            <td>{{ log.action }}</td>
            <td>{{ log.module }}</td>
            <td class="text-truncate" style="max-width: 320px">{{ log.description }}</td>
            <td>{{ log.ipAddress }}</td>
            <td class="text-center">
              <v-chip
                :color="log.status === 'SUCCESS' ? 'success' : 'error'"
                size="small"
                label
                class="font-weight-bold"
              >
                {{ log.status === 'SUCCESS' ? 'OK' : 'ERROR' }}
              </v-chip>
            </td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="7" class="text-center py-4 text-grey">No se encontraron registros.</td>
          </tr>
        </tbody>
      </v-table>

      <div class="d-flex justify-center py-4">
        <v-pagination
          v-model="page"
          :length="totalPages"
          @update:model-value="getLogs"
          density="comfortable"
        />
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/helpers/api.js'

const API_URL = "/api/v1/audit"

const logs = ref([]);
const page = ref(1);
const totalPages = ref(1);

const modules = ['AUTH', 'USERS', 'EQUIPOS', 'DOTACIONES', 'UPLOAD', 'PROYECTOS', 'REPORTES'];
const actions = [
  'LOGIN_SUCCESS', 'LOGIN_FAILED',
  'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
  'EQUIPO_CREATED', 'EQUIPO_CATEGORIA_CREATED',
  'DOTACION_CREATED', 'EXCEL_BULK_UPLOAD',
  'PROYECTO_CREATED', 'DATA_DOWNLOAD'
];

const filters = reactive({
  startDate: '',
  endDate: '',
  module: null,
  action: null,
});

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('es-GT');
};

const getLogs = async () => {
  try {
    const params = { page: page.value, limit: 20 };

    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.module) params.module = filters.module;
    if (filters.action) params.action = filters.action;

    const res = await api.get(API_URL, { params });

    logs.value = res.data.data;
    totalPages.value = res.data.totalPages || 1;
  } catch (error) {
    console.error('Error al obtener la bitácora de auditoría:', error);
  }
};

const applyFilters = () => {
  page.value = 1;
  getLogs();
};

onMounted(() => {
  getLogs();
});
</script>

<style scoped>
.admin-table {
  border-radius: 4px;
}

.table-size {
  width: 90vw;
  justify-self: center;
}

.text-indigo-darken-4 {
  color: #002952 !important;
}

.bg-indigo-darken-4 {
  background-color: #002952 !important;
}

.v-table th {
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  font-size: 0.75rem !important;
}
</style>
