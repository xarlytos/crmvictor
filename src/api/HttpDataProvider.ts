import type {
  Cliente,
  DataProvider,
  FiltrosClientes,
  ConfigUsuario,
  EstadoCliente,
  SiniestroGrupo,
  Siniestro,
  FiltrosSiniestros,
  CalendarEvent,
  EventType,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Token storage key
const TOKEN_KEY = 'crm_token';

export class HttpDataProvider implements DataProvider {
  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers,
        ...options,
      });

      // Si es 401, el token expiró o es inválido
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('crm_user');
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
      }

      if (!response.ok) {
        let errorMessage = `Error HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Si no puede parsear JSON, usa el status
        }
        throw new Error(errorMessage);
      }

      // Para respuestas 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
      }
      throw error;
    }
  }

  async listClientes(filters?: FiltrosClientes): Promise<{ items: Cliente[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.estados) filters.estados.forEach((e) => queryParams.append('estados', e));
    if (filters?.tiposCarga) filters.tiposCarga.forEach((t) => queryParams.append('tiposCarga', t));
    if (filters?.transportes) filters.transportes.forEach((t) => queryParams.append('transportes', t));
    if (filters?.mesVencimiento) queryParams.append('mesVencimiento', String(filters.mesVencimiento));
    if (filters?.proximosDias !== undefined) queryParams.append('proximosDias', String(filters.proximosDias));

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

  // Métodos de autenticación
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem('crm_user', JSON.stringify(response.user));
    return response;
  }

  async register(email: string, password: string, nombre: string): Promise<{ token: string; user: any }> {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre }),
    });
    
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem('crm_user', JSON.stringify(response.user));
    return response;
  }

  async getMe(): Promise<{ user: any }> {
    return this.request<{ user: any }>('/auth/me');
  }

  async updateProfile(nombre: string, email: string): Promise<{ user: any }> {
    return this.request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ nombre, email }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request<void>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('crm_user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser(): any | null {
    const userStr = localStorage.getItem('crm_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ========== SINIESTROS ==========

  async listSiniestroGrupos(filtros?: FiltrosSiniestros): Promise<SiniestroGrupo[]> {
    const queryParams = new URLSearchParams();
    if (filtros?.search) queryParams.append('search', filtros.search);
    if (filtros?.estado) queryParams.append('estado', filtros.estado);
    if (filtros?.valoracion) queryParams.append('valoracion', filtros.valoracion);

    const query = queryParams.toString();
    const response = await this.request<{ success: boolean; data: SiniestroGrupo[] }>(
      `/siniestros${query ? `?${query}` : ''}`
    );
    return response.data;
  }

  async getSiniestroGrupo(id: string): Promise<SiniestroGrupo> {
    const response = await this.request<{ success: boolean; data: SiniestroGrupo }>(`/siniestros/${id}`);
    return response.data;
  }

  async createSiniestroGrupo(dto: Omit<SiniestroGrupo, 'id' | 'createdAt' | 'updatedAt'>): Promise<SiniestroGrupo> {
    const response = await this.request<{ success: boolean; data: SiniestroGrupo }>('/siniestros', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.data;
  }

  async updateSiniestroGrupo(id: string, dto: Partial<SiniestroGrupo>): Promise<SiniestroGrupo> {
    const response = await this.request<{ success: boolean; data: SiniestroGrupo }>(`/siniestros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return response.data;
  }

  async deleteSiniestroGrupo(id: string): Promise<void> {
    await this.request<void>(`/siniestros/${id}`, {
      method: 'DELETE',
    });
  }

  async addSiniestro(grupoId: string, siniestro: Omit<Siniestro, 'id' | 'createdAt' | 'updatedAt'>): Promise<Siniestro> {
    const response = await this.request<{ success: boolean; data: Siniestro }>(`/siniestros/${grupoId}/siniestros`, {
      method: 'POST',
      body: JSON.stringify(siniestro),
    });
    return response.data;
  }

  async updateSiniestro(grupoId: string, siniestroId: string, updates: Partial<Siniestro>): Promise<Siniestro> {
    const response = await this.request<{ success: boolean; data: Siniestro }>(
      `/siniestros/${grupoId}/siniestros/${siniestroId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return response.data;
  }

  async deleteSiniestro(grupoId: string, siniestroId: string): Promise<void> {
    await this.request<void>(`/siniestros/${grupoId}/siniestros/${siniestroId}`, {
      method: 'DELETE',
    });
  }

  // ========== CALENDARIO - EVENTOS ==========

  async listEventos(year?: number, month?: number): Promise<CalendarEvent[]> {
    const queryParams = new URLSearchParams();
    if (year !== undefined) queryParams.append('year', String(year));
    if (month !== undefined) queryParams.append('month', String(month));

    const query = queryParams.toString();
    const response = await this.request<{ success: boolean; data: CalendarEvent[] }>(
      `/eventos${query ? `?${query}` : ''}`
    );
    return response.data;
  }

  async createEvento(dto: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    const response = await this.request<{ success: boolean; data: CalendarEvent }>('/eventos', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.data;
  }

  async updateEvento(id: string, dto: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>): Promise<CalendarEvent> {
    const response = await this.request<{ success: boolean; data: CalendarEvent }>(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return response.data;
  }

  async deleteEvento(id: string): Promise<void> {
    await this.request<void>(`/eventos/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== CALENDARIO - TIPOS DE EVENTO ==========

  async listTiposEvento(): Promise<EventType[]> {
    const response = await this.request<{ success: boolean; data: EventType[] }>('/eventos/tipos/list');
    return response.data;
  }

  async createTipoEvento(dto: Omit<EventType, 'id' | 'createdAt'>): Promise<EventType> {
    const response = await this.request<{ success: boolean; data: EventType }>('/eventos/tipos', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return response.data;
  }

  async updateTipoEvento(id: string, dto: Partial<Omit<EventType, 'id' | 'createdAt'>>): Promise<EventType> {
    const response = await this.request<{ success: boolean; data: EventType }>(`/eventos/tipos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
    return response.data;
  }

  async deleteTipoEvento(id: string): Promise<void> {
    await this.request<void>(`/eventos/tipos/${id}`, {
      method: 'DELETE',
    });
  }
}
