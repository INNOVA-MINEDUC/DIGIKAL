/**
 * Este archivo tenía una segunda implementación del bucket, con los nombres
 * viejos de variables (BUCKET_API_*) y leyendo el archivo desde disco. Ninguna
 * ruta lo importa. Se deja como reexport de `bucketService` para que, si algo
 * llega a usarlo, pase por la única implementación real (STORAGE_SERVICE_URL /
 * STORAGE_API_KEY, respaldo local incluido) y no por credenciales que ya no
 * existen en el .env.
 */

export {
  subirArchivo,
  obtenerUrlFirmada,
  eliminarArchivo,
  subirMultiples,
  resolverUrl
} from '../services/bucketService.js';
