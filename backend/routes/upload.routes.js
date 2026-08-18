import express from 'express';
import multer from 'multer';

import { importarExcelDotaciones } from '../controllers/UploadController.js';
import { uploadLimiter } from '../middlewares/rateLimit.middleware.js';
import { validarMetadatos, validarContenido } from '../utils/archivos.js';
import { requireRoles } from '../middlewares/auth.middleware.js';
import { ROLES_DOTACION } from '../config/env.js';

const router = express.Router();

const storage = multer.memoryStorage();

/**
 * Antes se aceptaba cualquier archivo cuyo `mimetype` declarado fuera de Excel,
 * sin mirar la extensión ni el contenido.
 */
const fileFilter = (req, file, cb) => {
  const error = validarMetadatos(file, 'excel');
  if (error) return cb(new Error(error));
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1,
  }
});

const manejarSubida = (req, res, next) => {
  upload.single('excel')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Error de archivo', error: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

/** Comprobación de los primeros bytes: .xlsx es un ZIP, .xls un contenedor OLE2. */
const verificarContenido = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo' });
  }

  const error = validarContenido(req.file, 'excel');
  if (error) return res.status(400).json({ message: error });

  next();
};

// La sesión la exige la barrera de app.js. La carga por Excel forma parte de
// "Crear Dotación", así que la usan los mismos roles.
router.post(
  '/',
  requireRoles(...ROLES_DOTACION),
  uploadLimiter,
  manejarSubida,
  verificarContenido,
  importarExcelDotaciones
);

export default router;
