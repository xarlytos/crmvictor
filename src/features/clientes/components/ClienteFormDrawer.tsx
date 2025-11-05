import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Trash2 } from 'lucide-react';
import type { Cliente, EstadoCliente, TipoCarga, Transporte } from '@/types';

const clienteSchema = z.object({
  empresa: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  correo: z.string().optional(),
  notas: z.string().optional(),
  estado: z.enum(['contratado', 'contactado_buena_pinta', 'en_negociacion', 'descartado']).optional(),
  tipoCarga: z.enum([
    'general_fraccionada',
    'frigorifica',
    'adr_peligrosas',
    'completa_ftl',
    'fraccionada_ltl',
    'a_granel',
    'vehiculos',
  ]).optional(),
  transporte: z.enum(['nacional', 'internacional', 'peninsula']).optional(),
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
  fechaVencimiento: z.string().optional(),
}).refine(
  (data) => {
    // Al menos uno de empresa o contacto debe estar presente
    const hasEmpresa = data.empresa && data.empresa.trim().length > 0;
    const hasContacto = data.contacto && data.contacto.trim().length > 0;
    return hasEmpresa || hasContacto;
  },
  {
    message: 'Debe proporcionar al menos un nombre de empresa o contacto',
    path: ['empresa'], // El error aparecerá en el campo empresa
  }
).refine(
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
  contratado: 'Contratado',
  contactado_buena_pinta: 'Contactado - Buena Pinta',
  en_negociacion: 'En Negociación',
  descartado: 'Descartado',
};

const tipoCargaLabels: Record<TipoCarga, string> = {
  general_fraccionada: 'General Fraccionada',
  frigorifica: 'Frigorífica',
  adr_peligrosas: 'ADR Peligrosas',
  completa_ftl: 'Completa FTL',
  fraccionada_ltl: 'Fraccionada LTL',
  a_granel: 'A Granel',
  vehiculos: 'Vehículos',
};

