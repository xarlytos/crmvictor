import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ClienteModel } from './models/Cliente';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-seguros';

async function migrate() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('🗑️  Borrando campo estado de todos los clientes...');

    const result = await ClienteModel.updateMany(
      {}, // todos los documentos
      { $unset: { estado: 1 } } // borra el campo estado
    );

    console.log(`✅ Migración completada:`);
    console.log(`   - ${result.modifiedCount} clientes modificados`);
    console.log(`   - ${result.matchedCount} clientes encontrados`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

migrate();
