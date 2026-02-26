// Servicio de API para Autenticación - Conectado al backend real

import { api, ApiError } from '@/lib/api';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: 'cliente' | 'empleado' | 'administrador';
    name?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: 'cliente' | 'empleado' | 'administrador';
    name?: string;
    phone?: string;
  };
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  recoveryCode?: string;
}

export interface VerifyCodeData {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  email?: string;
}

export interface ChangeEmailData {
  userId: string;
  newEmail: string;
  currentPassword: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: 'cliente' | 'empleado' | 'administrador';
    name?: string;
    phone?: string;
  };
}

export const EMAIL_SOPORTE = 'soporte@libreriagael.com';

export interface ChangePasswordData {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface CreateEmployeeData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface CreateEmployeeResponse {
  success: boolean;
  message: string;
  employee?: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    role: 'empleado';
  };
}

export interface EmployeeInfo {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'empleado';
}

function handleError(err: unknown): { success: false; message: string } {
  if (err && typeof err === 'object' && 'message' in err) {
    return { success: false, message: (err as ApiError).message };
  }
  return { success: false, message: 'Error de conexión. Verifica que el servidor esté activo.' };
}

export async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  try {
    const res = await api.post<RegisterResponse & { token?: string }>('/api/auth/register', {
      email: data.email,
      password: data.password,
      name: data.name,
    });
    return res as RegisterResponse;
  } catch (err) {
    return handleError(err);
  }
}

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  try {
    const res = await api.post<LoginResponse>('/api/auth/login', {
      email: data.email,
      password: data.password,
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResponse> {
  try {
    const res = await api.post<ForgotPasswordResponse>('/api/auth/forgot-password', {
      email: data.email,
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function verifyRecoveryCode(data: VerifyCodeData): Promise<VerifyCodeResponse> {
  try {
    const res = await api.post<VerifyCodeResponse>('/api/auth/verify-code', {
      email: data.email,
      code: data.code,
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
  try {
    const res = await api.post<ResetPasswordResponse>('/api/auth/reset-password', {
      email: data.email,
      code: data.code,
      newPassword: data.newPassword,
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileData,
  token: string
): Promise<UpdateProfileResponse> {
  try {
    const res = await api.patch<UpdateProfileResponse>(
      '/api/auth/profile',
      { name: data.name, phone: data.phone },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function changeEmail(
  data: ChangeEmailData,
  token: string
): Promise<UpdateProfileResponse> {
  try {
    const res = await api.post<UpdateProfileResponse>(
      '/api/auth/change-email',
      { newEmail: data.newEmail, currentPassword: data.currentPassword },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function changePassword(
  data: ChangePasswordData,
  token: string
): Promise<ChangePasswordResponse> {
  try {
    const res = await api.post<ChangePasswordResponse>(
      '/api/auth/change-password',
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function createEmployee(
  data: CreateEmployeeData,
  token: string
): Promise<CreateEmployeeResponse> {
  try {
    const res = await api.post<CreateEmployeeResponse>(
      '/api/auth/employees',
      {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
      },
      token
    );
    return res;
  } catch (err) {
    return handleError(err);
  }
}

export async function getEmployees(token: string): Promise<EmployeeInfo[]> {
  try {
    const res = await api.get<EmployeeInfo[]>('/api/auth/employees', token);
    return Array.isArray(res) ? res : [];
  } catch (err) {
    return [];
  }
}
