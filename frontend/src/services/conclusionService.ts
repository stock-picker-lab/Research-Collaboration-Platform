/**
 * 研报结论服务
 */
import api from './api';
import { ConclusionCard, PaginatedResponse } from '@/types';

export const getConclusions = async (params?: any): Promise<PaginatedResponse<ConclusionCard>> => {
  const response = await api.get('/conclusions', { params });
  return response.data.data;
};

export const getConclusion = async (id: string): Promise<ConclusionCard> => {
  const response = await api.get(`/conclusions/${id}`);
  return response.data.data;
};

export const createConclusion = async (data: Partial<ConclusionCard>): Promise<ConclusionCard> => {
  const response = await api.post('/conclusions', data);
  return response.data.data;
};

export const updateConclusion = async (id: string, data: Partial<ConclusionCard>): Promise<ConclusionCard> => {
  const response = await api.put(`/conclusions/${id}`, data);
  return response.data.data;
};

export const publishConclusion = async (id: string): Promise<ConclusionCard> => {
  const response = await api.post(`/conclusions/${id}/publish`);
  return response.data.data;
};

export const approveConclusion = async (id: string): Promise<ConclusionCard> => {
  const response = await api.post(`/conclusions/${id}/approve`);
  return response.data.data;
};

export const rejectConclusion = async (id: string, data: { reason: string }): Promise<ConclusionCard> => {
  const response = await api.post(`/conclusions/${id}/reject`, data);
  return response.data.data;
};

export const archiveConclusion = async (id: string): Promise<ConclusionCard> => {
  const response = await api.post(`/conclusions/${id}/archive`);
  return response.data.data;
};

export const getConclusionsByCompany = async (companyId: string): Promise<ConclusionCard[]> => {
  const response = await api.get('/conclusions', { params: { company_id: companyId } });
  return response.data.data.items || response.data.data || [];
};
