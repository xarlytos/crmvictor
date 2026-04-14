import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarEvent, EventType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Trash2, CalendarPlus, Clock, CalendarDays, Type, Palette, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  selectedDate: Date;
  eventTypes: EventType[];
  onSave: (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
}

export function EventModal({
  isOpen,
  onClose,
  event,
  selectedDate,
  eventTypes,
  onSave,
  onDelete,
}: EventModalProps) {

  const [title, setTitle] = useState('');
  const [typeId, setTypeId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!event;

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setTitle(event.title);
        setTypeId(event.typeId || undefined);
        setDate(event.date);
        setStartTime(event.startTime);
        setEndTime(event.endTime);
        setDescription(event.description || '');
        setCustomColor(event.customColor || '');
        setCompleted(event.completed || false);
      } else {
        setTitle('');
        setTypeId(undefined); // Sin tipo por defecto
        setDate(format(selectedDate, 'yyyy-MM-dd'));
        setStartTime('09:00');
        setEndTime('10:00');
        setDescription('');
        setCustomColor('');
        setCompleted(false);
      }
      setError('');
    }
  }, [isOpen, event, selectedDate, eventTypes]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (startTime >= endTime) {
      setError('La hora de fin debe ser posterior a la de inicio');
      return;
    }

    const eventData: Omit<CalendarEvent, 'id' | 'createdAt'> = {
      title: title.trim(),
      typeId: typeId || '',
      date,
      startTime,
      endTime,
      description: description.trim() || undefined,
      customColor: customColor || null,
      completed,
    };

    onSave(eventData);
    onClose();
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  const selectedType = eventTypes.find((et) => et.id === typeId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                {isEditing ? <CalendarDays className="w-5 h-5 text-white" /> : <CalendarPlus className="w-5 h-5 text-white" />}
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <div className="grid gap-5 p-6 overflow-y-auto flex-1 min-h-0">
          {/* Título */}
          <div className="grid gap-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Type className="w-4 h-4 text-emerald-500" />
              Título *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reunión con cliente"
              autoFocus
              className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          {/* Tipo de evento */}
          <div className="grid gap-2">
            <Label htmlFor="type" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Palette className="w-4 h-4 text-emerald-500" />
              Tipo de evento (opcional)
            </Label>
            <Select
              value={typeId || '__none__'}
              onValueChange={(value) => {
                const newTypeId = value === '__none__' ? undefined : value;
                setTypeId(newTypeId);
                // Limpiar color personalizado al cambiar de tipo para que se use el color del nuevo tipo
                setCustomColor('');
              }}
            >
              <SelectTrigger id="type" className="h-11 bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue placeholder="Sin tipo" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[200]">
                <SelectItem value="__none__">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-300" />
                    Sin tipo
                  </div>
                </SelectItem>
                {eventTypes.map((et) => (
                  <SelectItem key={et.id} value={et.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: et.color }}
                      />
                      {et.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div className="grid gap-2">
            <Label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              Fecha
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="w-4 h-4 text-emerald-500" />
                Hora inicio *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime" className="text-sm font-semibold text-slate-700 pt-6"
>Hora fin *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="grid gap-2">
            <Label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-emerald-500" />
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
              className="bg-slate-50 border-slate-200 rounded-xl resize-none focus:bg-white"
            />
          </div>

          {/* Completado */}
          {isEditing && (
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Check className="w-4 h-4 text-emerald-500" />
                Estado
              </Label>
              <button
                type="button"
                onClick={() => setCompleted(!completed)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 w-fit',
                  completed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                    completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-slate-300'
                  )}
                >
                  {completed && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="text-sm font-medium">
                  {completed ? 'Evento completado' : 'Evento pendiente'}
                </span>
              </button>
            </div>
          )}

          {/* Color personalizado (opcional) */}
          <div className="grid gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <Label htmlFor="customColor" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Palette className="w-4 h-4 text-emerald-500" />
              Color personalizado
              {selectedType && !customColor ? (
                <span
                  className="ml-2 inline-block w-4 h-4 rounded-full align-middle border border-gray-200"
                  style={{ backgroundColor: selectedType.color }}
                  title="Color del tipo seleccionado"
                />
              ) : !selectedType && !customColor ? (
                <span
                  className="ml-2 inline-block w-4 h-4 rounded-full align-middle bg-gray-300 border border-gray-200"
                  title="Sin color (gris por defecto)"
                />
              ) : null}
            </Label>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-11 rounded-xl border-2 border-slate-200 cursor-pointer overflow-hidden"
                style={{ backgroundColor: customColor || selectedType?.color || '#9ca3af' }}
              >
                <Input
                  id="customColor"
                  type="color"
                  value={customColor || selectedType?.color || '#9ca3af'}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="opacity-0 w-full h-full cursor-pointer"
                />
              </div>
              {customColor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomColor('')}
                  className="text-slate-500 hover:text-slate-700"
                >
                  {selectedType ? 'Restaurar color del tipo' : 'Restaurar color por defecto'}
                </Button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 p-6 border-t bg-slate-50/50 shrink-0">
          {isEditing && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="mr-auto rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 border-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200 hover:bg-white">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25">
            {isEditing ? 'Guardar cambios' : 'Crear evento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
