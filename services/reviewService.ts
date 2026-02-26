// Servicio de API para Reseñas (HU14) - Conectado al backend real

import { api, ApiError } from '@/lib/api';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  comentario: string;
  calificacion: number;
  fecha: string;
}

export interface SubmitReviewData {
  userId: string;
  userName: string;
  comentario: string;
  calificacion: number;
}

export interface SubmitReviewResponse {
  success: boolean;
  message: string;
  review?: Review;
}

function handleError(err: unknown): { success: false; message: string } {
  if (err && typeof err === 'object' && 'message' in err) {
    return { success: false, message: (err as ApiError).message };
  }
  return { success: false, message: 'Error de conexión. Verifica que el servidor esté activo.' };
}

export async function submitReview(
  data: SubmitReviewData,
  token: string
): Promise<SubmitReviewResponse> {
  try {
    const res = await api.post<SubmitReviewResponse>(
      '/api/reviews',
      { comentario: data.comentario, calificacion: data.calificacion },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function getReviews(token: string): Promise<Review[]> {
  try {
    const res = await api.get<Review[]>('/api/reviews', token);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}
