import express from 'express';
import {
  getEscuelasDotadas
} from '../controllers/DashboardController.js';

const router = express.Router();


router.post('/', getEscuelasDotadas);

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
