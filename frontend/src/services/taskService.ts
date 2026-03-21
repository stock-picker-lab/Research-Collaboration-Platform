/**
 * 任务服务
 */
import api from './api';
import { ResearchTask, PaginatedResponse } from '@/types';

export const getTasks = async (params?: any): Promise<PaginatedResponse<ResearchTask>> => {
  const response = await api.get('/tasks', { params });
  return response.data.data;
};

export const getTask = async (id: string): Promise<ResearchTask> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data.data;
};

export const createTask = async (data: Partial<ResearchTask>): Promise<ResearchTask> => {
  const response = await api.post('/tasks', data);
  return response.data.data;
};

export const updateTask = async (id: string, data: Partial<ResearchTask>): Promise<ResearchTask> => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data.data;
};

export const updateTaskStatus = async (id: string, status: string): Promise<ResearchTask> => {
  const response = await api.patch(`/tasks/${id}/status`, { status });
  return response.data.data;
};

export const assignTask = async (id: string, data: { assignee_id: string }): Promise<ResearchTask> => {
  const response = await api.post(`/tasks/${id}/assign`, data);
  return response.data.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
