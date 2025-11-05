import type {
  Cliente,
  DataProvider,
  FiltrosClientes,
  EstadoCliente,
  TipoCarga,
  Transporte,
  ConfigUsuario,
} from '@/types';

const STORAGE_KEY = 'crm-clientes';
const STORAGE_VERSION = '1.0';
const CONFIG_KEY = 'crm-config';

// Utility functions
function getMonthFromDate(dateString: string): number {
  return new Date(dateString).getMonth() + 1; // Adding 1 because getMonth() returns 0-11
}

function getDaysUntil(dateString: string): number {
  const now = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDefaultConfig(): ConfigUsuario {
  return {
    alertWindowDays: 60,
    monthColors: {
      1: '#ef4444',
      2: '#f97316',
      3: '#fbbf24',
      4: '#84cc16',
      5: '#22c55e',
      6: '#10b981',
      7: '#14b8a6',
      8: '#06b6d4',
      9: '#3b82f6',
      10: '#6366f1',
      11: '#8b5cf6',
      12: '#a855f7',
    },
  };
}

export class MockDataProvider implements DataProvider {
  private getClientes(): Cliente[] {
    // Intentar cargar de localStorage primero
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.data) && parsed.data.length > 0) {
          return parsed.data;
        }
      } catch (e) {
        // Si hay error, continuar y crear los datos
      }
    }

    // Helper para convertir meses a fechas
    const parseMonthToDate = (monthStr: string): string | undefined => {
      if (!monthStr || monthStr === '-' || monthStr.trim() === '') return undefined;
      
      const monthMap: Record<string, number> = {
        'ENERO': 1, 'ENE': 1,
        'FEBRERO': 2, 'FEB': 2,
        'MARZO': 3, 'MAR': 3,
        'ABRIL': 4, 'ABR': 4,
        'MAYO': 5, 'MAY': 5,
        'JUNIO': 6, 'JUN': 6,
        'JULIO': 7, 'JUL': 7,
        'AGOSTO': 8, 'AGO': 8,
        'SEPTIEMBRE': 9, 'SEP': 9,
        'OCTUBRE': 10, 'OCT': 10,
        'NOVIEMBRE': 11, 'NOV': 11,
        'DICIEMBRE': 12, 'DIC': 12,
      };

      const monthUpper = monthStr.trim().toUpperCase();
      const month = monthMap[monthUpper];
      if (!month) return undefined;

      const now = new Date();
      const currentYear = now.getFullYear();
      // Si el mes ya pasó este año, usar el próximo año
      const year = month < now.getMonth() + 1 ? currentYear + 1 : currentYear;
      // Último día del mes
      const lastDay = new Date(year, month, 0).getDate();
      return new Date(year, month - 1, lastDay).toISOString();
    };

    // Helper para parsear fechas como "31 dic" o "3/10"
    const parseDate = (dateStr: string): string | undefined => {
      if (!dateStr || dateStr === '-' || dateStr.trim() === '') return undefined;
      
      const trimmed = dateStr.trim();
      
      // Formato "3/10" o "7/10" (día/mes)
      if (trimmed.includes('/')) {
        const [day, month] = trimmed.split('/').map(Number);
        if (day && month) {
          const now = new Date();
          const currentYear = now.getFullYear();
          // Si el mes ya pasó, usar el próximo año
          const year = month < now.getMonth() + 1 ? currentYear + 1 : currentYear;
          return new Date(year, month - 1, day).toISOString();
        }
      }
      
      // Formato "31 dic" (día + mes abreviado)
      const parts = trimmed.split(/\s+/);
      if (parts.length === 2) {
        const day = parseInt(parts[0]);
        const monthStr = parts[1];
        const monthMap: Record<string, number> = {
          'ENE': 1, 'FEB': 2, 'MAR': 3, 'ABR': 4, 'MAY': 5, 'JUN': 6,
          'JUL': 7, 'AGO': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DIC': 12,
        };
        const month = monthMap[monthStr.toUpperCase()];
        if (day && month) {
          const now = new Date();
          const currentYear = now.getFullYear();
          const year = month < now.getMonth() + 1 ? currentYear + 1 : currentYear;
          return new Date(year, month - 1, day).toISOString();
        }
      }
      
      // Si es solo un mes, usar parseMonthToDate
      return parseMonthToDate(trimmed);
    };

    // Helper para convertir tipo de carga
    const parseTipoCarga = (mercancia: string): TipoCarga | undefined => {
      if (!mercancia || mercancia === '-' || mercancia.trim() === '') return undefined;
      const map: Record<string, TipoCarga> = {
        'NARANJA': 'general_fraccionada',
        'FRIO': 'frigorifica',
        'FRIGO': 'frigorifica',
        'CARGA FRACCIONADA': 'fraccionada_ltl',
        'NO ADR': 'general_fraccionada',
      };
      return map[mercancia.toUpperCase()] as TipoCarga | undefined;
    };

    // Helper para convertir transporte
    const parseTransporte = (transporte: string): Transporte | undefined => {
      if (!transporte || transporte === '-' || transporte.trim() === '') return undefined;
      const map: Record<string, Transporte> = {
        'INT': 'internacional',
        'NAC': 'nacional',
        'PEN': 'peninsula',
      };
      return map[transporte.toUpperCase()] as Transporte | undefined;
    };

    // Si no hay datos guardados, crear los clientes nuevos
    const now = new Date();
    const currentYear = now.getFullYear();
    
    const clientes: Cliente[] = [
      {
        id: '1',
        empresa: 'VICENTE COLOMAR',
        contacto: 'JESUS',
        telefono: '609875288',
        correo: 'vtecolomar@gmail.com',
        estado: 'contactado_buena_pinta',
        tipoCarga: parseTipoCarga('NARANJA'),
        transporte: parseTransporte('INT'),
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 11, 31).toISOString(),
        },
        facturacion: '7,3M',
        fechaLlamada: parseDate('7/10'),
        estadoConversacion: 'email enviado, llamar de nuevo.',
        createdAt: new Date(currentYear, 9, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        empresa: 'JUAN VICENTE',
        contacto: 'JUAN VICENTE',
        telefono: undefined,
        correo: 'Transterol@yahoo.es',
        estado: 'contactado_buena_pinta',
        tipoCarga: parseTipoCarga('FRIO'),
        transporte: parseTransporte('INT'),
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 11, 31).toISOString(),
        },
        vencimientos: {
          mercancias: undefined, // "NO" significa sin vencimiento
          acc: parseDate('31 dic'),
          flotas: parseDate('31 dic'),
        },
        facturacion: '3M',
        fechaLlamada: undefined,
        estadoConversacion: 'whatsap enviado',
        createdAt: new Date(currentYear, 9, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        empresa: 'TTES. EL CLARIANO',
        contacto: 'EMILIA',
        telefono: '962387288',
        correo: 'Ontinyent@transporteselclariano.es',
        estado: 'contactado_buena_pinta',
        tipoCarga: undefined,
        transporte: parseTransporte('NAC'),
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 11, 31).toISOString(),
        },
        vencimientos: {
          flotas: parseDate('31 dic'),
        },
        numVehiculos: 17,
        facturacion: '700mil',
        fechaLlamada: parseDate('3/10'),
        estadoConversacion: 'LLamar de nuevo',
        createdAt: new Date(currentYear, 9, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        empresa: 'TTES. HURTADO',
        contacto: 'GEMA',
        telefono: '961590011',
        correo: 'Contabilidad@hursa.com',
        estado: 'contactado_buena_pinta',
        tipoCarga: undefined,
        transporte: undefined,
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 2, 31).toISOString(), // MARZO
        },
        vencimientos: {
          rc: parseMonthToDate('MARZO'),
          mercancias: parseMonthToDate('ENERO'),
          acc: parseMonthToDate('MARZO'),
          pyme: parseMonthToDate('ABRIL'),
        },
        facturacion: '2M',
        fechaLlamada: parseDate('3/11'),
        estadoConversacion: 'Cuestionario de mercancias enviado',
        createdAt: new Date(currentYear, 10, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        empresa: 'DMORET',
        contacto: 'DANIEL',
        telefono: '606363299',
        correo: 'dmoret@logistica.net',
        estado: 'contactado_buena_pinta',
        tipoCarga: undefined,
        transporte: undefined,
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 11, 31).toISOString(),
        },
        facturacion: '22M',
        fechaLlamada: parseDate('1/10'),
        estadoConversacion: 'ENCIADA PROPUESTA DE RC Y ACC VOLVER A LLAMAR',
        createdAt: new Date(currentYear, 9, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '6',
        empresa: 'TRANSVERCHER',
        contacto: 'CARMEN',
        telefono: '9628221497',
        correo: 'info@transvercher.com',
        estado: 'contactado_buena_pinta',
        tipoCarga: parseTipoCarga('CARGA FRACCIONADA'),
        transporte: undefined,
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 2, 31).toISOString(), // MARZO
        },
        vencimientos: {
          flotas: parseMonthToDate('MARZO'),
          pyme: parseMonthToDate('JULIO'),
        },
        facturacion: '100mil',
        fechaLlamada: parseDate('3/10'),
        estadoConversacion: 'PROPUESTA RC ENVIADA llamar para recordar',
        createdAt: new Date(currentYear, 9, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '7',
        empresa: 'TTES. TALENS',
        contacto: 'FRANCUASCO',
        telefono: '658856645',
        correo: 'contabilidad@trasnportestalens.com',
        estado: 'contactado_buena_pinta',
        tipoCarga: parseTipoCarga('NO ADR'),
        transporte: parseTransporte('NAC'),
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 11, 31).toISOString(), // DIC
        },
        vencimientos: {
          rc: parseMonthToDate('DIC'),
          mercancias: parseMonthToDate('DIC'),
          acc: parseMonthToDate('DIC'),
          flotas: parseMonthToDate('DIC'),
        },
        numVehiculos: 9,
        facturacion: '1M',
        fechaLlamada: parseDate('3/10'),
        estadoConversacion: 'correo enviado llamar para recordar',
        createdAt: new Date(currentYear, 9, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '8',
        empresa: 'PERIS LOGISTICA',
        contacto: 'HUGO',
        telefono: '650977675',
        correo: 'perislogistica@hotmail.es',
        estado: 'contactado_buena_pinta',
        tipoCarga: parseTipoCarga('FRIGO'),
        transporte: parseTransporte('INT'),
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 11, 31).toISOString(),
        },
        vencimientos: {
          flotas: parseDate('31 dic'),
        },
        facturacion: '3M',
        fechaLlamada: parseDate('3/10'),
        estadoConversacion: 'COTIZANDO FLOTA',
        createdAt: new Date(currentYear, 9, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '9',
        empresa: 'TRANS CUQYEFRUT',
        contacto: 'CHELLO',
        telefono: '626216533',
        correo: 'transcuquefrut@telefonica.es',
        estado: 'contactado_buena_pinta',
        tipoCarga: undefined,
        transporte: undefined,
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 11, 31).toISOString(),
        },
        vencimientos: {
          flotas: parseDate('31 dic'),
        },
        facturacion: undefined,
        fechaLlamada: parseDate('3/10'),
        estadoConversacion: 'LLamar de nuevo, correo enviadp',
        createdAt: new Date(currentYear, 9, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '10',
        empresa: 'RAFAEL ALEMAN ALDAS',
        contacto: 'M JOSE',
        telefono: '687749403',
        correo: 'admin@raleman.es',
        estado: 'contactado_buena_pinta',
        tipoCarga: undefined,
        transporte: undefined,
        poliza: {
          fechaInicio: new Date(currentYear - 1, 0, 1).toISOString(),
          fechaFin: new Date(currentYear, 4, 31).toISOString(), // MAYO
        },
        vencimientos: {
          rc: parseMonthToDate('MAYO'),
          flotas: parseMonthToDate('JUNIO'),
        },
        numVehiculos: 18,
        facturacion: '1M',
        fechaLlamada: undefined,
        estadoConversacion: 'Llamar en Marzo',
        createdAt: new Date(currentYear, 2, 1).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Guardar los clientes iniciales
    this.saveClientes(clientes);
    return clientes;
  }

  private saveClientes(clientes: Cliente[]): void {
    // Guardar en localStorage para persistencia
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, data: clientes })
    );
  }

  async listClientes(filters?: FiltrosClientes): Promise<{ items: Cliente[]; total: number }> {
    // Obtener los 3 clientes
    let clientes = this.getClientes();

    // Aplicar filtros
    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        clientes = clientes.filter(
          (c) =>
            c.empresa.toLowerCase().includes(search) ||
            c.contacto.toLowerCase().includes(search) ||
            (c.telefono && c.telefono.includes(search)) ||
            (c.correo && c.correo.toLowerCase().includes(search))
        );
      }

      if (filters.estados && filters.estados.length > 0) {
        clientes = clientes.filter((c) => c.estado && filters.estados?.includes(c.estado));
      }

      if (filters.tiposCarga && filters.tiposCarga.length > 0) {
        clientes = clientes.filter((c) => c.tipoCarga && filters.tiposCarga?.includes(c.tipoCarga));
      }

      if (filters.transportes && filters.transportes.length > 0) {
        clientes = clientes.filter((c) => c.transporte && filters.transportes?.includes(c.transporte));
      }

      if (filters.mesVencimiento) {
        clientes = clientes.filter(
          (c) => getMonthFromDate(c.poliza.fechaFin) === filters.mesVencimiento
        );
      }
    }

    return { items: clientes, total: clientes.length };
  }

  async getCliente(id: string): Promise<Cliente> {
    const clientes = this.getClientes();
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) {
      throw new Error(`Cliente con id ${id} no encontrado`);
    }
    return cliente;
  }

  async createCliente(dto: Partial<Cliente>): Promise<Cliente> {
    const clientes = this.getClientes();
    const nuevo: Cliente = {
      id: `cliente-${Date.now()}`,
      empresa: dto.empresa || '',
      contacto: dto.contacto || '',
      telefono: dto.telefono || undefined,
      correo: dto.correo || undefined,
      direccion: dto.direccion,
      notas: dto.notas,
      estado: dto.estado || undefined,
      tipoCarga: dto.tipoCarga || undefined,
      transporte: dto.transporte || undefined,
      poliza: dto.poliza || {
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      vencimientos: dto.vencimientos,
      numVehiculos: dto.numVehiculos,
      facturacion: dto.facturacion,
      fechaLlamada: dto.fechaLlamada,
      estadoConversacion: dto.estadoConversacion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clientes.push(nuevo);
    this.saveClientes(clientes);
    return nuevo;
  }

  async updateCliente(id: string, dto: Partial<Cliente>): Promise<Cliente> {
    const clientes = this.getClientes();
    const index = clientes.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Cliente con id ${id} no encontrado`);
    }

    const actualizado = {
      ...clientes[index],
      ...dto,
      id, // Asegurar que el ID no cambie
      updatedAt: new Date().toISOString(),
    };

    clientes[index] = actualizado;
    this.saveClientes(clientes);
    return actualizado;
  }

  async deleteCliente(id: string): Promise<void> {
    const clientes = this.getClientes();
    const filtered = clientes.filter((c) => c.id !== id);
    if (filtered.length === clientes.length) {
      throw new Error(`Cliente con id ${id} no encontrado`);
    }
    this.saveClientes(filtered);
  }

  async listVencimientos(params: {
    days?: number;
    mes?: number;
    estado?: EstadoCliente;
  }): Promise<Cliente[]> {
    const clientes = this.getClientes();
    let filtered = clientes.filter((c) => {
      const dias = getDaysUntil(c.poliza.fechaFin);
      return dias >= 0; // Solo futuros
    });

    if (params.days !== undefined) {
      filtered = filtered.filter((c) => {
        const dias = getDaysUntil(c.poliza.fechaFin);
        return dias <= params.days!;
      });
    }

    if (params.mes) {
      filtered = filtered.filter(
        (c) => getMonthFromDate(c.poliza.fechaFin) === params.mes
      );
    }

    if (params.estado) {
      filtered = filtered.filter((c) => c.estado === params.estado);
    }

    // Ordenar por fechaFin ascendente
    filtered.sort((a, b) => {
      const fechaA = new Date(a.poliza.fechaFin).getTime();
      const fechaB = new Date(b.poliza.fechaFin).getTime();
      return fechaA - fechaB;
    });

    return filtered;
  }

  async getConfig(): Promise<ConfigUsuario> {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing config', e);
      }
    }
    const defaultConfig = getDefaultConfig();
    localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
    return defaultConfig;
  }

  async updateConfig(patch: Partial<ConfigUsuario>): Promise<ConfigUsuario> {
    const current = await this.getConfig();
    const updated = { ...current, ...patch };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
    return updated;
  }

  // Método helper para reiniciar datos
  resetData(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONFIG_KEY);
  }
}

