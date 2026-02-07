import mongoose from 'dotenv';
import dotenv from 'dotenv';
import { UsuarioModel } from './models/Usuario';
import { ClienteModel } from './models/Cliente';
import { ConfigModel } from './models/Config';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-seguros';

async function cleanDB() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar clientes
    console.log('🗑️  Eliminando todos los clientes...');
    const clientesDeleted = await ClienteModel.deleteMany({});
    console.log(`✅ ${clientesDeleted.deletedCount} clientes eliminados`);

    // Verificar que el usuario admin exista
    console.log('👤 Verificando usuario admin...');
    let admin = await UsuarioModel.findOne({ email: 'victor@crm.com' });
    
    if (!admin) {
      console.log('⚠️  Creando usuario victor@crm.com...');
      admin = new UsuarioModel({
        email: 'victor@crm.com',
        password: 'victor123',
        nombre: 'Victor',
        rol: 'admin'
      });
      await admin.save();
      console.log('✅ Usuario victor@crm.com creado');
    } else {
      console.log('✅ Usuario victor@crm.com ya existe');
    }

    // Verificar configuración
    console.log('⚙️  Verificando configuración...');
    let config = await ConfigModel.findOne();
    if (!config) {
      config = new ConfigModel({
        alertWindowDays: 60,
        monthColors: {
          1: '#ef4444', 2: '#f97316', 3: '#fbbf24', 4: '#84cc16',
          5: '#22c55e', 6: '#10b981', 7: '#14b8a6', 8: '#06b6d4',
          9: '#3b82f6', 10: '#6366f1', 11: '#8b5cf6', 12: '#a855f7',
        }
      });
      await config.save();
      console.log('✅ Configuración por defecto creada');
    }

    console.log('\n🎉 Base de datos limpiada exitosamente!');
    console.log('\n📋 Estado actual:');
    console.log('   - Clientes: 0 (vacío para Victor)');
    console.log('   - Usuario: victor@crm.com / victor123');
    console.log('   - Configuración: Lista');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

// Ejecutar
cleanDB();
