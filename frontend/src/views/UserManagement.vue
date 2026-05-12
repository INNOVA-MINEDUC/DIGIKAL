<template>
  <v-container class="py-10" fluid>
    <!-- Cabecera -->
    <v-card class="mb-6 px-4 py-2 " elevation="2" border>
      <v-row align="center">
        <v-col cols="12" md="6">
          <div class="d-flex align-center">
            <v-icon size="40" color="indigo-darken-4" class="mr-3">mdi-shield-account</v-icon>
            <div>
              <h1 class="text-h5 font-weight-bold text-indigo-darken-4 mb-0">
                SISTEMA DE GESTIÓN DE USUARIOS
              </h1>
              <span class="text-caption text-uppercase text-grey-darken-1">
                Gobierno de Guatemala | Control de Accesos y Roles
              </span>
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6" class="text-md-right">
          <v-btn 
            color="indigo-darken-4" 
            prepend-icon="mdi-account-plus" 
            class="px-6" 
            rounded="sm" 
            @click="openModal()"
          >
            Registrar Nuevo Usuario
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabla de Usuarios -->
    <v-card elevation="1" border class="table-size">
      <v-table hover class="admin-table ">
        <thead>
          <tr class="bg-indigo-darken-4">
            <th class="text-white font-weight-bold">Funcionario</th>
            <th class="text-white font-weight-bold">Correo Institucional</th>
            <th class="text-white font-weight-bold">Roles Asignados</th>
            <th class="text-white font-weight-bold text-center">Estado</th>
            <th class="text-white font-weight-bold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="font-weight-medium">{{ user.name }}</td>
            <td class="text-grey-darken-2">{{ user.email }}</td>
            <td>
              <div class="d-flex flex-wrap gap-1">
          <v-chip
  size="x-small"
  color="indigo-lighten-1"
  variant="outlined"
>
  {{ user.role?.descripcion }}
</v-chip>
              </div>
            </td>
            <td class="text-center">
              <v-chip :color="user.active ? 'success' : 'grey-darken-1'" size="small" label class="font-weight-bold">
                {{ user.active ? 'ACTIVO' : 'INACTIVO' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-tooltip text="Editar usuario" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-pencil-outline" variant="text" color="indigo-accent-4"
                    density="comfortable" class="mr-1" @click="openModal(user)"></v-btn>
                </template>
              </v-tooltip>

              <v-tooltip :text="user.active ? 'Desactivar acceso' : 'Activar acceso'" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" :icon="user.active ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
                    variant="text" :color="user.active ? 'green-darken-2' : 'red-darken-2'" density="comfortable"
                    @click="toggleStatus(user)"></v-btn>
                </template>
              </v-tooltip>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="5" class="text-center py-4 text-grey">No se encontraron registros.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Modal de Formulario -->
    <v-dialog v-model="showModal" max-width="700px" persistent>
      <v-card rounded="sm">
        <v-toolbar color="indigo-darken-4" density="compact">
          <v-toolbar-title class="text-body-1 font-weight-bold">
            {{ isEditing ? 'MODIFICAR EXPEDIENTE' : 'ALTA DE FUNCIONARIO' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" @click="showModal = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="userForm" @submit.prevent="saveUser">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.name" label="Nombre Completo" variant="filled"
                  prepend-inner-icon="mdi-account" required></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.email" label="Correo Electrónico" variant="filled"
                  prepend-inner-icon="mdi-email" type="email" required></v-text-field>
              </v-col>

              <v-col cols="12">
             <v-select
  v-model="form.roleId"
  :items="availableRoles"
  item-title="nombre"
  item-value="id"
  label="Rol del Usuario"
  variant="filled"
  prepend-inner-icon="mdi-shield-key"
/>
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="form.password"
                  :label="isEditing ? 'Actualizar Contraseña (dejar en blanco para mantener)' : 'Contraseña Inicial'" 
                  variant="filled"
                  prepend-inner-icon="mdi-key" :type="visible ? 'text' : 'password'"
                  :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="visible = !visible"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="grey-darken-2" class="px-6" @click="showModal = false">
            Cancelar
          </v-btn>
          <v-btn color="indigo-darken-4" variant="flat" class="px-8" @click="saveUser">
            {{ isEditing ? 'Guardar Cambios' : 'Registrar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/helpers/api.js'


const API_URL = "/api/v1/user"

// --- ESTADO ---
const users = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const visible = ref(false);
const availableRoles = ref([]);

const form = reactive({
  id: null,
  name: '',
  email: '',
  password: '',
  roleId: null, // 🔥 corregido
  active: true
});

const getRoles = async () => {
  try {
    const res = await api.get('/api/v1/role');

    // 🔥 guardamos TODO el objeto, no solo el nombre
    availableRoles.value = res.data;

  } catch (error) {
    console.error('Error cargando roles:', error);
  }
};

// --- MÉTODOS API ---

const getUsersFromAPI = async () => {
  try {
    const res = await api.get(API_URL);

    const data = Array.isArray(res.data) ? res.data : res.data.data;

    users.value = data.map(user => ({
      ...user,
      roles: user.role ? [user.role.nombre] : [] // 🔥 FIX AQUÍ
    }));

    console.log(users.value)

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
  }
};

const saveUser = async () => {
  if (!form.name || !form.email || !form.roleId) {
    alert('Todos los campos son obligatorios');
    return;
  }

  try {
    const payload = {
      name: form.name,
      email: form.email,
      roleId: form.roleId,
      active: form.active
    };

    if (form.password) payload.password = form.password;

    if (isEditing.value) {
      await api.put(`${API_URL}/${form.id}`, payload);
    } else {
      await api.post(API_URL, payload);
    }

    await getUsersFromAPI();
    showModal.value = false;

  } catch (error) {
    console.error(error);
  }
};

const toggleStatus = async (user) => {
  try {
    const data = await api.put(`${API_URL}/${user.id}`, {
      ...user,
      active: !user.active
    });
    console.log(data)
    await getUsersFromAPI();
  } catch (error) {
    console.error('Error al cambiar estado:', error);
  }
};


// --- LÓGICA DE UI ---

const openModal = (user = null) => {
  visible.value = false;

  if (user) {
    isEditing.value = true;

    Object.assign(form, {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      password: '',
      active: user.active
    });

  } else {
    isEditing.value = false;

    Object.assign(form, {
      id: null,
      name: '',
      email: '',
      roleId: null, // 🔥 importante
      password: '',
      active: true
    });
  }

  showModal.value = true;
};

onMounted(() => {
  getUsersFromAPI();
  getRoles();
});
</script>

<style scoped>
.admin-table {
  border-radius: 4px;
}

.table-size{
  width: 80vw;
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

.gap-1 {
  gap: 4px;
}
</style>