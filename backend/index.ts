import dotenv from 'dotenv';
// Cargar variables de entorno antes de cualquier otra importación
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import { authRouter } from './routes/auth';
import { clientesRouter } from './routes/clientes';
import { vencimientosRouter } from './routes/vencimientos';
import { configRouter } from './routes/config';
import { UsuarioModel } from './models/Usuario';
import { generateToken } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando servidor...');
console.log('🔧 MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurado' : '❌ No configurado');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ Usando default');

// Configuración de CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Health check (público)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CRM Seguros API', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Endpoint de emergencia para crear usuario admin (solo desarrollo)
app.post('/api/setup/admin', async (req, res) => {
  try {
    const { email = 'admin@crm.com', password = 'admin123', nombre = 'Administrador' } = req.body;
    
    // Verificar si ya existe
    let user = await UsuarioModel.findOne({ email: email.toLowerCase() });
    
    if (user) {
      user.password = password;
      await user.save();
      return res.json({ 
        message: 'Usuario actualizado',
        user: {
          id: user._id.toString(),
          email: user.email,
          nombre: user.nombre
        }
      });
    }
    
    // Crear nuevo usuario
    user = new UsuarioModel({
      email: email.toLowerCase(),
      password,
      nombre,
      rol: 'admin'
    });
    await user.save();
    
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });
    
    res.json({
      message: 'Usuario admin creado',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/vencimientos', vencimientosRouter);
app.use('/api/config', configRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
