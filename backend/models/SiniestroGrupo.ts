import mongoose, { Schema, Document } from 'mongoose';

export interface ISiniestro {
  _id?: string;
  nombreTomador: string;
  numeroPoliza: string;
  compania: string;
  matricula: string;
  fechaOcurrencia: Date | null;
  tipoSiniestro: string;
  fechaApertura: Date | null;
  numSiniestroCompania: string;
  numSiniestroElevia: string;
  estado: 'abierto' | 'cerrado';
  costeTotal: number | null;
  culpa: 'tomador' | 'contrario' | null;
  observaciones: string;
  fechaCierre: Date | null;
  valoracion: 'positiva' | 'intermedia' | 'negativa' | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISiniestroGrupo extends Document {
  _id: string;
  clienteId: string;
  empresa: {
    nombre: string;
    direccion?: string;
    cp?: string;
    ciudad?: string;
  };
  observacionesGenerales: string;
  siniestros: ISiniestro[];
  createdAt: Date;
  updatedAt: Date;
}

const SiniestroSchema = new Schema<ISiniestro>(
  {
    nombreTomador: { type: String, default: '' },
    numeroPoliza: { type: String, default: '' },
    compania: { type: String, default: '' },
    matricula: { type: String, default: '' },
    fechaOcurrencia: { type: Date, default: null },
    tipoSiniestro: { type: String, default: '' },
    fechaApertura: { type: Date, default: null },
    numSiniestroCompania: { type: String, default: '' },
    numSiniestroElevia: { type: String, default: '' },
    estado: { type: String, enum: ['abierto', 'cerrado'], default: 'abierto' },
    costeTotal: { type: Number, default: null },
    culpa: { type: String, enum: ['tomador', 'contrario', null], default: null },
    observaciones: { type: String, default: '' },
    fechaCierre: { type: Date, default: null },
    valoracion: { type: String, enum: ['positiva', 'intermedia', 'negativa', null], default: null },
  },
  { timestamps: true }
);

const SiniestroGrupoSchema = new Schema<ISiniestroGrupo>(
  {
    clienteId: { type: String, required: true },
    empresa: {
      nombre: { type: String, required: true },
      direccion: { type: String, default: '' },
      cp: { type: String, default: '' },
      ciudad: { type: String, default: '' },
    },
    observacionesGenerales: { type: String, default: '' },
    siniestros: [SiniestroSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ISiniestroGrupo>('SiniestroGrupo', SiniestroGrupoSchema);
