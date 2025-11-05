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

const ClienteSchema = new Schema<ICliente>({
  empresa: { type: String, required: true },
  contacto: { type: String, required: true },
  telefono: { type: String, required: true },
  correo: { type: String, required: true },
  direccion: { type: String },
  notas: { type: String },
  estado: {
    type: String,
    enum: ['contratado', 'contactado_buena_pinta', 'en_negociacion', 'descartado'],
    required: true,
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
    required: true,
  },
  transporte: {
    type: String,
    enum: ['nacional', 'internacional', 'peninsula'],
    required: true,
  },
  poliza: { type: PolizaSchema, required: true },
}, {
  timestamps: true,
});

export const ClienteModel = mongoose.model<ICliente>('Cliente', ClienteSchema);

