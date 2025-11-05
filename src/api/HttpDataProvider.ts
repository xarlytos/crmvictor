import type {
  Cliente,
  DataProvider,
  FiltrosClientes,
  ConfigUsuario,
  EstadoCliente,
} from '@/types';

const API_BASE = '/api';

export class HttpDataProvider implements DataProvider {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async listClientes(filters?: FiltrosClientes): Promise<{ items: Cliente[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.estados) filters.estados.forEach((e) => queryParams.append('estados', e));
    if (filters?.tiposCarga) filters.tiposCarga.forEach((t) => queryParams.append('tiposCarga', t));
    if (filters?.transportes) filters.transportes.forEach((t) => queryParams.append('transportes', t));
    if (filters?.mesVencimiento) queryParams.append('mesVencimiento', String(filters.mesVencimiento));

    const query = queryParams.toString();
    return this.request<{ items: Cliente[]; total: number }>(
      `/clientes${query ? `?${query}` : ''}`
    );
  }

  async getCliente(id: string): Promise<Cliente> {
    return this.request<Cliente>(`/clientes/${id}`);
  }

  async createCliente(dto: Partial<Cliente>): Promise<Cliente> {
    return this.request<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateCliente(id: string, dto: Partial<Cliente>): Promise<Cliente> {
    return this.request<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async deleteCliente(id: string): Promise<void> {
    await this.request<void>(`/clientes/${id}`, {
      method: 'DELETE',
    });
  }

  async listVencimientos(params: {
    days?: number;
    mes?: number;
    estado?: EstadoCliente;
  }): Promise<Cliente[]> {
    const queryParams = new URLSearchParams();
    if (params.days !== undefined) queryParams.append('days', String(params.days));
    if (params.mes) queryParams.append('mes', String(params.mes));
    if (params.estado) queryParams.append('estado', params.estado);

    const query = queryParams.toString();
    return this.request<Cliente[]>(`/vencimientos${query ? `?${query}` : ''}`);
  }

  async getConfig(): Promise<ConfigUsuario> {
    return this.request<ConfigUsuario>('/config');
  }

  async updateConfig(patch: Partial<ConfigUsuario>): Promise<ConfigUsuario> {
    return this.request<ConfigUsuario>('/config', {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
  }
}

