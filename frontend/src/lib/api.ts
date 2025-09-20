import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if we're in the browser
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { email: string; password: string; password_confirmation: string }) =>
    api.post('/auth/reset-password', data),
};

// Users API
export const usersAPI = {
  getAll: (params?: { search?: string; page?: number }) =>
    api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/users', data),
  update: (id: number, data: { name?: string; email?: string }) =>
    api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Contacts API
export const contactsAPI = {
  getAll: (params?: { search?: string; page?: number }) =>
    api.get('/contacts', { params }),
  getById: (id: number) => api.get(`/contacts/${id}`),
  create: (data: { name: string; email: string; phone_number: string; company: string }) =>
    api.post('/contacts', data),
  update: (id: number, data: { name?: string; email?: string; phone_number?: string; company?: string }) =>
    api.put(`/contacts/${id}`, data),
  delete: (id: number) => api.delete(`/contacts/${id}`),
};

// Projects API
export const projectsAPI = {
  getAll: (params?: { search?: string; status?: string; page?: number }) =>
    api.get('/projects', { params }),
  getById: (id: number) => api.get(`/projects/${id}`),
  create: (data: { name: string; description: string; status: number; contact_id: number }) =>
    api.post('/projects', data),
  update: (id: number, data: { name?: string; description?: string; status?: number; contact_id?: number }) =>
    api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};
