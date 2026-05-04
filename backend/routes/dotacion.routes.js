import express from 'express';
import multer from 'multer';
import { 
  createDotacion,
  getDotaciones
} from '../controllers/DotacionCOntroller.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'acta_pdf') {
      cb(null, 'uploads/actas');
    } else if (file.fieldname === 'imagenes_entrega') {
      cb(null, 'uploads/imgs');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: 'acta_pdf', maxCount: 1 },
  { name: 'imagenes_entrega', maxCount: 10 }
]);


router.post('/', uploadFields, createDotacion);

router.get('/', getDotaciones);

export default router;