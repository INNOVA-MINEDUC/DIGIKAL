import express from 'express';
import multer from 'multer';

import {
  createDotacion,
  getDotaciones,
  agregarImagenes
} from '../controllers/DotacionController.js';
import { apiLimiter, uploadLimiter } from '../middlewares/rateLimit.middleware.js';
import { validarMetadatos, validarContenido } from '../utils/archivos.js';
import { requireRoles } from '../middlewares/auth.middleware.js';
import { ROLES_DOTACION } from '../config/env.js';

const router = express.Router();

const storage = multer.memoryStorage();

/** Qué perfil de archivo corresponde a cada campo del formulario. */
const PERFIL_POR_CAMPO = {
  acta_pdf: 'pdf',
  imagenes_entrega: 'imagen',
};

/**
 * Primera barrera: nombre y extensión. El filtro anterior solo miraba
 * `file.mimetype`, que lo escribe el cliente, así que bastaba declarar
 * "application/pdf" para subir un .html.
 */
const fileFilter = (req, file, cb) => {
  const perfil = PERFIL_POR_CAMPO[file.fieldname];

  if (!perfil) return cb(new Error('Campo no válido'));

  const error = validarMetadatos(file, perfil);
  if (error) return cb(new Error(error));

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 30,
  }
});

// Una dotación puede llevar varias actas: no se sabe de antemano cuántas hay
// por establecimiento, así que se permite un lote.
const uploadFields = upload.fields([
  { name: 'acta_pdf', maxCount: 20 },
  { name: 'imagenes_entrega', maxCount: 10 }
]);

/**
 * Segunda barrera: el contenido real. Se ejecuta después de Multer, cuando ya
 * hay búfer, y comprueba los primeros bytes de cada archivo contra la firma que
 * le corresponde. Un .html renombrado a .pdf no empieza por "%PDF" y aquí cae.
 */
const verificarContenido = (req, res, next) => {
  for (const [campo, perfil] of Object.entries(PERFIL_POR_CAMPO)) {
    for (const file of req.files?.[campo] ?? []) {
      const error = validarContenido(file, perfil);
      if (error) return res.status(400).json({ message: error });
    }
  }
  next();
};

/** Envuelve un manejador de Multer traduciendo sus errores a 400. */
const manejarConMulter = (manejador) => (req, res, next) => {
  manejador(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Error de archivo', error: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

const manejarSubida = manejarConMulter(uploadFields);

/** Sólo fotos: es lo que acepta la ruta de agregar evidencia. */
const manejarSoloImagenes = manejarConMulter(
  upload.fields([{ name: 'imagenes_entrega', maxCount: 10 }])
);

/**
 * La sesión la exige la barrera de app.js; aquí se acota el ROL.
 *
 * admin, user y auditor: registrar y consultar dotaciones es justo el trabajo
 * del auditor, y lo único que puede hacer en el sistema.
 */
router.use(requireRoles(...ROLES_DOTACION));

router.post('/', uploadLimiter, manejarSubida, verificarContenido, createDotacion);

router.get('/', apiLimiter, getDotaciones);

/**
 * Agregar fotos de evidencia a una dotación ya registrada.
 *
 * Las fotos son opcionales al crearla —el acta suele llegar antes—, así que
 * hace falta una vía para completarlas después sin rehacer el registro.
 */
router.post(
  '/:id/imagenes',
  uploadLimiter,
  manejarSoloImagenes,
  verificarContenido,
  agregarImagenes
);

export default router;
