import express from 'express';
import {
  getEstadisticas,
  getIndicadores,
  getPorAnio,
  getPorCicloAnio,
  getPorDepartamento,
} from '../controllers/EstadisticasController.js';
import { publicoLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * PÚBLICO — son cifras agregadas por ciclo, departamento y año: no contienen
 * datos de contacto, ubicaciones exactas ni inventario identificable. Se deja
 * abierto porque es lo que muestra el tablero de la página de inicio, pero con
 * límite por IP.
 *
 * Si se decide cerrar también esta parte, basta con mover el `app.use` de
 * estadísticas por debajo de la barrera en app.js.
 */
router.use(publicoLimiter);

// Filtros comunes a todas las rutas: ?anio=2026&ciclo=BASICO&departamento=Petén

/** Payload completo del dashboard (las cuatro vistas en una sola llamada). */
router.get('/', getEstadisticas);

/** Tabla 4 — indicadores clave. */
router.get('/indicadores', getIndicadores);

/** Tabla 1 — resumen por ciclo educativo y año. */
router.get('/ciclo-anio', getPorCicloAnio);

/** Tabla 2 — resumen por departamento. */
router.get('/departamento', getPorDepartamento);

/** Tabla 3 — resumen por año. */
router.get('/anio', getPorAnio);

export default router;
