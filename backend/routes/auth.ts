import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

export const authRouter = Router();

// Rutas públicas
authRouter.post('/register', register);
authRouter.post('/login', login);

// Rutas protegidas
authRouter.get('/me', authMiddleware, getMe);
authRouter.put('/profile', authMiddleware, updateProfile);
authRouter.put('/change-password', authMiddleware, changePassword);
