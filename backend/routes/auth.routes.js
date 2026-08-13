import express from 'express';
import {
  AuthLogin,
  isAuthenticated,
  logout
} from '../controllers/AuthController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { loginLimiter, apiLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * El limitador va en el inicio de sesión, que es lo que se ataca por fuerza
 * bruta. Antes estaba definido en este archivo pero aplicado a
 * `/validate-token`, dejando el login sin ningún tope de intentos.
 */
router.post('/', loginLimiter, AuthLogin);

router.get('/validate-token', apiLimiter, authMiddleware, isAuthenticated);

router.post('/logout', apiLimiter, authMiddleware, logout);

export default router;
