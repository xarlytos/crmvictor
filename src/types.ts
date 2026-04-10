export type EstadoCliente = 'llamado' | 'gmail_enviado' | 'reunido' | 'propuesta_activa' | 'vendido' | 'no_llegamos';

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

export interface Vencimiento {
  id: string;
  nombre: string;
  fecha: string; // ISO
}

export interface Vencimientos {
  rc?: string; // ISO
  mercancias?: string; // ISO
  acc?: string; // ISO
  flotas?: string; // ISO
  pyme?: string; // ISO
  personalizados?: Vencimiento[];
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

  // Siniestros
  listSiniestroGrupos(filtros?: FiltrosSiniestros): Promise<SiniestroGrupo[]>;
  getSiniestroGrupo(id: string): Promise<SiniestroGrupo>;
  createSiniestroGrupo(dto: Omit<SiniestroGrupo, 'id' | 'createdAt' | 'updatedAt'>): Promise<SiniestroGrupo>;
  updateSiniestroGrupo(id: string, dto: Partial<SiniestroGrupo>): Promise<SiniestroGrupo>;
  deleteSiniestroGrupo(id: string): Promise<void>;

  // Siniestros individuales
  addSiniestro(grupoId: string, siniestro: Omit<Siniestro, 'id' | 'createdAt' | 'updatedAt'>): Promise<Siniestro>;
  updateSiniestro(grupoId: string, siniestroId: string, updates: Partial<Siniestro>): Promise<Siniestro>;
  deleteSiniestro(grupoId: string, siniestroId: string): Promise<void>;

  // Calendario - Eventos
  listEventos(year?: number, month?: number): Promise<CalendarEvent[]>;
  createEvento(dto: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent>;
  updateEvento(id: string, dto: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>): Promise<CalendarEvent>;
  deleteEvento(id: string): Promise<void>;

  // Calendario - Tipos de Evento
  listTiposEvento(): Promise<EventType[]>;
  createTipoEvento(dto: Omit<EventType, 'id' | 'createdAt'>): Promise<EventType>;
  updateTipoEvento(id: string, dto: Partial<Omit<EventType, 'id' | 'createdAt'>>): Promise<EventType>;
  deleteTipoEvento(id: string): Promise<void>;
}

// ========== CALENDAR TYPES ==========

export interface EventType {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  typeId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  description?: string;
  customColor?: string | null; // override del color del tipo
  createdAt: string;
}

// ========== SINIESTROS TYPES ==========

export type EstadoSiniestro = 'abierto' | 'cerrado';
export type CulpaSiniestro = 'tomador' | 'contrario';
export type ValoracionSiniestro = 'positiva' | 'intermedia' | 'negativa';

export interface Siniestro {
  id: string;
  nombreTomador: string;
  numeroPoliza: string;
  compania: string;
  matricula: string;
  fechaOcurrencia: string | null;
  tipoSiniestro: string;
  fechaApertura: string | null;
  numSiniestroCompania: string;
  numSiniestroElevia: string;
  estado: EstadoSiniestro;
  costeTotal: number | null;
  culpa: CulpaSiniestro | null;
  observaciones: string;
  fechaCierre: string | null;
  valoracion: ValoracionSiniestro | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiniestroGrupo {
  id: string;
  clienteId: string;
  empresa: {
    nombre: string;
    direccion?: string;
    cp?: string;
    ciudad?: string;
  };
  observacionesGenerales: string;
  siniestros: Siniestro[];
  createdAt: string;
  updatedAt: string;
}

export interface FiltrosSiniestros {
  search?: string;
  estado?: EstadoSiniestro;
  valoracion?: ValoracionSiniestro;
}

