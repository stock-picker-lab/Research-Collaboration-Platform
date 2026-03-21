/**
 * 仪表盘服务
 */
import api from './api';
import { ResearcherDashboardData, PMDashboardData, LeaderDashboardData } from '@/types';

export const getResearcherDashboard = async (): Promise<ResearcherDashboardData> => {
  const response = await api.get('/dashboard/researcher');
  return response.data.data;
};

export const getPMDashboard = async (): Promise<PMDashboardData> => {
  const response = await api.get('/dashboard/pm');
  return response.data.data;
};

export const getLeaderDashboard = async (): Promise<LeaderDashboardData> => {
  const response = await api.get('/dashboard/leader');
  return response.data.data;
};

export const getOutputStats = async (): Promise<any> => {
  const response = await api.get('/leader/output-stats');
  return response.data.data;
};
