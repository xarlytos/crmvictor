import { useEffect } from 'react';
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
import type { Cliente, EstadoCliente, Transporte } from '@/types';
import dayjs from 'dayjs';

const clienteSchema = z.object({
  empresa: z.string().min(1, 'Empresa es requerida'),
  contacto: z.string().min(1, 'Contacto es requerido'),
  telefono: z.string().min(1, 'Teléfono es requerido'),
  correo: z.string().email('Correo inválido'),
  cif: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
  estado: z.enum(['contratado', 'contactado_buena_pinta', 'en_negociacion', 'descartado']),
  tipoCarga: z.string().min(1, 'Tipo de carga es requerido'),
  transporte: z.enum([
    'nacional',
    'internacional',
    'peninsular',
    'espana_francia',
    'espana_portugal',
    'espana_francia_portugal',
  ]),
  numVehiculos: z.number().optional(),
  facturacion: z.string().optional(),
  fechaLlamada: z.string().optional(),
  estadoConversacion: z.string().optional(),
  poliza: z.object({
    fechaInicio: z.string().min(1, 'Fecha de inicio es requerida'),
    fechaFin: z.string().min(1, 'Fecha de fin es requerida'),
    aseguradora: z.string().optional(),
    numPoliza: z.string().optional(),
    prima: z.number().optional(),
  }).optional(),
  vencimientos: z.object({
    rc: z.string().optional(),
    mercancias: z.string().optional(),
    acc: z.string().optional(),
    flotas: z.string().optional(),
    pyme: z.string().optional(),
  }).optional(),
}).refine(
  (data) => {
    if (data.poliza?.fechaInicio && data.poliza?.fechaFin) {
      return new Date(data.poliza.fechaFin) > new Date(data.poliza.fechaInicio);
    }
    return true;
  },
  { message: 'La fecha de fin debe ser posterior a la fecha de inicio', path: ['poliza', 'fechaFin'] }
);

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onSubmit: (data: Partial<Cliente>) => Promise<void>;
}

const estadoLabels: Record<EstadoCliente, string> = {
  contratado: 'Contratado',
  contactado_buena_pinta: 'Contactado - Buena Pinta',
  en_negociacion: 'En Negociación',
  descartado: 'Descartado',
};

const transporteLabels: Record<Transporte, string> = {
  nacional: 'Nacional',
  internacional: 'Internacional',
  peninsular: 'Peninsular',
  espana_francia: 'España y Francia',
  espana_portugal: 'España y Portugal',
  espana_francia_portugal: 'España, Francia y Portugal',
};

