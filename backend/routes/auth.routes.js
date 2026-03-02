import express from 'express';
import { AuthLogin } from '../controllers/AuthController.js';

const router = express.Router();


router.post('/', AuthLogin);

// router.post('/validate-token', isAuthenticated);

export default router;
