import mongoose from 'mongoose';

// Usar MongoDB Atlas (prioridad) o fallback a local
const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB() {
  try {
    // Si no hay URI configurada, usamos Atlas por defecto (para desarrollo)
    const atlasUri = 'mongodb+srv://carlos:YpAaoxVf8yUNBvuF@crm-seguros.q1gix6i.mongodb.net/crm-seguros?retryWrites=true&w=majority';
    const uri = MONGODB_URI || atlasUri;
    
    console.log('🔌 Conectando a MongoDB...');
    console.log('☁️  Usando:', MONGODB_URI ? 'URI desde .env' : 'Atlas (default)');
    
    await mongoose.connect(uri);
    console.log('✅ MongoDB Atlas conectado correctamente');
    
    // Eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}
