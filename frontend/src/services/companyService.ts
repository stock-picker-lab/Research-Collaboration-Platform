/**
 * 公司服务
 */
import api from './api';
import { Company, PaginatedResponse } from '@/types';

export const getCompanies = async (params?: any): Promise<Company[]> => {
  const response = await api.get('/companies', { params });
  return response.data.data;
};

export const getCompany = async (id: string): Promise<Company> => {
  const response = await api.get(`/companies/${id}`);
  return response.data.data;
};

export const createCompany = async (data: Partial<Company>): Promise<Company> => {
  const response = await api.post('/companies', data);
  return response.data.data;
};

export const updateCompany = async (id: string, data: Partial<Company>): Promise<Company> => {
  const response = await api.put(`/companies/${id}`, data);
  return response.data.data;
};

export const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/companies/${id}`);
};

export const addCoverage = async (companyId: string): Promise<void> => {
  await api.post('/companies/coverage', { company_id: companyId });
};

export const removeCoverage = async (companyId: string): Promise<void> => {
  await api.delete(`/companies/coverage/${companyId}`);
};

// 别名函数，保持兼容性
export const getCompanyById = getCompany;
