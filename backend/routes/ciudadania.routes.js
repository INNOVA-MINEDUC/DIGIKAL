import express from 'express';
import {
  getResumen,
  buscarPorSerie,
  buscarPorEstablecimiento,
  listarTablets,
} from '../controllers/CiudadaniaController.js';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware.js';
import { publicoLimiter, apiLimiter } from '../middlewares/rateLimit.middleware.js';
import { ROLES_DOTACION } from '../config/env.js';

const router = express.Router();

/**
 * Servicio "Ciudadanía Digital" — consulta de las tablets entregadas.
 *
 * Este router se monta en la ZONA PÚBLICA de app.js, igual que
 * dashboard.routes.js: cada ruta declara aquí su propio nivel de acceso en
 * lugar de depender de dónde está montado el archivo.
 *
 * Consultar (mapa, ranking, "¿mi tablet está registrada?", "¿qué tablets tiene
 * mi escuela?") es de interés directo de las familias y de las OPF que compran
 * estos equipos, así que va sin token. Las respuestas se quedan a nivel de
 * equipo y establecimiento: no devuelven nombres, CUI ni teléfonos, aunque la
 * base sí los guarde (ver la nota de datos personales en el controlador).
 *
 * NO hay rutas de escritura: la base `tablets` es de otro sistema y desde
 * aquí es de solo lectura (ver config/tabletsDb.js). Las altas se hacen
 * cargando los archivos de las OPF en ese otro proceso, no por esta API.
 */

router.get('/resumen', publicoLimiter, getResumen);
router.get('/tablets/serie/:numeroSerie', publicoLimiter, buscarPorSerie);
router.get('/tablets/buscar', publicoLimiter, buscarPorEstablecimiento);

// Listado completo: mismo dato, pero paginado y para el personal operativo.
router.get('/tablets', apiLimiter, authMiddleware, requireRoles(...ROLES_DOTACION), listarTablets);

export default router;
