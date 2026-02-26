import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  loginUser,
  LoginData,
  LoginResponse,
} from '@/services/authService';

export interface User {
  id: string;
  email: string;
  role: 'cliente' | 'empleado' | 'administrador';
  name?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de autenticación al iniciar
  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error al cargar datos de autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await loginUser(data);

      if (response.success && response.token && response.user) {
        // Guardar token y usuario en SecureStore
        await SecureStore.setItemAsync(TOKEN_KEY, response.token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));

        setToken(response.token);
        setUser(response.user);
      }

      return response;
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Ocurrió un error al iniciar sesión. Por favor, inténtalo nuevamente.',
      };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
