import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  X,
  FileText,
  Save,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  useAddSiniestro,
  useUpdateSiniestro,
  useDeleteSiniestro,
} from '../hooks/useSiniestros';
import { generateSiniestroPDF } from '../utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SiniestrosTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: SiniestroGrupo;
}

const ESTADOS = [
  { value: 'abierto', label: 'Abierto', color: 'bg-amber-500' },
  { value: 'cerrado', label: 'Cerrado', color: 'bg-emerald-500' },
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

// Cabeceras de la tabla (sin columna de acciones)
const HEADERS = [
  { key: 'nombreTomador', label: 'Nombre tomador', width: 'w-40' },
  { key: 'numeroPoliza', label: 'Nº póliza', width: 'w-28' },
  { key: 'compania', label: 'Compañía', width: 'w-28' },
  { key: 'matricula', label: 'Matrícula', width: 'w-24' },
  { key: 'fechaOcurrencia', label: 'Fecha ocurrencia', width: 'w-32' },
  { key: 'tipoSiniestro', label: 'Tipo', width: 'w-28' },
  { key: 'fechaApertura', label: 'Fecha apertura', width: 'w-32' },
  { key: 'numSiniestroCompania', label: 'Nº siniestro comp.', width: 'w-36' },
  { key: 'numSiniestroElevia', label: 'Nº siniestro Elevia', width: 'w-36' },
  { key: 'estado', label: 'Estado', width: 'w-28' },
  { key: 'costeTotal', label: 'Coste total', width: 'w-24' },
  { key: 'culpa', label: 'Culpa', width: 'w-28' },
  { key: 'observaciones', label: 'Observaciones', width: 'w-40' },
  { key: 'fechaCierre', label: 'Fecha cierre', width: 'w-32' },
  { key: 'valoracion', label: 'Valoración', width: 'w-28' },
];

export function SiniestrosTableModal({
  isOpen,
  onClose,
  grupo,
}: SiniestrosTableModalProps) {
  const { toast } = useToast();
  const addSiniestro = useAddSiniestro();
  const updateSiniestro = useUpdateSiniestro();
  const deleteSiniestro = useDeleteSiniestro();

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [siniestrosLocales, setSiniestrosLocales] = useState<Siniestro[]>(grupo.siniestros);

  // Sincronizar cuando cambia el grupo
  useEffect(() => {
    setSiniestrosLocales(grupo.siniestros);
  }, [grupo.siniestros]);

  const handleAddSiniestro = async () => {
    try {
      const newSiniestro: Omit<Siniestro, 'id' | 'createdAt' | 'updatedAt'> = {
        nombreTomador: '',
        numeroPoliza: '',
        compania: '',
        matricula: '',
        fechaOcurrencia: null,
        tipoSiniestro: '',
        fechaApertura: new Date().toISOString().split('T')[0],
        numSiniestroCompania: '',
        numSiniestroElevia: '',
        estado: 'abierto',
        costeTotal: null,
        culpa: null,
        observaciones: '',
        fechaCierre: null,
        valoracion: null,
      };

      const creado = await addSiniestro.mutateAsync({ grupoId: grupo.id, siniestro: newSiniestro });

      // Añadir inmediatamente a la lista local para que se vea
      setSiniestrosLocales((prev) => [...prev, creado]);

      // Entrar en modo edición automáticamente para el nuevo
      setIsEditingMode(true);

      toast({
        title: 'Nuevo siniestro',
        description: 'Se ha añadido una nueva fila. Completa la información y guarda.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo añadir el siniestro',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSiniestro = (id: string, field: keyof Siniestro, value: any) => {
    setSiniestrosLocales((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveAll = async () => {
    try {
      const updatedSiniestros: Siniestro[] = [];

      // Guardar todos los siniestros que han cambiado
      for (const siniestro of siniestrosLocales) {
        const original = grupo.siniestros.find((s) => s.id === siniestro.id);
        if (original) {
          const haCambiado = JSON.stringify(original) !== JSON.stringify(siniestro);
          if (haCambiado) {
            const actualizado = await updateSiniestro.mutateAsync({
              grupoId: grupo.id,
              siniestroId: siniestro.id,
              updates: siniestro,
            });
            updatedSiniestros.push(actualizado);
          } else {
            updatedSiniestros.push(siniestro);
          }
        } else {
          // Siniestro nuevo que no estaba en el grupo original
          updatedSiniestros.push(siniestro);
        }
      }

      // Actualizar la lista local con los valores guardados
      setSiniestrosLocales(updatedSiniestros);
      setIsEditingMode(false);

      toast({
        title: 'Cambios guardados',
        description: 'Todos los siniestros se han actualizado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron guardar los cambios',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este siniestro?')) {
      try {
        await deleteSiniestro.mutateAsync({ grupoId: grupo.id, siniestroId: id });

        // Eliminar inmediatamente de la lista local
        setSiniestrosLocales((prev) => prev.filter((s) => s.id !== id));

        toast({
          title: 'Siniestro eliminado',
          description: 'El siniestro se ha eliminado correctamente',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'No se pudo eliminar el siniestro',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDownloadAll = () => {
    if (siniestrosLocales.length === 0) return;
    generateSiniestroPDF(grupo, siniestrosLocales);
    toast({
      title: 'PDF generado',
      description: `Descargando historial completo (${siniestrosLocales.length} siniestros)`,
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    try {
      return format(parseISO(date), 'dd/MM/yyyy', { locale: es });
    } catch {
      return '-';
    }
  };

  const siniestrosAbiertos = siniestrosLocales.filter((s) => s.estado === 'abierto').length;
  const siniestrosCerrados = siniestrosLocales.filter((s) => s.estado === 'cerrado').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="max-w-[98vw] w-[98vw] h-[95vh] max-h-[95vh] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Historial de Siniestros
                </DialogTitle>
                <p className="text-sm text-slate-500">{grupo.empresa.nombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="flex items-center gap-4 mr-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-600">{siniestrosAbiertos} abiertos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">{siniestrosCerrados} cerrados</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-slate-600">Total: {siniestrosLocales.length}</span>
              </div>

              {/* Botones de acción */}
              {siniestrosLocales.length > 0 && (
                <Button variant="outline" onClick={handleDownloadAll}>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar todo
                </Button>
              )}

              <Button onClick={handleAddSiniestro}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir siniestro
              </Button>

              {isEditingMode ? (
                <Button variant="default" onClick={handleSaveAll} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              ) : (
                siniestrosLocales.length > 0 && (
                  <Button variant="outline" onClick={() => setIsEditingMode(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )
              )}

              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tabla tipo Excel */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {siniestrosLocales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No hay siniestros registrados
              </h3>
              <p className="text-slate-500 mb-4">
                Este cliente no tiene siniestros. Haz clic en "Añadir siniestro" para crear el primero.
              </p>
              <Button onClick={handleAddSiniestro}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir primer siniestro
              </Button>
            </div>
          ) : (
            <div className="min-w-max p-4">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      {HEADERS.map((h) => (
                        <th
                          key={h.key}
                          className={cn(
                            "px-3 py-3 text-left font-medium text-slate-600 whitespace-nowrap",
                            h.width
                          )}
                        >
                          {h.label}
                        </th>
                      ))}
                      {/* Columna de eliminar solo en modo edición */}
                      {isEditingMode && (
                        <th className="px-3 py-3 text-left font-medium text-slate-600 w-20">
                          Eliminar
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {siniestrosLocales.map((siniestro) => {
                      const estado = ESTADOS.find((e) => e.value === siniestro.estado);

                      return (
                        <tr
                          key={siniestro.id}
                          className={cn(
                            "hover:bg-slate-50/50",
                            isEditingMode && "bg-blue-50/30"
                          )}
                        >
                          {/* Nombre tomador */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                value={siniestro.nombreTomador}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'nombreTomador', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              <span className="font-medium text-slate-900">
                                {siniestro.nombreTomador || '-'}
                              </span>
                            )}
                          </td>

                          {/* Nº póliza */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                value={siniestro.numeroPoliza}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'numeroPoliza', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              siniestro.numeroPoliza || '-'
                            )}
                          </td>

                          {/* Compañía */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                value={siniestro.compania}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'compania', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              siniestro.compania || '-'
                            )}
                          </td>

                          {/* Matrícula */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                value={siniestro.matricula}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'matricula', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              siniestro.matricula || '-'
                            )}
                          </td>

                          {/* Fecha ocurrencia */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                type="date"
                                value={siniestro.fechaOcurrencia || ''}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'fechaOcurrencia', e.target.value || null)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              formatDate(siniestro.fechaOcurrencia)
                            )}
                          </td>

                          {/* Tipo siniestro */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                value={siniestro.tipoSiniestro}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'tipoSiniestro', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              siniestro.tipoSiniestro || '-'
                            )}
                          </td>

                          {/* Fecha apertura */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                type="date"
                                value={siniestro.fechaApertura || ''}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'fechaApertura', e.target.value || null)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              formatDate(siniestro.fechaApertura)
                            )}
                          </td>

                          {/* Nº siniestro compañía */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                value={siniestro.numSiniestroCompania}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'numSiniestroCompania', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              siniestro.numSiniestroCompania || '-'
                            )}
                          </td>

                          {/* Nº siniestro Elevia */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                value={siniestro.numSiniestroElevia}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'numSiniestroElevia', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              siniestro.numSiniestroElevia || '-'
                            )}
                          </td>

                          {/* Estado - Select funcional en modo edición */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Select
                                value={siniestro.estado}
                                onValueChange={(v) =>
                                  handleUpdateSiniestro(siniestro.id, 'estado', v)
                                }
                              >
                                <SelectTrigger className="h-8 text-xs w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[200]">
                                  {ESTADOS.map((e) => (
                                    <SelectItem key={e.value} value={e.value}>
                                      {e.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "font-medium",
                                  siniestro.estado === 'abierto'
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                )}
                              >
                                <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", estado?.color)} />
                                {estado?.label}
                              </Badge>
                            )}
                          </td>

                          {/* Coste total */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={siniestro.costeTotal || ''}
                                onChange={(e) =>
                                  handleUpdateSiniestro(
                                    siniestro.id,
                                    'costeTotal',
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              siniestro.costeTotal ? `€${siniestro.costeTotal.toFixed(2)}` : '-'
                            )}
                          </td>

                          {/* Culpa - Select funcional en modo edición */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Select
                                value={siniestro.culpa || '__none__'}
                                onValueChange={(v) =>
                                  handleUpdateSiniestro(siniestro.id, 'culpa', v === '__none__' ? null : v)
                                }
                              >
                                <SelectTrigger className="h-8 text-xs w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[200]">
                                  <SelectItem value="__none__">-</SelectItem>
                                  {CULPAS.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                      {c.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className={cn(
                                "text-xs font-medium",
                                siniestro.culpa === 'tomador' && "text-blue-600",
                                siniestro.culpa === 'contrario' && "text-rose-600",
                                !siniestro.culpa && "text-slate-400"
                              )}>
                                {siniestro.culpa === 'tomador'
                                  ? 'Tomador'
                                  : siniestro.culpa === 'contrario'
                                  ? 'Contrario'
                                  : '-'}
                              </span>
                            )}
                          </td>

                          {/* Observaciones */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                value={siniestro.observaciones}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'observaciones', e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              <span className="truncate block max-w-[150px]">
                                {siniestro.observaciones || '-'}
                              </span>
                            )}
                          </td>

                          {/* Fecha cierre */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Input
                                type="date"
                                value={siniestro.fechaCierre || ''}
                                onChange={(e) =>
                                  handleUpdateSiniestro(siniestro.id, 'fechaCierre', e.target.value || null)
                                }
                                className="h-8 text-xs"
                              />
                            ) : (
                              formatDate(siniestro.fechaCierre)
                            )}
                          </td>

                          {/* Valoración - Select funcional en modo edición */}
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <Select
                                value={siniestro.valoracion || '__none__'}
                                onValueChange={(v) =>
                                  handleUpdateSiniestro(siniestro.id, 'valoracion', v === '__none__' ? null : v)
                                }
                              >
                                <SelectTrigger className="h-8 text-xs w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[200]">
                                  <SelectItem value="__none__">-</SelectItem>
                                  {VALORACIONES.map((v) => (
                                    <SelectItem key={v.value} value={v.value}>
                                      {v.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              siniestro.valoracion ? (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "font-medium",
                                    siniestro.valoracion === 'positiva' && "bg-emerald-50 text-emerald-700",
                                    siniestro.valoracion === 'intermedia' && "bg-amber-50 text-amber-700",
                                    siniestro.valoracion === 'negativa' && "bg-red-50 text-red-700"
                                  )}
                                >
                                  {VALORACIONES.find((v) => v.value === siniestro.valoracion)?.label}
                                </Badge>
                              ) : '-'
                            )}
                          </td>

                          {/* Columna eliminar solo en modo edición */}
                          {isEditingMode && (
                            <td className="px-3 py-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(siniestro.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
