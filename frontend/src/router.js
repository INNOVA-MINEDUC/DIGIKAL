import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { apiRequest } from '../services/authService'


import HomeView from './views/HomeView.vue'
import AboutView from './views/AboutView.vue'
import Dashboard from './views/Dashboard.vue'
import SchoolView from './views/SchoolView.vue'
import Comunidades from './views/Comunidades.vue'
import LoginView from './views/LoginView.vue'
import UploadData from './views/UploadData.vue'
import DownloadData from './views/DownloadData.vue'
import CreateEvents from './views/CreateEvents.vue'
import CatalogosView from './views/CatalogosView.vue'
import UserManagement from './views/UserManagement.vue'
import CargaView from './views/CargaView.vue';
import AuditLogView from './views/AuditLogView.vue';
import DashboardEstadisticas from './views/DashboardEstadisticas.vue'
import NotFound from './views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
        meta: { requiresAuth: false }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
        meta: { requiresAuth: false }
  },
  // {
  //   path: '/cargar-datos',
  //   name: 'carga',
  //   component: CargaView,
  //   meta: { requiresAuth: true, allowedRoles: ['admin', 'user'] }
  // },
  {
    // La ficha muestra el inventario del establecimiento con número de serie,
    // código SICOIN y valor de cada equipo, además del contacto del centro.
    // Estaba abierta: iterando el id se podía descargar ese catálogo completo.
    path: '/details',
    name: 'details',
    component: SchoolView,
    meta: { requiresAuth: true }
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: false }
  },

  // {
  //   path: '/dashboard/estadisticas',
  //   name: 'dashboard-estadisticas',
  //   component: DashboardEstadisticas,
  //   meta: { requiresAuth: false }
  // },

  // Las dos vistas de dotaciones: es todo lo que puede ver un auditor.
  // Los mismos roles que ROLES_DOTACION en backend/config/env.js.
  {
    path: '/upload-data',
    name: 'uploaddata',
    component: UploadData,
    meta: { requiresAuth: true, allowedRoles: ['admin', 'user', 'auditor'] }
  },

  {
    path: '/download-data',
    name: 'downloaddata',
    component: DownloadData,
    meta: { requiresAuth: true, allowedRoles: ['admin', 'user', 'auditor'] }
  },

  //   { 
  //   path: '/create-event', 
  //   name: 'createevent', 
  //   component: CreateEvents,
  //   // meta: { requiresAuth: true }
  // },

  {
    path: '/login',
    name: 'login',
    component: LoginView,
        meta: { requiresAuth: false }
  },
  {
    // Gestión de usuarios: solo administrador. Antes dejaba entrar también al
    // rol `user`, que es el de menor privilegio.
    path: '/usuarios',
    name: 'usuarios',
    component: UserManagement,
    meta: { requiresAuth: true, allowedRoles: ['admin'] }
  },

  // {
  //   path: '/catalogos',
  //   name: 'catalogos',
  //   component: CatalogosView,
  //   meta: { requiresAuth: true, allowedRoles: ['admin', 'user'] }
  // },

  {
    path: '/auditoria',
    name: 'auditoria',
    component: AuditLogView,
    meta: { requiresAuth: true, allowedRoles: ['admin'] }
  },

  // Catch-all: cualquier URL que no coincida con las rutas de arriba muestra la
  // página 404. Debe ir al final para que no tape a las demás.
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { requiresAuth: false }
  },
]



const router = createRouter({
  // Hash mode: la ruta va después de `#`, así el servidor sólo ve `/` y el
  // refresh funciona en cualquier hosting sin necesitar la regla
  // `try_files ... /index.html` en su nginx (que es lo que causaba el 403).
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const allowedRoles = to.meta.allowedRoles;

  // 1. Si la ruta NO requiere auth, déjalo pasar
  if (!requiresAuth) {
    return next();
  }

  const auth = useAuthStore();

  /* 2. Comprobación local: hay token, se puede decodificar y no ha caducado.
        Antes sólo se miraba que existiera algo en localStorage, así que un
        token caducado llegaba hasta la llamada al backend. Mirar `exp` aquí
        ahorra la petición y, sobre todo, deja el store en el estado correcto
        para que el nav se actualice. */
  if (!auth.autenticado) {
    auth.cerrarSesion('caducado');
    return next({ name: 'login', query: { redirigido: to.fullPath } });
  }

  try {
    /* 3. Validación contra el backend: es la autoridad. Un token puede estar
          bien firmado y sin caducar y aun así no valer, porque el servidor
          subió `tokenVersion` (cierre de sesión en otro equipo, cambio de
          contraseña, cuenta desactivada). Eso el navegador no lo puede saber
          por sí solo. */
    const user = await apiRequest('/api/v1/auth/validate-token');

    if (!user) {
      throw new Error('Usuario no válido');
    }

    // 4. Verificación de roles, con el rol que devuelve el backend (no el del
    //    token, que podría estar desactualizado).
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return next({ name: 'home' });
    }

    return next();

  } catch (error) {
    // Token caducado, revocado o servidor caído: se cierra la sesión de verdad
    // —lo que repinta el nav— y se manda al login.
    auth.cerrarSesion('revocado');
    return next({ name: 'login', query: { redirigido: to.fullPath } });
  }
});

export default router
