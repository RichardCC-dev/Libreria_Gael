// Servicio de API para Gestión de Reservas - Conectado al backend real

import { api, ApiError } from '@/lib/api';

export type ReservationStatus = 'por_confirmar' | 'pendiente' | 'confirmada' | 'cancelado';

export interface ReservationItem {
  productId: string;
  productName: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Reservation {
  id: string;
  clienteId: string;
  items: ReservationItem[];
  total: number;
  estado: ReservationStatus;
  createdAt: string;
  mensajeEmpleado?: string;
  tiempoEntregaDias?: number;
}

export interface CreateReservationItem {
  productId: string;
  cantidad: number;
}

export interface CreateReservationData {
  clienteId: string;
  items: CreateReservationItem[];
}

export interface CreateReservationResponse {
  success: boolean;
  message: string;
  reservation?: Reservation;
}

export interface CancelReservationResponse {
  success: boolean;
  message: string;
}

export const MONTO_MINIMO = 70;

export interface AcceptReservationData {
  reservationId: string;
  empleadoId: string;
  mensaje?: string;
  tiempoEntregaDias?: number;
}

export interface StaffActionResponse {
  success: boolean;
  message: string;
}

function handleError(err: unknown): { success: false; message: string } {
  if (err && typeof err === 'object' && 'message' in err) {
    return { success: false, message: (err as ApiError).message };
  }
  return { success: false, message: 'Error de conexión. Verifica que el servidor esté activo.' };
}

export async function createReservation(
  data: CreateReservationData,
  token: string
): Promise<CreateReservationResponse> {
  try {
    const res = await api.post<CreateReservationResponse>(
      '/api/reservations',
      { items: data.items },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function getReservationsByClient(
  clienteId: string,
  token: string
): Promise<Reservation[]> {
  try {
    const res = await api.get<Reservation[]>('/api/reservations', token);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function cancelReservation(
  reservationId: string,
  clienteId: string,
  token: string
): Promise<CancelReservationResponse> {
  try {
    const res = await api.post<CancelReservationResponse>(
      `/api/reservations/${reservationId}/cancel`,
      {},
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function getReservationById(
  reservationId: string,
  clienteId: string,
  token: string
): Promise<Reservation | null> {
  try {
    const res = await api.get<Reservation>(`/api/reservations/${reservationId}`, token);
    return res || null;
  } catch {
    return null;
  }
}

export function getStatusLabel(status: ReservationStatus): string {
  switch (status) {
    case 'por_confirmar':
      return 'Por confirmar';
    case 'pendiente':
      return 'Pendiente';
    case 'confirmada':
      return 'Confirmada';
    case 'cancelado':
      return 'Cancelado';
    default:
      return status;
  }
}

export async function getReservationsForStaff(token: string): Promise<Reservation[]> {
  try {
    const res = await api.get<Reservation[]>('/api/reservations', token);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function acceptReservation(
  data: AcceptReservationData,
  token: string
): Promise<StaffActionResponse> {
  try {
    const res = await api.post<StaffActionResponse>(
      `/api/reservations/${data.reservationId}/accept`,
      { mensaje: data.mensaje, tiempoEntregaDias: data.tiempoEntregaDias },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function cancelReservationByEmployee(
  reservationId: string,
  empleadoId: string,
  token: string,
  mensaje?: string
): Promise<StaffActionResponse> {
  try {
    const res = await api.post<StaffActionResponse>(
      `/api/reservations/${reservationId}/cancel-by-staff`,
      { mensaje },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function confirmPayment(
  reservationId: string,
  empleadoId: string,
  token: string
): Promise<StaffActionResponse> {
  try {
    const res = await api.post<StaffActionResponse>(
      `/api/reservations/${reservationId}/confirm-payment`,
      {},
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function getReservationByIdForStaff(
  reservationId: string,
  token: string
): Promise<Reservation | null> {
  try {
    const res = await api.get<Reservation>(`/api/reservations/${reservationId}`, token);
    return res || null;
  } catch {
    return null;
  }
}

export function canClientCancel(reservation: Reservation): boolean {
  if (reservation.estado !== 'por_confirmar') return false;
  const createdAt = new Date(reservation.createdAt).getTime();
  const horas24 = 24 * 60 * 60 * 1000;
  return Date.now() - createdAt <= horas24;
}

export async function hasProductInActiveReservations(
  productId: string,
  token: string
): Promise<boolean> {
  try {
    const res = await api.get<{ hasProductInActiveReservations: boolean }>(
      `/api/reservations/active/${productId}`,
      token
    );
    return res?.hasProductInActiveReservations ?? false;
  } catch {
    return false;
  }
}
