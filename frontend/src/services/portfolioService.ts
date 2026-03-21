/**
 * 持仓服务
 */
import api from './api';
import { Portfolio, Watchlist, PaginatedResponse } from '@/types';

export const getPortfolios = async (params?: any): Promise<PaginatedResponse<Portfolio>> => {
  const response = await api.get('/portfolios', { params });
  return response.data.data;
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
  const response = await api.get(`/portfolios/${id}`);
  return response.data.data;
};

export const createPortfolio = async (data: Partial<Portfolio>): Promise<Portfolio> => {
  const response = await api.post('/portfolios', data);
  return response.data.data;
};

export const updatePortfolio = async (id: string, data: Partial<Portfolio>): Promise<Portfolio> => {
  const response = await api.put(`/portfolios/${id}`, data);
  return response.data.data;
};

export const deletePortfolio = async (id: string): Promise<void> => {
  await api.delete(`/portfolios/${id}`);
};

export const getWatchlist = async (params?: any): Promise<PaginatedResponse<Watchlist>> => {
  const response = await api.get('/watchlist', { params });
  return response.data.data;
};

export const createWatchlist = async (data: Partial<Watchlist>): Promise<Watchlist> => {
  const response = await api.post('/watchlist', data);
  return response.data.data;
};

export const updateWatchlist = async (id: string, data: Partial<Watchlist>): Promise<Watchlist> => {
  const response = await api.put(`/watchlist/${id}`, data);
  return response.data.data;
};

export const deleteWatchlist = async (id: string): Promise<void> => {
  await api.delete(`/watchlist/${id}`);
};

export const moveToPortfolio = async (watchlistId: string, data: { weight: number }): Promise<Portfolio> => {
  const response = await api.post(`/watchlist/${watchlistId}/move-to-portfolio`, data);
  return response.data.data;
};
