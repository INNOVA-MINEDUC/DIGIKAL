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
 *
 * GET /api/v1/politicas
 */
router.get('/', getFasePolitica);

/**
 * 
 * GET /api/v1/politicas/:id
 */
router.get('/:id', getIdFasePolitica);

/**
 * 
 * POST /api/v1/politicas
 */
router.post('/', createFasePolitica);

/**
 * 
 * PUT /api/v1/politicas/:id
 */
router.put('/:id', updateIdFasePolitica);

/**
 * 
 * DELETE /api/v1/politicas/:id
 */
router.delete('/:id', deleteIdFasePolitica);

export default router;