const transporteLabels: Record<Transporte, string> = {
  nacional: 'Nacional',
  internacional: 'Internacional',
  peninsula: 'Península',
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
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente
      ? {
          empresa: cliente.empresa,
          contacto: cliente.contacto,
          telefono: cliente.telefono,
          correo: cliente.correo,
          notas: cliente.notas || '',
          estado: cliente.estado,
          tipoCarga: cliente.tipoCarga,
          transporte: cliente.transporte,
          fechaLlamada: cliente.fechaLlamada ? cliente.fechaLlamada.split('T')[0] : '',
          facturacion: cliente.facturacion || '',
          numVehiculos: cliente.numVehiculos,
          fechaVencimiento: cliente.vencimientos?.flotas 
            ? cliente.vencimientos.flotas.split('T')[0]
            : cliente.vencimientos?.mercancias
            ? cliente.vencimientos.mercancias.split('T')[0]
            : cliente.poliza.fechaFin.split('T')[0],
        }
      : {
          empresa: '',
          contacto: '',
          telefono: '',
          correo: '',
          notas: '',
          estado: undefined,
          tipoCarga: undefined,
          transporte: undefined,
          fechaLlamada: '',
          facturacion: '',
          numVehiculos: undefined,
          fechaVencimiento: '',
        },
  });

  useEffect(() => {
    if (open && cliente) {
      reset({
        empresa: cliente.empresa,
        contacto: cliente.contacto,
        telefono: cliente.telefono,
        correo: cliente.correo,
        notas: cliente.notas || '',
        estado: cliente.estado,
        tipoCarga: cliente.tipoCarga,
        transporte: cliente.transporte,
        fechaLlamada: cliente.fechaLlamada ? cliente.fechaLlamada.split('T')[0] : '',
        facturacion: cliente.facturacion || '',
        numVehiculos: cliente.numVehiculos,
        fechaVencimiento: cliente.vencimientos?.flotas 
          ? cliente.vencimientos.flotas.split('T')[0]
          : cliente.vencimientos?.mercancias
          ? cliente.vencimientos.mercancias.split('T')[0]
          : cliente.poliza.fechaFin.split('T')[0],
      });
    } else if (open && !cliente) {
      reset({
        empresa: '',
        contacto: '',
        telefono: '',
        correo: '',
        notas: '',
        estado: undefined,
        tipoCarga: undefined,
        transporte: undefined,
        fechaLlamada: '',
        facturacion: '',
        numVehiculos: undefined,
        fechaVencimiento: '',
      });
    }
  }, [open, cliente, reset]);

  const onFormSubmit = async (data: ClienteFormData) => {
    // Si no hay fechaVencimiento, no establecer fecha de vencimiento
    const fechaVencimientoISO = data.fechaVencimiento && data.fechaVencimiento.trim() !== ''
      ? new Date(data.fechaVencimiento).toISOString()
      : undefined;
    
    // Limpiar strings vacíos y convertirlos a undefined
    const cleanString = (value: string | undefined): string | undefined => {
      return value && value.trim() !== '' ? value : undefined;
    };

    const submitData: Partial<Cliente> = {
      empresa: data.empresa || data.contacto || '', // Si no hay empresa, usar contacto
      contacto: cleanString(data.contacto),
      telefono: cleanString(data.telefono),
      correo: cleanString(data.correo),
      notas: cleanString(data.notas),
      estado: data.estado || undefined,
      tipoCarga: data.tipoCarga || undefined,
      transporte: data.transporte || undefined,
      fechaLlamada: data.fechaLlamada && data.fechaLlamada.trim() !== '' ? new Date(data.fechaLlamada).toISOString() : undefined,
      facturacion: cleanString(data.facturacion),
      numVehiculos: data.numVehiculos,
      poliza: {
        fechaInicio: cliente?.poliza?.fechaInicio || new Date().toISOString(),
        // Solo establecer fechaFin si hay fechaVencimiento o si es un cliente existente con fechaFin
        // Si no hay fechaVencimiento y es un cliente nuevo, usar una fecha por defecto para poliza (requerida)
        fechaFin: fechaVencimientoISO || cliente?.poliza?.fechaFin || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // Solo establecer vencimientos si hay fechaVencimiento explícitamente
      // Si no hay fechaVencimiento y es un cliente nuevo, dejar undefined
      vencimientos: fechaVencimientoISO ? {
        flotas: fechaVencimientoISO,
      } : (cliente ? cliente.vencimientos : undefined),
    };

    await onSubmit(submitData);
    onOpenChange(false);
  };

  const estadoValue = watch('estado');
  const tipoCargaValue = watch('tipoCarga');
  const transporteValue = watch('transporte');

  const handleEstadoChange = (value: string) => {
    if (value === 'none') {
      setValue('estado', undefined);
    } else {
      setValue('estado', value as EstadoCliente, { shouldValidate: true });
    }
  };

  const handleTipoCargaChange = (value: string) => {
    if (value === 'none') {
      setValue('tipoCarga', undefined);
    } else {
      setValue('tipoCarga', value as TipoCarga, { shouldValidate: true });
    }
  };

  const handleTransporteChange = (value: string) => {
    if (value === 'none') {
      setValue('transporte', undefined);
    } else {
      setValue('transporte', value as Transporte, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 mt-4">
                    {/* Información Básica */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="empresa" className="text-sm font-medium">
                          Empresa o Nombre
                        </Label>
                        <Input
                          id="empresa"
                          {...register('empresa')}
                          placeholder="Nombre de la empresa o contacto"
                          className="h-10"
                        />
                        {errors.empresa && (
                          <p className="text-sm text-destructive">{errors.empresa.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Debe proporcionar al menos un nombre de empresa o contacto
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contacto" className="text-sm font-medium">
                          Contacto
                        </Label>
                        <Input
                          id="contacto"
                          {...register('contacto')}
                          placeholder="Nombre del contacto"
                          className="h-10"
                        />
                        {errors.contacto && (
                          <p className="text-sm text-destructive">{errors.contacto.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefono" className="text-sm font-medium">
                          Teléfono
                        </Label>
                        <Input
                          id="telefono"
                          type="tel"
                          {...register('telefono')}
                          placeholder="+34 600 000 000"
                          className="h-10"
                        />
                        {errors.telefono && (
                          <p className="text-sm text-destructive">{errors.telefono.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="correo" className="text-sm font-medium">
                          Correo
                        </Label>
                        <Input
                          id="correo"
                          type="email"
                          {...register('correo')}
                          placeholder="contacto@empresa.com"
                          className="h-10"
                        />
                        {errors.correo && (
                          <p className="text-sm text-destructive">{errors.correo.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Estado y Clasificación */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="estado" className="text-sm font-medium">
                          Estado
                        </Label>
              <Select
                value={estadoValue ? String(estadoValue) : 'none'}
                onValueChange={handleEstadoChange}
              >
                <SelectTrigger className="h-10" id="estado">
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
              {errors.estado && (
                <p className="text-sm text-destructive">{errors.estado.message}</p>
              )}
            </div>

                      <div className="space-y-2">
                        <Label htmlFor="tipoCarga" className="text-sm font-medium">
                          Mercancía
                        </Label>
              <Select
                value={tipoCargaValue ? String(tipoCargaValue) : 'none'}
                onValueChange={handleTipoCargaChange}
              >
                <SelectTrigger className="h-10" id="tipoCarga">
                  <SelectValue placeholder="Seleccionar mercancía" />
                </SelectTrigger>
                <SelectContent className="z-[200]" position="popper" sideOffset={5}>
                  <SelectItem value="none">Sin definir</SelectItem>
                  {Object.entries(tipoCargaLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoCarga && (
                <p className="text-sm text-destructive">{errors.tipoCarga.message}</p>
              )}
            </div>

                      <div className="space-y-2">
                        <Label htmlFor="transporte" className="text-sm font-medium">
                          Transporte
                        </Label>
              <Select
                value={transporteValue ? String(transporteValue) : 'none'}
                onValueChange={handleTransporteChange}
              >
                <SelectTrigger className="h-10" id="transporte">
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
              {errors.transporte && (
                <p className="text-sm text-destructive">{errors.transporte.message}</p>
              )}
            </div>
          </div>

          {/* Fechas y Facturación */}
          <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="fechaVencimiento" className="text-sm font-medium">
                          Fecha Vencimiento
                        </Label>
              <DateInput
                id="fechaVencimiento"
                value={watch('fechaVencimiento')}
                onChange={(value) => setValue('fechaVencimiento', value)}
                className="h-10"
              />
              {errors.fechaVencimiento && (
                <p className="text-sm text-destructive">{errors.fechaVencimiento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaLlamada" className="text-sm font-medium">
                Fecha de Llamada
              </Label>
              <DateInput
                id="fechaLlamada"
                value={watch('fechaLlamada') || ''}
                onChange={(value) => setValue('fechaLlamada', value || undefined)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facturacion" className="text-sm font-medium">
                Facturación
              </Label>
              <Input
                id="facturacion"
                {...register('facturacion')}
                placeholder="Ej: 7,3M, 3M, 700mil"
                className="h-10"
              />
            </div>
          </div>

          {/* Número de Vehículos */}
          <div className="space-y-2">
            <Label htmlFor="numVehiculos" className="text-sm font-medium">
              Número de Vehículos
            </Label>
            <Input
              id="numVehiculos"
              type="number"
              min="0"
              {...register('numVehiculos')}
              placeholder="Ej: 17"
              className="h-10"
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas" className="text-sm font-medium">
              Notas
            </Label>
            <Textarea 
              id="notas" 
              {...register('notas')} 
              rows={4} 
              placeholder="Información adicional, recordatorios, observaciones..."
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <div className="flex-1">
              {cliente && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={isSubmitting}
                  className="h-10 gap-2"
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
                className="h-10"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-10 px-6"
              >
                {isSubmitting ? 'Guardando...' : cliente ? 'Actualizar' : 'Crear Cliente'}
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

