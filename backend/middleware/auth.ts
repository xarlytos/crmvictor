import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioModel, IUsuario } from '../models/Usuario';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: IUsuario;
    }
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      res.status(401).json({ error: 'No autorizado. Token inválido.' });
      return;
    }

    try {
      const decoded = verifyToken(token);
      
      // Buscar el usuario en la base de datos
      const user = await UsuarioModel.findById(decoded.userId);
      
      if (!user) {
        res.status(401).json({ error: 'No autorizado. Usuario no encontrado.' });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      res.status(401).json({ error: 'No autorizado. Token inválido o expirado.' });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Error en la autenticación' });
    return;
  }
};

// Middleware opcional - no requiere auth pero la añade si existe
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = verifyToken(token);
        const user = await UsuarioModel.findById(decoded.userId);
        if (user) {
          req.user = user;
        }
      } catch {
        // Ignorar errores de token inválido en auth opcional
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};
