import mongoose, { Schema, Document } from 'mongoose';
import type { Cliente, EstadoCliente, TipoCarga, Transporte } from '../../src/types';

export interface ICliente extends Omit<Cliente, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const PolizaSchema = new Schema({
  aseguradora: { type: String },
  numPoliza: { type: String },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  prima: { type: Number },
}, { _id: false });

const VencimientosSchema = new Schema({
  rc: { type: String }, // ISO date string
  mercancias: { type: String }, // ISO date string
  acc: { type: String }, // ISO date string
  flotas: { type: String }, // ISO date string
  pyme: { type: String }, // ISO date string
}, { _id: false });

const ClienteSchema = new Schema<ICliente>({
  empresa: { type: String, required: true },
  contacto: { type: String, required: true },
  cif: { type: String },
  telefono: { type: String },
  correo: { type: String },
  direccion: { type: String },
  notas: { type: String },
  estado: {
    type: String,
    enum: ['contratado', 'contactado_buena_pinta', 'en_negociacion', 'descartado'],
  },
  tipoCarga: {
    type: String,
    enum: [
      'general_fraccionada',
      'frigorifica',
      'adr_peligrosas',
      'completa_ftl',
      'fraccionada_ltl',
      'a_granel',
      'vehiculos',
    ],
  },
  transporte: {
    type: String,
    enum: ['nacional', 'internacional', 'peninsular', 'espana_francia', 'espana_portugal', 'espana_francia_portugal'],
  },
  poliza: { type: PolizaSchema, required: true },
  vencimientos: { type: VencimientosSchema },
  numVehiculos: { type: Number },
  facturacion: { type: String },
  fechaLlamada: { type: String }, // ISO date string
  estadoConversacion: { type: String },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const ClienteModel = mongoose.model<ICliente>('Cliente', ClienteSchema);
