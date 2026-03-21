/**
 * 管理员服务
 */
import api from './api';
import { User, DataSource, AuditLog, PaginatedResponse } from '@/types';

export const getAdminStats = async (): Promise<any> => {
  const response = await api.get('/admin/stats');
  return response.data.data;
};

export const getUsers = async (params?: any): Promise<PaginatedResponse<User>> => {
  const response = await api.get('/admin/users', { params });
  return response.data.data;
};

export const createUser = async (data: Partial<User>): Promise<User> => {
  const response = await api.post('/admin/users', data);
  return response.data.data;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data.data;
};

export const toggleUserStatus = async (id: string): Promise<void> => {
  await api.post(`/admin/users/${id}/toggle-status`);
};

export const getAuditLogs = async (params?: any): Promise<PaginatedResponse<AuditLog>> => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data.data;
};

export const getDataSources = async (): Promise<PaginatedResponse<DataSource>> => {
  const response = await api.get('/admin/data-sources');
  return response.data.data;
};

export const createDataSource = async (data: Partial<DataSource>): Promise<DataSource> => {
  const response = await api.post('/admin/data-sources', data);
  return response.data.data;
};

export const syncDataSource = async (id: string): Promise<void> => {
  await api.post(`/admin/data-sources/${id}/sync`);
};
