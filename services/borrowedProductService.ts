// Servicio de API para Productos Prestados (HU11) - Conectado al backend real

import { api, ApiError } from '@/lib/api';

export type BorrowedProductStatus = 'pendiente' | 'cancelado';

export interface BorrowedProduct {
  id: string;
  nombre: string;
  stock: number;
  precio: number;
  codigoTienda: string;
  fechaPrestamo: string;
  estado: BorrowedProductStatus;
  empleadoId: string;
  empleadoName: string;
  createdAt: string;
}

export interface RegisterBorrowedProductData {
  nombre: string;
  stock: number;
  precio: number;
  codigoTienda: string;
  fechaPrestamo: string;
  empleadoId: string;
  empleadoName: string;
}

export interface RegisterBorrowedProductResponse {
  success: boolean;
  message: string;
  product?: BorrowedProduct;
}

export interface UpdateStatusResponse {
  success: boolean;
  message: string;
}

function handleError(err: unknown): { success: boolean; message: string } {
  if (err && typeof err === 'object' && 'message' in err) {
    return { success: false, message: (err as ApiError).message };
  }
  return { success: false, message: 'Error de conexión. Verifica que el servidor esté activo.' };
}

export async function registerBorrowedProduct(
  data: RegisterBorrowedProductData,
  token: string
): Promise<RegisterBorrowedProductResponse> {
  try {
    const res = await api.post<RegisterBorrowedProductResponse>(
      '/api/borrowed-products',
      {
        nombre: data.nombre,
        stock: data.stock,
        precio: data.precio,
        codigoTienda: data.codigoTienda,
        fechaPrestamo: data.fechaPrestamo,
      },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function getBorrowedProducts(token: string): Promise<BorrowedProduct[]> {
  try {
    const res = await api.get<BorrowedProduct[]>('/api/borrowed-products', token);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function getBorrowedProductsForCatalog(token: string): Promise<BorrowedProduct[]> {
  try {
    const res = await api.get<BorrowedProduct[]>('/api/borrowed-products/catalog', token);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function getBorrowedProductById(
  id: string,
  token: string
): Promise<BorrowedProduct | null> {
  try {
    const res = await api.get<BorrowedProduct>(`/api/borrowed-products/${id}`, token);
    return res || null;
  } catch {
    return null;
  }
}

export async function updateBorrowedProductStock(
  id: string,
  newStock: number,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.patch<{ success: boolean; message: string }>(
      `/api/borrowed-products/${id}/stock`,
      { newStock },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function updateBorrowedProductStatus(
  id: string,
  estado: BorrowedProductStatus,
  token: string
): Promise<UpdateStatusResponse> {
  try {
    const res = await api.patch<UpdateStatusResponse>(
      `/api/borrowed-products/${id}/status`,
      { estado },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export function getStatusLabel(status: BorrowedProductStatus): string {
  return status === 'pendiente' ? 'Pendiente' : 'Cancelado';
}
