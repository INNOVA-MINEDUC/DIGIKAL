import express from 'express';
import multer from 'multer';

import {
  createDotacion,
  getDotaciones
} from '../controllers/DotacionCOntroller.js';

const router = express.Router();


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



const uploadFields = upload.fields([
  { name: 'acta_pdf', maxCount: 1 },
  { name: 'imagenes_entrega', maxCount: 10 }
]);



router.post(
  '/',
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


router.get('/', getDotaciones);

export default router;