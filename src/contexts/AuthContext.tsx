import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'crm_auth';
const REMEMBER_ME_KEY = 'crm_remember_me';

const VALID_EMAIL = 'victorclemente@gmail.com';
const VALID_PASSWORD = 'Victor123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    const sessionAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    
    if (savedAuth === 'true' || sessionAuth === 'true' || rememberMe) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, rememberMe: boolean): boolean => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
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

