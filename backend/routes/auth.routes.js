import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  AuthLogin,
  isAuthenticated
} from '../controllers/AuthController.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

router.post('/', AuthLogin);
router.get('/validate-token', authLimiter, isAuthenticated);


export default router;
