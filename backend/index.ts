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
import siniestrosRouter from './routes/siniestros';
import eventosRouter from './routes/eventos';
import { iniciarCronJobs } from './services/cron-scheduler.service';

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

// Iniciar Cron Jobs para actualización automática de vencimientos
// Se ejecuta inmediatamente y luego todos los días a las 00:00
iniciarCronJobs();

// Health check (público)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CRM Seguros API', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/vencimientos', vencimientosRouter);
app.use('/api/config', configRouter);
app.use('/api/siniestros', siniestrosRouter);
app.use('/api/eventos', eventosRouter);

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
