// Servicio de Control de Asistencia (HU19) - Conectado al backend real

import { api, ApiError } from '@/lib/api';

export interface AttendanceRecord {
  id: string;
  empleadoId: string;
  empleadoName: string;
  fecha: string;
  horaEntrada: string;
  horaSalida?: string;
  registradoPor?: string;
  createdAt: string;
}

export interface RegisterAttendanceData {
  empleadoId: string;
  empleadoName: string;
  fecha: string;
  horaEntrada: string;
  horaSalida?: string;
  adminId: string;
}

export interface AttendanceSummary {
  empleadoId: string;
  empleadoName: string;
  diasAsistidos: number;
  totalHoras: number;
  registros: AttendanceRecord[];
}

function handleError(err: unknown): { success: false; message: string } {
  if (err && typeof err === 'object' && 'message' in err) {
    return { success: false, message: (err as ApiError).message };
  }
  return { success: false, message: 'Error de conexión. Verifica que el servidor esté activo.' };
}

function mapRecord(r: Record<string, unknown>): AttendanceRecord {
  return {
    id: String(r.id),
    empleadoId: String(r.empleadoId),
    empleadoName: String(r.empleadoName || 'Empleado'),
    fecha: String(r.fecha),
    horaEntrada: String(r.horaEntrada || ''),
    horaSalida: r.horaSalida ? String(r.horaSalida) : undefined,
    registradoPor: r.registradoPor ? String(r.registradoPor) : undefined,
    createdAt: String(r.createdAt || ''),
  };
}

export async function registerAttendance(
  data: RegisterAttendanceData,
  token: string
): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> {
  try {
    const res = await api.post<{ success: boolean; message: string; record?: Record<string, unknown> }>(
      '/api/attendance',
      {
        empleadoId: data.empleadoId,
        empleadoName: data.empleadoName,
        fecha: data.fecha,
        horaEntrada: data.horaEntrada,
        horaSalida: data.horaSalida,
      },
      token
    );
    return {
      ...res,
      record: res.record ? mapRecord(res.record) : undefined,
    };
  } catch (err) {
    return handleError(err);
  }
}

export async function getAttendanceRecords(
  params?: { empleadoId?: string; fechaDesde?: string; fechaHasta?: string },
  token?: string
): Promise<AttendanceRecord[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.empleadoId) searchParams.set('empleadoId', params.empleadoId);
    if (params?.fechaDesde) searchParams.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) searchParams.set('fechaHasta', params.fechaHasta);
    const query = searchParams.toString();
    const url = query ? `/api/attendance?${query}` : '/api/attendance';
    const res = await api.get<Record<string, unknown>[]>(url, token);
    const arr = Array.isArray(res) ? res : [];
    return arr.map(mapRecord);
  } catch {
    return [];
  }
}

export async function getAttendanceSummary(params?: {
  empleadoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  allEmployeeIds?: { id: string; name: string }[];
}, token?: string): Promise<AttendanceSummary[]> {
  const records = await getAttendanceRecords(
    {
      empleadoId: params?.empleadoId,
      fechaDesde: params?.fechaDesde,
      fechaHasta: params?.fechaHasta,
    },
    token
  );

  const byEmployee = new Map<string, AttendanceRecord[]>();
  for (const r of records) {
    const list = byEmployee.get(r.empleadoId) || [];
    list.push(r);
    byEmployee.set(r.empleadoId, list);
  }

  const summaries: AttendanceSummary[] = [];

  const processEmployee = (empleadoId: string, regs: AttendanceRecord[], empleadoName: string) => {
    let totalHoras = 0;
    for (const r of regs) {
      if (r.horaEntrada && r.horaSalida) {
        const [h1, m1] = r.horaEntrada.split(':').map(Number);
        const [h2, m2] = r.horaSalida.split(':').map(Number);
        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff < 0) diff += 24 * 60;
        totalHoras += diff / 60;
      }
    }
    summaries.push({
      empleadoId,
      empleadoName,
      diasAsistidos: regs.length,
      totalHoras: Math.round(totalHoras * 10) / 10,
      registros: regs.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      ),
    });
  };

  byEmployee.forEach((regs, empleadoId) => {
    processEmployee(empleadoId, regs, regs[0]?.empleadoName || 'Empleado');
  });

  if (params?.allEmployeeIds) {
    for (const emp of params.allEmployeeIds) {
      if (!byEmployee.has(emp.id)) {
        processEmployee(emp.id, [], emp.name);
      }
    }
  }

  return summaries.sort((a, b) => a.empleadoName.localeCompare(b.empleadoName));
}

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function getDateRangePreset(
  preset: 'hoy' | 'semana' | 'mes'
): { desde: string; hasta: string } {
  const today = new Date();
  const hoy = getTodayStr();

  switch (preset) {
    case 'hoy':
      return { desde: hoy, hasta: hoy };
    case 'semana': {
      const inicio = new Date(today);
      inicio.setDate(inicio.getDate() - inicio.getDay());
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      return {
        desde: inicio.toISOString().slice(0, 10),
        hasta: fin.toISOString().slice(0, 10),
      };
    }
    case 'mes': {
      const inicio = new Date(today.getFullYear(), today.getMonth(), 1);
      const fin = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        desde: inicio.toISOString().slice(0, 10),
        hasta: fin.toISOString().slice(0, 10),
      };
    }
    default:
      return { desde: hoy, hasta: hoy };
  }
}

export async function updateAttendanceRecord(
  recordId: string,
  data: { horaEntrada?: string; horaSalida?: string },
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.patch<{ success: boolean; message: string }>(
      `/api/attendance/${recordId}`,
      { horaEntrada: data.horaEntrada, horaSalida: data.horaSalida },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function deleteAttendanceRecord(
  recordId: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/api/attendance/${recordId}`,
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}