export function ClienteFormModal({
  open,
  onOpenChange,
  cliente,
  onSubmit,
}: ClienteFormModalProps) {
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
        cif: cliente.cif || '',
        telefono: cliente.telefono,
        correo: cliente.correo,
        direccion: cliente.direccion || '',
        notas: cliente.notas || '',
        estado: cliente.estado,
        tipoCarga: cliente.tipoCarga || '',
        transporte: cliente.transporte,
        numVehiculos: cliente.numVehiculos,
        facturacion: cliente.facturacion || '',
        fechaLlamada: cliente.fechaLlamada ? cliente.fechaLlamada.split('T')[0] : '',
        estadoConversacion: cliente.estadoConversacion || '',
        poliza: {
          fechaInicio: cliente.poliza.fechaInicio.split('T')[0],
          fechaFin: cliente.poliza.fechaFin.split('T')[0],
          aseguradora: cliente.poliza.aseguradora || '',
          numPoliza: cliente.poliza.numPoliza || '',
          prima: cliente.poliza.prima,
        },
        vencimientos: {
          rc: cliente.vencimientos?.rc ? cliente.vencimientos.rc.split('T')[0] : '',
          mercancias: cliente.vencimientos?.mercancias ? cliente.vencimientos.mercancias.split('T')[0] : '',
          acc: cliente.vencimientos?.acc ? cliente.vencimientos.acc.split('T')[0] : '',
          flotas: cliente.vencimientos?.flotas ? cliente.vencimientos.flotas.split('T')[0] : '',
          pyme: cliente.vencimientos?.pyme ? cliente.vencimientos.pyme.split('T')[0] : '',
        },
      }
      : {
        estado: 'contactado_buena_pinta',
        tipoCarga: '',
        transporte: 'nacional',
        poliza: {
          fechaInicio: dayjs().format('YYYY-MM-DD'),
          fechaFin: dayjs().add(90, 'days').format('YYYY-MM-DD'),
        },
      },
  });

  useEffect(() => {
    if (open && cliente) {
      reset({
        empresa: cliente.empresa,
        contacto: cliente.contacto,
        cif: cliente.cif || '',
        telefono: cliente.telefono,
        correo: cliente.correo,
        direccion: cliente.direccion || '',
        notas: cliente.notas || '',
        estado: cliente.estado,
        tipoCarga: cliente.tipoCarga || '',
        transporte: cliente.transporte,
        numVehiculos: cliente.numVehiculos,
        facturacion: cliente.facturacion || '',
        fechaLlamada: cliente.fechaLlamada ? cliente.fechaLlamada.split('T')[0] : '',
        estadoConversacion: cliente.estadoConversacion || '',
        poliza: {
          fechaInicio: cliente.poliza.fechaInicio.split('T')[0],
          fechaFin: cliente.poliza.fechaFin.split('T')[0],
          aseguradora: cliente.poliza.aseguradora || '',
          numPoliza: cliente.poliza.numPoliza || '',
          prima: cliente.poliza.prima,
        },
        vencimientos: {
          rc: cliente.vencimientos?.rc ? cliente.vencimientos.rc.split('T')[0] : '',
          mercancias: cliente.vencimientos?.mercancias ? cliente.vencimientos.mercancias.split('T')[0] : '',
          acc: cliente.vencimientos?.acc ? cliente.vencimientos.acc.split('T')[0] : '',
          flotas: cliente.vencimientos?.flotas ? cliente.vencimientos.flotas.split('T')[0] : '',
          pyme: cliente.vencimientos?.pyme ? cliente.vencimientos.pyme.split('T')[0] : '',
        },
      });
    } else if (open && !cliente) {
      reset({
        estado: 'contactado_buena_pinta',
        tipoCarga: '',
        transporte: 'nacional',
        poliza: {
          fechaInicio: dayjs().format('YYYY-MM-DD'),
          fechaFin: dayjs().add(90, 'days').format('YYYY-MM-DD'),
        },
      });
    }
  }, [open, cliente, reset]);

  const onFormSubmit = async (data: ClienteFormData) => {
    const submitData: Partial<Cliente> = {
      empresa: data.empresa,
      contacto: data.contacto,
      cif: data.cif || undefined,
      telefono: data.telefono,
      correo: data.correo,
      direccion: data.direccion || undefined,
      notas: data.notas || undefined,
      estado: data.estado,
      tipoCarga: data.tipoCarga,
      transporte: data.transporte,
      numVehiculos: data.numVehiculos,
      facturacion: data.facturacion || undefined,
      fechaLlamada: data.fechaLlamada ? new Date(data.fechaLlamada).toISOString() : undefined,
      estadoConversacion: data.estadoConversacion || undefined,
      poliza: data.poliza ? {
        fechaInicio: new Date(data.poliza.fechaInicio).toISOString(),
        fechaFin: new Date(data.poliza.fechaFin).toISOString(),
        aseguradora: data.poliza.aseguradora || undefined,
        numPoliza: data.poliza.numPoliza || undefined,
        prima: data.poliza.prima,
      } : undefined,
      vencimientos: data.vencimientos ? {
        rc: data.vencimientos.rc ? new Date(data.vencimientos.rc).toISOString() : undefined,
        mercancias: data.vencimientos.mercancias ? new Date(data.vencimientos.mercancias).toISOString() : undefined,
        acc: data.vencimientos.acc ? new Date(data.vencimientos.acc).toISOString() : undefined,
        flotas: data.vencimientos.flotas ? new Date(data.vencimientos.flotas).toISOString() : undefined,
        pyme: data.vencimientos.pyme ? new Date(data.vencimientos.pyme).toISOString() : undefined,
      } : undefined,
    };

    await onSubmit(submitData);
    onOpenChange(false);
  };

  const estadoValue = watch('estado');
  const transporteValue = watch('transporte');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa *</Label>
              <Input id="empresa" {...register('empresa')} />
              {errors.empresa && (
                <p className="text-sm text-destructive">{errors.empresa.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contacto">Contacto *</Label>
              <Input id="contacto" {...register('contacto')} />
              {errors.contacto && (
                <p className="text-sm text-destructive">{errors.contacto.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cif">CIF</Label>
              <Input id="cif" {...register('cif')} placeholder="CIF / DNI" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input id="telefono" type="tel" {...register('telefono')} />
              {errors.telefono && (
                <p className="text-sm text-destructive">{errors.telefono.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo *</Label>
              <Input id="correo" type="email" {...register('correo')} />
              {errors.correo && (
                <p className="text-sm text-destructive">{errors.correo.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...register('direccion')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={estadoValue}
                onValueChange={(value) => setValue('estado', value as EstadoCliente)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(estadoLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoCarga">Tipo de Carga *</Label>
              <Input
                id="tipoCarga"
                {...register('tipoCarga')}
                placeholder="Ej: General, Frigorífica..."
              />
              {errors.tipoCarga && (
                <p className="text-sm text-destructive">{errors.tipoCarga.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transporte">Transporte *</Label>
              <Select
                value={transporteValue}
                onValueChange={(value) => setValue('transporte', value as Transporte)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(transporteLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numVehiculos">Número de Vehículos</Label>
              <Input id="numVehiculos" type="number" {...register('numVehiculos', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facturacion">Facturación</Label>
              <Input id="facturacion" {...register('facturacion')} placeholder="Ej: 7,3M, 3M, 700mil" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaLlamada">Fecha de Llamada</Label>
              <Input id="fechaLlamada" type="date" {...register('fechaLlamada')} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="estadoConversacion">Estado de Conversación</Label>
              <Textarea id="estadoConversacion" {...register('estadoConversacion')} rows={2} />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Póliza Principal</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input id="fechaInicio" type="date" {...register('poliza.fechaInicio')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de Fin (Vencimiento)</Label>
                <Input id="fechaFin" type="date" {...register('poliza.fechaFin')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aseguradora">Aseguradora</Label>
                <Input id="aseguradora" {...register('poliza.aseguradora')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numPoliza">Número de Póliza</Label>
                <Input id="numPoliza" {...register('poliza.numPoliza')} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Vencimientos</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vencRC">RC</Label>
                <Input id="vencRC" type="date" {...register('vencimientos.rc')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencMercancias">Mercancías</Label>
                <Input id="vencMercancias" type="date" {...register('vencimientos.mercancias')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencACC">ACC</Label>
                <Input id="vencACC" type="date" {...register('vencimientos.acc')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencFlotas">Flotas</Label>
                <Input id="vencFlotas" type="date" {...register('vencimientos.flotas')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencPYME">PYME</Label>
                <Input id="vencPYME" type="date" {...register('vencimientos.pyme')} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" {...register('notas')} rows={4} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : cliente ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

