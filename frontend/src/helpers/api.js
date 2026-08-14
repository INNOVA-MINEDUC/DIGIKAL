import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000"
});

// Log para verificar qué URL está usando la aplicación
console.log("[DIGIKAL] API URL:", import.meta.env.VITE_API_URL || "VARIABLE VACÍA - usando localhost:3000");

api.interceptors.request.use(config => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Sesión caída o revocada.
 *
 * El backend ahora puede invalidar un token antes de que expire: al cambiar la
 * contraseña, al desactivar la cuenta o al cerrar sesión sube `tokenVersion` y
 * los tokens viejos dejan de servir. Cuando eso pasa responde 401, y aquí se
 * limpia el token guardado y se manda al login en lugar de dejar la interfaz
 * fallando en silencio.
 *
 * Las rutas de /auth se excluyen: el login devuelve 401 con credenciales
 * incorrectas y ahí el mensaje lo muestra el propio formulario.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401 && !url.includes('/api/v1/auth')) {
      localStorage.removeItem('token');

      // El router usa hash history.
      if (!window.location.hash.startsWith('#/login')) {
        window.location.hash = '#/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Convierte una ruta de archivo devuelta por el backend en una URL absoluta.
 *
 * El backend entrega `/uploads/...` cuando el archivo se guardó en disco (el
 * respaldo que se usa si el bucket no responde). Como el front corre en otro
 * puerto y no hay proxy, esa ruta relativa apuntaría al servidor de Vite: hay
 * que anteponerle la baseURL del API. Las URLs absolutas (bucket) se dejan
 * intactas.
 */
export const urlArchivo = (ruta) => {
  if (!ruta) return null;
  if (/^https?:\/\//i.test(ruta)) return ruta;

  const base = (api.defaults.baseURL || '').replace(/\/$/, '');
  return `${base}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
};

export default api;
