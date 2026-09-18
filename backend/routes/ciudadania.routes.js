import express from 'express';
import multer from 'multer';
import {
  getResumen,
  buscarPorSerie,
  buscarPorEstablecimiento,
  listarTablets,
} from '../controllers/CiudadaniaController.js';
import {
  crearSolicitud,
  listarSolicitudes,
  obtenerSolicitud,
  verificarSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  consultarEstado,
} from '../controllers/SolicitudSerieController.js';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware.js';
import {
  publicoLimiter,
  apiLimiter,
  uploadLimiter,
  escrituraLimiter,
} from '../middlewares/rateLimit.middleware.js';
import { validarMetadatos } from '../utils/archivos.js';
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
 * Las ALTAS siguen sin pasar por aquí: se hacen cargando los archivos de las
 * OPF en el otro proceso. La única escritura sobre la base `tablets` es la
 * corrección del número de serie (ver SolicitudSerieController.js), acotada a
 * esa columna y sólo tras verificar el acta firmada por el director.
 */

router.get('/resumen', publicoLimiter, getResumen);
router.get('/tablets/serie/:numeroSerie', publicoLimiter, buscarPorSerie);
router.get('/tablets/buscar', publicoLimiter, buscarPorEstablecimiento);

// Listado completo: mismo dato, pero paginado y para el personal operativo.
router.get('/tablets', apiLimiter, authMiddleware, requireRoles(...ROLES_DOTACION), listarTablets);

/* ══════════════════════════════════════════════════════════════════════════
   Solicitudes de corrección del número de serie
   ══════════════════════════════════════════════════════════════════════════
   Enviar la solicitud es PÚBLICO a propósito: quien detecta que la serie está
   mal es la dirección o la OPF del centro educativo, y no tienen usuario en
   DIGIKAL. Lo que protege el trámite no es una contraseña sino el documento
   firmado y sellado por el director, y que nada se aplica hasta que alguien
   del personal lo verifica y aprueba.

   Revisar, verificar, aprobar y rechazar SÍ exigen sesión: son las acciones
   que terminan modificando la serie real del equipo.                        */

const subidaDocumento = multer({
  storage: multer.memoryStorage(),
  // El contenido real (firma de los primeros bytes) lo revisa el controlador.
  fileFilter: (req, file, cb) => {
    const error = validarMetadatos(file, 'documento');
    if (error) return cb(new Error(error));
    return cb(null, true);
  },
  // 2 archivos: el oficio del director y, opcional, el ticket de garantía.
  limits: { fileSize: 15 * 1024 * 1024, files: 2 },
});

/* Dos adjuntos: el oficio del director (obligatorio) y, sólo en cambios por
   garantía, el ticket o nota del proveedor (opcional). */
const camposDocumento = subidaDocumento.fields([
  { name: 'documento', maxCount: 1 },
  { name: 'documentoGarantia', maxCount: 1 },
]);

const manejarDocumento = (req, res, next) => {
  camposDocumento(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'El documento no puede pesar más de 15 MB'
        : 'Error al recibir el documento';
      return res.status(400).json({ message });
    }
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

// Público: enviar la solicitud con el acta del director adjunta.
router.post('/solicitudes', uploadLimiter, manejarDocumento, crearSolicitud);

// Público: consultar en qué va el trámite de una serie (sin datos sensibles).
router.get('/solicitudes/estado/:numeroSerie', publicoLimiter, consultarEstado);

// Con sesión: bandeja, verificación y resolución.
router.get('/solicitudes', apiLimiter, authMiddleware, requireRoles(...ROLES_DOTACION), listarSolicitudes);
router.get('/solicitudes/:id', apiLimiter, authMiddleware, requireRoles(...ROLES_DOTACION), obtenerSolicitud);
router.patch('/solicitudes/:id/verificar', escrituraLimiter, authMiddleware, requireRoles(...ROLES_DOTACION), verificarSolicitud);
router.patch('/solicitudes/:id/aprobar', escrituraLimiter, authMiddleware, requireRoles(...ROLES_DOTACION), aprobarSolicitud);
router.patch('/solicitudes/:id/rechazar', escrituraLimiter, authMiddleware, requireRoles(...ROLES_DOTACION), rechazarSolicitud);

export default router;
