import express from 'express';
import {
  getEscuelasDotadas,
  getEstablecimientoDetalle
} from '../controllers/DashboardController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { publicoLimiter, apiLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * Este router se monta ANTES de la barrera de autenticación de app.js, así que
 * cada ruta declara aquí su propio nivel de acceso. Se hace explícito a
 * propósito: si alguien mueve el orden de los `app.use`, la protección del
 * detalle sigue en pie.
 */

/**
 * PÚBLICO — alimenta el mapa y el tablero de la página de inicio.
 * Devuelve agregados (totales, conteos por nivel, modelos dotados) y la lista
 * paginada de establecimientos. Va con límite por IP para que no se pueda
 * raspar el país entero a base de peticiones.
 */
router.post('/', publicoLimiter, getEscuelasDotadas);

/**
 * REQUIERE SESIÓN — ficha de un establecimiento con su inventario.
 *
 * Antes era pública: iterando el :id se descargaba el directorio nacional con
 * el correo y teléfono de cada centro, la matrícula desglosada, las coordenadas
 * y el inventario completo con número de serie, código SICOIN y valor en
 * quetzales de cada equipo.
 */
router.get('/establecimiento/:id', apiLimiter, authMiddleware, getEstablecimientoDetalle);

export default router;
