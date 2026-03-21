/**
 * 模板服务
 */
import api from './api';
import { ResearchTemplate } from '@/types';

export const getTemplates = async (): Promise<ResearchTemplate[]> => {
  const response = await api.get('/templates');
  return response.data.data;
};

export const getTemplate = async (id: string): Promise<ResearchTemplate> => {
  const response = await api.get(`/templates/${id}`);
  return response.data.data;
};

export const createTemplate = async (data: Partial<ResearchTemplate>): Promise<ResearchTemplate> => {
  const response = await api.post('/templates', data);
  return response.data.data;
};

export const updateTemplate = async (id: string, data: Partial<ResearchTemplate>): Promise<ResearchTemplate> => {
  const response = await api.put(`/templates/${id}`, data);
  return response.data.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await api.delete(`/templates/${id}`);
};
