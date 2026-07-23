import express from 'express';
import {
  getEscuelasDotadas,
  getEstablecimientoDetalle
} from '../controllers/DashboardController.js';

const router = express.Router();


router.post('/', getEscuelasDotadas);

// Detalle de un establecimiento + inventario (query establecimiento(id) del API MDM)
router.get('/establecimiento/:id', getEstablecimientoDetalle);

//  /**
//  * GET BY ID
//  */
// router.get('/:id', getEntregaById);

// /**
//  * CREATE
//  */
// router.post('/', createEntrega);

// /**
//  * UPDATE
//  */
// router.put('/:id', updateEntrega);

// /**
//  * DELETE
//  */
// router.delete('/:id', deleteEntrega);

export default router;
