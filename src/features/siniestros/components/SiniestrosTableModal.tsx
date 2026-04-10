import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SiniestroGrupo, Siniestro } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Download,
  X,
  FileText,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { useSiniestrosStore } from '../store/siniestros.store';
import { useToast } from '@/hooks/use-toast';

// Stub para generación de PDF - implementar cuando sea necesario
const generateSiniestroPDF = (_grupo: SiniestroGrupo, _siniestros: Siniestro[]) => {
  console.warn('PDF generator not implemented yet');
};

interface SiniestrosTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: SiniestroGrupo;
}

const ESTADOS = [
  { value: 'abierto', label: 'Abierto' },
  { value: 'cerrado', label: 'Cerrado' },
];

const CULPAS = [
  { value: 'tomador', label: 'Tomador' },
  { value: 'contrario', label: 'Contrario' },
];

const VALORACIONES = [
  { value: 'positiva', label: 'Positiva' },
  { value: 'intermedia', label: 'Intermedia' },
  { value: 'negativa', label: 'Negativa' },
];

// Columnas de la tabla
const COLUMNAS = [
  { key: 'nombreTomador', label: 'Nombre tomador', width: 'w-40' },
  { key: 'numeroPoliza', label: 'Nº póliza', width: 'w-32' },
  { key: 'compania', label: 'Compañía', width: 'w-32' },
  { key: 'matricula', label: 'Matrícula', width: 'w-28' },
  { key: 'fechaOcurrencia', label: 'Fecha ocurrencia', width: 'w-36' },
  { key: 'tipoSiniestro', label: 'Tipo siniestro', width: 'w-32' },
  { key: 'fechaApertura', label: 'Fecha apertura', width: 'w-36' },
  { key: 'numSiniestroCompania', label: 'Nº siniestro compañía', width: 'w-40' },
  { key: 'numSiniestroElevia', label: 'Nº siniestro Elevia', width: 'w-40' },
  { key: 'estado', label: 'Estado', width: 'w-28' },
  { key: 'costeTotal', label: 'Coste total', width: 'w-28' },
  { key: 'culpa', label: 'Culpa', width: 'w-28' },
  { key: 'observaciones', label: 'Observaciones', width: 'w-48' },
  { key: 'fechaCierre', label: 'Fecha cierre', width: 'w-36' },
  { key: 'valoracion', label: 'Valoración', width: 'w-28' },
];

