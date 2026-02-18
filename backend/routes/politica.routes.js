import express from 'express';
import { 
  createFasePolitica, 
  deleteIdFasePolitica, 
  getFasePolitica, 
  getIdFasePolitica, 
  updateIdFasePolitica
} from '../controllers/FasePoliticaController.js';

const router = express.Router();

/**
 * 📌 GET ALL
 * GET /api/v1/politicas
 */
router.get('/', getFasePolitica);

/**
 * 📌 GET BY ID
 * GET /api/v1/politicas/:id
 */
router.get('/:id', getIdFasePolitica);

/**
 * 📌 CREATE
 * POST /api/v1/politicas
 */
router.post('/', createFasePolitica);

/**
 * 📌 UPDATE
 * PUT /api/v1/politicas/:id
 */
router.put('/:id', updateIdFasePolitica);

/**
 * 📌 DELETE
 * DELETE /api/v1/politicas/:id
 */
router.delete('/:id', deleteIdFasePolitica);

export default router;
