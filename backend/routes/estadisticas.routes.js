import express from 'express';
import {
  getEstadisticas,
  getIndicadores,
  getPorAnio,
  getPorCicloAnio,
  getPorDepartamento,
} from '../controllers/EstadisticasController.js';

const router = express.Router();

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
