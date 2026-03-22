/**
 * 文档服务
 */
import api from './api';
import { Document, PaginatedResponse } from '@/types';

export const getDocuments = async (params?: any): Promise<PaginatedResponse<Document>> => {
  const response = await api.get('/documents', { params });
  return response.data.data;
};

export const getDocument = async (id: string): Promise<Document> => {
  const response = await api.get(`/documents/${id}`);
  return response.data.data;
};

export const uploadDocument = async (data: FormData): Promise<Document> => {
  const response = await api.post('/documents/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const updateDocument = async (id: string, data: Partial<Document>): Promise<Document> => {
  const response = await api.put(`/documents/${id}`, data);
  return response.data.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/documents/${id}`);
};

export const getDocumentsByCompany = async (companyId: string): Promise<Document[]> => {
  const response = await api.get('/documents', { params: { company_id: companyId } });
  return response.data.data.items || response.data.data || [];
};
