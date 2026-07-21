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
