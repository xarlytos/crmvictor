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
import { AlertCircle, Trash2 } from 'lucide-react';
import { useCalendarioStore } from '../store/calendario.store';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  selectedDate: Date;
  eventTypes: EventType[];
}

export function EventModal({
  isOpen,
  onClose,
  event,
  selectedDate,
  eventTypes,
}: EventModalProps) {
  const { addEvent, updateEvent, deleteEvent, checkOverlap } = useCalendarioStore();

  const [title, setTitle] = useState('');
  const [typeId, setTypeId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [customColor, setCustomColor] = useState('');
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
      } else {
        setTitle('');
        setTypeId(undefined); // Sin tipo por defecto
        setDate(format(selectedDate, 'yyyy-MM-dd'));
        setStartTime('09:00');
        setEndTime('10:00');
        setDescription('');
        setCustomColor('');
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

    // Verificar solapamiento
    const hasOverlap = checkOverlap(
      date,
      startTime,
      endTime,
      event?.id
    );

    if (hasOverlap) {
      setError('Ya existe un evento en ese horario');
      return;
    }

    const eventData = {
      title: title.trim(),
      typeId: typeId || '',
      date,
      startTime,
      endTime,
      description: description.trim() || undefined,
      customColor: customColor || undefined,
    };

    if (event) {
      updateEvent(event.id, eventData);
    } else {
      addEvent(eventData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (event) {
      deleteEvent(event.id);
      onClose();
    }
  };

  const selectedType = eventTypes.find((et) => et.id === typeId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Título */}
          <div className="grid gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reunión con cliente"
              autoFocus
            />
          </div>

          {/* Tipo de evento */}
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo de evento (opcional)</Label>
            <Select
              value={typeId || '__none__'}
              onValueChange={(value) => setTypeId(value === '__none__' ? undefined : value)}
            >
              <SelectTrigger id="type">
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
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Hora inicio *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">Hora fin *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          {/* Color personalizado (opcional) */}
          <div className="grid gap-2">
            <Label htmlFor="customColor">
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
              <Input
                id="customColor"
                type="color"
                value={customColor || selectedType?.color || '#9ca3af'}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              {customColor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomColor('')}
                >
                  {selectedType ? 'Restaurar color del tipo' : 'Restaurar color por defecto'}
                </Button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isEditing && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? 'Guardar cambios' : 'Crear evento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
