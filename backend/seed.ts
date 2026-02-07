import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UsuarioModel } from './models/Usuario';
import { ClienteModel } from './models/Cliente';
import { ConfigModel } from './models/Config';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-seguros';

const defaultColors: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#fbbf24',
  4: '#84cc16',
  5: '#22c55e',
  6: '#10b981',
  7: '#14b8a6',
  8: '#06b6d4',
  9: '#3b82f6',
  10: '#6366f1',
  11: '#8b5cf6',
  12: '#a855f7',
};

// Helper para crear fechas futuras
const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const addMonths = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
};

const sampleClientes = [
  {
    empresa: 'Transportes Ejemplo S.L.',
    contacto: 'Juan García',
    cif: 'B12345678',
    telefono: '912345678',
    correo: 'juan@ejemplo.com',
    direccion: 'Calle Mayor 123, Madrid',
    notas: 'Cliente potencial, interesado en seguro de flota',
    estado: 'contactado_buena_pinta',
    tipoCarga: 'general_fraccionada',
    transporte: 'nacional',
    poliza: {
      aseguradora: 'Mutua Madrileña',
      numPoliza: 'POL-2024-001',
      fechaInicio: new Date(),
      fechaFin: addMonths(2),
      prima: 2500,
    },
    vencimientos: {
      rc: addDays(15).toISOString(),
      mercancias: addMonths(2).toISOString(),
    },
    numVehiculos: 5,
    facturacion: '500mil',
    fechaLlamada: new Date().toISOString(),
    estadoConversacion: 'Pendiente de propuesta',
  },
  {
    empresa: 'Logística Rápida S.A.',
    contacto: 'María López',
    cif: 'A87654321',
    telefono: '934567890',
    correo: 'maria@logistica.com',
    estado: 'en_negociacion',
    tipoCarga: 'frigorifica',
    transporte: 'internacional',
    poliza: {
      aseguradora: 'Mapfre',
      numPoliza: 'POL-2024-002',
      fechaInicio: new Date(),
      fechaFin: addMonths(5),
      prima: 4500,
    },
    vencimientos: {
      rc: addDays(45).toISOString(),
      mercancias: addMonths(3).toISOString(),
      acc: addMonths(5).toISOString(),
    },
    numVehiculos: 12,
    facturacion: '2M',
    estadoConversacion: 'Negociando condiciones',
  },
  {
    empresa: 'Transportes Frío Express',
    contacto: 'Carlos Ruiz',
    cif: 'B11223344',
    telefono: '956789012',
    correo: 'carlos@frioexpress.com',
    estado: 'contratado',
    tipoCarga: 'frigorifica',
    transporte: 'peninsular',
    poliza: {
      aseguradora: 'Catalana Occidente',
      numPoliza: 'POL-2024-003',
      fechaInicio: new Date(),
      fechaFin: addMonths(4),
      prima: 3200,
    },
    vencimientos: {
      rc: addDays(30).toISOString(),
      flotas: addMonths(4).toISOString(),
    },
    numVehiculos: 8,
    facturacion: '1.2M',
    fechaLlamada: addDays(-5).toISOString(),
    estadoConversacion: 'Cliente activo',
  },
  {
    empresa: 'Mudanzas Veloz',
    contacto: 'Ana Martínez',
    cif: 'B33445566',
    telefono: '912345679',
    correo: 'ana@mudanzasveloz.com',
    estado: 'contactado_buena_pinta',
    tipoCarga: 'completa_ftl',
    transporte: 'nacional',
    poliza: {
      aseguradora: 'Zurich',
      numPoliza: 'POL-2024-004',
      fechaInicio: new Date(),
      fechaFin: addMonths(6),
      prima: 1800,
    },
    vencimientos: {
      rc: addDays(60).toISOString(),
      mercancias: addMonths(2).toISOString(),
      acc: addMonths(4).toISOString(),
      pyme: addMonths(6).toISOString(),
    },
    numVehiculos: 3,
    facturacion: '300mil',
    fechaLlamada: addDays(-10).toISOString(),
    estadoConversacion: 'Esperando respuesta',
  },
  {
    empresa: 'Carga Pesada S.L.',
    contacto: 'Pedro Sánchez',
    cif: 'B55667788',
    telefono: '934567891',
    correo: 'pedro@cargapesada.com',
    estado: 'contratado',
    tipoCarga: 'a_granel',
    transporte: 'internacional',
    poliza: {
      aseguradora: 'Allianz',
      numPoliza: 'POL-2024-005',
      fechaInicio: new Date(),
      fechaFin: addMonths(8),
      prima: 5500,
    },
    vencimientos: {
      rc: addMonths(1).toISOString(),
      mercancias: addMonths(3).toISOString(),
      flotas: addMonths(6).toISOString(),
    },
    numVehiculos: 15,
    facturacion: '5M',
    estadoConversacion: 'Renovación automática',
  },
  {
    empresa: 'Transporte Urgente 24h',
    contacto: 'Laura Gómez',
    cif: 'B77889900',
    telefono: '956789013',
    correo: 'laura@urgente24h.com',
    estado: 'en_negociacion',
    tipoCarga: 'fraccionada_ltl',
    transporte: 'peninsular',
    poliza: {
      aseguradora: 'AXA',
      numPoliza: 'POL-2024-006',
      fechaInicio: new Date(),
      fechaFin: addMonths(3),
      prima: 2800,
    },
    vencimientos: {
      rc: addDays(20).toISOString(),
      acc: addMonths(2).toISOString(),
    },
    numVehiculos: 6,
    facturacion: '800mil',
    fechaLlamada: addDays(-3).toISOString(),
    estadoConversacion: 'Pendiente de firma',
  },
  {
    empresa: 'Frutas Frescas Transport',
    contacto: 'Miguel Torres',
    cif: 'B99001122',
    telefono: '912345680',
    correo: 'miguel@frutasfrescas.com',
    estado: 'contratado',
    tipoCarga: 'frigorifica',
    transporte: 'nacional',
    poliza: {
      aseguradora: 'Generali',
      numPoliza: 'POL-2024-007',
      fechaInicio: new Date(),
      fechaFin: addMonths(7),
      prima: 4200,
    },
    vencimientos: {
      rc: addMonths(2).toISOString(),
      mercancias: addMonths(5).toISOString(),
      flotas: addMonths(7).toISOString(),
      pyme: addMonths(4).toISOString(),
    },
    numVehiculos: 10,
    facturacion: '3.5M',
    estadoConversacion: 'Cliente satisfecho',
  },
  {
    empresa: 'Transportes Química Segura',
    contacto: 'Rosa Fernández',
    cif: 'B11335577',
    telefono: '934567892',
    correo: 'rosa@quimicasegura.com',
    estado: 'contactado_buena_pinta',
    tipoCarga: 'adr_peligrosas',
    transporte: 'internacional',
    poliza: {
      aseguradora: 'Pelayo',
      numPoliza: 'POL-2024-008',
      fechaInicio: new Date(),
      fechaFin: addMonths(10),
      prima: 6800,
    },
    vencimientos: {
      rc: addDays(90).toISOString(),
      mercancias: addMonths(4).toISOString(),
      acc: addMonths(7).toISOString(),
    },
    numVehiculos: 20,
    facturacion: '8M',
    estadoConversacion: 'Estudiando propuesta',
  },
  {
    empresa: 'Distribución Express',
    contacto: 'David Jiménez',
    cif: 'B22446688',
    telefono: '956789014',
    correo: 'david@distribucionexpress.com',
    estado: 'descartado',
    tipoCarga: 'general_fraccionada',
    transporte: 'nacional',
    poliza: {
      aseguradora: 'Caser',
      numPoliza: 'POL-2024-009',
      fechaInicio: new Date(),
      fechaFin: addMonths(1),
      prima: 1500,
    },
    vencimientos: {
      rc: addDays(25).toISOString(),
    },
    numVehiculos: 2,
    facturacion: '150mil',
    estadoConversacion: 'No interesa por ahora',
  },
  {
    empresa: 'Transportes Montaña',
    contacto: 'Isabel Moreno',
    cif: 'B33669911',
    telefono: '912345681',
    correo: 'isabel@montanatrans.com',
    estado: 'contratado',
    tipoCarga: 'vehiculos',
    transporte: 'peninsular',
    poliza: {
      aseguradora: 'Mutua Madrileña',
      numPoliza: 'POL-2024-010',
      fechaInicio: new Date(),
      fechaFin: addMonths(9),
      prima: 3500,
    },
    vencimientos: {
      rc: addMonths(3).toISOString(),
      mercancias: addMonths(6).toISOString(),
      flotas: addMonths(9).toISOString(),
    },
    numVehiculos: 7,
    facturacion: '1.8M',
    estadoConversacion: 'Renovación pactada',
  },
];

