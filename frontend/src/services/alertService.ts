/**
 * 预警服务
 */
import api from './api';
import { Alert, PaginatedResponse } from '@/types';

export const getAlerts = async (params?: any): Promise<PaginatedResponse<Alert>> => {
  const response = await api.get('/alerts', { params });
  return response.data.data;
};

export const getAlert = async (id: string): Promise<Alert> => {
  const response = await api.get(`/alerts/${id}`);
  return response.data.data;
};

export const markAlertRead = async (id: string): Promise<void> => {
  await api.post(`/alerts/${id}/read`);
};

export const markAllAlertsRead = async (): Promise<void> => {
  await api.post('/alerts/read-all');
};

export const deleteAlert = async (id: string): Promise<void> => {
  await api.delete(`/alerts/${id}`);
};

// 别名函数，保持兼容性
export const markAlertAsRead = markAlertRead;
export const markAllAlertsAsRead = markAllAlertsRead;
