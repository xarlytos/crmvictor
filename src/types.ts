export type EstadoCliente = 'contratado' | 'contactado_buena_pinta' | 'en_negociacion' | 'descartado';

export type TipoCarga = string;

export type Transporte =
  | 'nacional'
  | 'internacional'
  | 'peninsular'
  | 'espana_francia'
  | 'espana_portugal'
  | 'espana_francia_portugal';

export interface Poliza {
  aseguradora?: string;
  numPoliza?: string;
  fechaInicio: string; // ISO
  fechaFin: string;    // ISO (vencimiento)
  prima?: number;
}

export interface Vencimientos {
  rc?: string; // ISO
  mercancias?: string; // ISO
  acc?: string; // ISO
  flotas?: string; // ISO
  pyme?: string; // ISO
}

export interface Cliente {
  id: string;
  empresa: string;
  contacto: string;
  cif?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  notas?: string;
  estado?: EstadoCliente;
  tipoCarga?: TipoCarga;
  transporte?: Transporte;
  poliza?: Poliza;
  vencimientos?: Vencimientos;
  numVehiculos?: number;
  facturacion?: string; // Ej: "7,3M", "3M", "700mil"
  fechaLlamada?: string; // ISO
  estadoConversacion?: string; // Ej: "email enviado, llamar de nuevo"
  createdAt: string;
  updatedAt: string;
}

export interface ConfigUsuario {
  alertWindowDays: number; // p.ej. 60
  monthColors: Record<number, string>; // 1..12 -> #hex
}

export interface FiltrosClientes {
  search?: string;
  estados?: EstadoCliente[];
  tiposCarga?: TipoCarga[];
  transportes?: Transporte[];
  mesVencimiento?: number;
  proximosDias?: number; // New
}

export interface DataProvider {
  listClientes(filters?: FiltrosClientes): Promise<{ items: Cliente[]; total: number }>;
  getCliente(id: string): Promise<Cliente>;
  createCliente(dto: Partial<Cliente>): Promise<Cliente>;
  updateCliente(id: string, dto: Partial<Cliente>): Promise<Cliente>;
  deleteCliente(id: string): Promise<void>;

  listVencimientos(params: { days?: number; mes?: number; estado?: EstadoCliente }): Promise<Cliente[]>;

  getConfig(): Promise<ConfigUsuario>;
  updateConfig(patch: Partial<ConfigUsuario>): Promise<ConfigUsuario>;
}

