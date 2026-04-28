import express from 'express';
import {
  getTiposEquipo,
} from '../controllers/TipoEquipoController.js';

const router = express.Router();


router.get('/', getTiposEquipo);




export default router;
