// Servicio de API para Gestión de Inventario - Conectado al backend real

import { api, ApiError } from '@/lib/api';

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  stock: number;
  createdAt: string;
}

export interface CatalogProduct extends Product {
  esPrestado?: boolean;
  codigoTienda?: string;
}

export interface RegisterProductData {
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: string | number;
  stock: string | number;
}

export interface RegisterProductResponse {
  success: boolean;
  message: string;
  product?: Product;
}

export interface UpdateProductData {
  descripcion?: string;
  precio?: string | number;
  stock?: string | number;
}

export interface UpdateProductResponse {
  success: boolean;
  message: string;
  product?: Product;
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

export const CATEGORIAS = [
  'Papelería',
  'Escritura',
  'Mochilas',
  'Organizadores',
  'Arte',
  'Matemáticas',
  'Oficina',
  'Prestado',
  'Otros',
];

function handleError(err: unknown): { success: false; message: string } {
  if (err && typeof err === 'object' && 'message' in err) {
    return { success: false, message: (err as ApiError).message };
  }
  return { success: false, message: 'Error de conexión. Verifica que el servidor esté activo.' };
}

export async function getProducts(token?: string): Promise<Product[]> {
  try {
    const res = await api.get<Product[]>('/api/products', token);
    return Array.isArray(res) ? res : [];
  } catch (err) {
    return [];
  }
}

export async function getProductById(id: string, token?: string): Promise<Product | null> {
  try {
    const res = await api.get<Product>(`/api/products/${id}`, token);
    return res || null;
  } catch {
    return null;
  }
}

export async function registerProduct(
  data: RegisterProductData,
  token: string
): Promise<RegisterProductResponse> {
  try {
    const res = await api.post<RegisterProductResponse>(
      '/api/products',
      {
        nombre: data.nombre,
        categoria: data.categoria,
        descripcion: data.descripcion,
        precio: data.precio,
        stock: data.stock,
      },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function updateProduct(
  id: string,
  data: UpdateProductData,
  token: string
): Promise<UpdateProductResponse> {
  try {
    const res = await api.patch<UpdateProductResponse>(`/api/products/${id}`, data, token);
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function deleteProduct(id: string, token: string): Promise<DeleteProductResponse> {
  try {
    const res = await api.delete<DeleteProductResponse>(`/api/products/${id}`, token);
    return res;
  } catch (err) {
    return handleError(err);
  }
}
