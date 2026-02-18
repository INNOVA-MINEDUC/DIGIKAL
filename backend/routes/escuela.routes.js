import express from 'express';
import {
  getEscuelas,
  getEscuelaById,
  createEscuela,
  updateEscuela,
  deleteEscuela
} from '../controllers/EscuelaController.js';

const router = express.Router();

/**
 * GET ALL
 * /api/v1/escuelas
 */
router.get('/', getEscuelas);

/**
 * GET BY ID
 */
router.get('/:id', getEscuelaById);

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
