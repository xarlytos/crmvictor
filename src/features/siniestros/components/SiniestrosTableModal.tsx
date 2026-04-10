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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  X,
  FileText,
  Trash2,
  Edit2,
  Save,
  Calendar,
  Car,
  User,
  Building2,
  Euro,
  Scale,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSiniestrosStore } from '../store/siniestros.store';
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
  { value: 'positiva', label: 'Positiva', color: 'text-emerald-600 bg-emerald-50' },
  { value: 'intermedia', label: 'Intermedia', color: 'text-amber-600 bg-amber-50' },
  { value: 'negativa', label: 'Negativa', color: 'text-red-600 bg-red-50' },
];

export function SiniestrosTableModal({
  isOpen,
  onClose,
  grupo,
}: SiniestrosTableModalProps) {
  const { addSiniestro, updateSiniestro, deleteSiniestro } = useSiniestrosStore();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [siniestrosLocales, setSiniestrosLocales] = useState<Siniestro[]>(grupo.siniestros);

  const handleAddSiniestro = () => {
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

    const id = addSiniestro(grupo.id, newSiniestro);
    const siniestroCompleto = {
      ...newSiniestro,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSiniestrosLocales([...siniestrosLocales, siniestroCompleto]);
    setEditingId(id);
    setExpandedIds(new Set(expandedIds).add(id));

    toast({
      title: 'Nuevo siniestro',
      description: 'Completa la información y guarda los cambios',
    });
  };

  const handleUpdateSiniestro = (id: string, field: keyof Siniestro, value: any) => {
    setSiniestrosLocales((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = (id: string) => {
    const siniestro = siniestrosLocales.find((s) => s.id === id);
    if (siniestro) {
      updateSiniestro(grupo.id, id, siniestro);
      setEditingId(null);
      toast({
        title: 'Siniestro guardado',
        description: 'Los cambios se han guardado correctamente',
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este siniestro?')) {
      deleteSiniestro(grupo.id, id);
      setSiniestrosLocales((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: 'Siniestro eliminado',
        description: 'El siniestro se ha eliminado correctamente',
      });
    }
  };

  const handleDownload = (siniestro: Siniestro) => {
    generateSiniestroPDF(grupo, [siniestro]);
    toast({
      title: 'PDF generado',
      description: 'Descargando documento...',
    });
  };

  const handleDownloadAll = () => {
    if (siniestrosLocales.length === 0) return;
    generateSiniestroPDF(grupo, siniestrosLocales);
    toast({
      title: 'PDF generado',
      description: `Descargando historial completo (${siniestrosLocales.length} siniestros)`,
    });
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
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
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Historial de Siniestros
                </DialogTitle>
                <p className="text-slate-300 mt-1">{grupo.empresa.nombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {siniestrosLocales.length > 0 && (
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleDownloadAll}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar todo
                </Button>
              )}
              <Button
                onClick={handleAddSiniestro}
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir siniestro
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-white">{siniestrosAbiertos}</span> abiertos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-white">{siniestrosCerrados}</span> cerrados
              </span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-sm text-slate-300">
              Total: <span className="font-semibold text-white">{siniestrosLocales.length}</span> siniestros
            </span>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          {siniestrosLocales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No hay siniestros registrados
              </h3>
              <p className="text-slate-500 mb-6 max-w-md">
                Este cliente no tiene siniestros registrados. Haz clic en "Añadir siniestro" para crear el primero.
              </p>
              <Button onClick={handleAddSiniestro}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir primer siniestro
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-w-7xl mx-auto">
              {siniestrosLocales.map((siniestro, index) => {
                const isEditing = editingId === siniestro.id;
                const isExpanded = expandedIds.has(siniestro.id);
                const estado = ESTADOS.find((e) => e.value === siniestro.estado);
                const valoracion = VALORACIONES.find((v) => v.value === siniestro.valoracion);

                return (
                  <div
                    key={siniestro.id}
                    className={cn(
                      "bg-white rounded-2xl border transition-all duration-200 overflow-hidden",
                      isEditing
                        ? "border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                        : "border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
                    )}
                  >
                    {/* Card Header - Always visible */}
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => !isEditing && toggleExpand(siniestro.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                            {index + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-slate-900">
                                {siniestro.nombreTomador || 'Sin nombre'}
                              </h4>
                              <Badge
                                className={cn(
                                  "font-medium",
                                  siniestro.estado === 'abierto'
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full mr-1.5",
                                    estado?.color
                                  )}
                                />
                                {estado?.label}
                              </Badge>
                              {valoracion && (
                                <Badge variant="secondary" className={cn("font-medium", valoracion.color)}>
                                  {valoracion.label}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
                              {siniestro.compania && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5" />
                                  {siniestro.compania}
                                </span>
                              )}
                              {siniestro.matricula && (
                                <span className="flex items-center gap-1">
                                  <Car className="w-3.5 h-3.5" />
                                  {siniestro.matricula}
                                </span>
                              )}
                              {siniestro.fechaOcurrencia && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatDate(siniestro.fechaOcurrencia)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-slate-400 hover:text-slate-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(siniestro.id);
                                  setExpandedIds(new Set(expandedIds).add(siniestro.id));
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-slate-400 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(siniestro.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-slate-400 hover:text-slate-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(siniestro);
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSave(siniestro.id);
                                }}
                              >
                                <Save className="w-4 h-4 mr-1.5" />
                                Guardar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(null);
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          )}
                          {!isEditing && (
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {(isExpanded || isEditing) && (
                      <div className="px-5 pb-5 border-t border-slate-100">
                        <div className="pt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                          {/* Column 1: Datos básicos */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                <User className="w-3.5 h-3.5" />
                                Nombre del tomador
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={siniestro.nombreTomador}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'nombreTomador', e.target.value)
                                  }
                                  className="h-9"
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{siniestro.nombreTomador || '-'}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                Número de póliza
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={siniestro.numeroPoliza}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'numeroPoliza', e.target.value)
                                  }
                                  className="h-9"
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{siniestro.numeroPoliza || '-'}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                <Building2 className="w-3.5 h-3.5" />
                                Compañía
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={siniestro.compania}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'compania', e.target.value)
                                  }
                                  className="h-9"
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{siniestro.compania || '-'}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                <Car className="w-3.5 h-3.5" />
                                Matrícula
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={siniestro.matricula}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'matricula', e.target.value)
                                  }
                                  className="h-9"
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{siniestro.matricula || '-'}</p>
                              )}
                            </div>
                          </div>

                          {/* Column 2: Fechas */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Fecha de ocurrencia
                              </Label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={siniestro.fechaOcurrencia || ''}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'fechaOcurrencia', e.target.value || null)
                                  }
                                  className="h-9"
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{formatDate(siniestro.fechaOcurrencia)}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                Tipo de siniestro
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={siniestro.tipoSiniestro}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'tipoSiniestro', e.target.value)
                                  }
                                  className="h-9"
                                  placeholder="Ej: Colisión, Robo..."
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{siniestro.tipoSiniestro || '-'}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Fecha de apertura
                              </Label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={siniestro.fechaApertura || ''}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'fechaApertura', e.target.value || null)
                                  }
                                  className="h-9"
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{formatDate(siniestro.fechaApertura)}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Fecha de cierre
                              </Label>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={siniestro.fechaCierre || ''}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'fechaCierre', e.target.value || null)
                                  }
                                  className="h-9"
                                  disabled={siniestro.estado !== 'cerrado'}
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{formatDate(siniestro.fechaCierre)}</p>
                              )}
                            </div>
                          </div>

                          {/* Column 3: Números y estado */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs font-medium text-slate-500 mb-1.5">
                                Nº siniestro compañía
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={siniestro.numSiniestroCompania}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'numSiniestroCompania', e.target.value)
                                  }
                                  className="h-9"
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{siniestro.numSiniestroCompania || '-'}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-slate-500 mb-1.5">
                                Nº siniestro Elevia
                              </Label>
                              {isEditing ? (
                                <Input
                                  value={siniestro.numSiniestroElevia}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'numSiniestroElevia', e.target.value)
                                  }
                                  className="h-9"
                                />
                              ) : (
                                <p className="text-sm text-slate-900">{siniestro.numSiniestroElevia || '-'}</p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                <Euro className="w-3.5 h-3.5" />
                                Coste total
                              </Label>
                              {isEditing ? (
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
                                  className="h-9"
                                  placeholder="0.00"
                                />
                              ) : (
                                <p className="text-sm text-slate-900">
                                  {siniestro.costeTotal ? `€${siniestro.costeTotal.toFixed(2)}` : '-'}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium text-slate-500 mb-1.5">Estado</Label>
                                {isEditing ? (
                                  <Select
                                    value={siniestro.estado}
                                    onValueChange={(v) =>
                                      handleUpdateSiniestro(siniestro.id, 'estado', v)
                                    }
                                  >
                                    <SelectTrigger className="h-9">
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
                                ) : (
                                  <Badge
                                    className={cn(
                                      siniestro.estado === 'abierto'
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-emerald-50 text-emerald-700"
                                    )}
                                  >
                                    {estado?.label}
                                  </Badge>
                                )}
                              </div>

                              <div>
                                <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                  <Scale className="w-3.5 h-3.5" />
                                  Culpa
                                </Label>
                                {isEditing ? (
                                  <Select
                                    value={siniestro.culpa || '__none__'}
                                    onValueChange={(v) =>
                                      handleUpdateSiniestro(siniestro.id, 'culpa', v === '__none__' ? null : v)
                                    }
                                  >
                                    <SelectTrigger className="h-9">
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
                                ) : (
                                  <p className="text-sm text-slate-900">
                                    {siniestro.culpa === 'tomador'
                                      ? 'Tomador'
                                      : siniestro.culpa === 'contrario'
                                      ? 'Contrario'
                                      : '-'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Column 4: Valoración y observaciones */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs font-medium text-slate-500 mb-1.5">Valoración</Label>
                              {isEditing ? (
                                <Select
                                  value={siniestro.valoracion || '__none__'}
                                  onValueChange={(v) =>
                                    handleUpdateSiniestro(siniestro.id, 'valoracion', v === '__none__' ? null : v)
                                  }
                                >
                                  <SelectTrigger className="h-9">
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
                              ) : (
                                <p className="text-sm text-slate-900">
                                  {siniestro.valoracion ? (
                                    <Badge className={valoracion?.color}>{valoracion?.label}</Badge>
                                  ) : (
                                    '-'
                                  )}
                                </p>
                              )}
                            </div>

                            <div className="flex-1">
                              <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                                <MessageSquare className="w-3.5 h-3.5" />
                                Observaciones
                              </Label>
                              {isEditing ? (
                                <Textarea
                                  value={siniestro.observaciones}
                                  onChange={(e) =>
                                    handleUpdateSiniestro(siniestro.id, 'observaciones', e.target.value)
                                  }
                                  className="min-h-[100px] resize-none"
                                  placeholder="Añade observaciones relevantes..."
                                />
                              ) : (
                                <div className="bg-slate-50 rounded-lg p-3 min-h-[100px]">
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                    {siniestro.observaciones || (
                                      <span className="text-slate-400 italic">Sin observaciones</span>
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
