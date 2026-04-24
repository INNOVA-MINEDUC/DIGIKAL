import express from 'express';
import {
  getEscuelas,
  getEscuelaByCodigo,
  createEscuela,
  updateEscuela,
  deleteEscuela,
  getEscuelByCodigoMineduc
} from '../controllers/EscuelaController.js';

const router = express.Router();

/**
 * GET ALL
 * /api/v1/escuelas
 */
router.get('/', getEscuelas);

router.get('/:codigo', getEscuelByCodigoMineduc);

/**
 * GET BY ID
 */
router.post('/udi', getEscuelaByCodigo);

/**
 * CREATE
 */
router.post('/', createEscuela);

/**
 * UPDATE
 */
router.put('/:id', updateEscuela);

/**
 * DELETE
 */
router.delete('/:id', deleteEscuela);

export default router;
