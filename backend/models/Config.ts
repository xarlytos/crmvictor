import mongoose, { Schema, Document } from 'mongoose';
import type { ConfigUsuario } from '../../src/types';

export interface IConfig extends ConfigUsuario, Document {
  _id: mongoose.Types.ObjectId;
}

const ConfigSchema = new Schema<IConfig>({
  alertWindowDays: { type: Number, required: true, default: 60 },
  monthColors: {
    type: Object,  // Cambiado de Map a Object para mejor compatibilidad
    required: true,
    default: {
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
    },
  },
}, {
  timestamps: true,
});

export const ConfigModel = mongoose.model<IConfig>('Config', ConfigSchema);
