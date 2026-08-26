import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { apiRequest } from '../services/authService'

/* Las vistas se cargan BAJO DEMANDA (import dinámico) en lugar de todas al
   arrancar. Con imports estáticos, Vite metía la aplicación entera en un solo
   archivo de 5.8 MB que el visitante tenía que descargar antes de ver nada,
   aunque sólo entrara a la portada. Eso hunde el LCP, y la velocidad de carga
   sí cuenta para el posicionamiento.

   Ahora cada vista es un archivo aparte y sólo viaja la que se visita. */

const HomeView       = () => import('./views/HomeView.vue')
const AboutView      = () => import('./views/AboutView.vue')
const Dashboard      = () => import('./views/Dashboard.vue')
const SchoolView     = () => import('./views/SchoolView.vue')
const LoginView      = () => import('./views/LoginView.vue')
const UploadData     = () => import('./views/UploadData.vue')
const DownloadData   = () => import('./views/DownloadData.vue')
const UserManagement = () => import('./views/UserManagement.vue')
const AuditLogView   = () => import('./views/AuditLogView.vue')
const NotFound       = () => import('./views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: false,
      titulo: 'DIGIKAL | Transformación Digital Educativa de Guatemala',
      descripcion: 'Política DIGIKAL 2025-2035 del Ministerio de Educación de Guatemala: dotación de equipo tecnológico y conectividad en los establecimientos educativos del país.',
    }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: {
      requiresAuth: false,
      titulo: 'Sobre DIGIKAL | Misión, visión y diagnóstico nacional',
      descripcion: 'Misión y visión 2035 de la Política DIGIKAL, diagnóstico de la brecha digital educativa en Guatemala y marco normativo e internacional que la sustenta.',
    }
  },
  // {
  //   path: '/cargar-datos',
  //   name: 'carga',
  //   component: CargaView,
  //   meta: { requiresAuth: true, allowedRoles: ['admin', 'user'] }
  // },
  {
    // Ficha del establecimiento: abierta a cualquiera, por decisión del
    // MINEDUC, para que las actas y las fotos de evidencia de la dotación se
    // puedan consultar sin tener cuenta. Publica también el inventario con
    // serie, SICOIN y valor de cada equipo (ver dashboard.routes.js).
    path: '/details',
    name: 'details',
    component: SchoolView,
    meta: {
      requiresAuth: false,
      titulo: 'Ficha del establecimiento | DIGIKAL Guatemala',
      descripcion: 'Datos del establecimiento educativo, equipo tecnológico entregado, actas de entrega y fotografías de la dotación.',
    }
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: false,
      titulo: 'Estadísticas de dotación tecnológica | DIGIKAL Guatemala',
      descripcion: 'Establecimientos beneficiados, estudiantes alcanzados y centros conectados por departamento y municipio en Guatemala.',
    }
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



/* Enlaces antiguos con almohadilla (/#/dashboard) → ruta limpia (/dashboard).
   Tiene que ejecutarse ANTES de crear el router, para que éste lea ya la URL
   corregida. Sin esto, cualquier marcador o enlace compartido de la versión
   anterior aterrizaría en la portada. */
if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  const destino = window.location.hash.slice(1)
  window.history.replaceState(null, '', destino)
}

const router = createRouter({
  /* Historial real: URLs como /dashboard en lugar de /#/dashboard.
     Es EL cambio que hace posible posicionar el sitio: los buscadores ignoran
     todo lo que va después de la almohadilla, así que con hash el sitio entero
     era una sola URL para Google y ninguna vista podía aparecer por separado.

     REQUISITO DEL SERVIDOR: al pedir /dashboard directamente, el servidor debe
     devolver index.html en vez de un 404. Ya está resuelto en frontend/nginx.conf
     con `try_files $uri $uri/ /index.html`. Si el sitio se sirve desde otro
     servidor, hay que replicar esa regla allí. */
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  // Al navegar se vuelve arriba, salvo que el usuario use atrás/adelante.
  scrollBehavior: (to, from, savedPosition) => savedPosition || { top: 0 },
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

/* ── Metadatos por página ───────────────────────────────────────────────────
   En una SPA el <title> y la descripción del index.html se quedan fijos: todas
   las vistas comparten los mismos, así que en resultados de búsqueda y al
   compartir un enlace todo el sitio se ve idéntico. Esto los actualiza en cada
   navegación con lo declarado en `meta` de cada ruta.

   Aviso: los rastreadores que NO ejecutan JavaScript (WhatsApp, Facebook,
   LinkedIn) leen el HTML tal cual llega del servidor y nunca verán estos
   valores; para ellos siguen valiendo los del index.html. Resolverlo del todo
   exige prerenderizado. */

const TITULO_POR_DEFECTO = 'DIGIKAL | Transformación Digital Educativa de Guatemala';

const fijarMeta = (selector, atributo, valor) => {
  if (!valor) return;
  let etiqueta = document.head.querySelector(selector);
  if (!etiqueta) {
    etiqueta = document.createElement('meta');
    etiqueta.setAttribute(atributo.split('=')[0], atributo.split('=')[1]);
    document.head.appendChild(etiqueta);
  }
  etiqueta.setAttribute('content', valor);
};

router.afterEach((to) => {
  document.title = to.meta?.titulo || TITULO_POR_DEFECTO;

  const descripcion = to.meta?.descripcion;
  fijarMeta('meta[name="description"]', 'name=description', descripcion);
  fijarMeta('meta[property="og:title"]', 'property=og:title', document.title);
  fijarMeta('meta[property="og:description"]', 'property=og:description', descripcion);

  /* Canónica: le dice a Google cuál es LA dirección de esta página. Sin ella,
     la misma vista alcanzada con distintos parámetros (?id=1&x=2) se trata como
     páginas distintas y compiten entre sí. */
  let canonica = document.head.querySelector('link[rel="canonical"]');
  if (!canonica) {
    canonica = document.createElement('link');
    canonica.setAttribute('rel', 'canonical');
    document.head.appendChild(canonica);
  }
  canonica.setAttribute('href', window.location.origin + to.path);

  /* Las pantallas internas no deben aparecer en buscadores: exigen sesión y
     un resultado que lleva a un login es un mal resultado. */
  const privada = to.meta?.requiresAuth === true;
  fijarMeta('meta[name="robots"]', 'name=robots', privada ? 'noindex, nofollow' : 'index, follow');
});

export default router
