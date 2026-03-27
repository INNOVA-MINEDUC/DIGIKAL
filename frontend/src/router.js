import { createRouter, createWebHistory } from 'vue-router'
import { getToken, removeToken } from '../utils/auth'
import { apiRequest } from '../services/authService'

// Importa tus vistas
import HomeView from './views/HomeView.vue'
import AboutView from './views/AboutView.vue'
import Dashboard from './views/Dashboard.vue'
import SchoolView from './views/SchoolView.vue'
import Comunidades from './views/Comunidades.vue'
import LoginView from './views/LoginView.vue'
import UploadData from './views/UploadData.vue'
import DownloadData from './views/DownloadData.vue'
import CreateEvents from './views/CreateEvents.vue'

const routes = [
  { path: '/', 
    name: 'home', 
    component: HomeView
  },
  { 
    path: '/about', 
    name: 'about', 
    component: AboutView 
  },
  { 
    path: '/comunities', 
    name: 'comunities', 
    component: Comunidades
  },
  { 
    path: '/details', 
    name: 'details', 
    component: SchoolView 
  },

  { 
    path: '/dashboard', 
    name: 'dashboard', 
    component: Dashboard,
    // meta: { requiresAuth: true }
  },

  { 
    path: '/upload-data', 
    name: 'uploaddata', 
    component: UploadData,
    // meta: { requiresAuth: true, role: 'admin' }
  },

  { 
    path: '/download-data', 
    name: 'downloaddata', 
    component: DownloadData,
    // meta: { requiresAuth: true }
  },

    { 
    path: '/create-event', 
    name: 'createevent', 
    component: CreateEvents,
    // meta: { requiresAuth: true }
  },

  { 
    path: '/login', 
    name: 'login', 
    component: LoginView
  },
]



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_|URL),     
  routes
})

router.beforeEach(async (to, from, next) => {

  const token = getToken()

  if (to.meta.requiresAuth) {

    if (!token) {
      return next('/login')
    }

    try {

      // Validar token con backend
      const user = await apiRequest('/validate-token')

      // Si la ruta requiere rol específico
      if (to.meta.role && user.role !== to.meta.role) {
        return next('/dashboard')
      }

      next()

    } catch (error) {
      removeToken()
      next('/login')
    }

  } else {
    next()
  }

})

export default router