async function seed() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes (opcional - descomenta si quieres resetear)
    console.log('🗑️  Limpiando datos existentes...');
    await UsuarioModel.deleteMany({});
    await ClienteModel.deleteMany({});
    await ConfigModel.deleteMany({});

    // Crear usuario admin
    console.log('👤 Creando usuario admin...');
    const admin = new UsuarioModel({
      email: 'admin@crm.com',
      password: 'admin123',
      nombre: 'Administrador',
      rol: 'admin',
    });
    await admin.save();
    console.log('✅ Usuario admin creado:');
    console.log('   Email: admin@crm.com');
    console.log('   Password: admin123');

    // Crear configuración por defecto
    console.log('⚙️  Creando configuración...');
    const config = new ConfigModel({
      alertWindowDays: 60,
      monthColors: defaultColors,
    });
    await config.save();
    console.log('✅ Configuración creada');

    // Crear clientes de ejemplo
    console.log('👥 Creando clientes de ejemplo...');
    for (const clienteData of sampleClientes) {
      const cliente = new ClienteModel(clienteData);
      await cliente.save();
    }
    console.log(`✅ ${sampleClientes.length} clientes de ejemplo creados`);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   - Puedes iniciar sesión con: admin@crm.com / admin123');
    console.log('   - La configuración por defecto está lista');
    console.log(`   - ${sampleClientes.length} clientes creados con vencimientos variados`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

// Ejecutar seed
seed();
