import express from 'express';
import {
  getEntregas,
  getEntregaById,
  createEntrega,
  updateEntrega,
  deleteEntrega
} from '../controllers/EntregaDetalleController.js';

const router = express.Router();

/**
 * GET ALL
 * /api/v1/entregas
 */
router.get('/', getEntregas);

/**
 * GET BY ID
 */
router.get('/:id', getEntregaById);

/**
 * CREATE
 */
router.post('/', createEntrega);

/**
 * UPDATE
 */
router.put('/:id', updateEntrega);

/**
 * DELETE
 */
router.delete('/:id', deleteEntrega);

export default router;
