import express from 'express';
import { 
  AuthLogin,
  isAuthenticated
} from '../controllers/AuthController.js';

const router = express.Router();


router.post('/', AuthLogin);
router.get('/validate-token', isAuthenticated);


export default router;
