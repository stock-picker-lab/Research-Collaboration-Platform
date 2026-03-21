/**
 * 认证服务
 */
import api from './api';
import { User } from '@/types';

export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data.data;
};
