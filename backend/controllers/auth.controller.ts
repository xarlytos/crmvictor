import { Request, Response } from 'express';
import { UsuarioModel } from '../models/Usuario';
import { generateToken } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre } = req.body;

    // Validaciones básicas
    if (!email || !password || !nombre) {
      res.status(400).json({ 
        error: 'Email, contraseña y nombre son requeridos' 
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Formato de email inválido' });
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = await UsuarioModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ error: 'Ya existe un usuario con este email' });
      return;
    }

    // Crear nuevo usuario
    const user = new UsuarioModel({
      email: email.toLowerCase(),
      password,
      nombre,
      rol: 'admin'
    });

    await user.save();

    // Generar token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
      return;
    }

    // Buscar usuario
    const user = await UsuarioModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Email o contraseña incorrectos' });
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Email o contraseña incorrectos' });
      return;
    }

    // Generar token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // El usuario ya está en req.user gracias al middleware
    if (!req.user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    res.json({
      user: {
        id: req.user._id.toString(),
        email: req.user.email,
        nombre: req.user.nombre,
        rol: req.user.rol
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const { nombre, email } = req.body;
    const updates: Partial<{ nombre: string; email: string }> = {};

    if (nombre) updates.nombre = nombre;
    if (email) updates.email = email.toLowerCase();

    // Si cambia el email, verificar que no exista
    if (email && email.toLowerCase() !== req.user.email) {
      const existingUser = await UsuarioModel.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(409).json({ error: 'Ya existe un usuario con este email' });
        return;
      }
    }

    const user = await UsuarioModel.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id.toString(),
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ 
        error: 'Contraseña actual y nueva contraseña son requeridas' 
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
      return;
    }

    // Verificar contraseña actual
    const isCurrentValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentValid) {
      res.status(401).json({ error: 'Contraseña actual incorrecta' });
      return;
    }

    // Actualizar contraseña
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};
