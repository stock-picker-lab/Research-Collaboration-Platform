/**
 * 投研协作平台 - API 客户端
 */
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器：注入 Token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截器：处理 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============ Auth ============

export const authAPI = {
  login: (data: { username: string; password: string }) =>
    api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// ============ Company ============

export const companyAPI = {
  list: (params?: any) => api.get("/companies/", { params }),
  get: (id: string) => api.get(`/companies/${id}`),
  create: (data: any) => api.post("/companies/", data),
  update: (id: string, data: any) => api.put(`/companies/${id}`, data),
};

// ============ Document ============

export const documentAPI = {
  list: (params?: any) => api.get("/documents/", { params }),
  get: (id: string) => api.get(`/documents/${id}`),
  create: (data: any) => api.post("/documents/", data),
  upload: (formData: FormData) =>
    api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  analyze: (id: string) => api.post(`/documents/${id}/analyze`),
};

// ============ Tasks ============

export const taskAPI = {
  list: (params?: any) => api.get("/tasks/", { params }),
  create: (data: any) => api.post("/tasks/", data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
};

// ============ Conclusion Cards ============

export const conclusionAPI = {
  getByCompany: (companyId: string, params?: any) =>
    api.get(`/conclusions/company/${companyId}`, { params }),
  create: (data: any) => api.post("/conclusions/", data),
};

// ============ Questions ============

export const questionAPI = {
  list: (params?: any) => api.get("/questions/", { params }),
  create: (data: any) => api.post("/questions/", data),
  answer: (id: string, data: any) => api.put(`/questions/${id}/answer`, data),
};

// ============ Copilot ============

export const copilotAPI = {
  ask: (data: {
    question: string;
    conversation_id?: string;
    company_id?: string;
    document_ids?: string[];
  }) => api.post("/copilot/ask", data),
  conversations: (params?: any) => api.get("/copilot/conversations", { params }),
};

// ============ Alerts ============

export const alertAPI = {
  list: (params?: any) => api.get("/alerts/", { params }),
  markRead: (id: string) => api.put(`/alerts/${id}/read`),
};

// ============ Dashboard ============

export const workbenchAPI = {
  get: () => api.get("/workbench/"),
};

export const dashboardAPI = {
  get: () => api.get("/dashboard/"),
};

export const managementAPI = {
  stats: () => api.get("/management/stats"),
};

export default api;
