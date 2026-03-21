/**
 * 用户服务
 */
import api from './api';
import { User, PaginatedResponse } from '@/types';

export const getUsers = async (params?: any): Promise<PaginatedResponse<User>> => {
  const response = await api.get('/users', { params });
  return response.data.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (data: Partial<User>): Promise<User> => {
  const response = await api.post('/users', data);
  return response.data.data;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const toggleUserStatus = async (id: string): Promise<void> => {
  await api.post(`/users/${id}/toggle-status`);
};
