import { useState } from 'react';
import { EventType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X, Settings2, Palette } from 'lucide-react';

interface EventTypeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  eventTypes: EventType[];
  onAdd: (tipo: Omit<EventType, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Omit<EventType, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export function EventTypeManager({
  isOpen,
  onClose,
  eventTypes,
  onAdd,
  onUpdate,
  onDelete,
}: EventTypeManagerProps) {

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd({
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
      onUpdate(id, {
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
      onDelete(id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                Tipos de Evento
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-6">
          {/* Lista de tipos existentes */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {eventTypes.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Palette className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No hay tipos de evento creados</p>
              </div>
            )}
            {eventTypes.map((et) => (
              <div
                key={et.id}
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors"
              >
                {editingId === et.id ? (
                  <>
                    <div
                      className="w-12 h-10 rounded-lg border-2 border-slate-200 cursor-pointer overflow-hidden shrink-0"
                      style={{ backgroundColor: editColor }}
                    >
                      <Input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="opacity-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 h-10 bg-white border-slate-200 rounded-lg"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUpdate(et.id)}
                      className="h-9 w-9 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cancelEditing}
                      className="h-9 w-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className="w-10 h-10 rounded-lg shrink-0 border border-slate-200"
                      style={{ backgroundColor: et.color }}
                    />
                    <span className="flex-1 font-medium text-slate-700">{et.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(et)}
                      className="h-9 w-9 rounded-lg hover:bg-slate-200/50 text-slate-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {/* No permitir eliminar tipos por defecto */}
                    {!et.id.startsWith('default-') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(et.id)}
                        className="h-9 w-9 rounded-lg hover:bg-rose-100 text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Añadir nuevo tipo */}
          {isAdding ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <div
                className="w-12 h-10 rounded-lg border-2 border-slate-200 cursor-pointer overflow-hidden shrink-0"
                style={{ backgroundColor: newColor }}
              >
                <Input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="opacity-0 w-full h-full cursor-pointer"
                />
              </div>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del tipo"
                className="flex-1 h-10 bg-white border-slate-200 rounded-lg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAdd}
                className="h-9 w-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAdding(false)}
                className="h-9 w-9 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-dashed border-2 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-600 transition-all"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir tipo de evento
            </Button>
          )}
        </div>

        <DialogFooter className="gap-2 p-6 border-t bg-slate-50/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200 hover:bg-white"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
