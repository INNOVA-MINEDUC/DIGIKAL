import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

import {
  createDotacion,
  getDotaciones
} from '../controllers/DotacionController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

const dotacionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP en la ventana
  standardHeaders: true,
  legacyHeaders: false
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

  if (file.fieldname === 'acta_pdf') {

    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    }

    return cb(new Error('El acta debe ser PDF'));

  }

  if (file.fieldname === 'imagenes_entrega') {

    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg'
    ) {
      return cb(null, true);
    }

    return cb(new Error('Solo imágenes JPG o PNG'));

  }

  cb(new Error('Campo no válido'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

// Una dotación puede llevar varias actas: no se sabe de antemano cuántas hay
// por establecimiento, así que se permite un lote.
const uploadFields = upload.fields([
  { name: 'acta_pdf', maxCount: 20 },
  { name: 'imagenes_entrega', maxCount: 10 }
]);

router.post(
  '/',
  dotacionRateLimiter,
  authMiddleware,
  (req, res, next) => {

    uploadFields(req, res, function (err) {

      if (err instanceof multer.MulterError) {

        return res.status(400).json({
          message: 'Error de archivo',
          error: err.message
        });

      }

      if (err) {

        return res.status(400).json({
          message: err.message
        });

      }

      next();

    });

  },
  createDotacion
);

router.get('/', dotacionRateLimiter, authMiddleware, getDotaciones);

export default router;
