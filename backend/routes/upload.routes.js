import express from 'express';
import multer from 'multer';

import {
  importarExcelDotaciones
} from '../controllers/UploadController.js';

const router = express.Router();


// =========================
// STORAGE
// =========================
const storage = multer.memoryStorage();


// =========================
// VALIDAR SOLO EXCEL
// =========================
const fileFilter = (req, file, cb) => {

  const tiposValidos = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (tiposValidos.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      'Solo se permiten archivos Excel (.xlsx o .xls)'
    )
  );
};


// =========================
// MULTER
// =========================
const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024
  }
});


// =========================
// RUTA IMPORTAR EXCEL
// =========================
router.post('/', (req, res, next) => {

    upload.single('excel')(
      req,
      res,
      function (err) {

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

      }
    );

  },

  importarExcelDotaciones
);

export default router;