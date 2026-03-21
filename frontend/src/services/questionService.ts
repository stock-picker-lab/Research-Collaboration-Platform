/**
 * 问答服务
 */
import api from './api';
import { QuestionThread, PaginatedResponse } from '@/types';

export const getQuestions = async (params?: any): Promise<PaginatedResponse<QuestionThread>> => {
  const response = await api.get('/questions', { params });
  return response.data.data;
};

export const getQuestion = async (id: string): Promise<QuestionThread> => {
  const response = await api.get(`/questions/${id}`);
  return response.data.data;
};

export const createQuestion = async (data: Partial<QuestionThread>): Promise<QuestionThread> => {
  const response = await api.post('/questions', data);
  return response.data.data;
};

export const answerQuestion = async (id: string, data: { answer: string }): Promise<QuestionThread> => {
  const response = await api.post(`/questions/${id}/answer`, data);
  return response.data.data;
};

export const closeQuestion = async (id: string): Promise<QuestionThread> => {
  const response = await api.post(`/questions/${id}/close`);
  return response.data.data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await api.delete(`/questions/${id}`);
};
