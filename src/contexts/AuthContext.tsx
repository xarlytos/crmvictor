import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HttpDataProvider } from '@/api/HttpDataProvider';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'crm_token';
const USER_KEY = 'crm_user';

const api = new HttpDataProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay token guardado al iniciar
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (token) {
        try {
          // Verificar que el token sigue siendo válido
          const response = await api.getMe();
          setUser(response.user);
          setIsAuthenticated(true);
        } catch (err) {
          // Token inválido, limpiar
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, _rememberMe: boolean): Promise<boolean> => {
    setError(null);
    console.log('🔐 Intentando login con:', email);
    
    try {
      console.log('📡 Llamando a api.login...');
      const response = await api.login(email, password);
      console.log('✅ Login exitoso:', response);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
      throw err; // Re-lanzar para que el componente lo maneje
    }
  };

  const logout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
