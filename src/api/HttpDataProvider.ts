import type {
  Cliente,
  DataProvider,
  FiltrosClientes,
  ConfigUsuario,
  EstadoCliente,
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
}
