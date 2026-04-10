import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DateInput } from '@/components/shared/DateInput';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Trash2, Plus, UserCircle, X } from 'lucide-react';
import type { Cliente, EstadoCliente, Transporte } from '@/types';

const vencimientoPersonalizadoSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
});

const clienteSchema = z.object({
  empresa: z.string().min(1, 'El nombre de empresa es obligatorio'),
  contacto: z.string().min(1, 'El nombre de contacto es obligatorio'),
  telefono: z.string().optional(),
  correo: z.string().optional(),
  cif: z.string().optional(),
  notas: z.string().optional(),
  estado: z.enum(['llamado', 'gmail_enviado', 'reunido', 'propuesta_activa', 'vendido', 'no_llegamos']).optional(),
  tipoCarga: z.string().optional(),
  transporte: z.enum([
    'nacional',
    'internacional',
    'peninsular',
    'espana_francia',
    'espana_portugal',
    'espana_francia_portugal',
  ]).optional(),
  fechaLlamada: z.string().optional(),
  facturacion: z.string().optional(),
  numVehiculos: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      if (typeof val === 'string') {
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    z.number().optional()
  ),
  vencimientos: z.object({
    rc: z.string().optional(),
    mercancias: z.string().optional(),
    acc: z.string().optional(),
    flotas: z.string().optional(),
    pyme: z.string().optional(),
    personalizados: z.array(vencimientoPersonalizadoSchema).default([]),
  }).optional(),
}).refine(
  (data) => {
    // Validar email solo si está presente
    if (!data.correo || data.correo.trim().length === 0) return true;
    return z.string().email().safeParse(data.correo).success;
  },
  {
    message: 'Correo inválido',
    path: ['correo'],
  }
);

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onSubmit: (data: Partial<Cliente>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const estadoLabels: Record<EstadoCliente, string> = {
  llamado: 'Llamado',
  gmail_enviado: 'Gmail enviado',
  reunido: 'Reunido',
  propuesta_activa: 'Propuesta activa',
  vendido: 'Vendido',
  no_llegamos: 'No llegamos',
};

const transporteLabels: Record<Transporte, string> = {
  nacional: 'Nacional',
  internacional: 'Internacional',
  peninsular: 'Peninsular',
  espana_francia: 'España y Francia',
  espana_portugal: 'España y Portugal',
  espana_francia_portugal: 'España, Francia y Portugal',
};

export function ClienteFormDrawer({
  open,
  onOpenChange,
  cliente,
  onSubmit,
  onDelete,
}: ClienteFormDrawerProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    control,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      empresa: '',
      contacto: '',
      cif: '',
      telefono: '',
      correo: '',
      notas: '',
      estado: undefined,
      tipoCarga: '',
      transporte: undefined,
      fechaLlamada: '',
      facturacion: '',
      numVehiculos: undefined,
      vencimientos: { 
        rc: '', 
        mercancias: '', 
        acc: '', 
        flotas: '', 
        pyme: '',
        personalizados: []
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vencimientos.personalizados',
  });

  useEffect(() => {
    if (open && cliente) {
      const personalizadosFormateados = cliente.vencimientos?.personalizados?.map(v => ({
        ...v,
        fecha: v.fecha ? v.fecha.split('T')[0] : ''
      })) || [];

      reset({
        empresa: cliente.empresa,
        contacto: cliente.contacto,
        cif: cliente.cif || '',
        telefono: cliente.telefono,
        correo: cliente.correo,
        notas: cliente.notas || '',
        estado: cliente.estado,
        tipoCarga: cliente.tipoCarga || '',
        transporte: cliente.transporte,
        fechaLlamada: cliente.fechaLlamada ? cliente.fechaLlamada.split('T')[0] : '',
        facturacion: cliente.facturacion || '',
        numVehiculos: cliente.numVehiculos,
        vencimientos: {
          rc: cliente.vencimientos?.rc ? cliente.vencimientos.rc.split('T')[0] : '',
          mercancias: cliente.vencimientos?.mercancias ? cliente.vencimientos.mercancias.split('T')[0] : '',
          acc: cliente.vencimientos?.acc ? cliente.vencimientos.acc.split('T')[0] : '',
          flotas: cliente.vencimientos?.flotas ? cliente.vencimientos.flotas.split('T')[0] : '',
          pyme: cliente.vencimientos?.pyme ? cliente.vencimientos.pyme.split('T')[0] : '',
          personalizados: personalizadosFormateados,
        },
      });
    } else if (open && !cliente) {
      reset({
        empresa: '',
        contacto: '',
        cif: '',
        telefono: '',
        correo: '',
        notas: '',
        estado: undefined,
        tipoCarga: '',
        transporte: undefined,
        fechaLlamada: '',
        facturacion: '',
        numVehiculos: undefined,
        vencimientos: { rc: '', mercancias: '', acc: '', flotas: '', pyme: '', personalizados: [] },
      });
    }
  }, [open, cliente, reset]);

  const onFormSubmit = async (data: ClienteFormData) => {
    // Limpiar strings vacíos y convertirlos a undefined (excepto empresa y contacto que son obligatorios)
    const cleanString = (value: string | undefined): string | undefined => {
      return value && value.trim() !== '' ? value.trim() : undefined;
    };

    const personalizadosLimpios = data.vencimientos?.personalizados
      ?.filter(v => v.nombre.trim() !== '' && v.fecha.trim() !== '')
      ?.map(v => ({
        id: v.id,
        nombre: v.nombre.trim(),
        fecha: new Date(v.fecha).toISOString(),
      })) || [];

    const submitData: Partial<Cliente> = {
      empresa: data.empresa.trim(),
      contacto: data.contacto.trim(),
      cif: cleanString(data.cif),
      telefono: cleanString(data.telefono),
      correo: cleanString(data.correo),
      notas: cleanString(data.notas),
      estado: data.estado || undefined,
      tipoCarga: cleanString(data.tipoCarga),
      transporte: data.transporte || undefined,
      fechaLlamada: data.fechaLlamada && data.fechaLlamada.trim() !== '' ? new Date(data.fechaLlamada).toISOString() : undefined,
      facturacion: cleanString(data.facturacion),
      numVehiculos: data.numVehiculos,

      vencimientos: data.vencimientos ? {
        rc: data.vencimientos.rc ? new Date(data.vencimientos.rc).toISOString() : undefined,
        mercancias: data.vencimientos.mercancias ? new Date(data.vencimientos.mercancias).toISOString() : undefined,
        acc: data.vencimientos.acc ? new Date(data.vencimientos.acc).toISOString() : undefined,
        flotas: data.vencimientos.flotas ? new Date(data.vencimientos.flotas).toISOString() : undefined,
        pyme: data.vencimientos.pyme ? new Date(data.vencimientos.pyme).toISOString() : undefined,
        personalizados: personalizadosLimpios.length > 0 ? personalizadosLimpios : undefined,
      } : undefined,
    };

    await onSubmit(submitData);
    onOpenChange(false);
  };

  const estadoValue = watch('estado');
  const transporteValue = watch('transporte');

  const handleEstadoChange = (value: string) => {
    if (value === 'none') {
      setValue('estado', undefined);
    } else {
      setValue('estado', value as EstadoCliente, { shouldValidate: true });
    }
  };

  const handleTransporteChange = (value: string) => {
    if (value === 'none') {
      setValue('transporte', undefined);
    } else {
      setValue('transporte', value as Transporte, { shouldValidate: true });
    }
  };

  const agregarVencimientoPersonalizado = () => {
    append({
      id: crypto.randomUUID(),
      nombre: '',
      fecha: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 p-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-xs">1</span>
              Información Básica
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="empresa" className="text-sm font-semibold text-slate-700">
                  Empresa o Nombre *
                </Label>
                <Input
                  id="empresa"
                  {...register('empresa')}
                  placeholder="Nombre de la empresa o contacto"
                  className="h-11 bg-white border-slate-200 rounded-xl focus:border-violet-500 focus:ring-violet-500/20"
                />
                {errors.empresa && (
                  <p className="text-sm text-rose-500 font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.empresa.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contacto" className="text-sm font-semibold text-slate-700">
                  Contacto *
                </Label>
                <Input
                  id="contacto"
                  {...register('contacto')}
                  placeholder="Nombre del contacto"
                  className="h-11 bg-white border-slate-200 rounded-xl focus:border-violet-500 focus:ring-violet-500/20"
                />
                {errors.contacto && (
                  <p className="text-sm text-rose-500 font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.contacto.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cif" className="text-sm font-semibold text-slate-700">
                  CIF / DNI
                </Label>
                <Input
                  id="cif"
                  {...register('cif')}
                  placeholder="CIF / DNI"
                  className="h-11 bg-white border-slate-200 rounded-xl focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-sm font-semibold text-slate-700">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  {...register('telefono')}
                  placeholder="+34 600 000 000"
                  className="h-11 bg-white border-slate-200 rounded-xl focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo" className="text-sm font-semibold text-slate-700">
                  Correo
                </Label>
                <Input
                  id="correo"
                  type="email"
                  {...register('correo')}
                  placeholder="contacto@empresa.com"
                  className="h-11 bg-white border-slate-200 rounded-xl focus:border-violet-500 focus:ring-violet-500/20"
                />
                {errors.correo && (
                  <p className="text-sm text-rose-500 font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.correo.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Estado y Clasificación */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs">2</span>
              Estado y Clasificación
            </h3>
            <div className="grid gap-4 sm:grid-cols-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm font-semibold text-slate-700">
                  Estado
                </Label>
                <Select
                  value={estadoValue ? String(estadoValue) : 'none'}
                  onValueChange={handleEstadoChange}
                >
                  <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl" id="estado">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent className="z-[200]" position="popper" sideOffset={5}>
                    <SelectItem value="none">Sin definir</SelectItem>
                    {Object.entries(estadoLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoCarga" className="text-sm font-semibold text-slate-700">
                  Mercancía
                </Label>
                <Input
                  id="tipoCarga"
                  {...register('tipoCarga')}
                  placeholder="Ej: General, Frigorífica..."
                  className="h-11 bg-white border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transporte" className="text-sm font-semibold text-slate-700">
                  Transporte
                </Label>
                <Select
                  value={transporteValue ? String(transporteValue) : 'none'}
                  onValueChange={handleTransporteChange}
                >
                  <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl" id="transporte">
                    <SelectValue placeholder="Seleccionar transporte" />
                  </SelectTrigger>
                  <SelectContent className="z-[200]" position="popper" sideOffset={5}>
                    <SelectItem value="none">Sin definir</SelectItem>
                    {Object.entries(transporteLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Vencimientos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs">3</span>
              Vencimientos
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="vencRC" className="text-sm font-semibold text-slate-700">Responsabilidad Civil</Label>
                <DateInput
                  id="vencRC"
                  value={watch('vencimientos.rc')}
                  onChange={(v) => setValue('vencimientos.rc', v)}
                  className="h-11 bg-white border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencACC" className="text-sm font-semibold text-slate-700">Accidentes Convenio</Label>
                <DateInput
                  id="vencACC"
                  value={watch('vencimientos.acc')}
                  onChange={(v) => setValue('vencimientos.acc', v)}
                  className="h-11 bg-white border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencFlota" className="text-sm font-semibold text-slate-700">Flota</Label>
                <DateInput
                  id="vencFlota"
                  value={watch('vencimientos.flotas')}
                  onChange={(v) => setValue('vencimientos.flotas', v)}
                  className="h-11 bg-white border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencMercancias" className="text-sm font-semibold text-slate-700">Mercancías</Label>
                <DateInput
                  id="vencMercancias"
                  value={watch('vencimientos.mercancias')}
                  onChange={(v) => setValue('vencimientos.mercancias', v)}
                  className="h-11 bg-white border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencPyme" className="text-sm font-semibold text-slate-700">Pyme</Label>
                <DateInput
                  id="vencPyme"
                  value={watch('vencimientos.pyme')}
                  onChange={(v) => setValue('vencimientos.pyme', v)}
                  className="h-11 bg-white border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Vencimientos Personalizados */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-600">Vencimientos Personalizados</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={agregarVencimientoPersonalizado}
                  className="h-9 gap-1 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50"
                >
                  <Plus className="h-4 w-4" />
                  Añadir vencimiento
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                  No hay vencimientos personalizados. Haz clic en "Añadir vencimiento" para crear uno.
                </p>
              )}

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-3 p-4 border border-slate-200 rounded-xl bg-white sm:grid-cols-12 items-start">
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-xs font-medium text-slate-600">Nombre</Label>
                      <Input
                        {...register(`vencimientos.personalizados.${index}.nombre`)}
                        placeholder="Ej: Seguro especial"
                        className="h-10 bg-slate-50 border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-xs font-medium text-slate-600">Fecha</Label>
                      <DateInput
                        value={watch(`vencimientos.personalizados.${index}.fecha`)}
                        onChange={(v) => setValue(`vencimientos.personalizados.${index}.fecha`, v)}
                        className="h-10 bg-slate-50 border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end items-end h-full pb-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fechas y Facturación */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">4</span>
              Información Comercial
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="space-y-2">
                <Label htmlFor="fechaLlamada" className="text-sm font-semibold text-slate-700">
                  Fecha de Llamada
                </Label>
                <DateInput
                  id="fechaLlamada"
                  value={watch('fechaLlamada') || ''}
                  onChange={(value) => setValue('fechaLlamada', value || undefined)}
                  className="h-11 bg-white border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facturacion" className="text-sm font-semibold text-slate-700">
                  Facturación
                </Label>
                <Input
                  id="facturacion"
                  {...register('facturacion')}
                  placeholder="Ej: 7,3M, 3M, 700mil"
                  className="h-11 bg-white border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="numVehiculos" className="text-sm font-semibold text-slate-700">
                  Número de Vehículos
                </Label>
                <Input
                  id="numVehiculos"
                  type="number"
                  min="0"
                  {...register('numVehiculos')}
                  placeholder="Ej: 17"
                  className="h-11 bg-white border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">5</span>
              Notas
            </h3>
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <Textarea
                id="notas"
                {...register('notas')}
                rows={4}
                placeholder="Información adicional, recordatorios, observaciones..."
                className="resize-none bg-white border-slate-200 rounded-xl focus:border-violet-500 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row border-t pt-6 mt-6">
            <div className="flex-1">
              {cliente && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={isSubmitting}
                  className="h-11 gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 border-0"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Cliente
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="h-11 rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-8 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-lg shadow-violet-500/25"
              >
                {isSubmitting ? 'Guardando...' : cliente ? 'Actualizar Cliente' : 'Crear Cliente'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      {cliente && onDelete && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Eliminar Cliente"
          description={`¿Estás seguro de que deseas eliminar a ${cliente.empresa}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={async () => {
            await onDelete(cliente.id);
            setDeleteConfirmOpen(false);
            onOpenChange(false);
          }}
          variant="destructive"
        />
      )}
    </Dialog>
  );
}
