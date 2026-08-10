import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken, removeToken } from '../utils/auth'
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
    path: '/details',
    name: 'details',
    component: SchoolView,
        meta: { requiresAuth: false }
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

  {
    path: '/upload-data',
    name: 'uploaddata',
    component: UploadData,
    meta: { requiresAuth: true, allowedRoles: ['admin', 'user'] }
  },

  {
    path: '/download-data',
    name: 'downloaddata',
    component: DownloadData,
    meta: { requiresAuth: true, allowedRoles: ['admin', 'user'] }
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
    path: '/usuarios',
    name: 'usuarios',
    component: UserManagement,
     meta: { requiresAuth: true, allowedRoles: ['admin', 'user'] }
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
  const token = getToken();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const allowedRoles = to.meta.allowedRoles;

  // 1. Si la ruta NO requiere auth, déjalo pasar
  if (!requiresAuth) {
    return next();
  }

  // 2. Si requiere auth y NO hay token, al login
  if (!token) {
    return next({ name: 'login' });
  }

  try {
    // 3. Validar token con el backend y obtener datos del usuario
    // Es vital que el backend devuelva { role: 'admin' } o similar
    const user = await apiRequest('/api/v1/auth/validate-token');

    if (!user) {
      throw new Error('Usuario no válido');
    }

    // 4. Verificación de Roles
    if (allowedRoles) {
      if (allowedRoles.includes(user.role)) {
        next(); // Rol autorizado
      } else {
        // Rol no autorizado: Mandar a una página segura o inicio
        next({ name: 'home' });
      }
    } else {
      // Si la ruta requiere auth pero no especifica roles, dejamos pasar
      next();
    }

  } catch (error) {
    // Si el token expiró o es falso, limpiamos y redirigimos
    console.error("Error de autenticación:", error);
    removeToken();
    next({ name: 'login' });
  }
});

export default router
