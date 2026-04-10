import { useState } from 'react';
import { EventType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useCalendarioStore } from '../store/calendario.store';

interface EventTypeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  eventTypes: EventType[];
}

export function EventTypeManager({
  isOpen,
  onClose,
  eventTypes,
}: EventTypeManagerProps) {
  const { addEventType, updateEventType, deleteEventType } = useCalendarioStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addEventType({
        name: newName.trim(),
        color: newColor,
      });
      setNewName('');
      setNewColor('#3b82f6');
      setIsAdding(false);
    }
  };

  const handleUpdate = (id: string) => {
    if (editName.trim()) {
      updateEventType(id, {
        name: editName.trim(),
        color: editColor,
      });
      setEditingId(null);
    }
  };

  const startEditing = (et: EventType) => {
    setEditingId(et.id);
    setEditName(et.name);
    setEditColor(et.color);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este tipo de evento? Los eventos existentes usarán el tipo por defecto.')) {
      deleteEventType(id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Gestionar Tipos de Evento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Lista de tipos existentes */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {eventTypes.map((et) => (
              <div
                key={et.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                {editingId === et.id ? (
                  <>
                    <Input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-12 h-10 p-1 shrink-0"
                    />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUpdate(et.id)}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cancelEditing}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: et.color }}
                    />
                    <span className="flex-1 font-medium">{et.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(et)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {/* No permitir eliminar tipos por defecto */}
                    {!et.id.startsWith('default-') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(et.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Añadir nuevo tipo */}
          {isAdding ? (
            <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-10 p-1 shrink-0"
              />
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del tipo"
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <Button variant="ghost" size="icon" onClick={handleAdd}>
                <Check className="w-4 h-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAdding(false)}
              >
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir tipo de evento
            </Button>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
