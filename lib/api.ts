/**
 * Cliente API para conectar la app con el backend
 * En desarrollo: localhost. En físico: IP de la máquina.
 */

// En emulador Android: 10.0.2.2 = localhost del host
// En emulador iOS: localhost funciona
// En dispositivo físico: usar la IP de tu PC (ej: 192.168.1.10)
import { Platform } from 'react-native';

const getBaseUrl = () => {
  // En desarrollo con Expo, puedes usar tu IP local para probar en dispositivo
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000'; // Emulador Android
    }
    return 'http://localhost:3000'; // iOS simulator / web
  }
  // En producción, usar la URL del servidor
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
};

export const API_BASE_URL = getBaseUrl();

export interface ApiError {
  message: string;
  status?: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: ApiError = {
      message: data?.message || data?.error || `Error ${response.status}`,
      status: response.status,
    };
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, body?: unknown, token?: string) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined, token }),

  put: <T>(endpoint: string, body?: unknown, token?: string) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, token }),

  patch: <T>(endpoint: string, body?: unknown, token?: string) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, token }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'DELETE', token }),
};
