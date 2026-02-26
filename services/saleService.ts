// Servicio de API para Gestión de Ventas (HU9) - Conectado al backend real

import { api, ApiError } from '@/lib/api';

export interface SaleItem {
  productId: string;
  productName: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Sale {
  id: string;
  empleadoId: string;
  empleadoName: string;
  items: SaleItem[];
  total: number;
  descuento?: number;
  subtotal?: number;
  fecha: string;
  reservationId?: string;
}

export interface RegisterSaleItem {
  productId: string;
  cantidad: number;
}

export interface RegisterSaleData {
  empleadoId: string;
  empleadoName: string;
  items: RegisterSaleItem[];
  descuento?: number;
  reservationId?: string;
}

export interface RegisterSaleResponse {
  success: boolean;
  message: string;
  sale?: Sale;
}

export interface SalesFilter {
  desde?: string;
  hasta?: string;
  temporada?: string;
}

function handleError(err: unknown): { success: false; message: string } {
  if (err && typeof err === 'object' && 'message' in err) {
    return { success: false, message: (err as ApiError).message };
  }
  return { success: false, message: 'Error de conexión. Verifica que el servidor esté activo.' };
}

export async function registerSale(
  data: RegisterSaleData,
  token: string
): Promise<RegisterSaleResponse> {
  try {
    const res = await api.post<RegisterSaleResponse>(
      '/api/sales',
      {
        items: data.items,
        descuento: data.descuento,
        reservationId: data.reservationId,
      },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function registerSaleFromReservation(
  data: {
    reservation: { id: string; items: SaleItem[]; total: number };
    empleadoId: string;
    empleadoName: string;
    descuento?: number;
  },
  token: string
): Promise<RegisterSaleResponse> {
  try {
    const items = data.reservation.items.map((i) => ({
      productId: i.productId,
      cantidad: i.cantidad,
    }));
    const res = await api.post<RegisterSaleResponse>(
      '/api/sales',
      {
        items,
        descuento: data.descuento,
        reservationId: data.reservation.id,
      },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function getSales(
  filter?: SalesFilter,
  token?: string
): Promise<Sale[]> {
  try {
    const params = new URLSearchParams();
    if (filter?.desde) params.set('desde', filter.desde);
    if (filter?.hasta) params.set('hasta', filter.hasta);
    if (filter?.temporada) params.set('temporada', filter.temporada);
    const query = params.toString();
    const url = query ? `/api/sales?${query}` : '/api/sales';
    const res = await api.get<Sale[]>(url, token);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}
