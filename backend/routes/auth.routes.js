import express from 'express';
import { AuthLogin } from '../controllers/AuthController.js';

const router = express.Router();

router.post('/', AuthLogin);


export default router;
