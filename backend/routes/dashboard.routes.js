import express from 'express';
import {
  getEscuelasDotadas,
  getEstablecimientoDetalle
} from '../controllers/DashboardController.js';
import { publicoLimiter } from '../middlewares/rateLimit.middleware.js';

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
 * PÚBLICO — ficha completa del establecimiento (vista SchoolView).
 *
 * Decisión del MINEDUC: la transparencia de la dotación pesa más que la
 * reserva, así que cualquiera puede consultar la ficha y abrir las actas y las
 * fotos de evidencia sin iniciar sesión.
 *
 * Conviene tener presente qué se está publicando, porque es amplio: contacto
 * del centro, matrícula desglosada, coordenadas GPS y el inventario con número
 * de serie, código SICOIN y valor en quetzales de cada equipo. Es decir, un
 * catálogo georreferenciado del equipo de cómputo de cada escuela.
 *
 * Como el :id es correlativo, recorrerlo entero descarga el directorio
 * nacional. `publicoLimiter` (120 peticiones por IP cada 15 min) no lo impide,
 * pero lo vuelve lento y visible en los registros.
 *
 * Para volver a cerrarla: añadir `authMiddleware` antes del controlador.
 */
router.get('/establecimiento/:id', publicoLimiter, getEstablecimientoDetalle);

export default router;
