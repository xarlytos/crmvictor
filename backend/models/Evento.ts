import mongoose, { Schema, Document } from 'mongoose';

export interface IEventType {
  _id?: string;
  name: string;
  color: string;
  icon?: string;
  createdAt?: Date;
}

export interface IEvento extends Document {
  _id: string;
  userId: string;
  title: string;
  typeId: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description?: string;
  customColor?: string | null;
  completed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventTypeDoc extends Document {
  _id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
}

const EventTypeSchema = new Schema<IEventTypeDoc>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const EventoSchema = new Schema<IEvento>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    typeId: { type: String, default: null },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    description: { type: String, default: '' },
    customColor: { type: String, default: null },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const EventoModel = mongoose.model<IEvento>('Evento', EventoSchema);
export const EventTypeModel = mongoose.model<IEventTypeDoc>('EventType', EventTypeSchema);