export function SiniestrosTableModal({
  isOpen,
  onClose,
  grupo,
}: SiniestrosTableModalProps) {
  const { addSiniestro, updateSiniestro, deleteSiniestro } = useSiniestrosStore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [siniestrosLocales, setSiniestrosLocales] = useState<Siniestro[]>(
    grupo.siniestros
  );

  // Sincronizar cuando cambia el grupo
  useState(() => {
    setSiniestrosLocales(grupo.siniestros);
  });

  const handleAddRow = () => {
    const newSiniestro: Omit<Siniestro, 'id' | 'createdAt' | 'updatedAt'> = {
      nombreTomador: '',
      numeroPoliza: '',
      compania: '',
      matricula: '',
      fechaOcurrencia: null,
      tipoSiniestro: '',
      fechaApertura: null,
      numSiniestroCompania: '',
      numSiniestroElevia: '',
      estado: 'abierto',
      costeTotal: null,
      culpa: null,
      observaciones: '',
      fechaCierre: null,
      valoracion: null,
    };

    const id = addSiniestro(grupo.id, newSiniestro);
    const siniestroCompleto = {
      ...newSiniestro,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSiniestrosLocales([...siniestrosLocales, siniestroCompleto]);
    setEditingRow(id);
    setIsEditing(true);

    toast({
      title: 'Nuevo siniestro añadido',
      description: 'Completa los datos y guarda',
    });
  };

  const handleUpdateCell = (
    siniestroId: string,
    field: keyof Siniestro,
    value: any
  ) => {
    setSiniestrosLocales((prev) =>
      prev.map((s) => (s.id === siniestroId ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveRow = (siniestroId: string) => {
    const siniestro = siniestrosLocales.find((s) => s.id === siniestroId);
    if (siniestro) {
      updateSiniestro(grupo.id, siniestroId, siniestro);
      toast({
        title: 'Siniestro guardado',
        description: 'Los cambios se han guardado correctamente',
      });
    }
    setEditingRow(null);
  };

  const handleDeleteRow = (siniestroId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este siniestro?')) {
      deleteSiniestro(grupo.id, siniestroId);
      setSiniestrosLocales((prev) => prev.filter((s) => s.id !== siniestroId));
      toast({
        title: 'Siniestro eliminado',
        description: 'El siniestro se ha eliminado correctamente',
      });
    }
  };

  const handleDownloadSiniestro = (siniestro: Siniestro) => {
    generateSiniestroPDF(grupo, [siniestro]);
    toast({
      title: 'PDF generado',
      description: 'Descargando documento...',
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    try {
      return format(parseISO(date), 'dd/MM/yyyy', { locale: es });
    } catch {
      return '';
    }
  };

  const renderCell = (siniestro: Siniestro, columna: typeof COLUMNAS[0]) => {
    const isEditingRow = editingRow === siniestro.id;
    const value = siniestro[columna.key as keyof Siniestro];

    if (!isEditing || !isEditingRow) {
      // Modo lectura
      if (columna.key === 'fechaOcurrencia' || columna.key === 'fechaApertura' || columna.key === 'fechaCierre') {
        return formatDate(value as string | null);
      }
      if (columna.key === 'costeTotal') {
        return value ? `€${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '';
      }
      return (value as string) || '';
    }

    // Modo edición
    switch (columna.key) {
      case 'estado':
        return (
          <Select
            value={value as string}
            onValueChange={(v) => handleUpdateCell(siniestro.id, 'estado', v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'culpa':
        return (
          <Select
            value={(value as string) || '__none__'}
            onValueChange={(v) =>
              handleUpdateCell(siniestro.id, 'culpa', v === '__none__' ? null : v)
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">-</SelectItem>
              {CULPAS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'valoracion':
        return (
          <Select
            value={(value as string) || '__none__'}
            onValueChange={(v) =>
              handleUpdateCell(siniestro.id, 'valoracion', v === '__none__' ? null : v)
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">-</SelectItem>
              {VALORACIONES.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'fechaOcurrencia':
      case 'fechaApertura':
      case 'fechaCierre':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) =>
              handleUpdateCell(siniestro.id, columna.key as keyof Siniestro, e.target.value || null)
            }
            className="h-8 text-xs"
            disabled={columna.key === 'fechaCierre' && siniestro.estado !== 'cerrado'}
          />
        );

      case 'costeTotal':
        return (
          <Input
            type="number"
            step="0.01"
            value={(value as number) || ''}
            onChange={(e) =>
              handleUpdateCell(siniestro.id, 'costeTotal', e.target.value ? parseFloat(e.target.value) : null)
            }
            className="h-8 text-xs"
            placeholder="€"
          />
        );

      case 'observaciones':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => handleUpdateCell(siniestro.id, 'observaciones', e.target.value)}
            className="h-16 text-xs resize-none"
            rows={2}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => handleUpdateCell(siniestro.id, columna.key as keyof Siniestro, e.target.value)
            }
            className="h-8 text-xs"
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Historial de Siniestros
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                {grupo.empresa.nombre}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? 'bg-primary text-primary-foreground' : ''}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {isEditing ? 'Dejar de editar' : 'Editar'}
              </Button>
              <Button onClick={handleAddRow}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir siniestro
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tabla scrollable */}
        <div className="flex-1 overflow-auto p-6">
          <div className="border rounded-lg overflow-hidden min-w-max">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium border-b w-20">
                    Acciones
                  </th>
                  {COLUMNAS.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 text-left font-medium border-b ${col.width}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {siniestrosLocales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNAS.length + 1}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      No hay siniestros registrados. Haz clic en "Añadir siniestro"
                      para crear uno nuevo.
                    </td>
                  </tr>
                ) : (
                  siniestrosLocales.map((siniestro) => (
                    <tr key={siniestro.id} className="hover:bg-muted/50">
                      <td className="px-3 py-2 border-b">
                        <div className="flex items-center gap-1">
                          {isEditing && editingRow === siniestro.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleSaveRow(siniestro.id)}
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingRow(null)}
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {isEditing && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setEditingRow(siniestro.id)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteRow(siniestro.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDownloadSiniestro(siniestro)}
                                title="Descargar PDF"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                      {COLUMNAS.map((col) => (
                        <td
                          key={col.key}
                          className={`px-3 py-2 border-b ${col.width}`}
                        >
                          {renderCell(siniestro, col)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer info */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>Total: {siniestrosLocales.length} siniestros</p>
            <p>
              Abiertos: {siniestrosLocales.filter((s) => s.estado === 'abierto').length} | Cerrados:{" "}
              {siniestrosLocales.filter((s) => s.estado === 'cerrado').length}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
