import { createRouter, createWebHistory } from 'vue-router'

// Importa tus vistas
import HomeView from './views/HomeView.vue'
import AboutView from './views/AboutView.vue'
import Dashboard from './views/Dashboard.vue'
import SchoolView from './views/SchoolView.vue'
import Comunidades from './views/Comunidades.vue'
import LoginView from './views/LoginView.vue'
import UploadData from './views/UploadData.vue'
import DownloadData from './views/DownloadData.vue'



const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/details', name: 'details', component: SchoolView },
  { path: '/comunidades', name: 'comunidades', component: Comunidades },
  { path: '/login', name: 'login', component: LoginView },
	{ path: '/upload-data', name: 'uploaddata', component: UploadData },
	{ path: '/download-data', name: 'downloaddata', component: DownloadData },
  // { path: '/excel', name: 'excel', component: ExcelUploadView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_|URL),     
  routes,
})

export default router
